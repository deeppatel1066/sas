import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  },
  { timestamps: true },
);

enrollmentSchema.index({ studentEmail: 1, classId: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
