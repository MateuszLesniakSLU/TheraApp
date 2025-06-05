import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
  ) {}

  create(dto: CreatePatientDto) {
    this.logger.info({ email: dto.email }, 'Tworzenie pacjenta');
    const {
      email,
      password,
      isActive,
      displayName,
      firstName,
      lastName,
      therapistId,
    } = dto;

    const data: any = {
      user: {
        create: {
          email,
          password,
          role: 'patient',
          isActive: isActive ?? true,
        },
      },
      displayName,
      firstName,
      lastName,
    };
    if (therapistId !== undefined) {
      data.therapistId = therapistId;
    }

    return this.prisma.patient.create({
      data,
      include: { user: true },
    });
  }

  findAll() {
    this.logger.debug('Pobieranie wszystkich pacjentów');
    return this.prisma.patient.findMany({
      include: { user: true, therapist: true },
    });
  }

  findOne(id: number) {
    this.logger.debug({ id }, 'Pobieranie pacjenta');
    return this.prisma.patient.findUnique({
      where: { id },
      include: { user: true, therapist: true },
    });
  }

  async update(id: number, dto: UpdatePatientDto, performedById: number) {
    const before = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    const result = await this.prisma.patient.update({
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
    this.logger.warn({ id }, 'Usuwanie pacjenta');
    return this.prisma.patient.delete({ where: { id } });
  }
}
