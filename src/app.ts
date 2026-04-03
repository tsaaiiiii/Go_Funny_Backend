import express from "express";
import routes from "@/routes";

const app = express();
app.use(express.json()); // middleware：讓 app 能解析 JSON request body
app.use(routes);

export default app;
