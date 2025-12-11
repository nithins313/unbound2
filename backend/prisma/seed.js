const crypto = require("crypto");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.Users.upsert({
    where: { mail: "admin@unbound.com" },
    update: {},
    create: {
      mail: "admin@unbound.com",
      name: "admin user",
      phone: "1234567890",
      userType: "ADMIN",
      apiKey: crypto
        .createHmac("sha256", process.env.API_SECRET)
        .update("admin@unbound.com" + Date.now().toString())
        .digest("hex"),
    },
  });
  console.log("Admin user created:", admin);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
