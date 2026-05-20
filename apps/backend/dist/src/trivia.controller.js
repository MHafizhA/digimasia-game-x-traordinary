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
exports.TriviaController = void 0;
const common_1 = require("@nestjs/common");
const trivia_service_1 = require("./trivia.service");
const prisma_service_1 = require("./prisma.service");
let TriviaController = class TriviaController {
    triviaService;
    prisma;
    constructor(triviaService, prisma) {
        this.triviaService = triviaService;
        this.prisma = prisma;
    }
    async getQuestion(index, userId) {
        const q = await this.prisma.question.findUnique({
            where: { index: parseInt(index) },
        });
        if (!q)
            return { error: 'Not found' };
        const { answer, ...rest } = q;
        let userSelection = null;
        let isCorrect = null;
        if (userId) {
            const ua = await this.prisma.userAnswer.findUnique({
                where: { userId_questionId: { userId: userId, questionId: q.id } }
            });
            if (ua) {
                userSelection = ua.selected;
                isCorrect = ua.isCorrect;
            }
        }
        return { ...rest, userSelection, isCorrect };
    }
    async submitAnswer(body) {
        return this.triviaService.submitAnswer(body.userId, body.questionIndex, body.optionIndex);
    }
};
exports.TriviaController = TriviaController;
__decorate([
    (0, common_1.Get)('trivia-question/:index'),
    __param(0, (0, common_1.Param)('index')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TriviaController.prototype, "getQuestion", null);
__decorate([
    (0, common_1.Post)('trivia-answer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TriviaController.prototype, "submitAnswer", null);
exports.TriviaController = TriviaController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [trivia_service_1.TriviaService,
        prisma_service_1.PrismaService])
], TriviaController);
//# sourceMappingURL=trivia.controller.js.map