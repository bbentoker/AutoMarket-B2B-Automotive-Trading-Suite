const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  const tokenWithoutBearer = token.split(' ')[1];

  jwt.verify(
    tokenWithoutBearer,
    process.env.JWT_SECRET || 'change_me_use_a_long_random_string',
    (err, decoded) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to authenticate token' });
      }

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized as admin' });
      }

      req.userId = decoded.id;
      next();
    }
  );
};

const verifyDealerToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token using the same secret as token generation
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me_use_a_long_random_string');

    // Check if user exists and is a dealer
    if (decoded.role !== 'dealer') {
      return res
        .status(403)
        .json({ error: 'Access denied. Dealer role required.' });
    }

    // Check if token is expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Check if user still exists in database and is active
    const user = await User.findOne({
      where: {
        id: decoded.id,
        role_id: 2, // Dealer role
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Check if user account is active (status_id should be 2 for active dealers)
    if (user.status_id !== 2) {
      return res.status(401).json({ error: 'Account is not active' });
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name || user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyDealerTokenOptional = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user authentication
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token using the same secret as token generation
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_me_use_a_long_random_string');

    // Check if user exists and is a dealer
    if (decoded.role !== 'dealer') {
      req.user = null;
      return next();
    }

    // Check if user still exists in database and is active
    const user = await User.findOne({
      where: {
        id: decoded.id,
        role_id: 2, // Dealer role
      },
    });

    if (!user || user.status_id !== 2) {
      req.user = null;
      return next();
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name || user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    // On any error, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = { verifyAdmin, verifyDealerToken, verifyDealerTokenOptional };
