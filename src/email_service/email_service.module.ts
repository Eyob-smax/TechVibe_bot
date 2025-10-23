import { Module } from '@nestjs/common';
import { EmailServiceService } from './email_service.service.js';

@Module({
  providers: [EmailServiceService],
})
export class EmailServiceModule {}
