import prisma from "../database/prisma/prismaClient.js";
import { IDatabaseStrategy } from "./IDatabaseStrategy.js";
import logger from "../logger.js";

export class PrismaStrategy extends IDatabaseStrategy {
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
      // P2025 = "Record not found" - codigo de erro estavel do Prisma,
      // ao contrario do texto da mensagem (que mudou entre majors).
      if (error.code === "P2025") {
        logger.debug({ id, version }, "Tentativa de compra ignorada devido a conflito de versao");
        return false;
      } else {
        throw error;
      }
    }
  }
}
