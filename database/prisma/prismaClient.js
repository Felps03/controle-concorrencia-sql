const { PrismaClient } = require('@prisma/client');

class PrismaSingleton {
    constructor() {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient();
        }
        return PrismaSingleton.instance;
    }
}

module.exports = new PrismaSingleton();
