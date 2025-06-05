import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@therapy.app';
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hash,
        role: 'admin',
        admin: { create: {} }, // profil admina
      },
    });
    console.log('✅ Admin utworzony.', adminUser.email);
  } else {
    console.log('Admin już istnieje.');
  }

  const therapistEmail = 'therapist1@therapy.app';
  const therapistExists = await prisma.user.findUnique({
    where: { email: therapistEmail },
  });

  if (!therapistExists) {
    const hash = await bcrypt.hash('therapist123', 10);
    const therapistUser = await prisma.user.create({
      data: {
        email: therapistEmail,
        password: hash,
        role: 'therapist',
        therapist: { create: {} }, // profil terapeuty
      },
    });
    console.log('✅ Terapeuta utworzony.', therapistUser.email);
  } else {
    console.log('Terapeuta już istnieje.');
  }

  const patientEmail = 'patient1@therapy.app';
  const patientExists = await prisma.user.findUnique({
    where: { email: patientEmail },
  });

  if (!patientExists) {
    const hash = await bcrypt.hash('patient123', 10);
    const firstTherapist = await prisma.therapist.findFirst();
    const patientUser = await prisma.user.create({
      data: {
        email: patientEmail,
        password: hash,
        role: 'patient',
        patient: {
          create: {
            displayName: 'Pacjent Pierwszy',
            therapist: firstTherapist
              ? { connect: { id: firstTherapist.id } }
              : undefined,
          },
        },
      },
    });
    console.log('✅ Pacjent utworzony.', patientUser.email);
  } else {
    console.log('Pacjent już istnieje.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
