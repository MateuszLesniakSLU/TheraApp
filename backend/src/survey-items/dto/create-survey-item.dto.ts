import { IsString } from 'class-validator';

export class CreateSurveyItemDto {
    @IsString()
    question: string;

    @IsString()
    type: 'scale' | 'text' | 'checkbox';
}
