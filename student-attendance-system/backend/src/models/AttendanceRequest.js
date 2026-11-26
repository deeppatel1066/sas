import mongoose from 'mongoose';

const attendanceRequestSchema = new mongoose.Schema(
  {
    sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSheet', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ['pending', 'allowed', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: Date,
  },
  { timestamps: true },
);

attendanceRequestSchema.index({ sheetId: 1, studentEmail: 1 }, { unique: true });

export const AttendanceRequest = mongoose.model('AttendanceRequest', attendanceRequestSchema);
