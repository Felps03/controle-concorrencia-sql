const pool = require('./client');

const query = async (sql, params) => {
  const client = await pool.connect();
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

const readStockItem = async (id) => {
  const rows = await query('SELECT id, amount, version FROM stocks WHERE id = $1', [id]);
  return rows[0];
};

const updateStockItem = async (id, version) => {
  const result = await query(
    'UPDATE stocks SET amount = amount - 1, version = version + 1 WHERE id = $1 AND version = $2 RETURNING *',
    [id, version]
  );
  return result.length > 0;
};

const purchase = async (id) => {
  const stockItem = await readStockItem(id);

  if (!stockItem || stockItem.amount <= 0) {
    console.log("Compra falhou: estoque insuficiente.");
    return;
  }

  const success = await updateStockItem(stockItem.id, stockItem.version);
  if (!success) {
    console.log("Compra falhou: erro de concorrência.");
    return;
  }

  console.log("Compra bem-sucedida.");
};

const main = async () => {
  try {
    const id = "f92ef45b-a729-4938-b580-03d939a80301";

    const purchases = Array.from({ length: 100 }, () => () => purchase(id));
    await Promise.all(purchases.map(func => func()));

    const finalStockItem = await readStockItem(id);
    console.log("Resultado final do estoque:", finalStockItem);
  } catch (e) {
    console.error("Erro durante a execução do script:", e);
  }
};

main();
