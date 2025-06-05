import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  /**
   * DTO tworzenia administratora
   * Dostęp tylko z rolą 'admin'
   * @param dto - Dane do utworzenia (obiekt UpdateAdminDto z ciała żądania)
   */
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  /**
   * Znajdź wszystkich administratorów
   * Dostęp tylko z rolą 'admin'
   */
  @Get()
  @Roles('admin')
  findAll() {
    return this.adminsService.findAll();
  }

  /**
   * Znajdź konkretnego administratora
   * Endpoint GET /admins/:id
   * Dostęp tylko z rolą 'admin'
   * @param id - id administratora do znalezienia
   */
  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(+id);
  }

  /**
   * Aktualizuje dane administratora o podanym ID.
   * Endpoint PATCH /admins/:id
   * Dostęp tylko z rolą 'admin'
   * @param id - ID administratora do zaktualizowania (pobrane z parametru ścieżki)
   * @param dto - Dane do aktualizacji (obiekt UpdateAdminDto z ciała żądania)
   * @param req - Obiekt żądania HTTP (wykorzystywany do pobrania ID użytkownika wykonującego operację)
   * @returns Zaktualizowany obiekt administratora lub informacja o statusie operacji
   */
  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto, @Req() req) {
    return this.adminsService.update(+id, dto, req.user.id);
  }

  /**
   * Usuwanie administratora
   * Endpoint DELETE /admins/:id
   * Dostęp tylko z rolą 'admin'
   * @param id - ID administratora do usunięcia
   */
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(+id);
  }
}
