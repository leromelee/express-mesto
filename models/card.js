const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },

  link: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /(http|https)[-a-zA-Z0-9@:%_\\+.~#?&\\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\\+.~#?&\\/=]*)?/.test(v);
      },
      message: 'Некорректный url',
    },
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },

});

module.exports = mongoose.model('card', cardSchema);