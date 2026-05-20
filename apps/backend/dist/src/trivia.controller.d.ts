import { TriviaService } from './trivia.service';
import { PrismaService } from './prisma.service';
export declare class TriviaController {
    private triviaService;
    private prisma;
    constructor(triviaService: TriviaService, prisma: PrismaService);
    getQuestion(index: string, userId?: string): Promise<{
        error: string;
    } | {
        userSelection: number | null;
        isCorrect: boolean | null;
        id: string;
        index: number;
        text: string;
        options: string;
        error?: undefined;
    }>;
    submitAnswer(body: {
        userId: string;
        questionIndex: number;
        optionIndex: number;
    }): Promise<{
        error: string;
        correct?: undefined;
        points?: undefined;
    } | {
        correct: boolean;
        points: number;
        error?: undefined;
    }>;
}
