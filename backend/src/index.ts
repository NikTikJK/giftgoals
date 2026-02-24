import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api", healthRouter);

app.listen(env.PORT, () => {
  console.log(
    `[GiftGoals API] running on http://localhost:${env.PORT}  (${env.NODE_ENV})`,
  );
});

export default app;
