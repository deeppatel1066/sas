import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    teacherEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
    std: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other', 'mixed'],
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    attendanceCode: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{6}$/,
    },
  },
  { timestamps: true },
);

export const Class = mongoose.model('Class', classSchema);
