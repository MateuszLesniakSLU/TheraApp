import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const therapistPassword = await bcrypt.hash('therapist123', 10);
  const patientPassword = await bcrypt.hash('patient123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      firstName: 'Anna',
      lastName: 'Kowalska',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'therapist@example.com' },
    update: {},
    create: {
      email: 'therapist@example.com',
      password: therapistPassword,
      role: Role.THERAPIST,
      firstName: 'Tomasz',
      lastName: 'Terapeuta',
      isActive: true,
    },
  });

  const therapist = await prisma.user.findUnique({
    where: { email: 'therapist@example.com' },
  });

  await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: patientPassword,
      role: Role.PATIENT,
      firstName: 'Piotr',
      lastName: 'Pacjent',
      isActive: true,
      therapistId: therapist?.id,
    },
  });

  console.log('Seed finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
