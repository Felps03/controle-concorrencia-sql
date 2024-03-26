const { PoolStrategy } = require('./strategies/PoolStrategy');
const { PrismaStrategy } = require('./strategies/PrismaStrategy');

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

module.exports = DatabaseStrategyFactory;
