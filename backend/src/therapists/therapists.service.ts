import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TherapistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {}

  create(dto: CreateTherapistDto) {
    this.logger.info({ email: dto.email }, 'Tworzenie terapeuty');
    return this.prisma.therapist.create({
      data: {
        user: {
          create: {
            email: dto.email,
            password: dto.password,
            role: 'therapist',
            isActive: dto.isActive ?? true,
          },
        },
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      include: { user: true },
    });
  }

  findAll() {
    this.logger.debug('Pobieranie wszystkich terapeutów');
    return this.prisma.therapist.findMany({
      include: { user: true, patients: true },
    });
  }

  findOne(id: number) {
    this.logger.debug({ id }, 'Pobieranie terapeuty');
    return this.prisma.therapist.findUnique({
      where: { id },
      include: { user: true, patients: true },
    });
  }

  async update(id: number, dto: UpdateTherapistDto, performedById: number) {
    const before = await this.prisma.therapist.findUnique({
      where: { id },
      include: { user: true },
    });

    const result = await this.prisma.therapist.update({
      where: { id },
      data: dto,
      include: { user: true },
    });

    const changedFields = Object.keys(dto);
    const details: any = {
      updatedFields: changedFields,
      before: {},
      after: {},
    };

    if (before) {
      for (const field of changedFields) {
        if (field === 'isActive') {
          details.before[field] = before.user?.isActive;
          details.after[field] = result.user?.isActive;
        } else {
          details.before[field] = before[field];
          details.after[field] = result[field];
        }
      }
    }

    await this.prisma.userActivityLog.create({
      data: {
        userId: id,
        performedById,
        action: 'profile_update',
        details: JSON.stringify(details),
      },
    });

    return result;
  }

  remove(id: number) {
    this.logger.warn({ id }, 'Usuwanie terapeuty');
    return this.prisma.therapist.delete({ where: { id } });
  }
}
