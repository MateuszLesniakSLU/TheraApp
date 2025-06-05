import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SurveyItemsService } from './survey-items.service';
import { CreateSurveyItemDto } from './dto/create-survey-item.dto';
import { UpdateSurveyItemDto } from './dto/update-survey-item.dto';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('survey-items')
export class SurveyItemsController {
    constructor(private readonly svc: SurveyItemsService) {}

    @Post()
    create(@Body() dto: CreateSurveyItemDto) {
        return this.svc.create(dto);
    }

    @Get()
    findAll() {
        return this.svc.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.svc.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSurveyItemDto) {
        return this.svc.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.svc.remove(+id);
    }
}
