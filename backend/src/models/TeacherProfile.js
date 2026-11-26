import mongoose from 'mongoose';

const teacherProfileSchema = new mongoose.Schema(
  {
    teacherEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\+?[0-9 ()-]{7,20}$/,
    },
    address: {
      apartment: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
    },
  },
  { timestamps: true },
);

export const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
