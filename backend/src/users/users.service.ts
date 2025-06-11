import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Znajdź użytkowników z daną rolą lub wszystkich
   * @param role - rola przypisana do konta
   */
  async findAll(role?: Role): Promise<User[]> {
    if (role) {
      if (role === Role.THERAPIST)
        return this.prisma.user.findMany({
          where: { role },
          include: { patients: true },
        });
      if (role === Role.PATIENT)
        return this.prisma.user.findMany({
          where: { role },
          include: { therapist: true },
        });
      return this.prisma.user.findMany({ where: { role } });
    }
    return this.prisma.user.findMany();
  }

  /**
   * Pobierz użytkownika o ID
   * @param id - ID użytkownika którego chcemy znaleźć
   */
  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { therapist: true, patients: true },
    });
    if (!user)
      throw new NotFoundException(
        `Użytkownik o ID:${id} nie został znaleziony.`,
      );
    if (!user.isActive)
      throw new ForbiddenException(
        `Użytkownik o ID:${id} jest nieaktywny.`,
      );
    return user;
  }

  /**
   * Utwórz użytkownika
   * @param data - dane przekazywane przez dto CreateUserDTO
   */
  async createUser(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        role: data.role ?? Role.PATIENT,
      },
    });
  }

  /**
   * Aktualizuj użytkownika
   * @param id - ID użytkownika którego dane będą aktualizowane
   * @param data - dane przekazywane przez dto UpdateUserDTO
   */
  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Dezaktywuj użytkownika (konto zostaje w bazie, ale nie można się zalogować)
   * @param id - ID użytkownika który będzie miał dezaktywowane konto
   */
  async removeUser(id: number): Promise<User> {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Aktywuj użytkownika
   * @param id - ID użytkownika do odblokowania konta
   */
  async activateUser(id: number): Promise<User> {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: { isActive: true } });
  }

  /**
   * Znajdź pacjentów danego terapeuty
   * @param therapistId - ID terapeuty do którego przypisani są pacjenci
   */
  async findPatientsByTherapist(therapistId: number): Promise<User[]> {
    const therapist = await this.prisma.user.findUnique({
      where: { id: therapistId },
      select: { id: true, role: true },
    });
    if (!therapist || therapist.role !== Role.THERAPIST) {
      return [];
    }
    return this.prisma.user.findMany({
      where: { therapistId: therapistId, role: Role.PATIENT },
    });
  }

  /**
   * Znajdź terapeutę pacjenta
   * @param patientId - ID pacjenta który pobiera dane swojego terapeuty
   */
  async findTherapistOfPatient(patientId: number): Promise<User | null> {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: { therapist: true },
    });
    if (patient?.therapist && patient.therapist.role === Role.THERAPIST) {
      return patient.therapist;
    }
    return null;
  }

  /**
   * Znajdź po emailu przypisanym do konta
   * @param email - email przypisany do konta użytkownika
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Ustaw nowy token odświeżania
   * @param userId - id użytkownika którego token ma być odświeżony
   * @param refreshToken - zahashowany token, czas życia 7dni
   */
  async setCurrentRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }

  /**
   * Pobierz dane użytkownika jeżeli token się zgadza
   * @param userId
   * @param refreshToken
   */
  async getUserIfRefreshTokenMatches(
    userId: number,
    refreshToken: string,
  ): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken) return null;
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    return isMatch ? user : null;
  }

}
