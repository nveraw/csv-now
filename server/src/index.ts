import cors from "cors";
import express from "express";

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/records", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Not ready",
  });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 server running on http://localhost:${PORT}`);
  });
}

export default app;
