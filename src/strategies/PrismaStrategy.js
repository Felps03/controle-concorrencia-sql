const prisma = require('../database/prisma/prismaClient');

const { IDatabaseStrategy } = require("./IDatabaseStrategy");
const logger = require("../logger");

class PrismaStrategy extends IDatabaseStrategy {
  async readStockItem(id) {
    return await prisma.stock.findUnique({
      where: { id },
      select: { id: true, amount: true, version: true },
    });
  }

  async updateStockItem(id, version) {
    try {
      await prisma.stock.update({
        where: { id, version },
        data: { amount: { decrement: 1 }, version: { increment: 1 } },
      });
      return true;
    } catch (error) {
      if (error.message.includes("Record to update not found")) {
        logger.debug({ id, version }, "Tentativa de compra ignorada devido a conflito de versao");
        return false;
      } else {
        throw error;
      }
    }
  }
}


module.exports = { PrismaStrategy };
