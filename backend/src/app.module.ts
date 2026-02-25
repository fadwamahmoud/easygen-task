import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env';
import { AppLoggerModule } from './logger.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AppLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // In tests, don't load .env files at all (prevents surprises across workers)
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      envFilePath: process.env.NODE_ENV === 'test' ? undefined : '.env',
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI', { infer: true })!,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule { }