import { Transport, RmqOptions } from '@nestjs/microservices';

export const rabbitmqConfig: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
    queue: 'todo_notifications',
    queueOptions: {
      durable: true,
    },
  },
};