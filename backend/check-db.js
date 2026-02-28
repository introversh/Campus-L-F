
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rooms = await prisma.chatRoom.findMany({
        include: {
            participants: {
                include: {
                    user: { select: { name: true, email: true } }
                }
            },
            match: {
                include: {
                    lostItem: true,
                    foundItem: true
                }
            },
            _count: { select: { messages: true } }
        }
    });

    console.log(JSON.stringify(rooms, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
