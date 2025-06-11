import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import {RegisterDto} from "./dto/register.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   *
   * @param loginDto
   * @param res
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) throw new UnauthorizedException('Nieprawidłowe dane');
    const { access_token, refresh_token } = await this.authService.login(user);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    if (!user.isActive) throw new UnauthorizedException('To konto nie istnieje lub jest nieaktywne.');
    res.json({ access_token });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const user = await this.authService.verifyRefreshToken(refreshToken);

    const dbUser = await this.usersService.getUserIfRefreshTokenMatches(
      user.id,
      refreshToken,
    );
    if (!dbUser) throw new UnauthorizedException('Refresh token mismatch');

    const accessToken = this.authService.generateAccessToken(user);
    const newRefreshToken = this.authService.generateRefreshToken(user);
    await this.usersService.setCurrentRefreshToken(user.id, newRefreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ access_token: accessToken });
  }
}
