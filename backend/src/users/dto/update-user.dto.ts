import { IsOptional, IsString, IsBoolean } from 'class-validator';
import {UserRole} from "./user-role.enum";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
