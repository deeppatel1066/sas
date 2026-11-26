import mongoose from 'mongoose';

const attendanceSheetSchema = new mongoose.Schema(
  {
    teacherEmail: { type: String, required: true, lowercase: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: String, required: true, trim: true },
    attendanceDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 1440 },
    code: { type: String, required: true, match: /^\d{6}$/ },
    secret: { type: String, required: true },
  },
  { timestamps: true },
);

export const AttendanceSheet = mongoose.model('AttendanceSheet', attendanceSheetSchema);
