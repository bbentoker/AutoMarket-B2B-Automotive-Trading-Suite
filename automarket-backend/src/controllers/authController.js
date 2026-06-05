const {
  loginAdmin,
  addAdmin,
  loginDealer,
  registerDealer,
  registerScrapedDealer,
} = require('../services/authService');
const loginCodeService = require('../services/loginCodeService');
const User = require('../models/User');
const UserStatus = require('../models/UserStatus');
const ResetPasswordCode = require('../models/ResetPasswordCode');

const emailService = require('../services/emailService');

const isValidEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
};

const authController = {
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const token = await loginAdmin(email, password);
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  addAdmin: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      const admin = await addAdmin(name, email, password);
      res.status(201).json(admin);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  loginDealer: async (req, res) => {
    try {
      const { email, password } = req.body;
      const token = await loginDealer(email, password);
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  registerDealer: async (req, res) => {
    try {
      const { name, email, password, company_name, phone_number, vat_number } =
        req.body;

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('A dealer with this email already exists');
      }
      const dealer = await registerDealer({
        name,
        email,
        password,
        company_name,
        phone_number,
        vat_number,
        status_id: 1,
      });

      // Send welcome email to the newly registered dealer
      try {
        await emailService.sendWelcomeEmail(email, name, company_name);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the registration if email sending fails
      }

      res.status(201).json(dealer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  registerDealerComplete: async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        company_name,
        phone_number,
        vat_number,
        language,
        country,
      } = req.body;

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('A dealer with this email already exists');
      }
      const dealer = await registerDealer({
        name,
        email,
        password,
        company_name,
        phone_number,
        vat_number,
        status_id: 2,
        language,
        country,
      });

      // Send welcome complete email to the newly registered dealer
      try {
        await emailService.sendWelcomeCompleteEmail(email, name, company_name);
        console.log(`Welcome complete email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send welcome complete email:', emailError);
        // Don't fail the registration if email sending fails
      }

      res.status(201).json(dealer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  registerScrapedDealer: async (req, res) => {
    try {
      const { company_name, first_name, email, listingsitea_url } = req.body;

      if (!isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('A dealer with this email already exists');
      }

      const dealer = await registerScrapedDealer({
        company_name,
        first_name,
        email,
        listingsitea_url,
      });

      // Send welcome email to the newly registered scraped dealer
      try {
        await emailService.sendWelcomeEmail(
          email,
          first_name,
          company_name,
          'en',
          true
        );
        console.log(`Welcome email sent to scraped dealer ${email}`);
      } catch (emailError) {
        console.error(
          'Failed to send welcome email to scraped dealer:',
          emailError
        );
        // Don't fail the registration if email sending fails
      }

      res.status(201).json(dealer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateDealerStatus: async (req, res) => {
    try {
      const { status_id, dealer_id } = req.body;

      // Find the dealer
      const dealer = await User.findByPk(dealer_id);
      if (!dealer || dealer.role_id !== 2) {
        throw new Error('Dealer not found');
      }

      // Get the status name from UserStatus model
      const status = await UserStatus.findByPk(status_id);
      if (!status) {
        throw new Error('Status not found');
      }

      // Update local dealer status
      dealer.status_id = status_id;
      await dealer.save();

      res.status(200).json(dealer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getAllDealers: async (req, res) => {
    try {
      const dealers = await User.findAll({ where: { roleId: 2 } });
      res.status(200).json(dealers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getDealer: async (req, res) => {
    try {
      const { id } = req.params;

      const dealer = await User.findOne({
        where: {
          id,
          role_id: 2, // Ensure it's a dealer
        },
        attributes: [
          'id',
          'name',
          'email',
          'company_name',
          'phone_number',
          'vat_number',
          'website',
          'billing_street',
          'billing_city',
          'billing_state',
          'billing_country',
          'billing_code',
          'status_id',
          'created_at',
          'updated_at',
          'listingsitea_url',
          'language',
        ],
      });

      if (!dealer) {
        return res.status(404).json({ error: 'Dealer not found' });
      }

      res.status(200).json(dealer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateDealer: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        company_name,
        phone_number,
        vat_number,
        website,
        billing_street,
        billing_city,
        billing_state,
        billing_country,
        billing_code,
        language,
        listingsitea_url,
      } = req.body;

      // Find the dealer
      const dealer = await User.findOne({
        where: {
          id,
          role_id: 2, // Ensure it's a dealer
        },
      });

      if (!dealer) {
        return res.status(404).json({ error: 'Dealer not found' });
      }

      // Validate email format if provided
      if (email) {
        if (!isValidEmail(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({
          where: {
            email,
            id: { [require('sequelize').Op.ne]: id },
          },
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Email is already taken' });
        }
      }

      // Update dealer fields
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (company_name !== undefined) updateData.company_name = company_name;
      if (phone_number !== undefined) updateData.phone_number = phone_number;
      if (vat_number !== undefined) updateData.vat_number = vat_number;
      if (website !== undefined) updateData.website = website;
      if (billing_street !== undefined)
        updateData.billing_street = billing_street;
      if (billing_city !== undefined) updateData.billing_city = billing_city;
      if (billing_state !== undefined) updateData.billing_state = billing_state;
      if (billing_country !== undefined)
        updateData.billing_country = billing_country;
      if (billing_code !== undefined) updateData.billing_code = billing_code;
      if (language !== undefined) updateData.language = language;
      if (listingsitea_url !== undefined) {
        updateData.listingsitea_url = listingsitea_url;
        // Set listingsitea_url_add_date to current date when listingsitea_url is updated
        updateData.listingsitea_url_add_date = new Date();
      }
      await dealer.update(updateData);

      res.status(200).json({
        message: 'Dealer updated successfully',
        dealer: {
          id: dealer.id,
          name: dealer.name,
          email: dealer.email,
          company_name: dealer.company_name,
          phone_number: dealer.phone_number,
          vat_number: dealer.vat_number,
          website: dealer.website,
          billing_street: dealer.billing_street,
          billing_city: dealer.billing_city,
          billing_state: dealer.billing_state,
          billing_country: dealer.billing_country,
          billing_code: dealer.billing_code,
          status_id: dealer.status_id,
          updated_at: dealer.updated_at,
          language: dealer.language,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  validateLoginCode: async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          error: 'Login code is required',
          statusCode: 400,
        });
      }

      const result = await loginCodeService.validateCode(code);

      if (result.success) {
        res.status(200).json({
          message: result.message,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(result.statusCode || 401).json({
          error: result.message,
          statusCode: result.statusCode || 401,
        });
      }
    } catch (error) {
      console.error('Error validating login code:', error);
      res.status(500).json({
        error: 'Internal server error',
        statusCode: 500,
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email is required',
          statusCode: 400,
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          statusCode: 400,
        });
      }

      // Find user with the provided email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // For security reasons, don't reveal if the email exists or not
        return res.status(200).json({
          message:
            'If an account with this email exists, a password reset code has been sent.',
        });
      }

      // Generate a unique reset code
      const resetCode =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      // Create reset password code record
      await ResetPasswordCode.create({
        user_id: user.id,
        code: resetCode,
        is_used: false,
      });

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(
          email,
          user.name,
          resetCode,
          user.language
        );
        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail the request if email sending fails
      }

      res.status(200).json({
        message:
          'If an account with this email exists, a password reset code has been sent.',
      });
    } catch (error) {
      console.error('Error in forgot password:', error);
      res.status(500).json({
        error: 'Internal server error',
        statusCode: 500,
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { code, newPassword } = req.body;

      if (!code || !newPassword) {
        return res.status(400).json({
          error: 'Reset code and new password are required',
          statusCode: 400,
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long',
          statusCode: 400,
        });
      }

      // Find the reset code
      const resetCodeRecord = await ResetPasswordCode.findOne({
        where: {
          code: code,
          is_used: false,
        },
        include: [
          {
            model: User,
            as: 'user',
          },
        ],
      });

      if (!resetCodeRecord) {
        return res.status(400).json({
          error: 'Invalid or expired reset code',
          statusCode: 400,
        });
      }

      // Check if code is expired (24 hour)
      const oneHourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (resetCodeRecord.created_at < oneHourAgo) {
        return res.status(400).json({
          error: 'Reset code has expired',
          statusCode: 400,
        });
      }

      // Hash the new password
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password
      const user = resetCodeRecord.user;
      user.password = hashedPassword;
      await user.save();

      // Mark the reset code as used
      resetCodeRecord.is_used = true;
      await resetCodeRecord.save();

      res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Error in reset password:', error);
      res.status(500).json({
        error: 'Internal server error',
        statusCode: 500,
      });
    }
  },
};

module.exports = authController;
