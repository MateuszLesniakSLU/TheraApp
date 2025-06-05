import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

/**
 * Kontroler odpowiedzialny za autentykacje użytkowników
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Rejestracja użytkowników
   * @param dto - dane rejestracyjne konta: email, hasło
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * logowanie użytkownika do systemu
   * @param dto - dane pobierane podczas logowania do aplikacji
   * @param req - żądanie logowania
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req) {
    return this.authService.login(dto, req);
  }

  /**
   * Pobieranie profilu po zalogowaniu
   * @param req - żądanie do pobrania profilu
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.authService.getProfile(Number(req.user.id));
  }

  /**
   * Aktualizowanie danych profilu
   * @param req - żądanie wysyłane po zaktualizowaniu profilu
   * @param dto - dane przekazywane podczas aktualizacji profilu
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req,
    @Body()
    dto: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
    },
  ) {
    return this.authService.updateProfile(Number(req.user.id), dto);
  }
}
