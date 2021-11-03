const validator = require('validator');
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, createUser, getProfile, updateProfile, updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getProfile);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().min(24).max(24).hex()
      .required(),
  }),
}), createUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
}), updateProfile);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value, helper) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return value;
      }
      return helper.message('avatar - невалидный url');
    }),
  }),
}), updateAvatar);

module.exports = router;