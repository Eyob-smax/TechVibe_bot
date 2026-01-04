import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/prisma/client.js';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly MAX_RETRIES = 8;
  private readonly RETRY_DELAY_MS = 2000;

  async onModuleInit() {
    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      try {
        await this.$connect();
        console.log('✅ Database connected successfully.');
        return;
      } catch (err) {
        retries++;
        console.error(
          `❌ Database connection failed (attempt ${retries}):`,
          err.message,
        );

        if (retries >= this.MAX_RETRIES) {
          console.error('🚫 Could not connect to the database. Exiting now...');
          process.exit(1);
        }

        console.log(`🔄 Retrying in ${this.RETRY_DELAY_MS / 1000} seconds...`);
        await new Promise((resolve) =>
          setTimeout(resolve, this.RETRY_DELAY_MS),
        );
      }
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Disconnected from the database');
  }
}
