const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const err = new Error('Авторизируйтесь');
    err.statusCode = 401;
    next(err);
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'super-secret-key');
  } catch (e) {
    const err = new Error('Авторизируйтесь');
    err.statusCode = 401;
    next(err);
  }
  req.user = payload;
  next();
};