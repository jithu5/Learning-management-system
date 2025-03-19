import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5 * 1000;

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    // configure mongoose settings
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB successfully!...");
      this.isConnected = true;
    });
    mongoose.connection.on("error", () => {
      console.log("Error connecting to MongoDB");
      this.isConnected = false;
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Disonnected to MongoDB");
      // attempt a reconnection
      this.handleDisconnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDB URI must be specified in the environment");
      }

      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // use IPv4
      };
      if (process.env.NODE_ENV === "production") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; // reset retry count to zero after connection is established
    } catch (error) {
      console.error(error);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying to connect to MongoDB... Attempt ${this.retryCount} times`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return this.connect();
    } else {
      console.error("Failed to connect to MongoDB after multiple attempts");
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB");
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
      process.exit(0);
    } catch (error) {
      console.error("Error closing connection to MongoDB");
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// create a singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);

export const getDbStatus = dbConnection.getConnectionStatus.bind(dbConnection);
