import { Connection } from "amqplib";

/**
 * Starts a consumer on a specified queue and runs a function passed to it
 * @param connection is the connection with the RabbitMQ server
 * @param queueName is the name of the message queue that will be consumed
 * @param callback will be ran when a message is consumed
 */
export default async function startConsumer(
  connection: Connection,
  queueName: string,
  durable: boolean,
  callback: (payload: any) => void
) {
  // Throw an error if connection has one
  connection.on("error", (err) => {
    throw Error(err);
  });

  // Create a channel
  const channel = await connection.createChannel();

  // Creates a queue if it does not exist yet
  await channel.assertQueue(queueName, { durable: durable });

  // Subscribe to queue as consumer
  channel.consume(queueName, (message) => {
    // Parse payload as JSON
    const payload = JSON.parse(message.content.toString());

    // Run provided callback function
    callback(payload);

    // Removes message from queue
    channel.ack(message);
  });
}
