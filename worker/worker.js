const amqp = require('amqplib');

class NotificationWorker {
  constructor(config = {}) {
    this.config = {
      rabbitmqUrl: 'amqp://admin:admin@localhost:5672',
      queueName: 'todo_notifications',
      exchange: 'notifications_exchange',
      exchangeType: 'direct',
      routingKey: 'notification',
      prefetchCount: 1,
      ...config
    };
    
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      console.log('Connecting to RabbitMQ...');
      this.connection = await amqp.connect(this.config.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Set prefetch count to control how many messages worker processes at once
      await this.channel.prefetch(this.config.prefetchCount);
      
      // For NestJS microservices, usually just need the queue
      // Declare queue (matching your API's queueOptions)
      await this.channel.assertQueue(this.config.queueName, {
        durable: true
      });
      
      console.log(`✅ Connected to RabbitMQ`);
      console.log(`📊 Queue: ${this.config.queueName}`);
      
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
      throw error;
    }
  }

  async startConsuming() {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ. Call connect() first.');
    }

    console.log('🚀 Starting to consume messages...');
    console.log('📝 Waiting for notifications. To exit press CTRL+C');

    await this.channel.consume(
      this.config.queueName,
      (msg) => this.handleMessage(msg),
      { noAck: false }
    );
  }

  handleMessage(msg) {
    if (!msg) {
      console.log('❌ Received empty message');
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const content = msg.content.toString();
      
      // Try to parse as JSON for better formatting
      let notification;
      try {
        notification = JSON.parse(content);
        console.log(`\n📧 [${timestamp}] Notification received:`);
        console.log(JSON.stringify(notification, null, 2));
      } catch (parseError) {
        // If not JSON, log as plain text
        console.log(`\n📧 [${timestamp}] Notification received: ${content}`);
      }
      
      // Log message properties
      console.log(`📋 Message Info:`);
      console.log(`   - Delivery Tag: ${msg.fields.deliveryTag}`);
      console.log(`   - Routing Key: ${msg.fields.routingKey}`);
      console.log(`   - Exchange: ${msg.fields.exchange}`);
      
      if (msg.properties.messageId) {
        console.log(`   - Message ID: ${msg.properties.messageId}`);
      }
      
      if (msg.properties.timestamp) {
        console.log(`   - Timestamp: ${new Date(msg.properties.timestamp * 1000).toISOString()}`);
      }
      
      console.log('---');
      
      // Acknowledge the message
      this.channel.ack(msg);
      
    } catch (error) {
      console.error('❌ Error processing message:', error.message);
      
      // Reject the message and requeue it
      this.channel.nack(msg, false, true);
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('👋 Disconnected from RabbitMQ');
    } catch (error) {
      console.error('❌ Error closing connection:', error.message);
    }
  }
}

// Main execution
async function main() {
  const worker = new NotificationWorker({
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
    queueName: process.env.QUEUE_NAME || 'todo_notifications',
    exchange: process.env.EXCHANGE_NAME || 'notifications_exchange',
    routingKey: process.env.ROUTING_KEY || 'notification',
    prefetchCount: parseInt(process.env.PREFETCH_COUNT) || 1
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    await worker.close();
    process.exit(0);
  });

  try {
    await worker.connect();
    await worker.startConsuming();
  } catch (error) {
    console.error('❌ Worker failed:', error.message);
    process.exit(1);
  }
}

// Run the worker
if (require.main === module) {
  main().catch(console.error);
}

module.exports = NotificationWorker;