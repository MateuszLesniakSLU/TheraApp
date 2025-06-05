import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { CreateSurveyItemDto } from "./dto/create-survey-item.dto";
import { UpdateSurveyItemDto } from "./dto/update-survey-item.dto";

@Injectable()
export class SurveyItemsService {
    constructor(private prisma: PrismaService) {}

    create(dto: CreateSurveyItemDto){
        return this.prisma.surveyItem.create({data: dto});
    }

    findAll() {
        return this.prisma.surveyItem.findMany();
    }

    findOne(id: number) {
        return this.prisma.surveyItem.findUnique({where: {id}});
    }

    update(id:number, dto: UpdateSurveyItemDto){
        return this.prisma.surveyItem.update({where: {id}, data: dto});
    }

    remove(id: number) {
        return this.prisma.surveyItem.delete({where: {id}});
    }
}
