import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import metadataRoutes from "./routes/metadata.js";
import entryRoutes from "./routes/entries.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const corsOriginRaw = process.env.CORS_ORIGIN?.trim() || "*";
const corsOrigins =
  corsOriginRaw === "*"
    ? true
    : corsOriginRaw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

app.use(cors({ origin: corsOrigins }));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "chhaperia-cables-production-api" });
});

app.use("/auth", authRoutes);
app.use("/metadata", metadataRoutes);
app.use("/entries", entryRoutes);
app.use("/admin", adminRoutes);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
