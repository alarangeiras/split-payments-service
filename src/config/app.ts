import http from "node:http";
import bodyParser from "body-parser";
import express from "express";
import pinoHTTP from "pino-http";
import router from "../api";
import { handleApiErrors } from "../middlewares/error-handling";
import logger from "./logger";

const app = express();
app.use(bodyParser.json());
app.use(
	pinoHTTP({
		logger,
	}),
);

app.use(router);
app.use(handleApiErrors());

const server = http.createServer(app);

export default server;
