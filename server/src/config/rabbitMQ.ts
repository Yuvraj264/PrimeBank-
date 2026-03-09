import amqplib, { ChannelModel, Channel } from 'amqplib';

class RabbitMQ {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private readonly url: string;

    constructor() {
        this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqplib.connect(this.url);
            this.channel = await this.connection.createChannel();
            console.log('RabbitMQ connected successfully');

            // Handle connection drops
            this.connection.on('error', (err: any) => {
                console.error('RabbitMQ connection error:', err);
                setTimeout(() => this.connect(), 5000);
            });

            this.connection.on('close', () => {
                console.error('RabbitMQ connection closed, retrying...');
                setTimeout(() => this.connect(), 5000);
            });
        } catch (error) {
            console.error('Failed to connect to RabbitMQ, retrying in 5s...', error);
            setTimeout(() => this.connect(), 5000);
        }
    }

    getChannel(): Channel {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not established');
        }
        return this.channel;
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
        console.log('RabbitMQ connection closed.');
    }
}

export const rabbitMQ = new RabbitMQ();
