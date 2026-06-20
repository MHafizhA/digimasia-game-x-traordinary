import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Create Admin
    await prisma.user.upsert({
        where: { pin: '9999' },
        update: {},
        create: {
            name: 'Admin',
            pin: '9999',
            division: 'ADMIN',
            isAdmin: true,
            isJoined: true,
        },
    });

    // 2. Create Users
    const users = [
        { name: 'Hafizh', pin: '1001', division: 'TECH' },
        { name: 'Mita', pin: '1002', division: 'DESIGN' },
        { name: 'Domet', pin: '1003', division: 'TECH' },
        { name: 'Rizky', pin: '1004', division: 'HR' },
        { name: 'Hana', pin: '1005', division: 'MARKETING' },
        { name: 'Frista', pin: '1006', division: 'FINANCE' },
        { name: 'Andre', pin: '1007', division: 'TECH' },
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { pin: u.pin },
            update: {},
            create: {
                name: u.name,
                pin: u.pin,
                division: u.division,
                isAdmin: false,
                isJoined: false,
            },
        });
    }

    // 3. Create Dummy Candidates (if table empty)
    const candidateCount = await prisma.candidate.count();
    if (candidateCount === 0) {
        await prisma.candidate.createMany({
            data: [
                { id: 't1', name: 'Tech Wizards', division: 'TECH', type: 'team', imageUrl: '' },
                { id: 't2', name: 'Design Masters', division: 'DESIGN', type: 'team', imageUrl: '' },
                { id: 't3', name: 'Marketing Heroes', division: 'MARKETING', type: 'team', imageUrl: '' },
                { id: 'd1', name: 'Hafizh', division: 'TECH', type: 'digimer', imageUrl: '' },
                { id: 'd2', name: 'Mita', division: 'DESIGN', type: 'digimer', imageUrl: '' },
                { id: 'd3', name: 'Andre', division: 'TECH', type: 'digimer', imageUrl: '' },
            ]
        });
    }

    // 4. Create Trivia Questions
    console.log('Seeding trivia questions...');
    const questions = [
        {
            index: 1,
            text: 'Kapan tanggal bulan dan tahun tepannya ulang tahun digima ASIA?',
            options: JSON.stringify(['14 Juni 2016', '19 Juni 2016', '25 Juni 2016', '26 Juni 2016']),
            answer: 0
        },
        {
            index: 2,
            text: 'Huruf “A” pada HEART sebagai core values digima ASIA mewakili…',
            options: JSON.stringify(['Achievement', 'Accelerated Growth', 'Adaptability', 'Accountability']),
            answer: 1
        },
        {
            index: 3,
            text: 'Apa filosofi di balik penulisan “digima ASIA”?',
            options: JSON.stringify([
                'digima dengan huruf kecil melambangkan sikap humble dan ASIA dengan huruf kapital mencerminkan visi untuk dikenal di tingkat Asia',
                'Saat mau membuat logo, ukuran huruf digima tidak sengaja lebih kecil dan akhirnya diteruskan sampai sekarang',
                'Penulisan ASIA dengan kapital menjadi reminder bahwa mimpi perusahaan lebih besar dari apapun',
                'Semua jawaban salah'
            ]),
            answer: 0
        },
        {
            index: 4,
            text: 'digimer dengan stastus PKWT mendapatkan benefit untuk memilih hadiah ulang tahun, salah satunya hadiahnya yaitu...',
            options: JSON.stringify(['Voucher Makan Bakmi Koga', 'Makan Bergizi Gratis', '1 hari libur', 'Sepatu PUMA baru']),
            answer: 2
        },
        {
            index: 5,
            text: 'Apa kepanjangan dari MoLeaWiz?',
            options: JSON.stringify(['Mobile Learning Wizard', 'More Learning Wizards', 'Mobility Learning Wizard', 'Motivated Learners Wizards']),
            answer: 2
        },
        {
            index: 6,
            text: 'Jika sebuah perusahaan ingin meningkatkan kompetensi karyawannya dan datang ke digima ASIA, “paket andalan” apa yang bisa kita tawarkan adalah...',
            options: JSON.stringify([
                'Seminar, Outing, Gathering',
                'LaaS, Learning Content Development, Strategic Execution & Implementation',
                'Podcast, Vlog, Webinar',
                'Laptop, Proyektor, Wi-Fi'
            ]),
            answer: 1
        },
        {
            index: 7,
            text: 'Jika ada digimers yang selalu memperhatikan kualitas, detail, dan hasil terbaik dalam pekerjaannya, ia sedang menerapkan nilai…',
            options: JSON.stringify(['Harmony', 'Excellence', 'Teamwork', 'Accelerated Growth']),
            answer: 1
        },
        {
            index: 8,
            text: 'Mana yang paling membuat jantung digimers berdebar?',
            options: JSON.stringify(['Deadline hari ini', 'Meeting mendadak', 'Pesan “Boleh call sebentar?”', 'Semua benar']),
            answer: 3
        },
        {
            index: 9,
            text: 'Selama 10 tahun perjalanan digima ASIA, mana yang paling tidak berubah?',
            options: JSON.stringify(['Semangat untuk terus berkembang', 'Jumlah revisi project', 'Deadline yang selalu menarik', 'Kebutuhan akan kopi']),
            answer: 0
        },
        {
            index: 10,
            text: 'Tim manakah yang saat ini memiliki anggota terbanyak di digima ASIA?',
            options: JSON.stringify(['HR', 'CD', 'CS', 'SE']),
            answer: 1
        },
    ];

    for (const q of questions) {
        await prisma.question.upsert({
            where: { index: q.index },
            update: q,
            create: q,
        });
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
