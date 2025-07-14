const sequelize = require("../config/database");
const createDatabaseIfNotExists = require("../config/initDatabase");

require("../models"); // Ensure models are imported to register them with Sequelize

const setupDatabase = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    await sequelize.sync({ alter: true }); // Optional: { alter: true } or { force: true }
    console.log("✅ Models synced");
  } catch (error) {
    console.error("❌ Error during DB setup:", error);
    process.exit(1);
  }
};

module.exports = setupDatabase;
