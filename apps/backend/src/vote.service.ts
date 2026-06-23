import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class VoteService {
    constructor(private prisma: PrismaService) { }

    async vote(userId: string, candidateId: string, category: string) {
        // 0. Cek apakah user ada
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User tidak ditemukan. Silakan login ulang.');
        }

        // 1. Cek apakah user sudah vote di kategori ini
        const existingVote = await this.prisma.vote.findUnique({
            where: {
                userId_category: {
                    userId,
                    category,
                },
            },
        });

        if (existingVote) {
            throw new BadRequestException(`Anda sudah melakukan voting di kategori ${category}`);
        }

        // 2. Cek kandidat validitas (optional: cegah vote diri sendiri jika ada data relasi)
        // Untuk saat ini kita simpan saja vote-nya
        const vote = await this.prisma.vote.create({
            data: {
                userId,
                candidateId,
                category,
            },
            include: {
                candidate: true,
            },
        });

        return vote;
    }

    async getResults(category: string) {
        const results = await this.prisma.vote.groupBy({
            by: ['candidateId'],
            where: { category },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 1,
        });

        if (results.length === 0) return { name: 'Belum ada suara', count: 0 };

        const winner = await this.prisma.candidate.findUnique({
            where: { id: results[0].candidateId },
        });

        return {
            id: winner?.id || '',
            name: winner?.name || 'Unknown',
            division: winner?.division,
            imageUrl: winner?.imageUrl,
            count: results[0]._count.id,
        };
    }

    async getAllStats(category: string) {
        // 1. Ambil semua kandidat dari kategori ini
        const candidates = await this.prisma.candidate.findMany({
            where: { type: category }
        });

        // 2. Ambil statistik suara
        const results = await this.prisma.vote.groupBy({
            by: ['candidateId'],
            where: { category },
            _count: { id: true },
        });

        // 3. Gabungkan: pastikan setiap kandidat muncul
        const stats = candidates.map(cand => {
            const voteResult = results.find(r => r.candidateId === cand.id);
            return {
                id: cand.id,
                name: cand.name,
                division: cand.division,
                imageUrl: cand.imageUrl,
                count: voteResult?._count.id || 0
            };
        });

        // 4. Hitung Metadata Partisipasi
        const totalVoters = await this.prisma.user.count({
            where: { isJoined: true, isAdmin: false }
        });
        const votes = await this.prisma.vote.findMany({
            where: { category },
            include: { user: { select: { name: true } } }
        });
        const voterNames = votes.map(v => v.user.name);

        return {
            items: stats.sort((a, b) => b.count - a.count),
            metadata: {
                totalVoters,
                votedCount: voterNames.length,
                voterNames,
                percentage: totalVoters > 0 ? (voterNames.length / totalVoters) * 100 : 0
            }
        };
    }
}
