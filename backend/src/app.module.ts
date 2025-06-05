import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { TherapistsModule } from './therapists/therapists.module';
import { AdminsModule } from './admins/admins.module';
import { SurveyItemsModule } from './survey-items/survey-items.module';
import { SurveyResponsesModule } from './survey-responses/survey-responses.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    }),
    PrismaModule,
    PatientsModule,
    AdminsModule,
    TherapistsModule,
    SurveyItemsModule,
    SurveyResponsesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
