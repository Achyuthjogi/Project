const { PrismaClient } = require('@prisma/client');

async function test() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany();
        console.log("Users:", users);
    } catch (e) {
        console.error("Error with default client:", e);
    }
    await prisma.$disconnect();
}

test();
