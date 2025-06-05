import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { UserRole } from '../../users/dto/user-role.enum';

export class CreatePatientDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

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

  readonly role: UserRole = UserRole.Patient;
}
