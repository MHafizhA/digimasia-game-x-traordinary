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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const session_service_1 = require("./session.service");
let AppService = class AppService {
    prisma;
    session;
    constructor(prisma, session) {
        this.prisma = prisma;
        this.session = session;
    }
    getHello() {
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
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => session_service_1.SessionService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        session_service_1.SessionService])
], AppService);
//# sourceMappingURL=app.service.js.map