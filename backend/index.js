require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { adminRoutes, userRoutes } = require("./routes/index.js");
const corsOptions = {
  origin: "*", // Replace with your frontend's origin
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
