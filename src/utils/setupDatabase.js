const sequelize = require("../config/database");
const createDatabaseIfNotExists = require("../config/initDatabase");
require("../models");

function shouldAutoSync() {
  const explicit = String(process.env.DB_AUTO_SYNC || "").toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return process.env.NODE_ENV !== "production";
}

const setupDatabase = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    console.log("✅ DB connection OK");
    if (shouldAutoSync()) {
      const alter = process.env.NODE_ENV !== "production";
      await sequelize.sync({ alter });
      console.log(`✅ Models synced (alter=${alter})`);
    } else {
      console.log("🔒 DB sync skipped (production / DB_AUTO_SYNC=false)");
    }
  } catch (error) {
    console.error("❌ Error during DB setup:", error);
    process.exit(1);
  }
};

module.exports = setupDatabase;
