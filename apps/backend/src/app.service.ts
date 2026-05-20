import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SessionService } from './session.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => SessionService))
    private session: SessionService,
  ) { }

  getHello(): string {
    return 'X-Celerate API v1.0';
  }

  async getSessionState() {
    return this.session.getState();
  }

  async getLeaderboard() {
    const topUsers = await this.prisma.user.findMany({
      where: { isJoined: true, isAdmin: false },
      orderBy: {
        contributedWater: 'desc',
      },
      take: 10,
      select: {
        name: true,
        division: true,
        contributedWater: true,
        score: true,
      }
    });

    return topUsers.map(u => ({
      name: u.name,
      division: u.division,
      amount: u.contributedWater,
      score: u.score
    }));
  }
}
