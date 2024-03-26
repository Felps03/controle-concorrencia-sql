const poolClient  = require('../database/pool/poolClient'); // Supondo que 

const { IDatabaseStrategy } = require("./IDatabaseStrategy");

class PoolStrategy extends IDatabaseStrategy {

  async query (sql, params) {
    const client = await poolClient.connect();
    try {
      const res = await client.query(sql, params);
      return res.rows;
    } catch (e) {
      console.error("Erro na operação de banco de dados:", e.message);
      throw e;
    } finally {
      client.release();
    }
  };

  
  async readStockItem(id) {
    const res = await this.query('SELECT id, amount, version FROM stocks WHERE id = $1', [id]);
    return res[0];
  }

  async updateStockItem(id, version) {
    const result = await this.query(
      'UPDATE stocks SET amount = amount - 1, version = version + 1 WHERE id = $1 AND version = $2 RETURNING *',
      [id, version]
    );
    return result.length > 0;
  }
}

module.exports = { PoolStrategy };
