import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import confirmRouter from "./routes/confirm";
import recordRouter from "./routes/record";
import uploadRouter from "./routes/upload";
import { createWorker } from "./worker/worker";

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Converts JSON from the request body into a JavaScript object you can access in req.body
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

io.on("connection", (socket) => {
  socket.on("joinProcess", (socketId: string) => {
    socket.join(socketId);
  });
});
createWorker(io);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", recordRouter);
app.use("/api", uploadRouter);
app.use("/api", confirmRouter);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(
    `🚀 server running on ${process.env.NODE_ENV !== "production" ? "http://localhost:" : "port:"} ${PORT}`,
  );
});

export default app;
