import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password)) && user.isActive) {
      return user;
    }
    return null;
  }
  async login(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.usersService.setCurrentRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Użytkownik już istnieje');

    const hash = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.createUser({
      ...dto,
      password: hash,
    });

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: newUser };
  }

  generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET') ?? 'dev-secret',
    });
  }

  generateRefreshToken(user: User): string {
    const payload = { sub: user.id };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        'dev-refresh-secret',
    });
  }

  /**
   * Zweryfikuj token odświeżający
   * @param token - token tworzony podczas logowania
   */
  async verifyRefreshToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'dev-refresh-secret',
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new ForbiddenException('User not found');
      return user;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
