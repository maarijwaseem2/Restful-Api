import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import ProductRoutes from "./api/routes/products";
import OrderRoutes from "./api/routes/orders";
import userRoutes from "./api/routes/user";
require("dotenv").config();

const app: Application = express();

const connect = mongoose.connect("mongodb://0.0.0.0:27017/ts-restful-api");
connect
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch(err => {
    console.log("Database cannot be connected: " + err);
  });

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept, Authorization"
  );

  if(req.method === "OPTIONS"){
    res.header("Access-Control-Allow-Methods","PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
}
next();
});

app.use("/products", ProductRoutes);
app.use("/orders", OrderRoutes);
app.use("/user", userRoutes);

interface errorMessage extends Error {
    status?: number;
}
app.use((req: Request, res: Response, next: NextFunction) => {
    const err: Error = new Error('Not Found');
    res.status(404);
    next(err);
});

app.use((err: errorMessage, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    res.json({
        err: {
            message: err.message
        }
    });
});

export default app;