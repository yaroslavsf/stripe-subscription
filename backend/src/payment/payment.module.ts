import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';

@Module({
  imports: [ConfigModule],
  // providers: [PaymentService],
  controllers: [PaymentController],
  // exports: [PaymentService],
})
export class PaymentModule {}
