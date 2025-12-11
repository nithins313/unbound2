const express = require("express");
const { authenticateUser } = require("../middleware/index.js");
const {
  executeCommand,
  getCredits,
  getHistory,
} = require("../controllers/index.js");

const Router = express.Router();

Router.post("/execute-command", authenticateUser, executeCommand);
Router.get("/credits", authenticateUser, getCredits);
Router.get("/history", authenticateUser, getHistory);

module.exports = Router;
