const User = require("./User");
const ActivityLog = require("./ActivityLog");
const Csr = require("./Csr");

User.hasMany(Csr, { foreignKey: "author_id" });
Csr.belongsTo(User, { foreignKey: "author_id" });

module.exports = {
  User,
  ActivityLog,
  Csr,
};
