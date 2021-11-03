const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const id = req.params.userId;
  User.findById({ _id: id })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 400;
        return next(err);
      }
      if (err.name === 'NotFound') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        return next(err);
      }
      const e = new Error('На сервере Ошибка');
      e.statusCode = 500;
      return next(e);
    });
};

module.exports.getProfile = (req, res, next) => {
  const id = req.user._id;
  User.find({ _id: id })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        return next(err);
      }
      const e = new Error('На сервере Ошибка');
      e.statusCode = 500;
      return next(e);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  console.log(name);
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь не найден');
        err.statusCode = 400;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 400;
        return next(err);
      }
      if (err.name === 'ValidationError') {
        const err = new Error('Некорректные данные');
        err.statusCode = 400;
        return next(err);
      }
      const e = new Error('На сервере Ошибка');
      e.statusCode = 500;
      return next(e);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const err = new Error('Пользователь не найден');
        err.statusCode = 400;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 400;
        return next(err);
      }
      if (err.name === 'ValidationError') {
        const err = new Error('Некорректные данные');
        err.statusCode = 400;
        return next(err);
      }
      const e = new Error('На сервере Ошибка');
      e.statusCode = 500;
      return next(e);
    })
    .catch(next);
};

module.exports.createUsers = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((password) => {
      User.create({
        name, about, avatar, email, password,
      })
        .then((user) => {
          const newUser = user.toObject();
          delete newUser.password;
          res.send(newUser);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            const err = new Error('Некорректные данные');
            err.statusCode = 400;
            return next(err);
          }
          if (err.message === 'Validation failed') {
            const err = new Error('Некорректные данные');
            err.statusCode = 400;
            return next(err);
          }
          if (err.name === 'MongoServerError') {
            const err = new Error('Зарегестрированный email');
            err.statusCode = 409;
            return next(err);
          }
          const e = new Error('На сервере Ошибка');
          e.statusCode = 500;
          return next(e);
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let userId;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const err = new Error('Неверные данные');
        err.statusCode = 401;
        return next(err);
      }
      userId = user._id;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        const err = new Error('Неверные данные');
        err.statusCode = 401;
        return next(err);
      }
      const token = jwt.sign(
        { _id: userId },
        'super-secret-key',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};