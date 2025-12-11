const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");
const crypto = require("crypto");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const createDashboardService = async () => {
  // Logic to create dashboard service
};
const createUserService = async (email, name, phone, userType) => {
  const user = await prisma.Users.create({
    data: {
      mail: email,
      name: name,
      phone: phone,
      userType: userType,
      apiKey: crypto
        .createHmac("sha256", process.env.API_SECRET)
        .update(email + Date.now().toString())
        .digest("hex"),
    },
  });
  return user;
};
const deleteUserService = async (userId) => {
  const user = await prisma.Users.delete({
    where: {
      id: userId,
    },
  });
  return user;
};
const createRuleService = async (pattern, action) => {
  const existingRules = await prisma.rules.findMany();

  const conflicts = [];

  for (const existingRule of existingRules) {
    try {
      if (existingRule.pattern === pattern) {
        if (existingRule.action === action) {
          return {
            success: false,
            error: "DUPLICATE",
            message: `Exact duplicate rule already exists (ID: ${existingRule.id})`,
          };
        } else {
          return {
            success: false,
            error: "CONFLICT",
            message: `Same pattern exists with different action: "${existingRule.action}" (ID: ${existingRule.id})`,
            conflictingRule: existingRule,
          };
        }
      }

      const newRegex = new RegExp(pattern);
      const existingRegex = new RegExp(existingRule.pattern);

      const existingMatchesNew = existingRegex.test(pattern);
      const newMatchesExisting = newRegex.test(existingRule.pattern);
      const isSubstring =
        pattern.includes(existingRule.pattern) ||
        existingRule.pattern.includes(pattern);

      if (
        (existingMatchesNew || newMatchesExisting || isSubstring) &&
        existingRule.action !== action
      ) {
        conflicts.push({
          ruleId: existingRule.id,
          pattern: existingRule.pattern,
          action: existingRule.action,
        });
      }
    } catch (e) {
      console.error(`Invalid existing regex: ${existingRule.pattern}`, e);
      continue;
    }
  }

  if (conflicts.length > 0) {
    const rule = await prisma.rules.create({
      data: {
        pattern: pattern,
        action: action,
      },
    });
    return {
      success: true,
      rule,
      warning: "POTENTIAL_CONFLICTS",
      message: `Rule created but may conflict with ${conflicts.length} existing rule(s)`,
      conflicts,
    };
  }

  const rule = await prisma.rules.create({
    data: {
      pattern: pattern,
      action: action,
    },
  });
  return { success: true, rule };
};
const deleteRuleService = async (ruleId) => {
  const rule = await prisma.rules.delete({
    where: {
      id: ruleId,
    },
  });
  return rule;
};
const getRulesService = async () => {
  const rules = await prisma.rules.findMany();
  return rules;
};
const getUserService = async () => {
  const users = await prisma.Users.findMany();
  return users;
};
const getLogsService = async () => {
  const logs = await prisma.logs.findMany();
  return logs;
};
const updateUserService = async (userId, name, phone, userType, credits) => {
  // Build data object with only the fields that are passed
  const data = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (userType !== undefined) data.userType = userType;
  if (credits !== undefined) data.credit = credits;

  const user = await prisma.Users.update({
    where: {
      id: userId,
    },
    data,
  });
  return user;
};
const createRoleService = async (name) => {
  const role = await prisma.role.create({
    data: {
      name: name,
    },
  });
  return role;
};
const deleteRoleService = async (roleId) => {
  const role = await prisma.role.delete({
    where: {
      id: roleId,
    },
  });
  return role;
};
const getRolesService = async () => {
  const roles = await prisma.role.findMany();
  return roles;
};
const updateRoleService = async (roleId, name) => {
  const role = await prisma.role.update({
    where: {
      id: roleId,
    },
    data: {
      name: name,
    },
  });
  return role;
};
const assignRoleService = async (userId, roleId) => {
  // Check if user exists
  const existingUser = await prisma.Users.findUnique({
    where: { id: userId },
  });
  if (!existingUser) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Check if role exists
  const existingRole = await prisma.role.findUnique({
    where: { id: roleId },
  });
  if (!existingRole) {
    throw new Error(`Role with ID ${roleId} not found`);
  }

  const user = await prisma.Users.update({
    where: {
      id: userId,
    },
    data: {
      roleId: roleId,
    },
  });
  return user;
};
const getApprovalService = async () => {
  const approval = await prisma.approvals.findMany();
  return approval;
};
const updateApprovalService = async (approvalId, status) => {
  const approval = await prisma.approvals.update({
    where: {
      id: approvalId,
    },
    data: {
      status: status,
    },
  });
  return approval;
};
const deleteApprovalService = async (approvalId) => {
  const approval = await prisma.approvals.delete({
    where: {
      id: approvalId,
    },
  });
  return approval;
};
const createApprovalService = async (userId, roleId) => {
  const approval = await prisma.approvals.create({
    data: {
      approvedby: userId,
      roleid: roleId,
    },
  });
  return approval;
};
const getApprovalsListService = async () => {
  const approvalsList = await prisma.approvalsList.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          mail: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return approvalsList;
};

const updateApprovalsListService = async (approvalId, status) => {
  const approval = await prisma.approvalsList.update({
    where: {
      id: approvalId,
    },
    data: {
      status: status,
    },
  });
  return approval;
};

const deleteApprovalsListService = async (approvalId) => {
  const approval = await prisma.approvalsList.delete({
    where: {
      id: approvalId,
    },
  });
  return approval;
};

module.exports = {
  createDashboardService,
  createUserService,
  deleteUserService,
  createRuleService,
  deleteRuleService,
  getRulesService,
  getUserService,
  getLogsService,
  updateUserService,
  createRoleService,
  deleteRoleService,
  getRolesService,
  updateRoleService,
  assignRoleService,
  getApprovalService,
  updateApprovalService,
  deleteApprovalService,
  createApprovalService,
  getApprovalsListService,
  updateApprovalsListService,
  deleteApprovalsListService,
};
