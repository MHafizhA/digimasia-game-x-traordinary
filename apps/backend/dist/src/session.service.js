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
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let SessionService = SessionService_1 = class SessionService {
    prisma;
    logger = new common_1.Logger(SessionService_1.name);
    onStateChange = () => { };
    onReset = () => { };
    state = {
        phase: 'LOGIN',
        currentQuestion: 0,
        timer: 0,
        treeStage: 0,
        totalWater: 0,
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const session = await this.prisma.session.findUnique({
            where: { id: 'singleton' },
        });
        if (session) {
            this.state = {
                phase: session.phase,
                currentQuestion: session.currentQ,
                timer: 0,
                treeStage: session.treeStage,
                totalWater: session.totalWater,
            };
            this.logger.log(`Session loaded: Phase ${this.state.phase}`);
        }
    }
    getState() {
        return this.state;
    }
    async updatePhase(phase) {
        this.state.phase = phase;
        if (phase === 'TRIVIA') {
            this.state.currentQuestion = 0;
        }
        this.onStateChange(this.state);
        await this.saveToDb();
    }
    async incrementWater(amount) {
        this.state.totalWater += amount;
        await this.internalUpdateWater(this.state.totalWater);
    }
    async incrementWaterInTransaction(tx, amount) {
        const session = await tx.session.findUnique({ where: { id: 'singleton' } });
        const newTotal = (session?.totalWater || 0) + amount;
        const newStage = Math.min(9, Math.floor(newTotal / 100));
        await tx.session.update({
            where: { id: 'singleton' },
            data: {
                totalWater: newTotal,
                treeStage: newStage
            }
        });
        this.state.totalWater = newTotal;
        this.state.treeStage = newStage;
        this.onStateChange(this.state);
    }
    async internalUpdateWater(total) {
        const newStage = Math.min(9, Math.floor(total / 100));
        if (this.state.treeStage !== newStage) {
            this.state.treeStage = newStage;
        }
        this.onStateChange(this.state);
        await this.saveToDb();
    }
    async reset() {
        this.state = {
            phase: 'LOGIN',
            currentQuestion: 0,
            timer: 0,
            treeStage: 0,
            totalWater: 0,
        };
        this.onStateChange(this.state);
        this.onReset();
        await this.saveToDb();
        await this.prisma.vote.deleteMany();
        await this.prisma.userAnswer.deleteMany();
        await this.prisma.user.updateMany({
            where: { isAdmin: false },
            data: {
                isJoined: false,
                collectedWater: 0,
                contributedWater: 0,
                score: 0,
            }
        });
    }
    async saveToDb() {
        try {
            await this.prisma.session.update({
                where: { id: 'singleton' },
                data: {
                    phase: this.state.phase,
                    currentQ: this.state.currentQuestion,
                    totalWater: this.state.totalWater,
                    treeStage: this.state.treeStage,
                },
            });
        }
        catch (e) {
            this.logger.error('Failed to sync session with DB', e);
        }
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionService);
//# sourceMappingURL=session.service.js.map