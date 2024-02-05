import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { configOptions } from './main.config';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [LoggerModule, ConfigModule.forRoot(configOptions), PaymentModule],
  providers: [AppService],
})
export class AppModule {}
