import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const employees = [
    { name: "Daniel V. Lie", division: "Global Chief Executive" },
    { name: "Karib Chiang", division: "Technology & Operation" },
    { name: "Dyah Prajnaparamita", division: "Technology & Operation" },
    { name: "Vania Sari Muchardie", division: "Organization Support" },
    { name: "Honey Fatricya", division: "Organization Support" },
    { name: "Stefany Arlianty", division: "Content Design" },
    { name: "Alfridho Yuliananda", division: "Content Design" },
    { name: "Inayatul Noor Amaliah", division: "Content Design" },
    { name: "Frista Diah Ramadhani", division: "Content Design" },
    { name: "Amelia Nur Azizah", division: "Content Design" },
    { name: "Nabila Paradays", division: "Content Design" },
    { name: "Ratna Indah Screenaningrum", division: "Content Design" },
    { name: "Agung Trisno Atmojo", division: "Content Design" },
    { name: "Fredy Wijaya", division: "Content Design" },
    { name: "Asep Badrudin", division: "Content Design" },
    { name: "Hanafiah Yunan Putri", division: "Content Design" },
    { name: "Andre Alfadjrid", division: "Content Design" },
    { name: "Hari Mujana", division: "Content Design" },
    { name: "Candra Prasetyo", division: "Software Engineering & QA" },
    { name: "Stepanus", division: "Interaction Design" },
    { name: "Heri Irwanto", division: "Interaction Design" },
    { name: "Tedy Iman Priyo Lestanto", division: "Interaction Design" },
    { name: "Yusuf Faisal Agus Saputro", division: "Software Engineering & QA" },
    { name: "Agunahwan Absin", division: "Software Engineering & QA" },
    { name: "Muhammad Reza", division: "Software Engineering & QA" },
    { name: "Christover Ramanda Moa", division: "Software Engineering & QA" },
    { name: "Muhammad Rizky Husain", division: "Software Engineering & QA" },
    { name: "Wahyu Candra Indhiarta", division: "Software Engineering & QA" },
    { name: "Muhammad Hafizh Abdillah", division: "Software Engineering & QA" },
    { name: "Fahmi Fikri Kurniawan", division: "Customer Support" },
    { name: "Putra Indra Tri Cahya", division: "Customer Support" },
    { name: "Cherly Diansacharina Tri Wahyuningsuara", division: "Customer Support" },
    { name: "Resfi Anggraeni", division: "General Affairs" },
    { name: "Mediani Prima Ismary", division: "General Affairs" },
    { name: "Mayang Gita", division: "Sales" },
    { name: "Danny Zainaldi", division: "Project Management" },
];

