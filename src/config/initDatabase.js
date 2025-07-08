const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const createDatabaseIfNotExists = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  });

  const dbName = process.env.DB_NAME;

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  console.log(`Database ${dbName} ensured`);
  await connection.end();
};

module.exports = createDatabaseIfNotExists;
