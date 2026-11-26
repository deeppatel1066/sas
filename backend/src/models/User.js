import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['teacher', 'student'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
