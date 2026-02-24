import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import wishlistsRouter from "./routes/wishlists.js";
import giftsRouter from "./routes/gifts.js";
import reservationsRouter from "./routes/reservations.js";
import contributionsRouter from "./routes/contributions.js";
import publicRouter from "./routes/public.js";
import notificationsRouter from "./routes/notifications.js";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/wishlists", wishlistsRouter);
app.use("/api/gifts", giftsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/contributions", contributionsRouter);
app.use("/api/w", publicRouter);
app.use("/api/notifications", notificationsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(
    `[GiftGoals API] running on http://localhost:${env.PORT}  (${env.NODE_ENV})`,
  );
});

export default app;
