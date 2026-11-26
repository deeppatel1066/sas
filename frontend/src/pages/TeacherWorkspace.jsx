import { ArrowLeft, CalendarCheck, ChevronRight, FilePlus2 } from 'lucide-react';
import AttendanceSheetCard from '../components/AttendanceSheetCard.jsx';
import StudentRow from '../components/StudentRow.jsx';
import TeacherNavbar from '../components/TeacherNavbar.jsx';

export default function TeacherWorkspace({
  teacherEmail,
  teacherDisplayName,
  teacherInitial,
  teacherView,
  setTeacherView,
  teacherRoster,
  rosterError,
  attendanceSheets,
  teacherProfile,
  classForm,
  setClassForm,
  createdClass,
  setCreatedClass,
  sheetResult,
  setSheetResult,
  sheetForm,
  setSheetForm,
  error,
  setError,
  onStudents,
  onSheets,
  onProfile,
  onCreateClass,
  onCreateSheet,
  onAllowAttendance,
  onAllowAllAttendance,
  onLogout,
}) {
  const navbar = (
    <TeacherNavbar
      teacherInitial={teacherInitial}
      teacherView={teacherView}
      onHome={() => setTeacherView('home')}
      onStudents={onStudents}
      onCreate={() => { setTeacherView('create'); setCreatedClass(null); setError(''); }}
      onAttendance={onSheets}
      onProfile={onProfile}
      onLogout={onLogout}
    />
  );

  if (teacherView === 'home') {
    return (
      <main className="app-shell portal-shell">
        <section className="dashboard-shell">
          {navbar}
          <header className="dashboard-header">
            <div><p className="eyebrow">Teacher workspace</p><h1>Good to see you.</h1><p className="intro">Build a clear attendance rhythm for every class you lead.</p></div>
            <span className="profile-badge">{teacherInitial}</span>
          </header>
          <div className="dashboard-grid">
            <article className="dashboard-card dashboard-card-accent"><span className="card-kicker">Start here</span><h2>Create a class</h2><p>Set a subject, class group, and a permanent code for students.</p><button className="continue-button" type="button" onClick={() => { setTeacherView('create'); setError(''); }}><FilePlus2 size={17} />Create class</button></article>
            <article className="dashboard-card"><span className="card-kicker">Your classes</span><h2>Students by class</h2><p>See how many students have joined each attendance class.</p><button className="text-button card-action" type="button" onClick={onStudents}>View student counts <ChevronRight size={16} /></button></article>
            <article className="dashboard-card dashboard-card-accent"><span className="card-kicker">Live attendance</span><h2>Create attendance sheet</h2><p>Open a timed sheet and approve student attendance requests.</p><button className="continue-button" type="button" onClick={() => { setTeacherView('sheets'); setSheetResult(null); onSheets(); }}><CalendarCheck size={17} />Create sheet</button></article>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell portal-shell">
      <section className="teacher-workspace">
        {navbar}
        {teacherView === 'sheets' && (
          <section className="teacher-subpage">
            <p className="eyebrow">Live attendance</p><h1>Create attendance sheet.</h1><p className="intro">Choose a class, set the date and duration, then share the generated code.</p>
            {sheetResult ? (
              <div className="code-result" aria-live="polite"><p className="eyebrow">Sheet active</p><h2>{sheetResult.subject}</h2><p>Students can submit this code until the expiry time.</p><strong className="attendance-code">{sheetResult.code}</strong><p>Expires: {new Date(sheetResult.expiresAt).toLocaleTimeString()}</p><button className="back-button" type="button" onClick={() => setSheetResult(null)}>Create another sheet</button></div>
            ) : (
              <form className="class-form" onSubmit={onCreateSheet}>
                <label htmlFor="sheetDate">Date</label><input id="sheetDate" type="date" value={sheetForm.attendanceDate} onChange={(event) => setSheetForm({ ...sheetForm, attendanceDate: event.target.value })} />
                <label htmlFor="sheetDuration">Open for (minutes)</label><input id="sheetDuration" type="number" min="1" max="1440" value={sheetForm.durationMinutes} onChange={(event) => setSheetForm({ ...sheetForm, durationMinutes: event.target.value })} />
                <label htmlFor="sheetClass">Subject / class</label><select id="sheetClass" value={sheetForm.classId} onChange={(event) => setSheetForm({ ...sheetForm, classId: event.target.value })}><option value="">Choose a class</option>{teacherRoster?.classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.title} - {classItem.group}</option>)}</select>
                {error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button" type="submit"><CalendarCheck size={17} />Create attendance sheet</button>
              </form>
            )}
            <div className="attendance-sheet-list">{attendanceSheets.length ? attendanceSheets.map((sheet) => <AttendanceSheetCard key={sheet.id} sheet={sheet} onAllow={onAllowAttendance} onAllowAll={onAllowAllAttendance} />) : <p className="empty-roster">No attendance sheets created yet.</p>}</div>
          </section>
        )}

        {teacherView === 'students' && (
          <section className="teacher-subpage"><p className="eyebrow">Students</p><h1>Class attendance groups.</h1><p className="intro">Students are grouped by the classes they join.</p>{rosterError && <p className="form-error" role="alert">{rosterError}</p>}<div className="class-count-list">{teacherRoster?.classes.map((classGroup) => <article className="class-roster" key={classGroup.id}><header className="class-roster-header"><div><span className="card-kicker">{classGroup.group} / {classGroup.course}</span><h2>{classGroup.title}</h2></div><strong>{classGroup.students.length} students</strong></header>{classGroup.students.length ? classGroup.students.map((student) => <StudentRow key={student.id} student={student} />) : <p className="empty-roster">No students have joined this class yet.</p>}</article>)}{teacherRoster && teacherRoster.classes.length === 0 && <p className="empty-roster">You have not created any classes yet.</p>}</div></section>
        )}

        {teacherView === 'profile' && (
          <section className="teacher-subpage">
            <p className="eyebrow">Teacher profile</p>
            <h1>Personal profile.</h1>
            {error && <p className="form-error" role="alert">{error}</p>}
            <table className="profile-table">
              <tbody>
                <tr><td colSpan="2"><span className="teacher-logo profile-logo">{teacherProfile?.initial || teacherInitial}</span></td></tr>
                <tr><th scope="row">Email</th><td>{teacherProfile?.email || teacherEmail}</td></tr>
                <tr><th scope="row">Name</th><td>{teacherProfile?.profile?.firstName && teacherProfile?.profile?.lastName ? `${teacherProfile.profile.firstName} ${teacherProfile.profile.lastName}` : (teacherProfile?.name || teacherDisplayName)}</td></tr>
                <tr><th scope="row">Gender</th><td className="profile-value-capital">{teacherProfile?.profile?.gender || 'Not provided'}</td></tr>
                <tr><th scope="row">Phone</th><td>{teacherProfile?.profile?.phone || 'Not provided'}</td></tr>
                <tr><th scope="row">Apartment / Flat</th><td>{teacherProfile?.profile?.address?.apartment || 'Not provided'}</td></tr>
                <tr><th scope="row">Area</th><td>{teacherProfile?.profile?.address?.area || 'Not provided'}</td></tr>
                <tr><th scope="row">City</th><td>{teacherProfile?.profile?.address?.city || 'Not provided'}</td></tr>
              </tbody>
            </table>
            <div className="profile-classes"><p className="eyebrow">Class details</p>{teacherProfile?.classes?.length ? teacherProfile.classes.map((classItem) => <article className="profile-class-row" key={classItem.id}><div><span className="card-kicker">{classItem.std ? `Standard ${classItem.std}` : `Semester ${classItem.semester}`} / {classItem.course}</span><h2>{classItem.subject}</h2><p>Teacher: {classItem.teacherName}</p></div><strong>{classItem.attendanceCode}</strong></article>) : <p className="empty-roster">No classes created yet.</p>}</div>
          </section>
        )}

        {teacherView === 'create' && (
          <section className="teacher-subpage"><button className="text-button" type="button" onClick={() => { setTeacherView('home'); setCreatedClass(null); setError(''); }}><ArrowLeft size={16} />Back</button><p className="eyebrow">Teacher portal</p><h1>Create a class.</h1><p className="intro">Set up one subject session and share its access code with your students.</p>{createdClass ? <div className="code-result" aria-live="polite"><p className="eyebrow">Class created</p><h2>{createdClass.subject}</h2><p>Share this code with students to enter the class.</p><strong className="attendance-code">{createdClass.attendanceCode}</strong><button className="back-button" type="button" onClick={() => setCreatedClass(null)}>Create another class</button></div> : <form className="class-form" onSubmit={onCreateClass} noValidate><label htmlFor="teacherName">Teacher name</label><input id="teacherName" value={classForm.teacherName} onChange={(event) => setClassForm({ ...classForm, teacherName: event.target.value })} placeholder="Your full name" /><div className="field-row"><div><label htmlFor="std">Standard</label><input id="std" value={classForm.std} onChange={(event) => setClassForm({ ...classForm, std: event.target.value, semester: '' })} placeholder="For example, 10" /></div><div><label htmlFor="semester">Semester</label><input id="semester" value={classForm.semester} onChange={(event) => setClassForm({ ...classForm, semester: event.target.value, std: '' })} placeholder="For example, 3" /></div></div><label htmlFor="subject">Subject</label><input id="subject" value={classForm.subject} onChange={(event) => setClassForm({ ...classForm, subject: event.target.value })} placeholder="Mathematics" /><label htmlFor="classGender">Gender</label><select id="classGender" value={classForm.gender} onChange={(event) => setClassForm({ ...classForm, gender: event.target.value })}><option value="mixed">Mixed</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select><label htmlFor="course">Course</label><input id="course" value={classForm.course} onChange={(event) => setClassForm({ ...classForm, course: event.target.value })} placeholder="Computer Science" />{error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button" type="submit"><FilePlus2 size={17} />Create class</button></form>}</section>
        )}
      </section>
    </main>
  );
}
