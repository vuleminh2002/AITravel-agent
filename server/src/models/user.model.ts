// user.model.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: String,
  refreshToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model('User', userSchema);

export const getUserByGoogleId = async (googleId: string) => {
  return User.findOne({ googleId });
};

export const getUserById = async (id: string) => {
  return User.findById(id);
};

export const createUser = async (userData: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  refreshToken?: string;
}) => {
  return User.create(userData);
};