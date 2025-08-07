require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
});

const generateContent = require('./src/services/ai.service');


const chatHistory = [];

io.on("connection", (socket) => {
  console.log("✅ Socket Connected");

  socket.on("ai-prompt", async (data) => {
    try {
      console.log("🟦 Prompt received:", data);

      chatHistory.push({
        role: "user",
        parts: [{ text: data }]
      });

      const response = await generateContent(chatHistory);

      chatHistory.push({
        role: "model",
        parts: [{ text: response }]
      });

      socket.emit("AI-Response", response);

    } catch (error) {
      console.error("❌ Error generating content:", error);
      socket.emit("ai-error", { error: "Failed to generate content" });
    }
  });
});

httpServer.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server is running on port", process.env.PORT || 3000);
});
