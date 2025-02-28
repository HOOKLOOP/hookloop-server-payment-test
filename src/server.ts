import mongoose from "mongoose";

import app from "./app";

// Connect mongoDB
mongoose
  .connect(process.env.MONGO_DB_URI!)
  .then(() => {
    console.log("MongoDB is running!");
    app.listen(process.env.PORT!, () => {
      console.log("Server is running again!", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("MongoDB can't connect!", error);
  });

// INFO: Handle uncaughtException and unhandledRejection
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("unhandledRejection:", promise, "reason:", reason);
});
