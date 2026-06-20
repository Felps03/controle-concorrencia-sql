import poolClient from "../database/pool/poolClient.js";
import { IDatabaseStrategy } from "./IDatabaseStrategy.js";
import logger from "../logger.js";

export class PoolStrategy extends IDatabaseStrategy {

  async query (sql, params) {
    const client = await poolClient.connect();
    try {
      const res = await client.query(sql, params);
      return res.rows;
    } catch (e) {
      logger.error({ err: e }, "Erro na operacao de banco de dados");
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
