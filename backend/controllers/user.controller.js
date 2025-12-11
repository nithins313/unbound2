const {
  executeCommandService,
  getUserCreditsService,
  getUserHistoryService,
} = require("../services/index.js");

const executeCommand = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ message: "Missing command" });
    }
    const result = await executeCommandService(command, req.user.apiKey);

    if (result.status === "error") {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getCredits = async (req, res) => {
  try {
    const credits = await getUserCreditsService(req.user.id);
    res.status(200).json({ message: "Credits fetched successfully", credits });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await getUserHistoryService(req.user.id);
    res.status(200).json({ message: "History fetched successfully", history });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = { executeCommand, getCredits, getHistory };
