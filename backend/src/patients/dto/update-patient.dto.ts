import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsInt()
  therapistId?: number;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
