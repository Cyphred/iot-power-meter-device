import amqp, { Connection } from "amqplib";
import messageChannels from "./channels.js";
import startConsumer from "./startConsumer.js";
import IRawConsumption from "../types/rawConsumption.js";

/**
 * Attempts to connect to a RabbitMQ server via a connection string.
 * Will only attempt to retry connection for a fixed number of times.
 * @returns the connection object
 */
async function connectToRabbitMQ() {
  // Get URI from env
  const uri = process.env.RABBITMQ_URI;

  // Get max retries from .env
  // If not defined, defaults to 6
  const maxRetries = process.env.RABBITMQ_MAX_RETRIES
    ? parseInt(process.env.RABBITMQ_MAX_RETRIES)
    : 6;

  // Try until connection is successful or max retries is reached
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(
        `Attempting to connect to RabbitMQ... (attempt ${i} out of ${maxRetries})`
      );

      // Attempt connection
      const connection = await amqp.connect(uri!);
      console.log("Connected to RabbitMQ");

      return connection;
    } catch (error) {
      // Wait 5 seconds if anothre retry is available
      if (i < maxRetries) {
        console.log("Failed to connect to RabbitMQ. Retrying in 5 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  // If retries are exhausted
  throw Error(
    "Could not establish connection to RabbitMQ. Check if the server is up or if the correct URI is set in environment"
  );
}

const startDataPointConsumer = async (connection: Connection) => {
  await startConsumer(
    connection,
    messageChannels.CONSUMPTION_DATA,
    true,
    (payload: IRawConsumption) => {
      // TODO Handle incoming raw data
    }
  );
};

/**
 * Sets up a connection with RabbitMQ and subscribes to channels.
 */
export default async function setup() {
  const connection = await connectToRabbitMQ();

  await startDataPointConsumer(connection);
}
