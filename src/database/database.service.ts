import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../prisma/generated/prisma/client.js';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const pool = new PrismaPg({ connectionString: connectionString });
    if (!pool) {
      throw new Error("Can't connect with the db");
    }
    super({ adapter: pool });
  }
  private MAX_RETRIES = 5;
  private RETRIES = 0;
  private INITIAL_RETRY_DELAY_MS = 1000;

  async onModuleInit() {
    while (this.RETRIES < this.MAX_RETRIES) {
      try {
        await this.$connect();
        console.log('✅ Connected to the database successfully!');
        return;
      } catch (err) {
        this.RETRIES++;
        console.error(
          `❌ Database connection failed (attempt ${this.RETRIES}):`,
          (err as Error).message,
        );

        if (this.RETRIES >= this.MAX_RETRIES) {
          console.error('🚫 Could not connect to the database. Exiting now...');
          process.exit(1);
        }

        const delay =
          this.INITIAL_RETRY_DELAY_MS * Math.pow(2, this.RETRIES - 1);
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Disconnected from the database');
  }
}
