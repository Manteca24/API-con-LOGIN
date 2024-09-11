const hashedSecret= require('../crypto/config');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ userId: user.id }, hashedSecret, { expiresIn: '1h' });
};

const verifyToken = (req, res, next) => {
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, hashedSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido', error: err.message });
    }
    req.user = decoded.userId;
    next();
  });
};

module.exports = { generateToken, verifyToken };