import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminLogsController } from './admin-logs.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdminsController, AdminLogsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
