import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface TodoCreatedEvent {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: Date;
}

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);
  private isConnected = false;
  private connectionRetryAttempts = 0;
  private readonly maxRetryAttempts = 3;

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendTodoCreatedNotification(todoData: TodoCreatedEvent): Promise<void> {
    this.sendNotificationAsync(todoData).catch((error) => {
      this.logger.error(`Async notification failed: ${error.message}`, error.stack);
    });
  }

  private async sendNotificationAsync(todoData: TodoCreatedEvent): Promise<void> {
    try {
      if (!this.isConnected) {
        this.logger.warn('RabbitMQ not connected, skipping notification');
        return;
      }

      const pattern = 'todo.created';
      const payload = {
        pattern,
        data: todoData,
        timestamp: new Date(),
      };

      this.logger.log(`Sending todo created notification for todo: ${todoData.id}`);
      
      // Emit the message to RabbitMQ
      this.client.emit(pattern, payload).subscribe({
        next: () => {
          this.logger.log(`[RMQ] Notification sent successfully: ${todoData.id}`);
        },
        error: (error) => {
          this.logger.error(`[RMQ] Failed to send notification: ${error.message}`, error.stack);
        }
      });
      
    } catch (error) {
      this.logger.error(`[RMQ] Failed to send notification: ${error.message}`, error.stack);
    }
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    while (this.connectionRetryAttempts < this.maxRetryAttempts) {
      try {
        this.logger.log(`Attempting to connect to RabbitMQ (attempt ${this.connectionRetryAttempts + 1}/${this.maxRetryAttempts})`);
        
        await this.client.connect();
        this.isConnected = true;
        this.connectionRetryAttempts = 0; // Reset on successful connection
        this.logger.log('RabbitMQ connection established successfully');
        return;
        
      } catch (error) {
        this.connectionRetryAttempts++;
        this.logger.error(`Failed to connect to RabbitMQ (attempt ${this.connectionRetryAttempts}): ${error.message}`);
        
        if (this.connectionRetryAttempts >= this.maxRetryAttempts) {
          this.logger.error('Max retry attempts reached. RabbitMQ will be unavailable.');
          this.isConnected = false;
          return;
        }
        
        // Wait before retrying
        await this.delay(2000 * this.connectionRetryAttempts); // Exponential backoff
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onModuleDestroy() {
    try {
      if (this.isConnected) {
        await this.client.close();
        this.logger.log('RabbitMQ connection closed');
      }
      this.isConnected = false;
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error.stack);
    }
  }
}