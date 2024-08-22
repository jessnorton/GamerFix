const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    condition: { type: String, required: true, enum: ['New', 'Like New', 'Used', 'Refurbished'] },
    price: { type: Number, required: true, min: 0.01 },
    details: { type: String, required: true },
    image: { type: String, required: true },
    totalOffers: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Item = mongoose.model('Item', itemSchema);

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName: { type: String, required: [true, 'Last name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: [true, 'Password is required'] }
});

const User = mongoose.model('User', userSchema);

module.exports = { User, Item };
