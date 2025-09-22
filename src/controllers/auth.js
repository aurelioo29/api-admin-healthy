const User = require("../models/User");
const {
  comparePassword,
  generateCode,
  generateToken,
  hashPassword,
  sendEmail,
} = require("../utils/auth");
const { Op } = require("sequelize");
const {
  testSendTemplate,
  signUpTemplate,
  resendCodeTemplate,
  forgetPasswordTemplate,
  notificationTemplate,
} = require("../utils/auth/templates");

// Sign-Up Method
const signup = async (request, response, next) => {
  try {
    const { username, email, password, role, confirmPassword } = request.body;

    if (password !== confirmPassword) {
      response.code = 400;
      throw new Error("Password and Confirm Password do not match");
    }

    const isUsernameExists = await User.findOne({
      where: {
        username,
      },
    });

    if (isUsernameExists) {
      response.code = 400;
      throw new Error("Username already exists");
    }

    const isEmailExists = await User.findOne({
      where: {
        email,
      },
    });

    if (isEmailExists) {
      response.code = 400;
      throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = generateCode(6);
    const html = signUpTemplate(verificationCode);
    const expiredCode = Math.floor(Date.now() / 1000) + 60 * 5; // Expires in 5 minutes

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      verificationCode,
      verificationCodeExpires: expiredCode,
      status: false,
    });

    await sendEmail({
      emailTo: newUser.email,
      subject: "🔐 Account Verification Code",
      html,
    });

    response.status(201).json({
      code: 201,
      success: true,
      message: "User created successfully. Verification code sent to email.",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify User Method
const verifyUser = async (request, response, next) => {
  try {
    const { email, code } = request.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      response.code = 404;
      throw new Error("User not found");
    }

    const now = Math.floor(Date.now() / 1000);
    if (user.verificationCode !== code || user.verificationCodeExpires < now) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    const html = notificationTemplate();

    await sendEmail({
      emailTo: user.email,
      subject: "✅ Account Verified Successfully",
      html,
    });

    response.status(200).json({
      code: 200,
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Resend Verification Code Method
const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.code = 404;
      throw new Error("User not found");
    }

    if (user.status === true) {
      res.code = 400;
      throw new Error("Account already verified");
    }

    const now = Date.now();
    const lastRequested = user.verificationCodeRequestedAt
      ? new Date(user.verificationCodeRequestedAt).getTime()
      : 0;

    // Check if the last request was less than 3 minutes ago
    // If so, throw an error to prevent spamming
    if (now - lastRequested < 3 * 60 * 1000) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Please wait 3 minutes before requesting another code",
      });
    }

    const newCode = generateCode(6);
    const html = resendCodeTemplate(newCode);
    const expires = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes

    user.verificationCode = newCode;
    user.verificationCodeExpires = expires;
    user.verificationCodeRequestedAt = new Date(); // Add this column in model if belum ada

    await user.save();

    await sendEmail({
      emailTo: user.email,
      subject: "🔄 New Verification Code",
      html,
    });

    res.status(200).json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Sign-In Method
const signin = async (request, response, next) => {
  try {
    const { email, username, password } = request.body;

    if (!email && !username) {
      response.code = 400;
      throw new Error("Email or Username is required");
    }

    const whereCondition = {};

    if (email) whereCondition.email = email;
    if (username) whereCondition.username = username;

    const user = await User.findOne({
      where: {
        [Op.or]: Object.entries(whereCondition).map(([key, value]) => ({
          [key]: value,
        })),
      },
    });

    if (!user) {
      response.code = 400;
      throw new Error("Invalid Email or Username");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      response.code = 400;
      throw new Error("Invalid Password");
    }

    const token = generateToken(user);

    response.status(200).json({
      code: 200,
      success: true,
      message: "User signed in successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get All Users Method
const getUsers = async (request, response, next) => {
  try {
    const { search, size, page } = request.query;

    const limit = parseInt(size) || 10;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * limit;

    let whereCondition = {};

    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count: totalUser, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["updated_at", "DESC"]],
    });

    if (users.length === 0) {
      return response.status(404).json({
        code: 404,
        success: false,
        message: "No users found",
      });
    }

    response.status(200).json({
      code: 200,
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        totalUser,
        totalPages: Math.ceil(totalUser / limit),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forget Password Code Method
const forgetPasswordCode = async (request, response, next) => {
  try {
    const { email } = request.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      response.code = 404;
      throw new Error("Code sent if email is registered");
    }

    const now = Date.now();
    const lastRequest = user.forgotPasswordRequestedAt
      ? new Date(user.forgotPasswordRequestedAt).getTime()
      : 0;

    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes

    if (now - lastRequest < cooldownPeriod) {
      response.status(400).json({
        code: 400,
        success: false,
        message: "Please wait before requesting another code.",
      });
    }

    const code = generateCode(6);
    const html = forgetPasswordTemplate(code);
    const expires = Math.floor(now / 1000) + 5 * 60;

    user.forgotPasswordCode = code;
    user.forgotPasswordCodeExpires = expires;
    user.forgotPasswordRequestedAt = new Date();

    await user.save();

    await sendEmail({
      emailTo: user.email,
      subject: "🔐 Forgot Password Code",
      html,
    });

    response.status(200).json({
      code: 200,
      success: true,
      message: "Forgot password code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Change Password Method
const recoverPassword = async (request, response, next) => {
  try {
    const { email, code, password, confirmPassword } = request.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      response.code = 404;
      throw new Error("Code sent if email is registered");
    }

    if (!code || code.length !== 6) {
      response.code = 400;
      throw new Error("Invalid verification code format");
    }

    const now = Math.floor(Date.now() / 1000);

    if (
      user.forgotPasswordCode !== code ||
      !user.forgotPasswordCodeExpires ||
      user.forgotPasswordCodeExpires < now
    ) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Invalid or expired code",
      });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.forgetPasswordCode = null;
    user.forgotPasswordCodeExpires = null;

    await user.save();

    response.status(200).json({
      code: 200,
      success: true,
      message: "Password reset successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Test Send Email Method
const testSendEmail = async (request, response, next) => {
  try {
    const { email } = request.body;

    if (!email) {
      response.code = 400;
      throw new Error("Email is required");
    }

    const code = generateCode(6);
    const html = testSendTemplate(code);

    await sendEmail({
      emailTo: email,
      subject: "🔐 Email Verification Code",
      html,
    });

    response.status(200).json({
      code: 200,
      success: true,
      message: "Email verification code sent successfully",
    });
  } catch (error) {
    response.json({
      code: response.code || 500,
      success: false,
      message: error.message || "Internal Server Error",
    });
    next(error);
  }
};

module.exports = {
  testSendEmail,
  signup,
  verifyUser,
  signin,
  getUsers,
  forgetPasswordCode,
  recoverPassword,
  resendVerificationCode,
};
