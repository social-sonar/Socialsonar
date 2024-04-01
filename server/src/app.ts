import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routers";
import { responseTimeLogger } from "./middlewares/Log";
import { endpointErrorHandler } from "./middlewares/EndpointErrorHandler";
import { sequelize } from "./database";

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", responseTimeLogger, router, endpointErrorHandler);

app.get("/test", (_req, res) => {
  res.json({
    message: "Hello World!",
    db: sequelize.getDatabaseName(),
  });
});

app.get("/setup", (req, res) => {
  res.json({ version: process.env.API_VERSION ?? "0.0.1" });
});

export default app;
