const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");
const nodemailer = require("nodemailer");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const creditperrequest = 5;

// Working hours configuration (hardcoded)
const WORKING_HOURS = {
  startHour: 9, // 9 AM
  endHour: 18, // 6 PM
  workDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
};

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Helper function to check if current time is within working hours
const isWithinWorkingHours = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  const isWorkDay = WORKING_HOURS.workDays.includes(currentDay);
  const isWorkHour =
    currentHour >= WORKING_HOURS.startHour &&
    currentHour < WORKING_HOURS.endHour;

  return isWorkDay && isWorkHour;
};

// Helper function to send approval request email
const sendApprovalEmail = async (approvers, command, userId, approvalId) => {
  const approverEmails = approvers.map((a) => a.mail).join(", ");

  const mailOptions = {
    from: process.env.SMTP_USER || "nithins3103@gmail.com",
    to: approverEmails,
    subject: "Command Approval Required - Unbound",
    html: `
      <h2>Command Approval Request</h2>
      <p>A command requires your approval:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Command:</strong> <code>${command}</code>
      </div>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Approval ID:</strong> ${approvalId}</p>
      <p><strong>Requested at:</strong> ${new Date().toISOString()}</p>
      <hr>
      <p>Please log in to the admin panel to approve or reject this request.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to: ${approverEmails}`);
    return true;
  } catch (error) {
    console.error("Failed to send approval email:", error);
    return false;
  }
};

const executeCommandService = async (command, apiKey) => {
  const user = await prisma.Users.findUnique({
    where: {
      apiKey: apiKey,
    },
  });
  if (!user) {
    return { status: "error", message: "User not found" };
  }
  if (user.credit < creditperrequest) {
    return { status: "error", message: "Not enough credits" };
  }

  // Fetch all rules from the database
  const rules = await prisma.rules.findMany();

  // Check each rule's regex pattern against the command
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern);
      if (regex.test(command)) {
        // Handle different action types
        switch (rule.action) {
          case "AUTO_ACCEPT": {
            // Deduct credits and execute
            user.credit -= creditperrequest;
            await prisma.Users.update({
              where: { apiKey: apiKey },
              data: { credit: user.credit },
            });
            await prisma.logs.create({
              data: {
                comment: command,
                userid: user.id,
                action: "executed",
              },
            });
            return {
              status: "executed",
              message: "Command executed successfully",
            };
          }

          case "AUTO_REJECT": {
            await prisma.logs.create({
              data: {
                comment: command,
                userid: user.id,
                action: "rejected",
              },
            });
            return { status: "rejected", message: "Command rejected by rule" };
          }

          case "REQUIRE_APPROVAL": {
            // Create approval request in approvalsList table
            const approval = await prisma.approvalsList.create({
              data: {
                userid: user.id,
                command: command,
                status: "PENDING",
              },
            });

            // Get all admin users to send approval email
            const approvers = await prisma.Users.findMany({
              where: { userType: "ADMIN" },
              select: { mail: true, name: true },
            });

            // Send email to approvers
            await sendApprovalEmail(approvers, command, user.id, approval.id);

            await prisma.logs.create({
              data: {
                comment: command,
                userid: user.id,
                action: "pending_approval",
              },
            });

            return {
              status: "pending_approval",
              message:
                "Command requires approval. Notification sent to approvers.",
              approvalId: approval.id,
            };
          }

          case "TIMED_APPROVAL": {
            // Check if within working hours
            if (isWithinWorkingHours()) {
              // Auto-approve within working hours
              user.credit -= creditperrequest;
              await prisma.Users.update({
                where: { apiKey: apiKey },
                data: { credit: user.credit },
              });
              await prisma.logs.create({
                data: {
                  comment: command,
                  userid: user.id,
                  action: "executed_timed",
                },
              });
              return {
                status: "executed",
                message:
                  "Command executed (within working hours: 9 AM - 6 PM, Mon-Fri)",
              };
            } else {
              // Reject outside working hours
              await prisma.logs.create({
                data: {
                  comment: command,
                  userid: user.id,
                  action: "rejected_outside_hours",
                },
              });
              return {
                status: "rejected",
                message:
                  "Command rejected. Outside working hours (9 AM - 6 PM, Mon-Fri)",
              };
            }
          }

          default:
            await prisma.logs.create({
              data: {
                comment: command,
                userid: user.id,
                action: "not executed",
              },
            });
            return { status: "not executed", message: "Unknown action type" };
        }
      }
    } catch (e) {
      console.error(`Invalid regex pattern: ${rule.pattern}`, e);
      continue;
    }
  }

  // No matching rule found - default reject
  await prisma.logs.create({
    data: {
      comment: command,
      userid: user.id,
      action: "not executed",
    },
  });
  return { status: "not executed", message: "No matching rule found" };
};

const getUserCreditsService = async (userId) => {
  const user = await prisma.Users.findUnique({
    where: {
      id: userId,
    },
    select: {
      credit: true,
    },
  });
  return user?.credit ?? 0;
};

const getUserHistoryService = async (userId) => {
  const logs = await prisma.logs.findMany({
    where: {
      userid: userId,
    },
    orderBy: {
      id: "desc",
    },
  });
  return logs;
};

module.exports = {
  executeCommandService,
  getUserCreditsService,
  getUserHistoryService,
};
