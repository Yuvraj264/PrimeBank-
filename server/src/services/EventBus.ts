import { rabbitMQ } from '../config/rabbitMQ';
import { Channel } from 'amqplib';

export class EventBus {
    private static exchange = 'primebank_events';

    // Ensure the exchange exists
    static async init() {
        try {
            const channel: Channel = rabbitMQ.getChannel();
            await channel.assertExchange(this.exchange, 'topic', { durable: true });
            console.log(`[EventBus] Initialized exchange: ${this.exchange}`);
        } catch (error) {
            console.error('[EventBus] Failed to initialize exchange, retrying...', error);
            setTimeout(() => this.init(), 5000);
        }
    }

    /**
     * Publishes an event to the RabbitMQ exchange.
     * @param routingKey The event name (e.g. transaction.created, fraud.score.requested)
     * @param payload The data associated with the event
     */
    static async publish(routingKey: string, payload: any) {
        try {
            const channel: Channel = rabbitMQ.getChannel();
            const message = Buffer.from(JSON.stringify(payload));

            // The exchange routes the message to any queues bound with a matching routing key
            const success = channel.publish(this.exchange, routingKey, message, {
                persistent: true // Messages survive broker restarts
            });

            if (success) {
                console.log(`[EventBus] Published Event: ${routingKey}`);
            } else {
                console.error(`[EventBus] Failed to Publish Event (Buffer full): ${routingKey}`);
            }
        } catch (error) {
            console.error(`[EventBus] Error publishing event ${routingKey}:`, error);
        }
    }

    /**
     * Subscribes to an event pattern.
     * @param queueName The name of the queue (e.g., 'transaction_processor')
     * @param routingKey The pattern to map (e.g., 'transaction.*')
     * @param callback Function to process the message
     */
    static async subscribe(queueName: string, routingKey: string, callback: (payload: any) => Promise<void>) {
        try {
            const channel: Channel = rabbitMQ.getChannel();

            // Ensure the queue exists
            await channel.assertQueue(queueName, { durable: true });
            // Bind the queue to the exchange
            await channel.bindQueue(queueName, this.exchange, routingKey);

            console.log(`[EventBus] Subscribed Queue: ${queueName} to Key: ${routingKey}`);

            channel.consume(queueName, async (msg) => {
                if (msg !== null) {
                    try {
                        const payload = JSON.parse(msg.content.toString());
                        await callback(payload);

                        // Acknowledge the message was processed successfully
                        channel.ack(msg);
                    } catch (err) {
                        console.error(`[EventBus] Error processing message on ${queueName}:`, err);
                        // Depending on the logic, either nack or send to Dead Letter Queue
                        // Here we just reject but don't requeue to prevent infinite loops (or set true if momentary network error)
                        channel.nack(msg, false, false);
                    }
                }
            });
        } catch (error) {
            console.error(`[EventBus] Failed to subscribe to ${queueName}:`, error);
        }
    }
}
