import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('users')
export class UserController {
    constructor(private prisma: PrismaService) { }

    @Get('tree/top-contributors')
    async getTopContributors() {
        return this.prisma.user.findMany({
            where: { isAdmin: false, contributedWater: { gt: 0 } },
            orderBy: { contributedWater: 'desc' },
            take: 10,
            select: { id: true, name: true, division: true, contributedWater: true }
        });
    }

    @Get(':id/stats')
    async getStats(@Param('id') id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                collectedWater: true,
                contributedWater: true,
                score: true,
            }
        });
    }
}
