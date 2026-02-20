import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", async (_, res) => {
  res.json({ status: "ok" });
});
