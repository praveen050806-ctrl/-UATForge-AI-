/**
 * MongoDB Connection Abstraction Placeholder
 * 
 * NOTE: This is an architectural placeholder for Milestone 1B.
 * MongoDB connection handling, pooling, and collections will be implemented
 * in a subsequent milestone. No database connection or credentials are used.
 */

export interface DbConnectionStatus {
  isConnected: boolean;
  status: "disconnected" | "connecting" | "connected" | "error";
  message: string;
}

export async function getDbConnectionStatus(): Promise<DbConnectionStatus> {
  return {
    isConnected: false,
    status: "disconnected",
    message: "MongoDB connection is deferred to a future milestone. Application is running in shell mode.",
  };
}

export async function getDatabase(): Promise<never> {
  throw new Error(
    "MongoDB database operations are not enabled in Milestone 1B. Database connectivity will be configured in a subsequent milestone."
  );
}
