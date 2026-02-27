import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env';
import { AppLoggerModule } from './logger.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AppLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // in tests don't load .env files at all (prevents surprises across workers)
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      envFilePath: process.env.NODE_ENV === 'test' ? undefined : '.env',
      validate: validateEnv,
    }),
    // global throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 seconds
        limit: 20, // 20 requests per minute per ip
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI', { infer: true })!,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {

}
