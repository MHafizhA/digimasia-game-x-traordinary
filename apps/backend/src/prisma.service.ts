import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super();
        this.logger.log('✅ PrismaService initialized — connecting to Neontech PostgreSQL');
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('✅ Prisma connected to Neontech PostgreSQL');
    }
}
