import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { PrismaService } from './prisma.service';

@Controller()
export class TriviaController {
    constructor(
        private triviaService: TriviaService,
        private prisma: PrismaService,
    ) { }

    @Get('trivia-question/:index')
    async getQuestion(@Param('index') index: string, @Query('userId') userId?: string) {
        const q = await this.prisma.question.findUnique({
            where: { index: parseInt(index) },
        });

        if (!q) return { error: 'Not found' };

        // Jangan kirim jawaban asli ke client
        const { answer, ...rest } = q;

        let userSelection: number | null = null;
        let isCorrect: boolean | null = null;

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

    @Post('trivia-answer')
    async submitAnswer(
        @Body() body: { userId: string; questionIndex: number; optionIndex: number },
    ) {
        return this.triviaService.submitAnswer(
            body.userId,
            body.questionIndex,
            body.optionIndex,
        );
    }
}
