const User = require('../models/User');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Config');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const authUtils = require('../utils/authUtils');

// Web Registration
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Generate verification token
    const verificationToken = authUtils.generateRandomToken();

    const userId = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role_id: 2, // Regular user
      verification_token: verificationToken
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification instructions.',
      data: { userId }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed. Please try again.'
    });
  }
};

// Web Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user has role_id 2 (regular user)
    if (user.role_id !== 2) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Please use the admin login portal.'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive. Please contact support.'
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in.'
      });
    }

    await User.updateLastLogin(user.id);
    
    const token = authUtils.generateToken(user.id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          profile_picture: user.profile_picture,
          email_verified: user.email_verified,
          phone: user.phone,
          address: user.address
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    if (user.role_id !== 1) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive. Please contact support.'
      });
    }

    await User.updateLastLogin(user.id);
    
    const token = authUtils.generateToken(user.id, true);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          profile_picture: user.profile_picture
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

// Forgot Password (Common for both web and admin)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const isAdmin = req.path.includes('/admin/');

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    // Check if user is trying to reset admin password but is not admin
    if (isAdmin && user.role_id !== 1) {
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
    }

    const resetToken = authUtils.generateRandomToken();
    const resetTokenExpiry = authUtils.generateResetTokenExpiry();

    await User.updateResetToken(email, resetToken, resetTokenExpiry);
    await sendPasswordResetEmail(email, resetToken, isAdmin);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset request failed. Please try again.'
    });
  }
};

// Reset Password (Common for both web and admin)
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    await User.updatePassword(user.id, password);
    await User.clearResetToken(user.id);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed. Please try again.'
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    await User.verifyEmail(user.id);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login to your account.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed. Please try again.'
    });
  }
};

// Get Current User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    let profilePicture = req.user.profile_picture;

    // Handle file upload
    if (req.file) {
      // Delete old profile picture from S3
      if (profilePicture) {
        await deleteFromS3(profilePicture);
      }
      // Upload new profile picture to S3
      profilePicture = await uploadToS3(req.file, 'travel/profiles');
    }

    const updateData = { 
      name, 
      email, 
      phone, 
      address, 
      profile_picture: profilePicture 
    };

    const updated = await User.update(req.user.id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile update failed. Please try again.'
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByEmail(req.user.email);
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    await User.updatePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password change failed. Please try again.'
    });
  }
};

// Logout
const logout = async (req, res) => {
  // Since we're using JWT, logout is handled on client side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  updateProfile,
  changePassword,
  logout
};