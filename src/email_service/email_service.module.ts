import { Global, Module } from '@nestjs/common';
import { EmailService } from './email_service.service.js';
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
