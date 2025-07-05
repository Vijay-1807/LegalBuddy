const express = require("express");
const cors = require("cors");
require("dotenv").config();
const chatRoutes = require("./routes/chat");
const generateDocRoutes = require("./routes/generateDoc");
const transformRoutes = require("./routes/transform");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRoutes);
app.use("/api/generate-doc", generateDocRoutes);
app.use("/api/transform", transformRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 