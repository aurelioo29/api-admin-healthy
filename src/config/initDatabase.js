const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const createDatabaseIfNotExists = async () => {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    console.log("🔒 [DB] Production mode: skip CREATE DATABASE");
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, // di dev boleh root / power user
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  });

  const dbName = process.env.DB_NAME;
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  console.log(`✅ [DB] Ensured database ${dbName} (dev only)`);
  await connection.end();
};

module.exports = createDatabaseIfNotExists;
