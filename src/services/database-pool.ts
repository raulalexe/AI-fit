import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Database connection pool configuration
interface DatabasePoolConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Default pool configuration
const defaultPoolConfig: DatabasePoolConfig = {
  maxConnections: 10,
  minConnections: 2,
  connectionTimeout: 30000, // 30 seconds
  idleTimeout: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Connection pool class
export class DatabaseConnectionPool {
  private clients: SupabaseClient[] = [];
  private availableClients: SupabaseClient[] = [];
  private busyClients: Set<SupabaseClient> = new Set();
  private config: DatabasePoolConfig;
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor(config: Partial<DatabasePoolConfig> = {}) {
    this.config = { ...defaultPoolConfig, ...config };
    this.supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key are required');
    }
  }

  // Initialize the connection pool
  async initialize(): Promise<void> {
    try {
      // Create minimum number of connections
      for (let i = 0; i < this.config.minConnections; i++) {
        const client = this.createClient();
        this.clients.push(client);
        this.availableClients.push(client);
      }
      
      console.log(`Database pool initialized with ${this.config.minConnections} connections`);
    } catch (error) {
      console.error('Failed to initialize database pool:', error);
      throw error;
    }
  }

  // Create a new Supabase client
  private createClient(): SupabaseClient {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: {
        storage: {
          getItem: async (key: string) => {
            try {
              return await SecureStore.getItemAsync(key);
            } catch (error) {
              console.error('Error getting item from secure store:', error);
              return null;
            }
          },
          setItem: async (key: string, value: string) => {
            try {
              await SecureStore.setItemAsync(key, value);
            } catch (error) {
              console.error('Error setting item in secure store:', error);
            }
          },
          removeItem: async (key: string) => {
            try {
              await SecureStore.deleteItemAsync(key);
            } catch (error) {
              console.error('Error removing item from secure store:', error);
            }
          },
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'ai-fitness-app',
        },
      },
    });
  }

  // Get an available client from the pool
  async getClient(): Promise<SupabaseClient> {
    // Try to get an available client
    if (this.availableClients.length > 0) {
      const client = this.availableClients.pop()!;
      this.busyClients.add(client);
      return client;
    }

    // If no available clients and we haven't reached max connections, create a new one
    if (this.clients.length < this.config.maxConnections) {
      const client = this.createClient();
      this.clients.push(client);
      this.busyClients.add(client);
      return client;
    }

    // Wait for a client to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Database connection timeout'));
      }, this.config.connectionTimeout);

      const checkForAvailableClient = () => {
        if (this.availableClients.length > 0) {
          clearTimeout(timeout);
          const client = this.availableClients.pop()!;
          this.busyClients.add(client);
          resolve(client);
        } else {
          setTimeout(checkForAvailableClient, 100);
        }
      };

      checkForAvailableClient();
    });
  }

  // Return a client to the pool
  releaseClient(client: SupabaseClient): void {
    if (this.busyClients.has(client)) {
      this.busyClients.delete(client);
      this.availableClients.push(client);
    }
  }

  // Execute a database operation with automatic connection management
  async execute<T>(
    operation: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    
    try {
      const result = await operation(client);
      return result;
    } catch (error) {
      console.error('Database operation error:', error);
      throw error;
    } finally {
      this.releaseClient(client);
    }
  }

  // Get pool statistics
  getPoolStats() {
    return {
      totalConnections: this.clients.length,
      availableConnections: this.availableClients.length,
      busyConnections: this.busyClients.size,
      maxConnections: this.config.maxConnections,
      minConnections: this.config.minConnections,
    };
  }

  // Health check for all connections
  async healthCheck(): Promise<boolean> {
    try {
      const healthChecks = await Promise.allSettled(
        this.clients.map(client => client.from('user_profiles').select('count').limit(1))
      );
      
      const successfulChecks = healthChecks.filter(
        result => result.status === 'fulfilled'
      ).length;
      
      return successfulChecks > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Close all connections
  async close(): Promise<void> {
    try {
      // Clear all clients
      this.clients = [];
      this.availableClients = [];
      this.busyClients.clear();
      
      console.log('Database pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
  }
}

// Create and export singleton instance
export const databasePool = new DatabaseConnectionPool();

// Initialize the pool when the module is imported
databasePool.initialize().catch(error => {
  console.error('Failed to initialize database pool:', error);
});

export default databasePool;