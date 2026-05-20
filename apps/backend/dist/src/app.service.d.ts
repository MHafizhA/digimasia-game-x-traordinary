import { PrismaService } from './prisma.service';
import { SessionService } from './session.service';
export declare class AppService {
    private prisma;
    private session;
    constructor(prisma: PrismaService, session: SessionService);
    getHello(): string;
    getSessionState(): Promise<{
        phase: import("./session.service").GamePhase;
        currentQuestion: number;
        timer: number;
        treeStage: number;
        totalWater: number;
    }>;
    getLeaderboard(): Promise<{
        name: string;
        division: string;
        amount: number;
        score: number;
    }[]>;
}
