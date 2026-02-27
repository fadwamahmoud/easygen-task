import { Module } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Request } from 'express';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const headerId = req.headers['x-request-id'];
          const id =
            typeof headerId === 'string' && headerId.length > 0
              ? headerId
              : randomUUID();

          // keep header consistent too
          res.setHeader('x-request-id', id);
          return id;
        },
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                },
              }
            : undefined,
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.passwordHash',
          'res.headers["set-cookie"]',
        ],
        serializers: {
          req(
            req: IncomingMessage & Partial<Request> & { id?: string | number },
          ) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
              remoteAddress:
                // express sets req.ip; node has socket/remoteAddress
                (req as Partial<Request>).ip ??
                req.socket?.remoteAddress ??
                undefined,
            };
          },
          res(res: ServerResponse & { statusCode?: number }) {
            return { statusCode: res.statusCode };
          },
        },
      },
    }),
  ],
})
export class AppLoggerModule {}
