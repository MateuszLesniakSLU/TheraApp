import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tworzy nowego administratora oraz powiązanego użytkownika w bazie danych
   * @param dto - Dane nowego administratora
   * @returns Utworzony rekord administratora z relacją do użytkownika
   */
  create(dto: CreateAdminDto) {
    return this.prisma.admin.create({
      data: {
        user: {
          create: {
            email: dto.email,
            password: dto.password,
            role: 'admin',
            isActive: dto.isActive ?? true,
          },
        },
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      include: { user: true },
    });
  }

  /**
   * Znajdź wszystkich
   */
  findAll() {
    return this.prisma.admin.findMany({ include: { user: true } });
  }

  /**
   * Znajdź jednego
   * @param id - ID poszukiwanego administratora
   */
  findOne(id: number) {
    return this.prisma.admin.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Aktualizuje dane istniejącego już administratora i wysyła zmiany do bazy danych
   * @param id - id administratora którego profil i dane będą aktualizowane
   * @param dto - dane aktualizowanego administratora
   * @param performedById - id administratora który wprowadził zmiany
   */
  async update(id: number, dto: UpdateAdminDto, performedById: number) {
    const before = await this.prisma.admin.findUnique({
      where: { id },
      include: { user: true },
    });

    const result = await this.prisma.admin.update({
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

  /**
   * usuń administratora
   * @param id - ID administratora który będzie usuwany
   */
  remove(id: number) {
    return this.prisma.admin.delete({ where: { id } });
  }
}
