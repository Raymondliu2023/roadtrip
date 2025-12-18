import { createClient } from 'redis';

let client = null;

/**
 * Get or create Redis client
 * @returns {RedisClient} Redis client instance
 */
export function getClient() {
  if (client) {
    return client;
  }

  const config = {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Too many reconnection attempts, giving up');
          return new Error('Too many retries');
        }
        // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, then 1s
        const delay = Math.min(retries * 50, 1000);
        console.log(`Redis: Retrying connection in ${delay}ms...`);
        return delay;
      },
    },
  };

  // Add password if provided
  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }

  // Support for full connection URL (overrides individual params)
  if (process.env.REDIS_URL) {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: config.socket.reconnectStrategy,
      },
    });
  } else {
    client = createClient(config);
  }

  // Handle errors
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  client.on('connect', () => {
    console.log('Redis client connected');
  });

  client.on('ready', () => {
    console.log('Redis client ready');
  });

  client.on('reconnecting', () => {
    console.log('Redis client reconnecting...');
  });

  client.on('end', () => {
    console.log('Redis client connection ended');
  });

  return client;
}

/**
 * Connect to Redis
 * @returns {Promise<boolean>} True if connection successful
 */
export async function connect() {
  try {
    const client = getClient();
    if (!client.isOpen) {
      await client.connect();
    }
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    return false;
  }
}

/**
 * Test Redis connection
 * @returns {Promise<boolean>} True if connection works
 */
export async function testConnection() {
  try {
    const client = getClient();
    if (!client.isOpen) {
      await connect();
    }
    const pong = await client.ping();
    console.log('Redis ping successful:', pong);
    return true;
  } catch (error) {
    console.error('Redis ping failed:', error.message);
    return false;
  }
}

/**
 * Disconnect from Redis
 * @returns {Promise<void>}
 */
export async function disconnect() {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
    console.log('Redis client disconnected');
  }
}

/**
 * Set a value in Redis with optional TTL
 * @param {string} key - Redis key
 * @param {string} value - Value to store
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<string>} Redis response
 */
export async function set(key, value, ttl = null) {
  try {
    const client = getClient();
    if (!client.isOpen) {
      await connect();
    }
    if (ttl) {
      return await client.setEx(key, ttl, value);
    }
    return await client.set(key, value);
  } catch (error) {
    console.error('Redis SET error:', error);
    throw error;
  }
}

/**
 * Get a value from Redis
 * @param {string} key - Redis key
 * @returns {Promise<string|null>} Value or null if not found
 */
export async function get(key) {
  try {
    const client = getClient();
    if (!client.isOpen) {
      await connect();
    }
    return await client.get(key);
  } catch (error) {
    console.error('Redis GET error:', error);
    throw error;
  }
}

/**
 * Delete a key from Redis
 * @param {string} key - Redis key
 * @returns {Promise<number>} Number of keys deleted
 */
export async function del(key) {
  try {
    const client = getClient();
    if (!client.isOpen) {
      await connect();
    }
    return await client.del(key);
  } catch (error) {
    console.error('Redis DEL error:', error);
    throw error;
  }
}

export default {
  getClient,
  connect,
  testConnection,
  disconnect,
  set,
  get,
  del,
};
