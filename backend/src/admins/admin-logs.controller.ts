import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin-logs')
export class AdminLogsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Pobiera logi dot. użytkowników
   * @param userId
   */
  @Get('user/:userId')
  @Roles('admin')
  async getLogsForUser(@Param('userId') userId: string) {
    const logs = await this.prisma.userActivityLog.findMany({
      where: { userId: Number(userId) },
      orderBy: { timestamp: 'desc' },
    });
    return {
      logins: logs.filter(
        (log) =>
          log.action === 'login_success' ||
          log.action === 'login_failed' ||
          log.action === 'login_failed_blocked',
      ),
      changes: logs.filter((log) => log.action === 'profile_update'),
    };
  }
}
