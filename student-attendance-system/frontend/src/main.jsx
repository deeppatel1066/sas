import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { ArrowLeft, BookOpen, CalendarCheck, ChevronRight, Clock3, FilePlus2, Home, LogIn, UserRound, UsersRound } from 'lucide-react';
import './styles.css';

function StudentRow({ student }) {
  return (
    <div className="student-row">
      <span><small>Enrollment no.</small><strong>{student.enrollmentNo}</strong></span>
      <span><small>Name</small><strong>{student.name}</strong></span>
      <span><small>Gender</small><strong>{student.gender}</strong></span>
      <span><small>Phone</small><strong>{student.phone}</strong></span>
    </div>
  );
}

function App() {
  const [role, setRole] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [classForm, setClassForm] = useState({
    teacherName: '',
    std: '',
    semester: '',
    subject: '',
    gender: 'mixed',
    course: '',
  });
  const [createdClass, setCreatedClass] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentForm, setStudentForm] = useState({
    name: '',
    gender: 'male',
    enrollmentNo: '',
    phone: '',
    dob: '',
  });
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

  function TeacherNavbar() {
    async function openStudents() {
      setTeacherView('students');
      setRosterError('');
      try {
        const response = await fetch(`http://localhost:5000/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setTeacherRoster(result);
      } catch (requestError) {
        setRosterError(requestError.message);
      }
    }

    async function openSheets() {
      setTeacherView('sheets');
      setError('');
      const [sheetResponse, rosterResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/teacher/attendance-sheets?teacherEmail=${encodeURIComponent(teacherEmail)}`),
        fetch(`http://localhost:5000/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`),
      ]);
      const result = await sheetResponse.json();
      const rosterResult = await rosterResponse.json();
      if (!sheetResponse.ok) setError(result.message);
      else setAttendanceSheets(result.sheets);
      if (rosterResponse.ok) setTeacherRoster(rosterResult);
    }

    async function openProfile() {
      setTeacherView('profile');
      setError('');
      const response = await fetch(`http://localhost:5000/api/teacher/profile?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const result = await response.json();
      if (!response.ok) setError(result.message);
      else setTeacherProfile(result.teacher);
    }

    return (
      <nav className="teacher-navbar" aria-label="Teacher navigation">
        <button className="teacher-logo" type="button" title="Teacher profile" onClick={openProfile}>
          {teacherInitial}
        </button>
        <div className="nav-links">
          <button className={teacherView === 'home' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => setTeacherView('home')}><Home size={16} />Home</button>
          <button className={teacherView === 'students' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={openStudents}><UsersRound size={16} />Students</button>
          <button className={teacherView === 'create' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => { setTeacherView('create'); setCreatedClass(null); setError(''); }}><FilePlus2 size={16} />Create class</button>
          <button className={teacherView === 'sheets' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={openSheets}><CalendarCheck size={16} />Attendance</button>
          <button className={teacherView === 'profile' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={openProfile}><UserRound size={16} />Profile</button>
        </div>
      </nav>
    );
  }

  function StudentNavbar() {
    async function openHistory() {
      setStudentView('history');
      setError('');
      const response = await fetch(`http://localhost:5000/api/student/history?studentEmail=${encodeURIComponent(studentEmail)}`);
      const result = await response.json();
      if (!response.ok) setError(result.message);
      else setStudentHistory(result.history);
    }

    return (
      <nav className="teacher-navbar student-navbar" aria-label="Student navigation">
        <button className="teacher-logo" type="button" title="Student profile" onClick={() => setStudentView('profile')}>
          {(studentDetails?.name || studentEmail || 'Student').charAt(0).toUpperCase()}
        </button>
        <div className="nav-links">
          <button className={studentView === 'home' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => setStudentView('home')}><Home size={16} />Home</button>
          <button className={studentView === 'join' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => { setStudentView('join'); setError(''); }}><BookOpen size={16} />Join class</button>
          <button className={studentView === 'history' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={openHistory}><Clock3 size={16} />History</button>
          <button className={studentView === 'profile' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={() => setStudentView('profile')}><UserRound size={16} />Profile</button>
        </div>
      </nav>
    );
  }

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

  async function handleLogin(event) {
    event.preventDefault();
    const email = form.email.trim();

    if (!email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setError('');

    try {
      const authResponse = await fetch(`http://localhost:5000/api/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });

      const authResult = await authResponse.json();
      if (!authResponse.ok) {
        throw new Error(authResult.message);
      }

      const response = await fetch(`http://localhost:5000/api/${role}/dashboard`);

      if (!response.ok) {
        throw new Error('Unable to load your dashboard.');
      }

      setDashboard(await response.json());
      if (role === 'teacher') {
        setTeacherEmail(authResult.email);
      } else {
        setStudentEmail(authResult.email);
        setStudentView('home');
        const homeResponse = await fetch(`http://localhost:5000/api/student/home?studentEmail=${encodeURIComponent(authResult.email)}`);
        if (homeResponse.ok) setStudentClasses((await homeResponse.json()).classes);
        const profileResponse = await fetch(`http://localhost:5000/api/student/profile?studentEmail=${encodeURIComponent(authResult.email)}`);
        if (profileResponse.ok) setStudentDetails((await profileResponse.json()).student);
      }
      setHasEntered(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleStudentDetails(event) {
    event.preventDefault();

    if (Object.values(studentForm).some((value) => !value.trim())) {
      setError('All student details are required.');
      return;
    }

    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/student/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, ...studentForm }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setStudentDetails(result.student);
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
      return;
    }

    if (hasStd === hasSemester) {
      setError('Enter either a standard or a semester, not both.');
      return;
    }

    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, ...classForm }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setCreatedClass(result.class);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleJoinClass(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(studentCode.trim())) {
      setError('Enter the six-digit class code.');
      return;
    }

    setError('');
    const response = await fetch('http://localhost:5000/api/student/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail, attendanceCode: studentCode.trim() }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message);
      return;
    }
    setStudentClasses((current) => [result.class, ...current.filter((classItem) => classItem.id !== result.class.id)]);
    setStudentCode('');
    setStudentView('home');
  }

  async function handleMarkAttendance(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(studentCode.trim())) {
      setError('Enter the six-digit attendance code.');
      return;
    }

    setError('');
    const response = await fetch('http://localhost:5000/api/student/attendance-sheets/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentEmail, code: studentCode.trim() }),
    });
    const result = await response.json();
    if (!response.ok) setError(result.message);
    else { setStudentCode(''); setError('Attendance request sent. Waiting for teacher approval.'); setStudentView('home'); }
  }

  if (hasEntered) {
    if (role === 'teacher') {
      if (teacherView === 'home') {
        return (
          <main className="app-shell portal-shell">
            <section className="dashboard-shell">
              <TeacherNavbar />
              <header className="dashboard-header">
                <div>
                  <p className="eyebrow">Teacher workspace</p>
                  <h1>Good to see you.</h1>
                  <p className="intro">Build a clear attendance rhythm for every class you lead.</p>
                </div>
                <span className="profile-badge">T</span>
              </header>
              <div className="dashboard-grid">
                <article className="dashboard-card dashboard-card-accent">
                  <span className="card-kicker">Start here</span>
                  <h2>Create a class</h2>
                  <p>Set a subject, class group, and a permanent code for students.</p>
                  <button className="continue-button" type="button" onClick={() => { setTeacherView('create'); setError(''); }}><FilePlus2 size={17} />Create class</button>
                </article>
                <article className="dashboard-card">
                  <span className="card-kicker">Your classes</span>
                  <h2>Students by class</h2>
                  <p>See how many students have joined each attendance class.</p>
                  <button className="text-button card-action" type="button" onClick={async () => { setTeacherView('students'); const response = await fetch(`http://localhost:5000/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`); setTeacherRoster(await response.json()); }}>View student counts <ChevronRight size={16} /></button>
                </article>
                <article className="dashboard-card dashboard-card-accent">
                  <span className="card-kicker">Live attendance</span>
                  <h2>Create attendance sheet</h2>
                  <p>Open a timed sheet and approve student attendance requests.</p>
                  <button className="continue-button" type="button" onClick={() => { setTeacherView('sheets'); setSheetResult(null); }}>Create sheet</button>
                </article>
              </div>
              <button className="text-button workspace-back" type="button" onClick={() => setHasEntered(false)}>Change role</button>
            </section>
          </main>
        );
      }

      return (
        <main className="app-shell portal-shell">
          <section className="teacher-workspace">
            <TeacherNavbar />
            {teacherView === 'sheets' ? (
              <section className="teacher-subpage">
                <p className="eyebrow">Live attendance</p>
                <h1>Create attendance sheet.</h1>
                <p className="intro">Choose a class, set the date and duration, then share the generated code.</p>
                {sheetResult ? (
                  <div className="code-result" aria-live="polite"><p className="eyebrow">Sheet active</p><h2>{sheetResult.subject}</h2><p>Students can submit this code until the expiry time.</p><strong className="attendance-code">{sheetResult.code}</strong><p>Expires: {new Date(sheetResult.expiresAt).toLocaleTimeString()}</p><button className="back-button" type="button" onClick={() => setSheetResult(null)}>Create another sheet</button></div>
                ) : (
                  <form className="class-form" onSubmit={async (event) => { event.preventDefault(); if (!sheetForm.classId) { setError('Choose a class.'); return; } setError(''); const response = await fetch('http://localhost:5000/api/teacher/attendance-sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teacherEmail, ...sheetForm, durationMinutes: Number(sheetForm.durationMinutes) }) }); const result = await response.json(); if (!response.ok) setError(result.message); else setSheetResult(result.sheet); }}>
                    <label htmlFor="sheetDate">Date</label><input id="sheetDate" type="date" value={sheetForm.attendanceDate} onChange={(event) => setSheetForm({ ...sheetForm, attendanceDate: event.target.value })} />
                    <label htmlFor="sheetDuration">Open for (minutes)</label><input id="sheetDuration" type="number" min="1" max="1440" value={sheetForm.durationMinutes} onChange={(event) => setSheetForm({ ...sheetForm, durationMinutes: event.target.value })} />
                    <label htmlFor="sheetClass">Subject / class</label><select id="sheetClass" value={sheetForm.classId} onChange={(event) => setSheetForm({ ...sheetForm, classId: event.target.value })}><option value="">Choose a class</option>{teacherRoster?.classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.title} - {classItem.group}</option>)}</select>
                    {error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button" type="submit"><CalendarCheck size={17} />Create attendance sheet</button>
                  </form>
                )}
                <div className="sheet-notifications"><span className="card-kicker">Teacher approval</span><h2>Student requests</h2>{attendanceSheets.flatMap((sheet) => sheet.pendingRequests.map((request) => <div className="request-row" key={request.id}><span>{request.student?.name || request.studentEmail}</span><span>{sheet.subject}</span><button className="allow-button" type="button" onClick={async () => { await fetch(`http://localhost:5000/api/teacher/attendance-requests/${request.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teacherEmail, allow: true }) }); const refreshed = await fetch(`http://localhost:5000/api/teacher/attendance-sheets?teacherEmail=${encodeURIComponent(teacherEmail)}`); setAttendanceSheets((await refreshed.json()).sheets); }}>Allow</button></div>))}{attendanceSheets.every((sheet) => sheet.pendingRequests.length === 0) && <p className="empty-roster">No pending student requests.</p>}</div>
              </section>
            ) : teacherView === 'students' ? (
              <section className="teacher-subpage">
                <p className="eyebrow">Students</p>
                <h1>Class attendance groups.</h1>
                <p className="intro">Students are grouped by the classes they join. Profiles without a class are shown separately.</p>
                {rosterError && <p className="form-error" role="alert">{rosterError}</p>}
                <div className="class-count-list">
                  {teacherRoster?.classes.map((classGroup) => (
                    <article className="class-roster" key={classGroup.id}>
                      <header className="class-roster-header">
                        <div><span className="card-kicker">{classGroup.group} / {classGroup.course}</span><h2>{classGroup.title}</h2></div>
                        <strong>{classGroup.students.length} students</strong>
                      </header>
                      {classGroup.students.length > 0 ? classGroup.students.map((student) => <StudentRow key={student.id} student={student} />) : <p className="empty-roster">No students have joined this class yet.</p>}
                    </article>
                  ))}
                  {teacherRoster && teacherRoster.classes.length === 0 && <p className="empty-roster">You have not created any classes yet.</p>}
                </div>
              </section>
            ) : teacherView === 'profile' ? (
              <section className="teacher-subpage">
                <p className="eyebrow">Teacher profile</p>
                <div className="teacher-profile-heading">
                  <span className="teacher-logo profile-logo">{teacherProfile?.initial || teacherInitial}</span>
                  <div><h1>{teacherDisplayName}.</h1><p className="profile-email">{teacherProfile?.email || teacherEmail}</p></div>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="profile-metrics">
                  <div><strong>{teacherProfile?.classCount ?? 0}</strong><span>Classes</span></div>
                  <div><strong>{teacherProfile?.sheetCount ?? 0}</strong><span>Attendance sheets</span></div>
                  <div><strong>{teacherProfile?.studentCount ?? 0}</strong><span>Students</span></div>
                </div>
                <div className="profile-classes"><p className="eyebrow">Class details</p>{teacherProfile?.classes?.length ? teacherProfile.classes.map((classItem) => <article className="profile-class-row" key={classItem.id}><div><span className="card-kicker">{classItem.std ? `Standard ${classItem.std}` : `Semester ${classItem.semester}`} / {classItem.course}</span><h2>{classItem.subject}</h2><p>Teacher: {classItem.teacherName}</p></div><strong>{classItem.attendanceCode}</strong></article>) : <p className="empty-roster">No classes created yet.</p>}</div>
              </section>
            ) : (
              <>
            <button className="text-button" type="button" onClick={() => { setTeacherView('home'); setCreatedClass(null); setError(''); }}>
              <ArrowLeft size={16} /> Back
            </button>
            <p className="eyebrow">Teacher portal</p>
            <h1>Create a class.</h1>
            <p className="intro">Set up one subject session and share its access code with your students.</p>

            {createdClass ? (
              <div className="code-result" aria-live="polite">
                <p className="eyebrow">Class created</p>
                <h2>{createdClass.subject}</h2>
                <p>Share this code with students to enter the class.</p>
                <strong className="attendance-code">{createdClass.attendanceCode}</strong>
                <button className="back-button" type="button" onClick={() => setCreatedClass(null)}>
                  Create another class
                </button>
              </div>
            ) : (
              <form className="class-form" onSubmit={handleCreateClass} noValidate>
                <label htmlFor="teacherName">Teacher name</label>
                <input id="teacherName" value={classForm.teacherName} onChange={(event) => setClassForm({ ...classForm, teacherName: event.target.value })} placeholder="Your full name" />

                <div className="field-row">
                  <div>
                    <label htmlFor="std">Standard</label>
                    <input id="std" value={classForm.std} onChange={(event) => setClassForm({ ...classForm, std: event.target.value, semester: '' })} placeholder="For example, 10" />
                  </div>
                  <div>
                    <label htmlFor="semester">Semester</label>
                    <input id="semester" value={classForm.semester} onChange={(event) => setClassForm({ ...classForm, semester: event.target.value, std: '' })} placeholder="For example, 3" />
                  </div>
                </div>

                <label htmlFor="subject">Subject</label>
                <input id="subject" value={classForm.subject} onChange={(event) => setClassForm({ ...classForm, subject: event.target.value })} placeholder="Mathematics" />

                <label htmlFor="gender">Gender</label>
                <select id="gender" value={classForm.gender} onChange={(event) => setClassForm({ ...classForm, gender: event.target.value })}>
                  <option value="mixed">Mixed</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <label htmlFor="course">Course</label>
                <input id="course" value={classForm.course} onChange={(event) => setClassForm({ ...classForm, course: event.target.value })} placeholder="Computer Science" />

                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="continue-button" type="submit"><FilePlus2 size={17} />Create class</button>
              </form>
            )}
            <button className="text-button workspace-back" type="button" onClick={() => setHasEntered(false)}>Change role</button>
              </>
            )}
          </section>
        </main>
      );
    }

    return (
      <main className="app-shell portal-shell">
        <section className="dashboard-shell" aria-live="polite">
          <StudentNavbar />
          {studentView === 'home' && (
            <>
              <header className="dashboard-header">
                <div>
                  <p className="eyebrow">Student workspace</p>
                  <h1>Your attendance desk.</h1>
                  <p className="intro">See your joined classes and mark attendance with the teacher’s code.</p>
                </div>
                <span className="profile-badge">{(studentDetails?.name || studentEmail || 'Student').charAt(0).toUpperCase()}</span>
              </header>
              <div className="student-class-grid">
                {studentClasses.length > 0 ? studentClasses.map((classItem) => (
                  <article className="student-class-card" key={classItem.id}>
                    <span className="card-kicker">{classItem.std ? `Standard ${classItem.std}` : `Semester ${classItem.semester}`} / {classItem.course}</span>
                    <h2>{classItem.subject}</h2>
                    <p>Teacher: {classItem.teacherName}</p>
                    <p>{classItem.teacherEmail}</p>
                    <form className="attendance-form" onSubmit={handleMarkAttendance}>
                      <label htmlFor={`attendance-${classItem.id}`}>Attendance code</label>
                      <input id={`attendance-${classItem.id}`} value={studentCode} onChange={(event) => setStudentCode(event.target.value)} inputMode="numeric" maxLength="6" placeholder="Six digits" />
                      <button className="continue-button" type="submit"><CalendarCheck size={17} />Mark attendance</button>
                    </form>
                  </article>
                )) : <p className="empty-roster">You have not joined a class yet. Use Join class to enter a teacher’s code.</p>}
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
            </>
          )}

          {studentView === 'join' && (
            <section className="student-subpage">
              <p className="eyebrow">Join class</p>
              <h1>Enter your joining class code.</h1>
              <p className="intro">Use the six-digit code created by your teacher.</p>
              <form className="student-form" onSubmit={handleJoinClass} noValidate>
                <label htmlFor="joinCode">Class code</label>
                <input id="joinCode" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} inputMode="numeric" maxLength="6" placeholder="123456" />
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="continue-button" type="submit"><BookOpen size={17} />Join class</button>
              </form>
            </section>
          )}

          {studentView === 'history' && (
            <section className="student-subpage">
              <p className="eyebrow">Attendance history</p>
              <h1>Your attendance record.</h1>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="history-list">
                {studentHistory.length > 0 ? studentHistory.map((record) => (
                  <article className="history-row" key={record.id}><strong>{record.class.subject}</strong><span>{record.class.teacherName}</span><time>{new Date(record.attendedAt).toLocaleString()}</time></article>
                )) : <p className="empty-roster">No attendance records yet.</p>}
              </div>
            </section>
          )}

          {studentView === 'profile' && (
            <section className="student-subpage">
              {studentDetails ? (
                <>
                  <p className="eyebrow">Student profile</p>
                  <div className="student-profile-heading">
                    <span className="teacher-logo profile-logo">{studentDetails.name.charAt(0).toUpperCase()}</span>
                    <div><h1>{studentDetails.name}.</h1><p className="profile-email">{studentDetails.email}</p><strong className="profile-enrollment">Enrollment no. {studentDetails.enrollmentNo}</strong></div>
                  </div>
                  <div className="profile-metrics">
                    <div><strong>{studentDetails.joinedClassCount ?? 0}</strong><span>Joined classes</span></div>
                    <div><strong>{studentDetails.attendedCount ?? 0}</strong><span>Attended sessions</span></div>
                  </div>
                </>
              ) : (
                <><p className="eyebrow">Student details</p><h1>Complete your profile.</h1><p className="intro">Save your details before joining attendance classes.</p><form className="student-form" onSubmit={handleStudentDetails} noValidate><label htmlFor="studentName">Name</label><input id="studentName" value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} placeholder="Your full name" /><label htmlFor="studentGender">Gender</label><select id="studentGender" value={studentForm.gender} onChange={(event) => setStudentForm({ ...studentForm, gender: event.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select><label htmlFor="enrollmentNo">Enrollment number</label><input id="enrollmentNo" value={studentForm.enrollmentNo} onChange={(event) => setStudentForm({ ...studentForm, enrollmentNo: event.target.value })} placeholder="Your enrollment number" /><label htmlFor="phone">Phone</label><input id="phone" type="tel" value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} placeholder="Your phone number" /><label htmlFor="dob">Date of birth</label><input id="dob" type="date" value={studentForm.dob} onChange={(event) => setStudentForm({ ...studentForm, dob: event.target.value })} />{error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button" type="submit">Save student details</button></form></>
              )}
            </section>
          )}
          <button className="text-button workspace-back" type="button" onClick={() => setHasEntered(false)}>Change role</button>
        </section>
      </main>
    );
  }

  if (showLogin) {
    return (
      <main className="app-shell portal-shell">
        <section className="login-panel">
          <button className="text-button" type="button" onClick={() => setShowLogin(false)}>
            <ArrowLeft size={16} /> Back
          </button>
          <p className="eyebrow">{roleDetails[role].label} account</p>
          <h1>{isRegistering ? 'Create your account.' : 'Welcome back.'}</h1>
          <p className="intro">{isRegistering ? 'Register to start using attendance tools.' : 'Sign in to continue to your attendance workspace.'}</p>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              aria-invalid={Boolean(error)}
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              aria-invalid={Boolean(error)}
            />

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="continue-button" type="submit"><LogIn size={17} />{isRegistering ? 'Register' : 'Sign in'} as {roleDetails[role].label}</button>
          </form>
          <button className="text-button auth-switch" type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="entry-page">
        <p className="eyebrow">Student attendance system</p>
        <h1>Attendance, from the right side of the classroom.</h1>
        <p className="intro">Choose how you are entering today.</p>

        <div className="role-options" aria-label="Choose your role">
          {Object.entries(roleDetails).map(([value, details]) => (
            <button
              className={`role-card${role === value ? ' is-selected' : ''}`}
              key={value}
              type="button"
              aria-pressed={role === value}
              onClick={() => setRole(value)}
            >
              <span className="role-mark" aria-hidden="true">{value === 'teacher' ? 'T' : 'S'}</span>
              <span className="role-text">
                <strong>{details.label}</strong>
                <span>{details.description}</span>
              </span>
              <span className="role-arrow" aria-hidden="true">-&gt;</span>
            </button>
          ))}
        </div>

        <button className="continue-button" type="button" disabled={!role} onClick={() => setShowLogin(true)}>
          {role ? `Continue as ${roleDetails[role].label}` : 'Select a role to continue'}
        </button>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
