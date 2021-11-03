const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  console.log(req.body);
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const err = new Error('Некорректные данные');
        err.statusCode = 400;
        return next(err);
      }
      const e = new Error('Ошибка на сервере');
      e.statusCode = 500;
      return next(e);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Некорректные данные');
        err.statusCode = 400;
        return next(err);
      }
      if (err.name === 'NotFound') {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      const e = new Error('Ошибка на сервере');
      e.statusCode = 500;
      return next(e);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Некорректные данные');
        err.statusCode = 400;
        return next(err);
      }
      if (err.name === 'NotFound') {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      const e = new Error('Ошибка на сервере');
      e.statusCode = 500;
      return next(e);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const reqId = req.user._id;

  Card.findById({
    _id: req.params.cardId,
    owner: reqId,
  })
    .then((card) => {
      if (!card) {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      if (card.owner.equals(reqId)) {
        Card.findOneAndRemove({
          _id: req.params.cardId,
          owner: reqId,
        })
          .then((cardResult) => {
            res.send(cardResult);
          });
      } else {
        const err = new Error('Вы не владелец карточки');
        err.statusCode = 403;
        return next(err);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      if (err.name === 'NotFound') {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      const e = new Error('Ошибка на сервере');
      e.statusCode = 500;
      return next(e);
    });
};