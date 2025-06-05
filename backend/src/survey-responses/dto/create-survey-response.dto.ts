import { IsInt, IsString } from 'class-validator';

export class CreateSurveyResponseDto {
    @IsInt()
    patientId: number;

    @IsString()
    responses: string;
}