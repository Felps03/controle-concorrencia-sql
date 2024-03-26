const { Pool } = require("pg");

class PoolSingleton {
  constructor() {
    if (!PoolSingleton.instance) {
      PoolSingleton.instance = new Pool({
        user: "postgres",
        host: "localhost",
        database: "transactions",
        password: "postgres",
        port: 5432,
      });
    }
    return PoolSingleton.instance;
  }
}

module.exports = new PoolSingleton();