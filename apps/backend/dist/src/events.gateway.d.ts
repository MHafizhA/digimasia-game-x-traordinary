import { OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionService } from './session.service';
import { PrismaService } from './prisma.service';
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection {
    private sessionService;
    private prisma;
    server: Server;
    private readonly logger;
    constructor(sessionService: SessionService, prisma: PrismaService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleJoin(data: any, client: Socket): Promise<{
        event: string;
        reason: string;
        data?: undefined;
    } | {
        event: string;
        data: string;
        reason?: undefined;
    }>;
    handleVote(data: {
        candidateId: string;
        category: string;
    }): Promise<void>;
    handleAnswer(data: {
        questionIndex: number;
        optionIndex: number;
    }): void;
    handleWaterTap(): Promise<void>;
}
