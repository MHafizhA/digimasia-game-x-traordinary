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
    console.log('Cleaning up existing users...');
    await prisma.userAnswer.deleteMany({});
    await prisma.vote.deleteMany({});
    await prisma.user.deleteMany({});

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

    console.log('Seeding employees...');
    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        const pin = (1001 + i).toString();
        await prisma.user.create({
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
        console.log(`Created: ${emp.name} (PIN: ${pin})`);
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
