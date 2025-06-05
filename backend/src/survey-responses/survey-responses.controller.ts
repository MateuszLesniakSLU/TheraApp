import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { SurveyResponsesService } from './survey-responses.service';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('survey-responses')
export class SurveyResponsesController {
    constructor(private svc: SurveyResponsesService) {}

    @Post()
    create(@Body() dto: CreateSurveyResponseDto) {
        return this.svc.create(dto);
    }

    @Get('patient/:patientId')
    findAll(@Param('patientId') id: number) {
        return this.svc.findAllForPatient(+id);
    }
}
