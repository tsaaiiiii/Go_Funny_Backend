import express from "express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "@/lib/auth";
import routes from "@/routes";
import { createCors } from "@/middleware/cors";

const app = express();

app.use(createCors());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json()); // middleware：讓 app 能解析 JSON request body
app.use(routes);

export default app;
