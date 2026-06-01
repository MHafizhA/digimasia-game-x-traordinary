/**
 * Script untuk push schema dan seed data ke Turso
 * Jalankan: npx ts-node prisma/turso-migrate.ts
 * 
 * Pastikan env vars sudah diset:
 *   TURSO_DATABASE_URL=libsql://...
 *   TURSO_AUTH_TOKEN=ey...
 */
import { createClient } from '@libsql/client';

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
    console.log('🔄 Memulai migrasi ke Turso...');

    // Create tables
    const statements = [
        `CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "pin" TEXT NOT NULL,
            "division" TEXT NOT NULL,
            "isAdmin" BOOLEAN NOT NULL DEFAULT false,
            "isJoined" BOOLEAN NOT NULL DEFAULT false,
            "collectedWater" INTEGER NOT NULL DEFAULT 0,
            "contributedWater" INTEGER NOT NULL DEFAULT 0,
            "score" INTEGER NOT NULL DEFAULT 0,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "User_pin_key" ON "User"("pin")`,

        `CREATE TABLE IF NOT EXISTS "Session" (
            "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
            "phase" TEXT NOT NULL DEFAULT 'LOGIN',
            "currentQ" INTEGER NOT NULL DEFAULT 0,
            "totalWater" INTEGER NOT NULL DEFAULT 0,
            "treeStage" INTEGER NOT NULL DEFAULT 0,
            "phaseStartAt" DATETIME,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS "Candidate" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "division" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "imageUrl" TEXT NOT NULL
        )`,

        `CREATE TABLE IF NOT EXISTS "Vote" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "candidateId" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Vote_userId_category_key" ON "Vote"("userId", "category")`,

        `CREATE TABLE IF NOT EXISTS "Question" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "index" INTEGER NOT NULL,
            "text" TEXT NOT NULL,
            "options" TEXT NOT NULL,
            "answer" INTEGER NOT NULL
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Question_index_key" ON "Question"("index")`,

        `CREATE TABLE IF NOT EXISTS "UserAnswer" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "questionId" TEXT NOT NULL,
            "selected" INTEGER,
            "isCorrect" BOOLEAN NOT NULL DEFAULT false,
            CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "UserAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "UserAnswer_userId_questionId_key" ON "UserAnswer"("userId", "questionId")`,
    ];

    for (const sql of statements) {
        await turso.execute(sql);
    }
    console.log('✅ Tabel berhasil dibuat!');
}

