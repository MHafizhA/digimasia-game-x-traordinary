"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const session_service_1 = require("./session.service");
const prisma_service_1 = require("./prisma.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    sessionService;
    prisma;
    server;
    logger = new common_1.Logger(EventsGateway_1.name);
    constructor(sessionService, prisma) {
        this.sessionService = sessionService;
        this.prisma = prisma;
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway Initialized');
        this.sessionService.onStateChange = (state) => {
            this.server.emit('session_state', state);
        };
        this.sessionService.onReset = () => {
            this.server.emit('system_resetted');
        };
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        client.emit('session_state', this.sessionService.getState());
    }
    async handleJoin(data, client) {
        this.logger.log(`User ${data.name} joined via socket`);
        if (data.id) {
            const userInDb = await this.prisma.user.findUnique({ where: { id: data.id } });
            if (userInDb && !userInDb.isJoined && !userInDb.isAdmin) {
                this.logger.log(`User ${data.name} reconnecting but was reset. Forcing logout.`);
                client.emit('system_resetted');
                return { event: 'rejected', reason: 'system_reset' };
            }
        }
        client.user = data;
        return { event: 'joined', data: 'success' };
    }
    async handleVote(data) {
        this.logger.log(`Vote received for ${data.candidateId}`);
    }
    handleAnswer(data) {
        this.logger.log(`Answer received: Q${data.questionIndex} Option ${data.optionIndex}`);
    }
    async handleWaterTap() {
        await this.sessionService.incrementWater(10);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleVote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('water_tap'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleWaterTap", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [session_service_1.SessionService,
        prisma_service_1.PrismaService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map