import express, { Request, Response } from "express";
import config from "config"
import connect from "./utils/connect"
import logger from "./utils/logger"
import routes from "./routes"
import deserializeUser from "./middleware/deserializeUser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT
const app =express()
app.use(cors());
app.use(express.json());
app.use(deserializeUser);

app.listen(port, async ()=>{

    logger.info(`app is running at http://localhost:${port}`);
    await connect();
    routes(app);
})