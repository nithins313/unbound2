const express = require("express");
const {
  getDashboard,
  createUser,
  deleteUser,
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
} = require("../controllers/index.js");
const { authenticateAdmin } = require("../middleware/index.js");

const Router = express.Router();
Router.get("/dashboard", authenticateAdmin, getDashboard);
Router.post("/create-user", authenticateAdmin, createUser);
Router.delete("/delete-user/:id", authenticateAdmin, deleteUser);
Router.post("/create-rule", authenticateAdmin, createRule);
Router.delete("/delete-rule/:id", authenticateAdmin, deleteRule);
Router.get("/get-rules", authenticateAdmin, getRules);
Router.get("/get-users", authenticateAdmin, getUsers);
Router.get("/get-logs", authenticateAdmin, getLogs);
Router.put("/update-user/:id", authenticateAdmin, updateUser);
Router.post("/create-role", authenticateAdmin, createRole);
Router.delete("/delete-role/:id", authenticateAdmin, deleteRole);
Router.get("/get-roles", authenticateAdmin, getRoles);
Router.put("/update-role/:id", authenticateAdmin, updateRole);
Router.post("/assign-role", authenticateAdmin, assignRole);
Router.get("/get-approvals", authenticateAdmin, getApprovals);
Router.put("/update-approval/:id", authenticateAdmin, updateApproval);
Router.delete("/delete-approval/:id", authenticateAdmin, deleteApproval);
Router.post("/create-approval", authenticateAdmin, createApproval);

// Command Approvals List endpoints
Router.get("/get-approvals-list", authenticateAdmin, getApprovalsList);
Router.put(
  "/update-approvals-list/:id",
  authenticateAdmin,
  updateApprovalsList
);
Router.delete(
  "/delete-approvals-list/:id",
  authenticateAdmin,
  deleteApprovalsList
);

module.exports = Router;
