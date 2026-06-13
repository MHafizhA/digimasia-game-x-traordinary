import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaService } from './prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private sessionService: SessionService,
    private prisma: PrismaService
  ) { }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');

    // Subscribe SessionService updates to WebSocket broadcast
    this.sessionService.onStateChange = (state) => {
      this.server.emit('session_state', state);
    };

    this.sessionService.onReset = () => {
      this.server.emit('system_resetted');
    };
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('session_state', this.sessionService.getState());
  }

  @SubscribeMessage('join')
  async handleJoin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`User ${data.name} joined via socket`);

    // VALIDATION: Check if user is still officially in the game (handles mobile sleep/reconnect after reset)
    if (data.id) {
      const userInDb = await this.prisma.user.findUnique({ where: { id: data.id } });
      if (userInDb && !userInDb.isJoined && !userInDb.isAdmin) {
        this.logger.log(`User ${data.name} reconnecting but was reset. Forcing logout.`);
        client.emit('system_resetted');
        return { event: 'rejected', reason: 'system_reset' };
      }
    }

    (client as any).user = data;
    return { event: 'joined', data: 'success' };
  }

  @SubscribeMessage('vote')
  async handleVote(@MessageBody() data: { candidateId: string; category: string }) {
    this.logger.log(`Vote received for ${data.candidateId}`);
    // logic in Phase 4
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: { questionIndex: number; optionIndex: number }) {
    this.logger.log(`Answer received: Q${data.questionIndex} Option ${data.optionIndex}`);
    // logic in Phase 5
  }

  @SubscribeMessage('water_tap')
  async handleWaterTap(@ConnectedSocket() client: Socket) {
    const user = (client as any).user;
    if (user && user.id) {
      await this.prisma.$transaction(async (tx) => {
        // Increment user contribution
        await tx.user.update({
          where: { id: user.id },
          data: {
            contributedWater: { increment: 1 },
            collectedWater: { decrement: 1 }
          }
        });
        // Update global session water
        await this.sessionService.incrementWaterInTransaction(tx, 1);
      });
    } else {
      await this.sessionService.incrementWater(1);
    }
  }
}
