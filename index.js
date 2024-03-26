const prisma = require("./client");

const read = async () => {
  const stock = await prisma.stock.findUnique({
    where: {id: "f92ef45b-a729-4938-b580-03d939a80301"},
    select: { id: true, amount: true, version: true },
  });

  return stock;
};


const updateStockItem = async (id, version) => {
  try {
    await prisma.stock.update({
      where: {
        id,
        version,
      },
      data: {
        amount: { decrement: 1 },
        version: { increment: 1 },
      },
    });
  } catch (error) {
    if (error.message.includes("Record to update not found")) {
      console.log("Tentativa de compra ignorada devido a condição de corrida");
    } else {
      throw error;
    }
  }
};

const purchase = async () => {
  const stockItem = await read();

  if (!stockItem || stockItem.amount <= 0) return;

  await updateStockItem(stockItem.id, stockItem.version);
};


const main = async () => {
  const purchases = Array.from({ length: 100 }, () => purchase());
  await Promise.all(purchases);

  const finalStockItem = await read();

  console.log("Resultado final do estoque:", finalStockItem);
};

main().catch(e => {
  console.error("Erro durante a execução do script:", e);
});
