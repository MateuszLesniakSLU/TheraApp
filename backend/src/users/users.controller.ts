import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Pobierz użytkowników z wybraną rolą albo wszystkich użytkowników
  @Get()
  @Roles(Role.ADMIN, Role.THERAPIST)
  findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }
  // Pobierz profil użytkownika zalogowanego
  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMe(@Req() req) {
    console.log('req.user:', req.user);
    const userId = req.user.id ?? req.user.sub;
    if (!userId) throw new BadRequestException('Brak ID w tokenie JWT');
    return this.usersService.findById(userId);
  }

  // Pobierz konkretnego użytkownika o ID
  @Get(':id')
  @Roles(Role.ADMIN, Role.THERAPIST)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.THERAPIST, Role.PATIENT)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  // Aktualizuj użytkownika
  @Patch(':id')
  @Roles(Role.ADMIN, Role.THERAPIST, Role.PATIENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req,
  ) {
    console.log('Kto PATCHuje:', req.user);
    return this.usersService.updateUser(id, dto);
  }
  // Dezaktywuj użytkownika
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number)
  {
    console.log('Co PATCHuje:', id);
    return this.usersService.removeUser(id);
  }
  // Aktywuj użytkownika
  @Patch(':id')
  @Roles(Role.ADMIN)
  async activate(@Param('id', ParseIntPipe) id: number) {
    console.log('Co PATCHuje:', id);
    return this.usersService.activateUser(id);
  }
  // Pobierz pacjentów terapeuty o ID
  @Get(':id/patients')
  @Roles(Role.ADMIN, Role.THERAPIST)
  findTherapistPatients(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findPatientsByTherapist(id);
  }
  // Pobierz terapeutę pacjenta o ID
  @Get(':id/therapist')
  @Roles(Role.ADMIN, Role.THERAPIST, Role.PATIENT)
  findPatientsTherapist(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findTherapistOfPatient(id);
  }
}
