import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';

@Injectable()
export class SurveyResponsesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSurveyResponseDto) {
    return this.prisma.surveyResponse.create({
      data: {
        patient: { connect: { id: dto.patientId } },
        responses: dto.responses,
      },
    });
  }

  findAllForPatient(patientId: number) {
    return this.prisma.surveyResponse.findMany({
      where: { patientId },
      orderBy: { surveyDate: 'desc' },
    });
  }
}
