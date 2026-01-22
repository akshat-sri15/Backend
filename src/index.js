import dotenv from "dotenv"
import express from "express"
import cors from "cors";
import connectDB from "./db/index.js"
dotenv.config({
    path:"./.env",
});
const app=express();
const port=process.env.PORT || 3000;
// basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// cors configurations
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
import healthCheckRouter from "./routers/healthcheck.route.js"
app.use("/api/v1/healthcheck",healthCheckRouter);
import authrouter from "../src/routers/auth.routes.js"
app.use("/api/v1/auth",authrouter);
app.get("/",(req,res)=>{
    res.send("hey!")
});
app.get("/instagram",(req,res)=>{
    res.send("insta page")
});
connectDB()
  .then(()=>{
    app.listen(port,()=>{
        console.log(`App listening on port http://localhost:${port}`);
    })
  })
  .catch(err=>{
    console.error("DB connection error",err);
    process.exit(1);
  })




  