import express from "express";

const app = express();
app.use(express.json());

app.get("/", (_req: express.Request, res: express.Response) => {
  res.send("Hello, Go-Funny-Backend!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
