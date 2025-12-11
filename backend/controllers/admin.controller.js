const {
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
} = require("../services/index.js");
const getDashboard = async (req, res) => {
  try {
    const dashboardData = await createDashboardService();
    res.status(200).json({ message: "Admin dashboard data" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
const createUser = async (req, res) => {
  console.log(req.body);
  const { mail, name, phone, userType } = req.body;
  if (!mail || !name || !phone || !userType) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (userType !== "ADMIN" && userType !== "MEMBER") {
    return res.status(400).json({ message: "Invalid user type" });
  }
  if (typeof phone !== "string") {
    return res.status(400).json({ message: "Phone number must be a number" });
  }
  if (typeof mail !== "string") {
    return res.status(400).json({ message: "Email must be a string" });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ message: "Name must be a string" });
  }

  try {
    const newUser = await createUserService(mail, name, phone, userType);
    res
      .status(201)
      .json({ message: "User created successfully", apiKey: newUser.apiKey });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const deletedUser = await deleteUserService(parseInt(userId));
    res
      .status(200)
      .json({ message: `User with ID ${userId} deleted successfully.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const createRule = async (req, res) => {
  const { pattern, action } = req.body;
  if (!pattern || !action) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (
    action !== "AUTO_ACCEPT" &&
    action !== "AUTO_REJECT" &&
    action !== "REQUIRE_APPROVAL" &&
    action !== "TIMED_APPROVAL"
  ) {
    return res.status(400).json({ message: "Invalid action type" });
  }
  //check pattern ins valid regex
  try {
    new RegExp(pattern);
  } catch (e) {
    return res.status(400).json({ message: "Invalid pattern" });
  }
  try {
    const result = await createRuleService(pattern, action);

    // Handle duplicate or conflict errors
    if (!result.success) {
      return res.status(409).json({
        message: result.message,
        error: result.error,
        conflictingRule: result.conflictingRule,
      });
    }

    // Handle successful creation with potential conflicts warning
    if (result.warning) {
      return res.status(201).json({
        message: result.message,
        rule: result.rule,
        warning: result.warning,
        conflicts: result.conflicts,
      });
    }

    // Clean success
    res.status(201).json({
      message: "Rule created successfully",
      rule: result.rule,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const deleteRule = async (req, res) => {
  const ruleId = req.params.id;
  if (!ruleId) {
    return res.status(400).json({ message: "Missing rule ID" });
  }
  try {
    const deletedRule = await deleteRuleService(parseInt(ruleId));
    res
      .status(200)
      .json({ message: `Rule with ID ${ruleId} deleted successfully.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const getRules = async (req, res) => {
  try {
    const rules = await getRulesService();
    res.status(200).json({ message: "Rules fetched successfully", rules });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await getUserService();
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const getLogs = async (req, res) => {
  try {
    const logs = await getLogsService();
    res.status(200).json({ message: "Logs fetched successfully", logs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, phone, userType, credits } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }
  try {
    const updatedUser = await updateUserService(
      parseInt(userId),
      name,
      phone,
      userType,
      credits
    );
    res
      .status(200)
      .json({ message: `User with ID ${userId} updated successfully.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const createRole = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Missing role name" });
  }
  try {
    const newRole = await createRoleService(name);
    res
      .status(201)
      .json({ message: "Role created successfully", role: newRole });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const deleteRole = async (req, res) => {
  const roleId = req.params.id;
  if (!roleId) {
    return res.status(400).json({ message: "Missing role ID" });
  }
  try {
    const deletedRole = await deleteRoleService(parseInt(roleId));
    res
      .status(200)
      .json({ message: `Role with ID ${roleId} deleted successfully.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const getRoles = async (req, res) => {
  try {
    const roles = await getRolesService();
    res.status(200).json({ message: "Roles fetched successfully", roles });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const updateRole = async (req, res) => {
  const roleId = req.params.id;
  const { name } = req.body;
  if (!roleId) {
    return res.status(400).json({ message: "Missing role ID" });
  }
  try {
    const updatedRole = await updateRoleService(parseInt(roleId), name);
    res
      .status(200)
      .json({ message: `Role with ID ${roleId} updated successfully.` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const assignRole = async (req, res) => {
  const { userId, roleId } = req.body;
  if (!userId || !roleId) {
    return res.status(400).json({ message: "Missing user ID or role ID" });
  }
  try {
    const assignedRole = await assignRoleService(
      parseInt(userId),
      parseInt(roleId)
    );
    res.status(200).json({
      message: `Role assigned to user with ID ${userId} successfully.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const getApprovals = async (req, res) => {
  try {
    const approvals = await getApprovalService();
    res
      .status(200)
      .json({ message: "Approvals fetched successfully", approvals });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const updateApproval = async (req, res) => {
  const approvalId = req.params.id;
  const { status } = req.body;
  if (!approvalId) {
    return res.status(400).json({ message: "Missing approval ID" });
  }
  try {
    const updatedApproval = await updateApprovalService(
      parseInt(approvalId),
      status
    );
    res.status(200).json({
      message: `Approval with ID ${approvalId} updated successfully.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const deleteApproval = async (req, res) => {
  const approvalId = req.params.id;
  if (!approvalId) {
    return res.status(400).json({ message: "Missing approval ID" });
  }
  try {
    const deletedApproval = await deleteApprovalService(parseInt(approvalId));
    res.status(200).json({
      message: `Approval with ID ${approvalId} deleted successfully.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
const createApproval = async (req, res) => {
  const { userId, roleId } = req.body;
  if (!userId || !roleId) {
    return res.status(400).json({ message: "Missing user ID or role ID" });
  }
  try {
    const createdApproval = await createApprovalService(
      parseInt(userId),
      parseInt(roleId)
    );
    res.status(201).json({
      message: "Approval created successfully",
      approval: createdApproval,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// ==================== APPROVALS LIST (Command Approvals) ====================
const getApprovalsList = async (req, res) => {
  try {
    const approvalsList = await getApprovalsListService();
    res.status(200).json({
      message: "Command approvals fetched successfully",
      approvalsList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const updateApprovalsList = async (req, res) => {
  const approvalId = req.params.id;
  const { status } = req.body;
  if (!approvalId) {
    return res.status(400).json({ message: "Missing approval ID" });
  }
  if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return res
      .status(400)
      .json({
        message: "Invalid status. Must be PENDING, APPROVED, or REJECTED",
      });
  }
  try {
    const updatedApproval = await updateApprovalsListService(
      parseInt(approvalId),
      status
    );
    res.status(200).json({
      message: `Command approval with ID ${approvalId} updated to ${status}.`,
      approval: updatedApproval,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteApprovalsList = async (req, res) => {
  const approvalId = req.params.id;
  if (!approvalId) {
    return res.status(400).json({ message: "Missing approval ID" });
  }
  try {
    const deletedApproval = await deleteApprovalsListService(
      parseInt(approvalId)
    );
    res.status(200).json({
      message: `Command approval with ID ${approvalId} deleted successfully.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  deleteUser,
  createUser,
  getDashboard,
  createRule,
  deleteRule,
  getRules,
  getUsers,
  getLogs,
  updateUser,
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  assignRole,
  getApprovals,
  updateApproval,
  deleteApproval,
  createApproval,
  getApprovalsList,
  updateApprovalsList,
  deleteApprovalsList,
};
