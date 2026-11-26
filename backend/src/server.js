import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { generateSecret, generateSync } from 'otplib';
import { Attendance } from './models/Attendance.js';
import { AttendanceRequest } from './models/AttendanceRequest.js';
import { AttendanceSheet } from './models/AttendanceSheet.js';
import { Class } from './models/Class.js';
import { Enrollment } from './models/Enrollment.js';
import { StudentProfile } from './models/StudentProfile.js';
import { TeacherProfile } from './models/TeacherProfile.js';
import { User } from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-attendance';

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...configuredOrigins,
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClassCode() {
  const secret = generateSecret();
  return String(generateSync({ secret })).padStart(6, '0');
}

function getTimedCode(secret, startsAt, durationMinutes) {
  const raw = generateSync({ secret, epoch: startsAt.getTime(), step: durationMinutes * 60 });
  return String(raw).padStart(6, '0');
}

app.post('/api/auth/register', async (request, response) => {
  const {
    email,
    password,
    role,
    firstName,
    lastName,
    gender,
    phone,
    dob,
    enrollmentNo,
    apartment,
    area,
    city,
    address,
  } = request.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedFirstName = firstName?.trim();
  const normalizedLastName = lastName?.trim();
  const normalizedGender = String(gender || '').trim().toLowerCase();
  const normalizedPhone = String(phone || '').trim();
  const normalizedEnrollmentNo = String(enrollmentNo || '').trim();
  const addressData = address || { apartment: apartment || '', area: area || '', city: city || '' };
  const normalizedApartment = String(addressData.apartment || '').trim();
  const normalizedArea = String(addressData.area || '').trim();
  const normalizedCity = String(addressData.city || '').trim();
  const parsedDob = dob ? new Date(dob) : null;

  if (!normalizedEmail || !password || !role) {
    return response.status(400).json({ message: 'Email, password, and role are required.' });
  }

  if (!['teacher', 'student'].includes(role)) {
    return response.status(400).json({ message: 'Role must be teacher or student.' });
  }

  if (!isValidEmail(normalizedEmail)) {
    return response.status(400).json({ message: 'Enter a valid email address.' });
  }

  if (password.length < 8) {
    return response.status(400).json({ message: 'Password must contain at least 8 characters.' });
  }

  if (!normalizedFirstName || !normalizedLastName) {
    return response.status(400).json({ message: 'First name and last name are required.' });
  }

  if (!['male', 'female', 'other'].includes(normalizedGender)) {
    return response.status(400).json({ message: 'Gender must be male, female, or other.' });
  }

  if (!normalizedPhone || !/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{7,20}$/.test(normalizedPhone)) {
    return response.status(400).json({ message: 'A valid phone number is required.' });
  }

  if (!normalizedApartment || !normalizedArea || !normalizedCity) {
    return response.status(400).json({ message: 'Apartment, area, and city are required in the address.' });
  }

  if (role === 'student') {
    if (!normalizedEnrollmentNo) {
      return response.status(400).json({ message: 'Enrollment number is required for students.' });
    }
    if (!parsedDob || Number.isNaN(parsedDob.getTime()) || parsedDob >= new Date()) {
      return response.status(400).json({ message: 'A valid date of birth in the past is required for students.' });
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let createdUser = null;
  let createdProfile = null;

  try {
    createdUser = await User.create({
      email: normalizedEmail,
      role,
      passwordHash,
    });

    if (role === 'student') {
      createdProfile = await StudentProfile.create({
        studentEmail: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
        gender: normalizedGender,
        enrollmentNo: normalizedEnrollmentNo,
        phone: normalizedPhone,
        dob: parsedDob,
        address: {
          apartment: normalizedApartment,
          area: normalizedArea,
          city: normalizedCity,
        },
      });
    } else {
      createdProfile = await TeacherProfile.create({
        teacherEmail: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        gender: normalizedGender,
        phone: normalizedPhone,
        address: {
          apartment: normalizedApartment,
          area: normalizedArea,
          city: normalizedCity,
        },
      });
    }
  } catch (error) {
    if (createdProfile) {
      if (role === 'student') await StudentProfile.deleteOne({ _id: createdProfile._id }).catch(() => {});
      else await TeacherProfile.deleteOne({ _id: createdProfile._id }).catch(() => {});
    }
    if (createdUser) await User.deleteOne({ _id: createdUser._id }).catch(() => {});
    if (error.code === 11000) {
      return response.status(409).json({ message: 'An account or profile with this information already exists.' });
    }
    return response.status(500).json({ message: 'Unable to create the account.' });
  }

  return response.status(201).json({
    email: normalizedEmail,
    role,
    message: 'Registration successful.',
    user: {
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      gender: normalizedGender,
      phone: normalizedPhone,
      address: {
        apartment: normalizedApartment,
        area: normalizedArea,
        city: normalizedCity,
      },
      ...(role === 'student' ? { dob: parsedDob, enrollmentNo: normalizedEnrollmentNo } : {}),
    },
  });
});

app.post('/api/auth/login', async (request, response) => {
  const { email, password, role } = request.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password || !role) {
    return response.status(400).json({ message: 'Email, password, and role are required.' });
  }

  const user = await User.findOne({ email: normalizedEmail, role });

  if (!user) {
    return response.status(401).json({ message: 'Invalid email, password, or role.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return response.status(401).json({ message: 'Invalid email, password, or role.' });
  }

  let profile = null;
  if (user.role === 'student') {
    profile = await StudentProfile.findOne({ studentEmail: user.email }).lean();
  } else {
    profile = await TeacherProfile.findOne({ teacherEmail: user.email }).lean();
  }

  return response.json({
    email: user.email,
    role: user.role,
    message: 'Login successful.',
    user: profile
      ? {
          id: profile._id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          phone: profile.phone,
          address: profile.address,
          ...(user.role === 'student' ? { dob: profile.dob, enrollmentNo: profile.enrollmentNo } : {}),
        }
      : {
          id: user._id,
          firstName: '',
          lastName: '',
          gender: 'male',
          phone: '',
          address: { apartment: '', area: '', city: '' },
          ...(user.role === 'student' ? { dob: null, enrollmentNo: '' } : {}),
        },
  });
});

app.get('/api/health', (_request, response) => {
  response.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
    service: 'student-attendance-api',
    database: mongoose.connection.name || 'disconnected',
  });
});

app.get('/api/attendance', (_request, response) => {
  response.json({ records: [] });
});

app.post('/api/teacher/attendance-sheets', async (request, response) => {
  const { teacherEmail, classId, attendanceDate, durationMinutes } = request.body;
  const normalizedEmail = teacherEmail?.trim().toLowerCase();
  const duration = Number(durationMinutes);

  if (!normalizedEmail || !classId || !attendanceDate || !Number.isInteger(duration) || duration < 1 || duration > 1440) {
    return response.status(400).json({ message: 'Teacher email, class, date, and a duration from 1 to 1440 minutes are required.' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
    return response.status(400).json({ message: 'Enter a valid attendance date.' });
  }

  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' });
  const classRecord = await Class.findOne({ _id: classId, teacherEmail: normalizedEmail });
  if (!teacher || !classRecord) {
    return response.status(403).json({ message: 'Only a teacher can create a sheet for their own class.' });
  }

  const startsAt = new Date();
  const expiresAt = new Date(startsAt.getTime() + duration * 60 * 1000);
  const secret = generateSecret();
  const code = getTimedCode(secret, startsAt, duration);

  try {
    const sheet = await AttendanceSheet.create({
      teacherEmail: normalizedEmail,
      classId: classRecord._id,
      subject: classRecord.subject,
      attendanceDate,
      startsAt,
      expiresAt,
      durationMinutes: duration,
      code,
      secret,
    });

    return response.status(201).json({
      message: 'Real-time attendance sheet created.',
      sheet: { id: sheet._id, subject: sheet.subject, attendanceDate, durationMinutes: duration, code, startsAt, expiresAt },
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to create the attendance sheet.' });
  }                                                   
});

app.get('/api/teacher/attendance-sheets', async (request, response) => {
  const teacherEmail = request.query.teacherEmail?.trim().toLowerCase();
  if (!teacherEmail || !isValidEmail(teacherEmail)) return response.status(400).json({ message: 'A valid teacher email is required.' });

  const sheets = await AttendanceSheet.find({ teacherEmail }).populate('classId').sort({ attendanceDate: -1, createdAt: -1 }).lean();
  const classIds = [...new Set(sheets.filter((sheet) => sheet.classId).map((sheet) => String(sheet.classId._id)))];
  const [enrollments, requests] = await Promise.all([
    Enrollment.find({ classId: { $in: classIds } }).lean(),
    AttendanceRequest.find({ sheetId: { $in: sheets.map((sheet) => sheet._id) } }).lean(),
  ]);
  const studentEmails = [...new Set(enrollments.map((enrollment) => enrollment.studentEmail))];
  const profiles = await StudentProfile.find({ studentEmail: { $in: studentEmails } }).lean();
  const profileByEmail = new Map(profiles.map((profile) => [profile.studentEmail, profile]));
  const requestBySheetAndStudent = new Map(requests.map((requestRecord) => [
    `${requestRecord.sheetId}:${requestRecord.studentEmail}`,
    requestRecord,
  ]));

  return response.json({ sheets: sheets.map((sheet) => ({
    id: sheet._id,
    teacherName: sheet.classId?.teacherName || 'Teacher',
    subject: sheet.subject,
    attendanceDate: sheet.attendanceDate,
    code: sheet.code,
    expiresAt: sheet.expiresAt,
    students: enrollments
      .filter((enrollment) => String(enrollment.classId) === String(sheet.classId?._id))
      .map((enrollment) => {
        const profile = profileByEmail.get(enrollment.studentEmail);
        const attendanceRequest = requestBySheetAndStudent.get(`${sheet._id}:${enrollment.studentEmail}`);
        const status = attendanceRequest?.status === 'allowed'
          ? 'present'
          : attendanceRequest?.status === 'pending'
            ? 'pending'
            : 'absent';

        return {
          id: profile?._id || enrollment._id,
          requestId: attendanceRequest?._id || null,
          enrollmentNo: profile?.enrollmentNo || 'Not provided',
          name: profile?.name || enrollment.studentEmail,
          gender: profile?.gender || 'Not provided',
          status,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name)),
  })) });
});

app.patch('/api/teacher/attendance-requests/:requestId', async (request, response) => {
  const { teacherEmail, allow } = request.body;
  const normalizedEmail = teacherEmail?.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return response.status(400).json({ message: 'A valid teacher email is required.' });
  }

  const requestRecord = await AttendanceRequest.findById(request.params.requestId).populate('sheetId');

  if (!requestRecord || !requestRecord.sheetId || requestRecord.sheetId.teacherEmail !== normalizedEmail) {
    return response.status(404).json({ message: 'Attendance request not found.' });
  }

  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' }).lean();
  if (!teacher) {
    return response.status(403).json({ message: 'Only a registered teacher can allow attendance.' });
  }

  requestRecord.status = allow ? 'allowed' : 'rejected';
  requestRecord.respondedAt = new Date();
  await requestRecord.save();

  if (allow) {
    try {
      await Attendance.updateOne(
        {
          studentEmail: requestRecord.studentEmail,
          classId: requestRecord.classId,
          attendedAt: requestRecord.respondedAt,
        },
        {
          $setOnInsert: {
            studentEmail: requestRecord.studentEmail,
            classId: requestRecord.classId,
            attendedAt: requestRecord.respondedAt,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      return response.status(500).json({ message: 'Attendance approval saved but attendance history could not be recorded.' });
    }
  }

  return response.json({ message: allow ? 'Student attendance allowed.' : 'Student attendance rejected.', status: requestRecord.status });
});

app.patch('/api/teacher/attendance-sheets/:sheetId/allow-pending', async (request, response) => {
  const normalizedEmail = request.body.teacherEmail?.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return response.status(400).json({ message: 'A valid teacher email is required.' });
  }

  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' }).lean();
  if (!teacher) {
    return response.status(403).json({ message: 'Only a registered teacher can allow attendance requests.' });
  }

  const sheet = await AttendanceSheet.findOne({
    _id: request.params.sheetId,
    teacherEmail: normalizedEmail,
  });

  if (!sheet) {
    return response.status(404).json({ message: 'Attendance sheet not found or it does not belong to this teacher.' });
  }

  const pendingRequests = await AttendanceRequest.find({
    sheetId: sheet._id,
    status: 'pending',
  });

  if (pendingRequests.length === 0) {
    return response.json({
      message: 'There are no pending attendance requests to allow.',
      approvedCount: 0,
    });
  }

  const respondedAt = new Date();
  let approvedCount = 0;

  try {
    for (const attendanceRequest of pendingRequests) {
      attendanceRequest.status = 'allowed';
      attendanceRequest.respondedAt = respondedAt;
      await attendanceRequest.save();

      await Attendance.updateOne(
        {
          studentEmail: attendanceRequest.studentEmail,
          classId: attendanceRequest.classId,
          attendedAt: respondedAt,
        },
        {
          $setOnInsert: {
            studentEmail: attendanceRequest.studentEmail,
            classId: attendanceRequest.classId,
            attendedAt: respondedAt,
          },
        },
        { upsert: true },
      );

      approvedCount += 1;
    }
  } catch (error) {
    return response.status(500).json({
      message: 'Some attendance requests could not be allowed.',
      approvedCount,
    });
  }

  return response.json({
    message: 'Pending attendance requests allowed.',
    approvedCount,
  });
});

async function findStudent(studentEmail, response) {
  const normalizedEmail = studentEmail?.trim().toLowerCase();
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    response.status(400).json({ message: 'A valid student email is required.' });
    return null;
  }

  const student = await User.findOne({ email: normalizedEmail, role: 'student' });
  if (!student) {
    response.status(403).json({ message: 'Only a registered student can use this route.' });
    return null;
  }

  return normalizedEmail;
}

function classResponse(classRecord) {
  return {
    id: classRecord._id,
    subject: classRecord.subject,
    teacherName: classRecord.teacherName,
    teacherEmail: classRecord.teacherEmail,
    ...(classRecord.std ? { std: classRecord.std } : { semester: classRecord.semester }),
    course: classRecord.course,
  };
}

app.get('/api/student/home', async (request, response) => {
  const studentEmail = await findStudent(request.query.studentEmail, response);
  if (!studentEmail) return;

  const enrollments = await Enrollment.find({ studentEmail }).populate('classId').sort({ createdAt: -1 }).lean();
  return response.json({
    classes: enrollments.filter((enrollment) => enrollment.classId).map((enrollment) => classResponse(enrollment.classId)),
  });
});

app.get('/api/student/profile', async (request, response) => {
  const studentEmail = await findStudent(request.query.studentEmail, response);
  if (!studentEmail) return;

  const profile = await StudentProfile.findOne({ studentEmail }).lean();
  if (!profile) return response.status(404).json({ message: 'Student profile has not been created yet.' });

  const [joinedClassCount, attendedCount] = await Promise.all([
    Enrollment.countDocuments({ studentEmail }),
    Attendance.countDocuments({ studentEmail }),
  ]);

  return response.json({
    student: {
      id: profile._id,
      email: profile.studentEmail,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: profile.name,
      gender: profile.gender,
      enrollmentNo: profile.enrollmentNo,
      phone: profile.phone,
      dob: profile.dob,
      address: profile.address,
      joinedClassCount,
      attendedCount,
    },
  });
});

app.post('/api/student/classes/join', async (request, response) => {
  const { studentEmail, attendanceCode } = request.body;
  const normalizedEmail = await findStudent(studentEmail, response);
  if (!normalizedEmail) return;

  const code = String(attendanceCode || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return response.status(400).json({ message: 'Enter a valid six-digit class code.' });
  }

  const classRecord = await Class.findOne({ attendanceCode: code });
  if (!classRecord) {
    return response.status(404).json({ message: 'That class code is not valid.' });
  }

  try {
    await Enrollment.create({ studentEmail: normalizedEmail, classId: classRecord._id });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'You already joined this class.' });
    }
    return response.status(500).json({ message: 'Unable to join the class.' });
  }

  return response.status(201).json({ message: 'Class joined successfully.', class: classResponse(classRecord) });
});

app.post('/api/student/attendance', async (request, response) => {
  const { studentEmail, attendanceCode } = request.body;
  const normalizedEmail = await findStudent(studentEmail, response);
  if (!normalizedEmail) return;

  const code = String(attendanceCode || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return response.status(400).json({ message: 'Enter a valid six-digit attendance code.' });
  }

  const classRecord = await Class.findOne({ attendanceCode: code });
  if (!classRecord) {
    return response.status(404).json({ message: 'That attendance code is not valid.' });
  }

  const enrollment = await Enrollment.findOne({ studentEmail: normalizedEmail, classId: classRecord._id });
  if (!enrollment) {
    return response.status(403).json({ message: 'Join this class before marking attendance.' });
  }

  try {
    const attendance = await Attendance.create({ studentEmail: normalizedEmail, classId: classRecord._id });
    return response.status(201).json({ message: 'Attendance marked successfully.', attendedAt: attendance.attendedAt, class: classResponse(classRecord) });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'Attendance is already marked for this class at this time.' });
    }
    return response.status(500).json({ message: 'Unable to mark attendance.' });
  }
});

