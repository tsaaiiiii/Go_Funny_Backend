import "dotenv/config";
import app from "./src/app";

const port = Number(process.env.PORT);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
