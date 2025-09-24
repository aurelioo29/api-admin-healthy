const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  try {
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      }
    );
    return token;
  } catch (error) {
    throw new Error(`Error generating token: ${error.message}`);
  }
};

module.exports = generateToken;
