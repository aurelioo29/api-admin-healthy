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
const logActivity = require("../helpers/logActivity");

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

    await logActivity({
      userId: user.id,
      action: "VERIFY",
      resource: "/auth/verification",
      resourceId: user.id,
      description: `User ${user.email} verified their account`,
      ipAddress: request.ip,
      userAgent: request.get("User-Agent"),
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

// Sign-In (Login) Method
const signin = async (request, response, next) => {
  try {
    const { email, username, password } = request.body;

    if (!email && !username) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Email or Username is required",
      });
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
      return response.status(404).json({
        code: 404,
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Password does not match",
      });
    }

    const token = generateToken(user);

    await logActivity({
      userId: user.id,
      action: "LOGIN",
      resource: "/auth/signin",
      resourceId: user.id,
      description: `User ${user.username} | ${user.email} logged in`,
      ipAddress: request.ip,
      userAgent: request.get("User-Agent"),
    });

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
const getUsers = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = Math.min(parseInt(size) || 10, 100);
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const whereCondition = {};

    if (search) {
      const or = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];

      // optional: kalau angka, boleh cari by id juga
      const idNum = Number(search);
      if (!Number.isNaN(idNum)) or.push({ id: idNum });

      whereCondition[Op.or] = or;
    }

    const { count: totalUser, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["updated_at", "DESC"]],
    });

    // saran: balikin 200 meski kosong—biar FE nggak perlu treat sebagai error
    return res.status(200).json({
      code: 200,
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        totalUser,
        totalPages: Math.max(Math.ceil(totalUser / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Step 1 (Forget) - Forget Password Code Method
const forgetPasswordCode = async (request, response, next) => {
  try {
    const { email } = request.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return response.status(404).json({
        code: 404,
        success: false,
        message: "Code sent if email is registered", // tidak membocorkan kalau email ada/tidak
      });
    }

    const now = Date.now(); // milidetik
    const lastRequest = user.forgotPasswordRequestedAt
      ? new Date(user.forgotPasswordRequestedAt).getTime()
      : 0;

    const cooldownPeriod = 5 * 60 * 1000; // 5 menit (dalam ms)

    if (now - lastRequest < cooldownPeriod) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Please wait 5 minutes before requesting another code.",
      });
    }

    const code = generateCode(6); // 6 digit random OTP
    const html = forgetPasswordTemplate(code);
    const expires = Math.floor(now / 1000) + 5 * 60; // expire dalam 5 menit (dalam detik)

    user.forgotPasswordCode = code;
    user.forgotPasswordCodeExpires = expires; // pastikan field di DB pakai INT
    user.forgotPasswordRequestedAt = new Date(); // terserah kamu mau pakai ms/detik tapi konsisten

    await user.save();

    await sendEmail({
      emailTo: user.email,
      subject: "🔐 Forgot Password Code",
      html,
    });

    await logActivity({
      userId: user.id,
      action: "REQUEST_PASSWORD_RESET",
      resource: "/auth/forgot-password-code",
      resourceId: user.id,
      description: `User ${user.email} requested password reset`,
      ipAddress: request.ip,
      userAgent: request.get("User-Agent"),
    });

    return response.status(200).json({
      code: 200,
      success: true,
      message: "Forgot password code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Step 2 (Forget) - Change Password Method
const recoverPassword = async (request, response, next) => {
  try {
    const { email, code, password, confirmPassword } = request.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return response.status(404).json({
        code: 404,
        success: false,
        message: "Code sent if email is registered",
      });
    }

    if (!code || code.length !== 6) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Invalid verification code format",
      });
    }

    const now = Math.floor(Date.now() / 1000); // pastikan pakai detik karena DB kamu INT

    // ✅ Cek apakah code cocok & belum expire
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

    // ✅ Cek kecocokan password
    if (password !== confirmPassword) {
      return response.status(400).json({
        code: 400,
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    const hashedPassword = await hashPassword(password);

    // ✅ Reset data kode
    user.password = hashedPassword;
    user.forgotPasswordCode = null;
    user.forgotPasswordCodeExpires = null;
    user.forgotPasswordRequestedAt = null;

    await user.save();

    await logActivity({
      userId: user.id,
      action: "CHANGE_PASSWORD",
      resource: "/auth/recover-password",
      resourceId: user.id,
      description: `User ${user.email} changed password via recovery`,
      ipAddress: request.ip,
      userAgent: request.get("User-Agent"),
    });

    return response.status(200).json({
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

// Create User by Superadmin Method
const createUserBySuperAdmin = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Forbidden: You do not have permission to perform this action",
      });
    }

    if (!username || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "All fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ code: 400, success: false, message: "Passwords do not match" });
    }
    if (!["admin", "superadmin"].includes(role)) {
      return res
        .status(400)
        .json({ code: 400, success: false, message: "Invalid role" });
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Username or Email already in use",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/auth/create-users",
      resourceId: newUser.id,
      description: `Created user ${username} with role ${role} by superadmin`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      code: 201,
      success: true,
      message: "User created successfully by superadmin",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified, // true
        status: "active", // biar FE makin gampang
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "User authenticated",
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  testSendEmail,
  signup,
  verifyUser,
  me,
  signin,
  getUsers,
  forgetPasswordCode,
  recoverPassword,
  resendVerificationCode,
  createUserBySuperAdmin,
};