app.post('/api/student/attendance-sheets/submit', async (request, response) => {
  const { studentEmail, code } = request.body;
  const normalizedEmail = await findStudent(studentEmail, response);
  if (!normalizedEmail) return;

  const submittedCode = String(code || '').trim();
  if (!/^\d{6}$/.test(submittedCode)) {
    return response.status(400).json({ message: 'Enter a valid six-digit attendance code.' });
  }

  const now = new Date();
  const activeSheets = await AttendanceSheet.find({
    code: submittedCode,
    expiresAt: { $gte: now },
  }).sort({ createdAt: -1 }).populate('classId');
  const sheet = activeSheets[0];
  if (!sheet) return response.status(404).json({ message: 'Attendance code is not valid or has expired.' });

  const enrollment = await Enrollment.findOne({ studentEmail: normalizedEmail, classId: sheet.classId._id });
  if (!enrollment) return response.status(403).json({ message: 'Join this class before requesting attendance.' });

  try {
    const attendanceRequest = await AttendanceRequest.create({ sheetId: sheet._id, classId: sheet.classId._id, studentEmail: normalizedEmail });
    return response.status(201).json({ message: 'Attendance request sent to your teacher for approval.', requestId: attendanceRequest._id, subject: sheet.subject });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ message: 'You already submitted attendance for this sheet.' });
    return response.status(500).json({ message: 'Unable to submit attendance request.' });
  }
});

app.get('/api/student/history', async (request, response) => {
  const studentEmail = await findStudent(request.query.studentEmail, response);
  if (!studentEmail) return;

  const allowedRequests = await AttendanceRequest.find({
    studentEmail,
    status: 'allowed',
  }).lean();

  try {
    await Promise.all(allowedRequests.map((allowedRequest) => Attendance.updateOne(
      {
        studentEmail,
        classId: allowedRequest.classId,
        attendedAt: allowedRequest.respondedAt || allowedRequest.requestedAt,
      },
      {
        $setOnInsert: {
          studentEmail,
          classId: allowedRequest.classId,
          attendedAt: allowedRequest.respondedAt || allowedRequest.requestedAt,
        },
      },
      { upsert: true },
    )));
  } catch (error) {
    console.error('Unable to reconcile student attendance history:', error.message);
  }

  const history = await Attendance.find({ studentEmail }).populate('classId').sort({ attendedAt: -1 }).lean();
  return response.json({
    history: history.filter((record) => record.classId).map((record) => ({
      id: record._id,
      attendedAt: record.attendedAt,
      class: classResponse(record.classId),
    })),
  });
});

app.post('/api/student/details', async (request, response) => {
  const {
    studentEmail,
    name,
    gender,
    enrollmentNo,
    phone,
    dob,
  } = request.body;
  const normalizedEmail = studentEmail?.trim().toLowerCase();
  const normalizedEnrollmentNo = enrollmentNo?.trim();
  const parsedDob = dob ? new Date(dob) : null;

  if (!normalizedEmail || !name?.trim() || !gender || !normalizedEnrollmentNo || !phone?.trim() || !dob) {
    return response.status(400).json({
      message: 'Student email, name, gender, enrollment number, phone, and date of birth are required.',
    });
  }

  if (!['male', 'female', 'other'].includes(gender)) {
    return response.status(400).json({ message: 'Gender must be male, female, or other.' });
  }

  if (!isValidEmail(normalizedEmail)) {
    return response.status(400).json({ message: 'Enter a valid student email address.' });
  }

  if (Number.isNaN(parsedDob?.getTime()) || parsedDob >= new Date()) {
    return response.status(400).json({ message: 'Enter a valid date of birth in the past.' });
  }

  const student = await User.findOne({ email: normalizedEmail, role: 'student' });
  if (!student) {
    return response.status(403).json({ message: 'Only a registered student can submit student details.' });
  }

  try {
    const profile = await StudentProfile.create({
      studentEmail: normalizedEmail,
      name: name.trim(),
      gender,
      enrollmentNo: normalizedEnrollmentNo,
      phone: phone.trim(),
      dob: parsedDob,
    });

    return response.status(201).json({
      message: 'Student details saved successfully.',
      student: {
        id: profile._id,
        email: profile.studentEmail,
        name: profile.name,
        gender: profile.gender,
        enrollmentNo: profile.enrollmentNo,
        phone: profile.phone,
        dob: profile.dob,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const message = duplicateField === 'enrollmentNo'
        ? 'This enrollment number already exists.'
        : 'Student details already exist for this account.';
      return response.status(409).json({ message });
    }
    return response.status(500).json({ message: 'Unable to save student details.' });
  }
});

app.post('/api/teacher/classes', async (request, response) => {
  const {
    teacherEmail,
    teacherName,
    std,
    semester,
    subject,
    gender,
    course,
  } = request.body;
  const normalizedEmail = teacherEmail?.trim().toLowerCase();

  const hasStd = Boolean(std?.trim());
  const hasSemester = Boolean(semester?.trim());

  if (!normalizedEmail || !teacherName?.trim() || !subject?.trim() || !gender || !course?.trim()) {
    return response.status(400).json({
      message: 'Teacher email, teacher name, std or semester, subject, gender, and course are required.',
    });
  }

  if (hasStd === hasSemester) {
    return response.status(400).json({ message: 'Provide exactly one value: std for school or semester for college.' });
  }

  if (!['male', 'female', 'other', 'mixed'].includes(gender)) {
    return response.status(400).json({ message: 'Gender must be male, female, other, or mixed.' });
  }

  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' });
  if (!teacher) {
    return response.status(403).json({ message: 'Only a registered teacher can create a class.' });
  }

  let attendanceCode;
  let createdClass;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    attendanceCode = getClassCode();
    try {
      createdClass = await Class.create({
        teacherEmail: normalizedEmail,
        teacherName: teacherName.trim(),
        ...(hasStd ? { std: std.trim() } : { semester: semester.trim() }),
        subject: subject.trim(),
        gender,
        course: course.trim(),
        attendanceCode,
      });
      break;
    } catch (error) {
      if (error.code !== 11000 || attempt === 4) {
        return response.status(500).json({ message: 'Unable to create the class.' });
      }
    }
  }

  return response.status(201).json({
    message: 'Class created successfully.',
    class: {
      id: createdClass._id,
      teacherName: createdClass.teacherName,
      ...(createdClass.std ? { std: createdClass.std } : { semester: createdClass.semester }),
      subject: createdClass.subject,
      gender: createdClass.gender,
      course: createdClass.course,
      attendanceCode: createdClass.attendanceCode,
    },
  });
});

app.get('/api/teacher/students', async (request, response) => {
  const normalizedEmail = request.query.teacherEmail?.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return response.status(400).json({ message: 'A valid teacher email is required.' });
  }

  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' });
  if (!teacher) {
    return response.status(403).json({ message: 'Only a registered teacher can view student rosters.' });
  }

  const classes = await Class.find({ teacherEmail: normalizedEmail }).sort({ createdAt: -1 }).lean();
  const enrollments = await Enrollment.find({ classId: { $in: classes.map((classRecord) => classRecord._id) } }).lean();
  const studentEmails = [...new Set(enrollments.map((enrollment) => enrollment.studentEmail))];
  const profiles = await StudentProfile.find({ studentEmail: { $in: studentEmails } }).lean();
  const profileByEmail = new Map(profiles.map((profile) => [profile.studentEmail, profile]));

  return response.json({
    classes: classes.map((classRecord) => ({
      id: classRecord._id,
      title: classRecord.subject,
      group: classRecord.std ? `Standard ${classRecord.std}` : `Semester ${classRecord.semester}`,
      course: classRecord.course,
      students: enrollments
        .filter((enrollment) => String(enrollment.classId) === String(classRecord._id))
        .map((enrollment) => profileByEmail.get(enrollment.studentEmail))
        .filter(Boolean)
        .map((profile) => ({
          id: profile._id,
          enrollmentNo: profile.enrollmentNo,
          name: profile.name,
          gender: profile.gender,
          phone: profile.phone,
        })),
    })),
  });
});

app.get('/api/teacher/profile', async (request, response) => {
  const normalizedEmail = request.query.teacherEmail?.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return response.status(400).json({ message: 'A valid teacher email is required.' });
  }

  const teacher = await User.findOne({ email: normalizedEmail, role: 'teacher' }).lean();
  if (!teacher) {
    return response.status(403).json({ message: 'Only a registered teacher can view this profile.' });
  }

  const teacherProfile = await TeacherProfile.findOne({ teacherEmail: normalizedEmail }).lean();
  const classes = await Class.find({ teacherEmail: normalizedEmail }).sort({ createdAt: -1 }).lean();
  const classIds = classes.map((classRecord) => classRecord._id);
  const [sheetCount, studentEmails] = await Promise.all([
    AttendanceSheet.countDocuments({ teacherEmail: normalizedEmail }),
    Enrollment.distinct('studentEmail', { classId: { $in: classIds } }),
  ]);

  return response.json({
    teacher: {
      email: teacher.email,
      initial: teacher.email.charAt(0).toUpperCase(),
      classCount: classes.length,
      sheetCount,
      studentCount: studentEmails.length,
      profile: teacherProfile
        ? {
            id: teacherProfile._id,
            firstName: teacherProfile.firstName,
            lastName: teacherProfile.lastName,
            gender: teacherProfile.gender,
            phone: teacherProfile.phone,
            address: teacherProfile.address,
          }
        : null,
      classes: classes.map((classRecord) => ({
        id: classRecord._id,
        subject: classRecord.subject,
        teacherName: classRecord.teacherName,
        course: classRecord.course,
        ...(classRecord.std ? { std: classRecord.std } : { semester: classRecord.semester }),
        attendanceCode: classRecord.attendanceCode,
      })),
    },
  });
});

app.get('/api/teacher/dashboard', (_request, response) => {
  response.json({
    role: 'teacher',
    message: 'Teacher dashboard ready',
    features: ['Take attendance', 'Manage classes', 'View reports'],
  });
});

app.get('/api/student/dashboard', (_request, response) => {
  response.json({
    role: 'student',
    message: 'Student dashboard ready',
    features: ['View attendance', 'Check attendance percentage', 'Review class history'],
  });
});

async function startServer() {
  await mongoose.connect(mongoUri, { dbName: 'student-attendance' });
  await AttendanceSheet.collection.dropIndex('code_1').catch(() => {});
  await AttendanceSheet.collection.dropIndex('attendanceCode_1').catch(() => {});
  await Attendance.collection.dropIndex('studentEmail_1_sheetId_1').catch(() => {});
  await Attendance.collection.dropIndex('studentEmail_1_attendanceSheetId_1').catch(() => {});
  app.listen(port, () => {
    console.log(`Student attendance API running on http://localhost:${port}`);
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to connect to MongoDB:', error.message);
  process.exit(1);
});
