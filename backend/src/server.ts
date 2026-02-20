import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/tasks";
import { registerSocketHandlers } from "./socket/socketHandler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/tasks", taskRoutes);

const httpServer = http.createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

registerSocketHandlers(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
