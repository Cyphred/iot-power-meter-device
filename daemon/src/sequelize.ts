import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

let dbPort = parseInt(process.env.POSTGRES_PORT);
// Defaults to 3306
if (isNaN(dbPort)) dbPort = 5347;

const dbHost = process.env.POSTGRES_HOST;
const dbName = process.env.POSTGRES_NAME;
const dbUser = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASS;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  define: { timestamps: true },
});

export default sequelize;
