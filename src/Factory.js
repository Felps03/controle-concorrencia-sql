import { PoolStrategy } from "./strategies/PoolStrategy.js";
import { PrismaStrategy } from "./strategies/PrismaStrategy.js";

class DatabaseStrategyFactory {
  static strategies = {
    pool: PoolStrategy,
    prisma: PrismaStrategy,
  };

  static create(strategyType) {
    const Strategy = this.strategies[strategyType];
    if (!Strategy) {
      throw new Error('Invalid database strategy type');
    }
    return new Strategy();
  }
}

export default DatabaseStrategyFactory;
