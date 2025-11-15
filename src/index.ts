import connectDatabase from "./config/database.config";
import app from "./app";

const port = process.env.PORT || 3030;

const start = async () => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

  await connectDatabase()
  .then(() => { console.log(`MongoDB Connected`) })
  .catch((e) => { console.log(`MongoDB Error - ${e}`) });
}

start();