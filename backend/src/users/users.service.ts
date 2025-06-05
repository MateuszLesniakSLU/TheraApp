import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        patient: true,
        therapist: true,
        admin: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id: Number(id) } });
  }

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id: Number(id) }, data: dto });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id: Number(id) } });
  }
}
