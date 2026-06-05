const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const LoginCode = require('../models/LoginCode');
const User = require('../models/User');

/**
 * Generate a login code for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - The generated login code object
 */
const generateCode = async (userId) => {
  try {
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // // Delete any existing login codes for this user
    // await LoginCode.destroy({
    //   where: { user_id: userId },
    // });

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a unique token that includes the code
    const token = crypto.randomBytes(32).toString('hex');

    // Create the login code record
    const loginCode = await LoginCode.create({
      user_id: userId,
      token: token,
    });

    return {
      success: true,
      code: code,
      token: token,
      loginCodeId: loginCode.id,
      createdAt: loginCode.created_at,
    };
  } catch (error) {
    console.error('Error generating login code:', error);
    throw error;
  }
};

/**
 * Validate a login code for a user and log them in if successful
 * @param {string} code - The code to validate
 * @returns {Promise<Object>} - Validation result with token if successful
 */
const validateCode = async (code) => {
  try {
    // Find the login code for this user
    const loginCode = await LoginCode.findOne({
      where: { token: code },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!loginCode) {
      return {
        success: false,
        message: 'Invalid login code',
        statusCode: 401,
      };
    }

    const user = loginCode.user;

    // Check if the code has expired (7 days)
    const now = new Date();
    const codeAge = now - new Date(loginCode.created_at);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (codeAge > maxAge) {
      // Delete expired code
      await loginCode.destroy();
      return {
        success: false,
        message: 'Login code has expired',
        statusCode: 401,
      };
    }

    // Check if user account is active (for dealers)
    if (user.role_id === 2 && user.status_id !== 2) {
      // Delete the used code
      await loginCode.destroy();
      return {
        success: false,
        message: 'Account is not active',
        statusCode: 401,
      };
    }

    // Generate JWT token similar to loginDealer
    const tokenExpiration = '1h';
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role_id === 1 ? 'admin' : 'dealer',
        name: user.name,
        language: user.language,
      },
      process.env.JWT_SECRET || 'change_me_use_a_long_random_string', // SECURITY-SANITIZED: original fallback was weak
      {
        expiresIn: tokenExpiration,
      }
    );

    return {
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        language: user.language,
      },
    };
  } catch (error) {
    console.error('Error validating login code:', error);
    throw error;
  }
};

/**
 * Get active login code for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Object|null>} - The active login code or null
 */
const getActiveCode = async (userId) => {
  try {
    const loginCode = await LoginCode.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    if (!loginCode) {
      return null;
    }

    // // Check if code has expired
    // const now = new Date();
    // const codeAge = now - new Date(loginCode.created_at);
    // const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // if (codeAge > maxAge) {
    //   // Delete expired code
    //   await loginCode.destroy();
    //   return null;
    // }

    return loginCode;
  } catch (error) {
    console.error('Error getting active login code:', error);
    throw error;
  }
};

/**
 * Delete all login codes for a user
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteUserCodes = async (userId) => {
  try {
    await LoginCode.destroy({
      where: { user_id: userId },
    });
    return true;
  } catch (error) {
    console.error('Error deleting user login codes:', error);
    throw error;
  }
};

module.exports = {
  generateCode,
  validateCode,
  getActiveCode,
  deleteUserCodes,
};
