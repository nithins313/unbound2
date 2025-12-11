const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const authenticateAdmin = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing or invalid token" });
    }

    const adminToken = authHeader.split(" ")[1];

    // Await the Prisma query
    const admin = await prisma.users.findFirst({
      where: {
        apiKey: adminToken,
        userType: "ADMIN",
      },
    });

    if (admin) {
      req.admin = admin; // Attach admin info to request
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Admins only" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const authenticateUser = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing or invalid token" });
    }

    const userToken = authHeader.split(" ")[1];

    // Await the Prisma query
    const user = await prisma.users.findFirst({
      where: {
        apiKey: userToken,
        userType: "MEMBER",
      },
    });

    if (user) {
      req.user = user; // Attach user info to request
      next();
    } else {
      res.status(403).json({ message: "Forbidden: Users only" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { authenticateAdmin, authenticateUser };
