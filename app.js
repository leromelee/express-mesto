const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const errors = require('./middlewares/errors');
const { login, createUsers } = require('./controllers/users');

const app = express();

const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(auth);
app.use(errors);
app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Не найдено' });
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(2).max(30).required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(2).max(30).required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value, helper) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return value;
      }
      return helper.message('Некорректный url');
    }),
  }),
}), createUsers);

app.listen(PORT, () => {
  console.log(`Используется порт: ${PORT}`);
});