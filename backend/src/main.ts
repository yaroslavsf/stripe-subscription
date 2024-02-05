import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cors from 'cors';
import * as basicAuth from 'express-basic-auth';
import * as bodyParser from 'body-parser';

import { corseConfig, helmetConfig } from './main.config';
import { ErrorsInterceptor } from './common/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EConfigEnvironment } from './common/enums';

class Application {
  public configService: ConfigService;
  public loggerService: LoggerService;

  private app: INestApplication;

  constructor() {
    this.loggerService = new LoggerService('Stripe test');
  }

  public async bootstrap(): Promise<void> {
    this.app = await NestFactory.create(AppModule, {
      logger: this.loggerService,
    });

    this.configService = this.app.get(ConfigService);

    const nodeEnv = this.configService.get<EConfigEnvironment>('NODE_ENV');
    const PORT = this.configService.get<number>('PORT') || 4200;

    this.app.setGlobalPrefix('api');

    this.app.use(helmet(helmetConfig));
    this.app.use(cors(corseConfig));

    //stripe config for request with raw body
    //stripe config for webhook
    const rawBodyBuffer = (req: any, res: any, buffer: any, encoding: any) => {
      if (!req.headers['stripe-signature']) {
        return;
      }

      if (buffer && buffer.length) {
        req.rawBody = buffer.toString(encoding || 'utf8');
      }
    };
    this.app.use(
      bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }),
    );
    this.app.use(bodyParser.json({ verify: rawBodyBuffer }));

    if (nodeEnv === EConfigEnvironment.production) {
      const swaggerUser = this.configService.get<string>('SWAGGER_USR');
      const swaggerPassword =
        this.configService.get<string>('SWAGGER_PASSWORD');

      if (!swaggerUser || !swaggerPassword) {
        throw new Error('Swagger credentials is required for production mode');
      }

      this.app.use(
        ['/api/docs', '/api/docs-json'],
        basicAuth({
          challenge: true,
          users: {
            [swaggerUser]: swaggerPassword,
          },
        }),
      );
    }

    this.app.useGlobalInterceptors(
      new ErrorsInterceptor(this.loggerService, this.configService),
    );

    this.app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    const document = SwaggerModule.createDocument(
      this.app,
      new DocumentBuilder().setTitle('Stripe test').setVersion('1.0').build(),
    );
    SwaggerModule.setup(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.configService.get('API_DOC_PATH')!,
      this.app,
      document,
    );

    this.useListeners();

    this.app
      .listen(PORT)
      .then(() =>
        this.loggerService.log(`Application was started on PORT ${PORT}`),
      )
      .catch((e) => this.loggerService.error(e));
  }

  private useListeners(): void {
    process.on('unhandledRejection', (reason: any): void => {
      this.loggerService.error(
        reason.toString(),
        reason.stack || reason,
        'Unhandled Rejection',
      );
      process.exit(1);
    });

    process.on('uncaughtException', (err: any): void => {
      this.loggerService.error({ err }, 'Uncaught Exception');
      process.exit(1);
    });

    process.on('warning', (err: any): void => {
      this.loggerService.error({ err }, 'Warning detected');
    });

    process.on('exit', (code): void => {
      this.loggerService.warn(`Stopped with code: ${code}`);
    });
  }
}

const app = new Application();

app.bootstrap();
