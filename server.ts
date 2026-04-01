import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Hello, Go-Funny-Backend!");
});

const port = Number(process.env.PORT);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
