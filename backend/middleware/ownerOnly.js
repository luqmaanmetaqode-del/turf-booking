module.exports = function (req, res, next) {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Owners only.' });
  }
  next();
};