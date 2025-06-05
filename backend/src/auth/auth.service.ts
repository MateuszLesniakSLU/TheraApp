import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * rejestracja użytkowników
   * @param dto - dane rejestracyjne konta
   * @param role - rola która będzie przyznawana podczas rejestracji
   */
  async register(
    dto: RegisterDto,
    role: 'therapist' | 'patient' | 'admin' = 'therapist',
  ) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExists) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        role: role,
        ...(role === 'therapist' && { therapist: { create: {} } }),
        ...(role === 'patient' && {
          patient: { create: { displayName: dto.email.split('@')[0] } },
        }),
        ...(role === 'admin' && { admin: { create: {} } }),
      },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  /**
   * weryfikacja danych podczas logowania do systemu
   * @param dto - dane przekazywane podczas próby zalogowania
   * @param req - żądanie logowania
   */
  async login(dto: LoginDto, req?: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Nieprawidłowe dane');
    }

    if (!user.isActive) {
      await this.prisma.userActivityLog.create({
        data: {
          userId: user.id,
          performedById: user.id,
          action: 'login_failed_blocked',
          details: JSON.stringify({
            ip: req?.ip,
            userAgent: req?.headers?.['user-agent'],
          }),
        },
      });
      throw new UnauthorizedException('Konto jest zablokowane');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.password);
    if (!passwordOk) {
      await this.prisma.userActivityLog.create({
        data: {
          userId: user.id,
          performedById: user.id,
          action: 'login_failed',
          details: JSON.stringify({
            ip: req?.ip,
            userAgent: req?.headers?.['user-agent'],
          }),
        },
      });
      throw new UnauthorizedException('Nieprawidłowe dane');
    }

    await this.prisma.userActivityLog.create({
      data: {
        userId: user.id,
        performedById: user.id,
        action: 'login_success',
        details: JSON.stringify({
          ip: req?.ip,
          userAgent: req?.headers?.['user-agent'],
        }),
      },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  /**
   * asynchroniczne pobieranie profilu przez wyszukiwanie id
   * @param id - ID szukanego użytkownika
   */
  async getProfile(id: number | string | undefined) {
    if (!id || isNaN(Number(id))) {
      throw new Error('User id is required and must be a number');
    }
    return this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        role: true,
        therapist: {
          select: { id: true, firstName: true, lastName: true },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        admin: { select: { id: true } },
      },
    });
  }

  /**
   * asynchroniczna metoda aktualizowania profilu użytkownika
   * @param id - ID profilu który ma być aktualizowany
   * @param dto - dane które mogą być aktualizowane
   */
  async updateProfile(
    id: number,
    dto: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
    },
  ) {
    const userData: any = {};
    if (dto.email) userData.email = dto.email;
    if (dto.password) userData.password = await bcrypt.hash(dto.password, 10);

    if (Object.keys(userData).length > 0) {
      await this.prisma.user.update({
        where: { id },
        data: userData,
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (
      user?.role === 'therapist' &&
      (dto.firstName !== undefined || dto.lastName !== undefined)
    ) {
      const therapistData: any = {};
      if (dto.firstName !== undefined) therapistData.firstName = dto.firstName;
      if (dto.lastName !== undefined) therapistData.lastName = dto.lastName;
      if (Object.keys(therapistData).length > 0) {
        await this.prisma.therapist.update({
          where: { userId: id },
          data: therapistData,
        });
      }
    }
    if (
      user?.role === 'patient' &&
      (dto.firstName !== undefined ||
        dto.lastName !== undefined ||
        dto.displayName !== undefined)
    ) {
      const patientData: any = {};
      if (dto.firstName !== undefined) patientData.firstName = dto.firstName;
      if (dto.lastName !== undefined) patientData.lastName = dto.lastName;
      if (dto.displayName !== undefined)
        patientData.displayName = dto.displayName;
      if (Object.keys(patientData).length > 0) {
        await this.prisma.patient.update({
          where: { userId: id },
          data: patientData,
        });
      }
    }

    return await this.getProfile(id);
  }
}