async function seed() {
    console.log('🌱 Seeding data...');

    // Generate cuid-like ids
    const id = () => 'cl' + Math.random().toString(36).substr(2, 20);

    // Session singleton
    await turso.execute({
        sql: `INSERT OR IGNORE INTO "Session" ("id") VALUES ('singleton')`,
        args: [],
    });

    // Admin
    await turso.execute({
        sql: `INSERT OR IGNORE INTO "User" ("id", "name", "pin", "division", "isAdmin", "isJoined") VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id(), 'Admin', '9999', 'ADMIN', true, true],
    });

    const users = [
        { name: "Daniel V. Lie", pin: "1001", div: "Global Chief Executive" },
        { name: "Karib Chiang", pin: "1002", div: "Technology & Operation" },
        { name: "Dyah Prajnaparamita", pin: "1003", div: "Technology & Operation" },
        { name: "Vania Sari Muchardie", pin: "1004", div: "Organization Support" },
        { name: "Honey Fatricya", pin: "1005", div: "Organization Support" },
        { name: "Stefany Arlianty", pin: "1006", div: "Content Design" },
        { name: "Alfridho Yuliananda", pin: "1007", div: "Content Design" },
        { name: "Inayatul Noor Amaliah", pin: "1008", div: "Content Design" },
        { name: "Frista Diah Ramadhani", pin: "1009", div: "Content Design" },
        { name: "Amelia Nur Azizah", pin: "1010", div: "Content Design" },
        { name: "Nabila Paradays", pin: "1011", div: "Content Design" },
        { name: "Ratna Indah Screenaningrum", pin: "1012", div: "Content Design" },
        { name: "Agung Trisno Atmojo", pin: "1013", div: "Content Design" },
        { name: "Fredy Wijaya", pin: "1014", div: "Content Design" },
        { name: "Asep Badrudin", pin: "1015", div: "Content Design" },
        { name: "Hanafiah Yunan Putri", pin: "1016", div: "Content Design" },
        { name: "Andre Alfadjrid", pin: "1017", div: "Content Design" },
        { name: "Hari Mujana", pin: "1018", div: "Content Design" },
        { name: "Stepanus", pin: "1019", div: "Interaction Design" },
        { name: "Heri Irwanto", pin: "1020", div: "Interaction Design" },
        { name: "Tedy Iman Priyo Lestanto", pin: "1021", div: "Interaction Design" },
        { name: "Yusuf Faisal Agus Saputro", pin: "1022", div: "Software Engineering & QA" },
        { name: "Agunahwan Absin", pin: "1023", div: "Software Engineering & QA" },
        { name: "Muhammad Reza", pin: "1024", div: "Software Engineering & QA" },
        { name: "Christover Ramanda Moa", pin: "1025", div: "Software Engineering & QA" },
        { name: "Muhammad Rizky Husain", pin: "1026", div: "Software Engineering & QA" },
        { name: "Wahyu Candra Indhiarta", pin: "1027", div: "Software Engineering & QA" },
        { name: "Muhammad Hafizh Abdillah", pin: "1028", div: "Software Engineering & QA" },
        { name: "Fahmi Fikri Kurniawan", pin: "1029", div: "Customer Support" },
        { name: "Putra Indra Tri Cahya", pin: "1030", div: "Customer Support" },
        { name: "Cherly Diansacharina Tri Wahyuningsuara", pin: "1031", div: "Customer Support" },
        { name: "Resfi Anggraeni", pin: "1032", div: "General Affairs" },
        { name: "Mediani Prima Ismary", pin: "1033", div: "General Affairs" },
        { name: "Mayang Gita", pin: "1034", div: "Sales" },
        { name: "Danny Zainaldi", pin: "1035", div: "Project Management" }
    ];
    for (const u of users) {
        await turso.execute({
            sql: `INSERT OR IGNORE INTO "User" ("id", "name", "pin", "division", "isAdmin", "isJoined") VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id(), u.name, u.pin, u.div, false, false],
        });
    }

    // Candidates
    const candidates = [
        { id: 't1', name: 'Tech Wizards', div: 'TECH', type: 'team' },
        { id: 't2', name: 'Design Masters', div: 'DESIGN', type: 'team' },
        { id: 't3', name: 'Marketing Heroes', div: 'MARKETING', type: 'team' },
        { id: 'd1', name: 'Hafizh', div: 'TECH', type: 'digimer' },
        { id: 'd2', name: 'Mita', div: 'DESIGN', type: 'digimer' },
        { id: 'd3', name: 'Andre', div: 'TECH', type: 'digimer' },
    ];
    for (const c of candidates) {
        await turso.execute({
            sql: `INSERT OR IGNORE INTO "Candidate" ("id", "name", "division", "type", "imageUrl") VALUES (?, ?, ?, ?, '')`,
            args: [c.id, c.name, c.div, c.type],
        });
    }

    // Trivia Questions
    const questions = [
        { idx: 1, text: 'Apa warna logo Digimasia?', opts: JSON.stringify(['Merah', 'Biru', 'Hijau', 'Kuning']), ans: 1 },
        { idx: 2, text: 'Tahun berapa Digimasia didirikan?', opts: JSON.stringify(['2010', '2015', '2018', '2020']), ans: 2 },
        { idx: 3, text: 'Apa core value utama kita?', opts: JSON.stringify(['Speed', 'Quality', 'Integrity', 'All of above']), ans: 3 },
        { idx: 4, text: 'Siapa CEO Digimasia saat ini?', opts: JSON.stringify(['Bapak A', 'Bapak B', 'Bapak C', 'Bapak D']), ans: 0 },
        { idx: 5, text: 'Berapa jumlah divisi di kantor kita?', opts: JSON.stringify(['4', '6', '8', '10']), ans: 2 },
        { idx: 6, text: 'Apa tagline event X-Celerate?', opts: JSON.stringify(['Move Fast', 'Grow the Tree', 'Shoot for Star', 'Break the Limit']), ans: 1 },
        { idx: 7, text: 'Di kota mana kantor pusat kita?', opts: JSON.stringify(['Jakarta', 'Bandung', 'Surabaya', 'Medan']), ans: 0 },
        { idx: 8, text: 'Apa nama maskot kita?', opts: JSON.stringify(['Digi', 'Masia', 'Treey', 'Celer']), ans: 0 },
        { idx: 9, text: 'Platform apa yang kita gunakan untuk chat?', opts: JSON.stringify(['Slack', 'Discord', 'WhatsApp', 'Teams']), ans: 0 },
        { idx: 10, text: 'Apa pencapaian terbesar kita tahun ini?', opts: JSON.stringify(['Project A', 'Project B', 'IPO', 'X-Celerate']), ans: 3 },
    ];
    for (const q of questions) {
        await turso.execute({
            sql: `INSERT OR IGNORE INTO "Question" ("id", "index", "text", "options", "answer") VALUES (?, ?, ?, ?, ?)`,
            args: [id(), q.idx, q.text, q.opts, q.ans],
        });
    }

    console.log('✅ Seed selesai!');
}

async function main() {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
        console.error('❌ Harap set TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di environment!');
        process.exit(1);
    }

    await migrate();
    await seed();
    console.log('🎉 Turso database siap digunakan!');
}

main().catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
});
