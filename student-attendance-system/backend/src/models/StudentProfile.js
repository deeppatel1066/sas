import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    enrollmentNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\+?[0-9 ()-]{7,20}$/,
    },
    dob: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