async function main() {
    console.log('Cleaning up existing data...');
    await prisma.userAnswer.deleteMany({});
    await prisma.vote.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.question.deleteMany({});

    console.log('Seeding Admin...');
    await prisma.user.create({
        data: {
            name: 'Admin',
            pin: '9999',
            division: 'ADMIN',
            isAdmin: true,
            isJoined: true,
        },
    });

    const seededUsers: any[] = [];
    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        let pin = (1001 + i).toString();

        // Custom PIN updates as requested
        if (emp.name === "Hanafiah Yunan Putri") pin = "1019";
        else if (emp.name === "Stepanus") pin = "1016";
        // Prevent collision: if someone else ends up with 1016 or 1019 via the formula, give them a different one
        else if (pin === "1016") pin = "1116";
        else if (pin === "1019") pin = "1119";

        const user = await prisma.user.create({
            data: {
                name: emp.name,
                pin: pin,
                division: emp.division,
                isAdmin: false,
                isJoined: false,
                collectedWater: 0,
                contributedWater: 0,
                score: 0,
            },
        });
        seededUsers.push({ Name: user.name, PIN: user.pin, Division: user.division });
    }
    console.table(seededUsers);

    console.log('Seeding candidates (Teams & Digimers)...');
    await prisma.candidate.createMany({
        data: [
            // Teams
            { id: 't1', name: 'Tech Wizards', division: 'Technology & Operation', type: 'team', imageUrl: '' },
            { id: 't2', name: 'Design Masters', division: 'Content Design', type: 'team', imageUrl: '' },
            { id: 't3', name: 'Support Heroes', division: 'Customer Support', type: 'team', imageUrl: '' },
            // Individual Digimers (Sampling from real employees)
            { id: 'd1', name: 'Muhammad Rizky Husain', division: 'Software Engineering & QA', type: 'digimer', imageUrl: '' },
            { id: 'd2', name: 'Hanafiah Yunan Putri', division: 'Content Design', type: 'digimer', imageUrl: '' },
            { id: 'd3', name: 'Muhammad Hafizh Abdillah', division: 'Software Engineering & QA', type: 'digimer', imageUrl: '' },
        ]
    });

    console.log('Seeding trivia questions...');
    const questions = [
        {
            index: 1,
            text: "Di tahun berapakah digima ASIA resmi didirikan dan mulai berkarya di industri digital learning & animasi tanah air?",
            options: JSON.stringify(["2012", "2014", "2016", "2018"]),
            answer: 2
        },
        {
            index: 2,
            text: "Divisi manakah di digima ASIA yang paling sering berkoordinasi secara intens untuk memastikan integrasi antara aset visual animasi dan sistem berjalan mulus tanpa bug?",
            options: JSON.stringify(["Tim Organization Support & Tim Customer Support", "Tim Software Engineer & Tim Content Design", "Tim Interaction Design & Tim Customer Support", "Tim Project Management & Tim Sales"]),
            answer: 1
        },
        {
            index: 3,
            text: "Saat menghadapi proyek e-learning berskala besar, format standardisasi internasional apa yang paling sering diutak-atik tim developer digima ASIA agar konten bisa berjalan di LMS?",
            options: JSON.stringify(["MP4 Video Only", "SCORM Package", "PDF Documents", "Powerpoint Slides"]),
            answer: 1
        },
        {
            index: 4,
            text: "Siapakah sosok pimpinan atau jajaran manajemen awal yang menjadi motor penggerak utama di balik arah strategis dan kesuksesan bisnis digima ASIA?",
            options: JSON.stringify(["Vania Sari Muchardie", "Daniel Virginia Lie", "Karib Chiang", "Dyah Prajnaparamita"]),
            answer: 1
        },
        {
            index: 5,
            text: "Apa pilar layanan utama yang ditawarkan oleh digima ASIA kepada klien korporat dalam mentransformasi materi training konvensional?",
            options: JSON.stringify(["Penjualan Perangkat Keras Komputer", "Digital Learning Content, Animation, & Custom E-Learning Development", "Jasa Pembuatan Baliho Fisik", "Konsultan Pajak Korporasi"]),
            answer: 1
        },
        {
            index: 6,
            text: "Di IntikomHub, area manakah yang paling sering dijadikan tempat 'pelarian' digimer untuk mencari inspirasi segar atau sekadar meluruskan punggung yang pegal akibat kelamaan duduk?",
            options: JSON.stringify(["Pantry", "Basement Pojok", "Rooftop", "Delta"]),
            answer: 1
        },
        {
            index: 7,
            text: "Jenis software desain/animasi apa yang menjadi senjata tempur utama dan wajib terinstal di komputer setiap anggota tim Content Design digima ASIA?",
            options: JSON.stringify(["Figma", "Adobe Creative Cloud", "Corel Draw", "Microsoft Paint"]),
            answer: 1
        },
        {
            index: 8,
            text: "Buku panduan atau standar operasional (SOP) internal digima ASIA yang mengatur tata tertib, hak, dan kewajiban karyawan dikelola secara rapi oleh tim apa?",
            options: JSON.stringify(["Tim Project Management", "Tim Organization Support", "Tim Interaction Design", "Tim Customer Support"]),
            answer: 1
        },
        {
            index: 9,
            text: "digimer dengan status kepegawaian PKWT mendapatkan benefit dapat memilih hadiah ulang tahun berupa?",
            options: JSON.stringify(["Voucher Makan Bakmi Koga", "Makan siang gratis senilai 300.000", "1 Hari Libur", "Sepatu baru"]),
            answer: 2
        },
        {
            index: 10,
            text: "Apa sapaan internal atau sebutan akrab yang biasanya digunakan sesama karyawan digima ASIA untuk menyapa rekan kerja agar suasana terasa hangat dan kekeluargaan?",
            options: JSON.stringify(["'Mas' / 'Mba' / 'Kak'", "'Yang Mulia'", "'Baginda'", "'Paduka'"]),
            answer: 0
        }
    ];

    for (const q of questions) {
        await prisma.question.create({ data: q });
    }

    console.log('Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
