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
import { TherapistsService } from './therapists.service';
import { CreateTherapistDto } from './dto/create-therapist.dto';
import { UpdateTherapistDto } from './dto/update-therapist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('therapists')
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateTherapistDto) {
    return this.therapistsService.create(dto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.therapistsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'therapist')
  findOne(@Param('id') id: string) {
    return this.therapistsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateTherapistDto, @Req() req) {
    return this.therapistsService.update(+id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.therapistsService.remove(+id);
  }
}
