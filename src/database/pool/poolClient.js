import { Pool } from "pg";

class PoolSingleton {
  constructor() {
    if (!PoolSingleton.instance) {
      PoolSingleton.instance = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    return PoolSingleton.instance;
  }
}

export default new PoolSingleton();
