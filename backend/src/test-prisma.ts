import { PrismaService } from './prisma/prisma.service';

async function main() {
    const prisma = new PrismaService();
    const therapists = await prisma.therapist.findMany();
    console.log('Therapists:', therapists);
    await prisma.$disconnect();
}

main();
