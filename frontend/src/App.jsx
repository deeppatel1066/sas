import { useState } from 'react';
import StatusPopup from './components/StatusPopup.jsx';
import CoverPage from './pages/CoverPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RoleSelectionPage from './pages/RoleSelectionPage.jsx';
import StudentWorkspace from './pages/StudentWorkspace.jsx';
import TeacherWorkspace from './pages/TeacherWorkspace.jsx';

const roleDetails = {
  teacher: {
    label: 'Teacher',
    description: 'Take attendance, manage classes, and review reports.',
    action: 'Enter teacher portal',
  },
  student: {
    label: 'Student',
    description: 'Check your attendance record and stay up to date.',
    action: 'Enter student portal',
  },
};

const apiBase = 'http://localhost:7000/api';

async function readResponse(response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'The request could not be completed.');
  return result;
}

function buildPopup(success, title, message, details) {
  return { success, title, message, details };
}

export default function App() {
  const [showCover, setShowCover] = useState(true);
  const [role, setRole] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [form, setForm] = useState({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  gender: 'male',
  phone: '',
  dob: '',
  enrollmentNo: '',
  address: {
    apartment: '',
    area: '',
    city: ''
  }
});
  const [error, setError] = useState('');
  const [popup, setPopup] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [classForm, setClassForm] = useState({ teacherName: '', std: '', semester: '', subject: '', gender: 'mixed', course: '' });
  const [createdClass, setCreatedClass] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentForm, setStudentForm] = useState({ name: '', gender: 'male', enrollmentNo: '', phone: '', dob: '' });
  const [studentDetails, setStudentDetails] = useState(null);
  const [teacherView, setTeacherView] = useState('home');
  const [studentView, setStudentView] = useState('home');
  const [teacherRoster, setTeacherRoster] = useState(null);
  const [rosterError, setRosterError] = useState('');
  const [attendanceSheets, setAttendanceSheets] = useState([]);
  const [sheetForm, setSheetForm] = useState({ attendanceDate: new Date().toISOString().slice(0, 10), durationMinutes: '30', classId: '' });
  const [sheetResult, setSheetResult] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [studentHistory, setStudentHistory] = useState([]);
  const [studentCode, setStudentCode] = useState('');

  const teacherDisplayName = classForm.teacherName.trim() || teacherEmail.split('@')[0] || 'Teacher';
  const teacherInitial = teacherDisplayName.charAt(0).toUpperCase();

  async function loadTeacherStudents() {
    setTeacherView('students');
    setRosterError('');
    try {
      const response = await fetch(`${apiBase}/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      setTeacherRoster(await readResponse(response));
    } catch (requestError) {
      setRosterError(requestError.message);
    }
  }

  async function loadTeacherSheets() {
    setTeacherView('sheets');
    setError('');
    try {
      const [sheetResponse, rosterResponse] = await Promise.all([
        fetch(`${apiBase}/teacher/attendance-sheets?teacherEmail=${encodeURIComponent(teacherEmail)}`),
        fetch(`${apiBase}/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`),
      ]);
      const [sheetResult, rosterResult] = await Promise.all([readResponse(sheetResponse), readResponse(rosterResponse)]);
      setAttendanceSheets(sheetResult.sheets);
      setTeacherRoster(rosterResult);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadTeacherProfile() {
    setTeacherView('profile');
    setError('');
    try {
      const response = await fetch(`${apiBase}/teacher/profile?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      setTeacherProfile((await readResponse(response)).teacher);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadStudentHistory() {
    setStudentView('history');
    setError('');
    try {
      const response = await fetch(`${apiBase}/student/history?studentEmail=${encodeURIComponent(studentEmail)}`);
      setStudentHistory((await readResponse(response)).history);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const email = form.email.trim();

    if (!email || !form.password) return setError('Email and password are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Password must contain at least 8 characters.');

    setError('');
    try {
      // Prepare registration payload
      let payload = { ...form, email, role };
      if (isRegistering) {
        // Flatten address fields for backend if needed
        payload = {
          ...payload,
          apartment: form.address?.apartment || '',
          area: form.address?.area || '',
          city: form.address?.city || '',
        };
        delete payload.address;
      }
      const authResponse = await fetch(`${apiBase}/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const authResult = await readResponse(authResponse);
      const dashboardResponse = await fetch(`${apiBase}/${role}/dashboard`);
      await readResponse(dashboardResponse);

      if (role === 'teacher') {
        const teacherName = `${authResult.user?.firstName || form.firstName || ''} ${authResult.user?.lastName || form.lastName || ''}`.trim();
        setTeacherEmail(authResult.email);
        setClassForm((current) => ({ ...current, teacherName: teacherName || current.teacherName }));
        setTeacherView('home');
      } else {
        const fullName = `${authResult.user?.firstName || form.firstName || ''} ${authResult.user?.lastName || form.lastName || ''}`.trim();
        const studentProfile = {
          id: authResult.user?.id || null,
          email: authResult.email,
          name: fullName || (authResult.user?.name || form.firstName || 'Student'),
          gender: authResult.user?.gender || form.gender || 'male',
          enrollmentNo: authResult.user?.enrollmentNo || form.enrollmentNo || '',
          phone: authResult.user?.phone || form.phone || '',
          dob: authResult.user?.dob || form.dob || '',
        };

        setStudentEmail(authResult.email);
        setStudentDetails(studentProfile);
        setStudentForm({
          name: studentProfile.name,
          gender: studentProfile.gender,
          enrollmentNo: studentProfile.enrollmentNo,
          phone: studentProfile.phone,
          dob: studentProfile.dob,
        });
        setStudentView('home');
        const [homeResponse, profileResponse] = await Promise.all([
          fetch(`${apiBase}/student/home?studentEmail=${encodeURIComponent(authResult.email)}`),
          fetch(`${apiBase}/student/profile?studentEmail=${encodeURIComponent(authResult.email)}`),
        ]);
        if (homeResponse.ok) setStudentClasses((await homeResponse.json()).classes);
        if (profileResponse.ok) setStudentDetails((await profileResponse.json()).student);
      }
      setHasEntered(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleStudentDetails(event) {
    event.preventDefault();
    if (Object.values(studentForm).some((value) => !value.trim())) return setError('All student details are required.');
    setError('');
    try {
      const response = await fetch(`${apiBase}/student/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, ...studentForm }),
      });
      setStudentDetails((await readResponse(response)).student);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleCreateClass(event) {
    event.preventDefault();
    const hasStd = Boolean(classForm.std.trim());
    const hasSemester = Boolean(classForm.semester.trim());
    if (!classForm.teacherName.trim() || !classForm.subject.trim() || !classForm.course.trim()) {
      setError('Teacher name, subject, and course are required.');
      setPopup(buildPopup(false, 'Class not created', 'Please check the form and try again.', 'Teacher name, subject, and course are required.'));
      return;
    }
    if (hasStd === hasSemester) {
      setError('Enter either a standard or a semester, not both.');
      setPopup(buildPopup(false, 'Class not created', 'Please check the class details and try again.', 'Enter either a standard or a semester, not both.'));
      return;
    }

    setError('');
    try {
      const response = await fetch(`${apiBase}/teacher/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, ...classForm }),
      });
      const result = await readResponse(response);
      setCreatedClass(result.class);
      setPopup(buildPopup(
        true,
        'Class created successfully',
        `${result.class.subject} is now live.`,
        `Teacher: ${result.class.teacherName} • Code: ${result.class.attendanceCode}`
      ));
    } catch (requestError) {
      setError(requestError.message);
      setPopup(buildPopup(false, 'Class not created', 'The class could not be created.', requestError.message));
    }
  }

  async function handleCreateSheet(event) {
    event.preventDefault();
    if (!sheetForm.classId) {
      setError('Choose a class.');
      setPopup(buildPopup(false, 'Attendance sheet not created', 'Please select a class and try again.', 'Choose a class before creating the live sheet.'));
      return;
    }
    setError('');
    try {
      const response = await fetch(`${apiBase}/teacher/attendance-sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, ...sheetForm, durationMinutes: Number(sheetForm.durationMinutes) }),
      });
      const result = await readResponse(response);
      setSheetResult(result.sheet);
      const listResponse = await fetch(`${apiBase}/teacher/attendance-sheets?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      if (listResponse.ok) setAttendanceSheets((await listResponse.json()).sheets);
      const selectedClass = teacherRoster?.classes.find((classItem) => classItem.id === sheetForm.classId);
      setPopup(buildPopup(
        true,
        'Live attendance code created',
        `Code: ${result.sheet.code}`,
        `Subject: ${selectedClass?.title || result.sheet.subject} • Duration: ${result.sheet.durationMinutes} minutes`
      ));
    } catch (requestError) {
      setError(requestError.message);
      setPopup(buildPopup(false, 'Attendance sheet not created', 'The attendance sheet could not be created.', requestError.message));
    }
  }

  async function handleAllowAttendance(requestId) {
    try {
      const response = await fetch(`${apiBase}/teacher/attendance-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, allow: true }),
      });
      await readResponse(response);
      const refreshed = await fetch(`${apiBase}/teacher/attendance-sheets?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      setAttendanceSheets((await readResponse(refreshed)).sheets);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleAllowAllAttendance(sheetId) {
    try {
      const response = await fetch(`${apiBase}/teacher/attendance-sheets/${sheetId}/allow-pending`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail }),
      });
      const result = await readResponse(response);
      const refreshed = await fetch(`${apiBase}/teacher/attendance-sheets?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      setAttendanceSheets((await readResponse(refreshed)).sheets);
      setPopup(buildPopup(true, 'Attendance requests allowed', `${result.approvedCount} pending student request${result.approvedCount === 1 ? '' : 's'} approved.`, 'Students are now marked present for this attendance sheet.'));
    } catch (requestError) {
      setError(requestError.message);
      setPopup(buildPopup(false, 'Requests not fully allowed', 'There was a problem approving the pending requests.', requestError.message));
    }
  }

  async function handleJoinClass(event) {
    event.preventDefault();
    const code = studentCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit class code.');
      setPopup(buildPopup(false, 'Class not joined', 'Please enter a valid six-digit code.', 'Try again with the teacher-provided class code.'));
      return;
    }
    setError('');
    try {
      const response = await fetch(`${apiBase}/student/classes/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, attendanceCode: code }),
      });
      const result = await readResponse(response);
      setStudentClasses((current) => [result.class, ...current.filter((item) => item.id !== result.class.id)]);
      setStudentCode('');
      setStudentView('home');
      setPopup(buildPopup(true, 'Joined class successfully', `${result.class.subject} is now on your dashboard.`, `Teacher: ${result.class.teacherName} • Subject: ${result.class.subject}`));
    } catch (requestError) {
      setError(requestError.message);
      setPopup(buildPopup(false, 'Class not joined', 'The class could not be joined.', requestError.message));
    }
  }

  async function handleMarkAttendance(event) {
    event.preventDefault();
    const code = studentCode.trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit attendance code.');
      setPopup(buildPopup(false, 'Attendance not sent', 'Please enter a valid six-digit code.', 'Try again with the live attendance code from your teacher.'));
      return;
    }
    setError('');
    try {
      const response = await fetch(`${apiBase}/student/attendance-sheets/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, code }),
      });
      await readResponse(response);
      setStudentCode('');
      setError('Attendance request sent. Waiting for teacher approval.');
      setStudentView('home');
      setPopup(buildPopup(true, 'Attendance request sent', 'Your request is now pending teacher approval.', 'The teacher will approve your attendance shortly.'));
    } catch (requestError) {
      setError(requestError.message);
      setPopup(buildPopup(false, 'Attendance request failed', 'Your request was not sent.', requestError.message));
    }
  }

  function handleLogout() {
    setHasEntered(false);
    setShowCover(true);
    setShowLogin(false);
    setRole('');
    setForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      gender: 'male',
      phone: '',
      dob: '',
      enrollmentNo: '',
      address: {
        apartment: '',
        area: '',
        city: ''
      }
    });
    setClassForm({ teacherName: '', std: '', semester: '', subject: '', gender: 'mixed', course: '' });
    setStudentForm({ name: '', gender: 'male', enrollmentNo: '', phone: '', dob: '' });
    setTeacherEmail('');
    setStudentEmail('');
    setStudentDetails(null);
    setStudentClasses([]);
    setStudentHistory([]);
    setTeacherRoster(null);
    setAttendanceSheets([]);
    setError('');
    setPopup(null);
  }

  const appContent = (() => {
    if (hasEntered) {
      if (role === 'teacher') {
        return <TeacherWorkspace
          teacherEmail={teacherEmail}
          teacherDisplayName={teacherDisplayName}
          teacherInitial={teacherInitial}
          teacherView={teacherView}
          setTeacherView={setTeacherView}
          teacherRoster={teacherRoster}
          rosterError={rosterError}
          attendanceSheets={attendanceSheets}
          teacherProfile={teacherProfile}
          classForm={classForm}
          setClassForm={setClassForm}
          createdClass={createdClass}
          setCreatedClass={setCreatedClass}
          sheetResult={sheetResult}
          setSheetResult={setSheetResult}
          sheetForm={sheetForm}
          setSheetForm={setSheetForm}
          error={error}
          setError={setError}
          onStudents={loadTeacherStudents}
          onSheets={loadTeacherSheets}
          onProfile={loadTeacherProfile}
          onCreateClass={handleCreateClass}
          onCreateSheet={handleCreateSheet}
          onAllowAttendance={handleAllowAttendance}
          onAllowAllAttendance={handleAllowAllAttendance}
          onLogout={handleLogout}
        />;
      }

      return <StudentWorkspace
        studentEmail={studentEmail}
        studentDetails={studentDetails}
        studentClasses={studentClasses}
        studentHistory={studentHistory}
        studentView={studentView}
        setStudentView={setStudentView}
        studentForm={studentForm}
        setStudentForm={setStudentForm}
        studentCode={studentCode}
        setStudentCode={setStudentCode}
        error={error}
        setError={setError}
        onJoinClass={handleJoinClass}
        onMarkAttendance={handleMarkAttendance}
        onStudentDetails={handleStudentDetails}
        onHistory={loadStudentHistory}
        onLogout={handleLogout}
      />;
    }

    if (showCover) {
      return <CoverPage
        onSignIn={() => { setIsRegistering(false); setRole(''); setError(''); setShowCover(false); }}
        onSignUp={() => { setIsRegistering(true); setRole(''); setError(''); setShowCover(false); }}
      />;
    }

    if (showLogin) {
      return <LoginPage
        role={role}
        roleDetails={roleDetails}
        isRegistering={isRegistering}
        form={form}
        error={error}
        onChange={(event) => {
  const { name, value } = event.target;
  if (name.startsWith('address.')) {
    const field = name.split('.')[1];
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  } else {
    setForm((prev) => ({ ...prev, [name]: value }));
  }
}}
        onSubmit={handleLogin}
        onBack={() => setShowLogin(false)}
        onToggleMode={() => { setIsRegistering(!isRegistering); setError(''); }}
      />;
    }

    return <RoleSelectionPage
      role={role}
      roleDetails={roleDetails}
      onSelectRole={(selectedRole) => { setRole(selectedRole); setError(''); }}
      onContinue={() => { if (role) setShowLogin(true); }}
      onBack={() => { setRole(''); setShowCover(true); setError(''); }}
    />;
  })();

  return (
    <>
      {appContent}
      {popup && <StatusPopup success={popup.success} title={popup.title} message={popup.message} details={popup.details} onClose={() => setPopup(null)} />}
    </>
  );
}
