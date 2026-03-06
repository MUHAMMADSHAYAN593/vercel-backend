const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: [ true, 'Username already exists. Please choose another one.'],
    },

    email: {
      type: String,
      required: true,
      unique: [ true, 'Email already exists. Please choose another one.'],
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;


