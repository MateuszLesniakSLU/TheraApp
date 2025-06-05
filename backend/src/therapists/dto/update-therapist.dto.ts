import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateTherapistDto {
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
