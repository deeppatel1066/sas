import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    attendedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

attendanceSchema.index({ studentEmail: 1, classId: 1, attendedAt: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
