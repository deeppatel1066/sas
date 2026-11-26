import { BookOpen, CalendarCheck } from 'lucide-react';
import StudentNavbar from '../components/StudentNavbar.jsx';

export default function StudentWorkspace({
  studentEmail,
  studentDetails,
  studentClasses,
  studentHistory,
  studentView,
  setStudentView,
  studentForm,
  setStudentForm,
  studentCode,
  setStudentCode,
  error,
  setError,
  onJoinClass,
  onMarkAttendance,
  onStudentDetails,
  onHistory,
  onLogout,
}) {
  const studentInitial = (studentDetails?.name || studentEmail || 'Student').charAt(0).toUpperCase();
  const navbar = (
    <StudentNavbar
      studentInitial={studentInitial}
      studentView={studentView}
      onHome={() => setStudentView('home')}
      onJoin={() => { setStudentView('join'); setError(''); }}
      onHistory={onHistory}
      onProfile={() => setStudentView('profile')}
      onLogout={onLogout}
    />
  );

  return (
    <main className="app-shell portal-shell">
      <section className="dashboard-shell" aria-live="polite">
        {navbar}
        {studentView === 'home' && (
          <>
            <header className="dashboard-header"><div><p className="eyebrow">Student workspace</p><h1>Your attendance desk.</h1><p className="intro">See your joined classes and mark attendance with the teacher’s code.</p></div><span className="profile-badge">{studentInitial}</span></header>
            <div className="student-class-grid">
              {studentClasses.length ? studentClasses.map((classItem) => (
                <article className="student-class-card" key={classItem.id}>
                  <span className="card-kicker">{classItem.std ? `Standard ${classItem.std}` : `Semester ${classItem.semester}`} / {classItem.course}</span>
                  <h2>{classItem.subject}</h2><p>Teacher: {classItem.teacherName}</p><p>{classItem.teacherEmail}</p>
                  <form className="attendance-form" onSubmit={onMarkAttendance}><label htmlFor={`attendance-${classItem.id}`}>Attendance code</label><input id={`attendance-${classItem.id}`} value={studentCode} onChange={(event) => setStudentCode(event.target.value)} inputMode="numeric" maxLength="6" placeholder="Six digits" /><button className="continue-button" type="submit"><CalendarCheck size={17} />Mark attendance</button></form>
                </article>
              )) : <p className="empty-roster">You have not joined a class yet. Use Join class to enter a teacher’s code.</p>}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </>
        )}

        {studentView === 'join' && (
          <section className="student-subpage"><p className="eyebrow">Join class</p><h1>Enter your joining class code.</h1><p className="intro">Use the six-digit code created by your teacher.</p><form className="student-form" onSubmit={onJoinClass} noValidate><label htmlFor="joinCode">Class code</label><input id="joinCode" value={studentCode} onChange={(event) => setStudentCode(event.target.value)} inputMode="numeric" maxLength="6" placeholder="123456" />{error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button" type="submit"><BookOpen size={17} />Join class</button></form></section>
        )}

        {studentView === 'history' && (
          <section className="student-subpage"><p className="eyebrow">Attendance history</p><h1>Your attendance record.</h1>{error && <p className="form-error" role="alert">{error}</p>}<div className="history-list">{studentHistory.length ? studentHistory.map((record) => <article className="history-row" key={record.id}><strong>{record.class.subject}</strong><span>{record.class.teacherName}</span><time>{new Date(record.attendedAt).toLocaleString()}</time></article>) : <p className="empty-roster">No attendance records yet.</p>}</div></section>
        )}

        {studentView === 'profile' && (
          <section className="student-subpage">
            {studentDetails ? (
              <>
                <p className="eyebrow">Student profile</p>
                <h1>Personal profile.</h1>
                <table className="profile-table">
                  <tbody>
                    <tr><td colSpan="2"><span className="teacher-logo profile-logo">{studentInitial}</span></td></tr>
                    <tr><th scope="row">Email</th><td>{studentDetails.email}</td></tr>
                    <tr><th scope="row">Name</th><td>{studentDetails.name}</td></tr>
                    <tr><th scope="row">Gender</th><td className="profile-value-capital">{studentDetails.gender || 'Not provided'}</td></tr>
                    <tr><th scope="row">Phone</th><td>{studentDetails.phone || 'Not provided'}</td></tr>
                    <tr><th scope="row">Date of birth</th><td>{studentDetails.dob ? new Date(studentDetails.dob).toLocaleDateString() : 'Not provided'}</td></tr>
                    <tr><th scope="row">Enrollment number</th><td>{studentDetails.enrollmentNo || 'Not provided'}</td></tr>
                    <tr><th scope="row">Apartment / Flat</th><td>{studentDetails.address?.apartment || 'Not provided'}</td></tr>
                    <tr><th scope="row">Area</th><td>{studentDetails.address?.area || 'Not provided'}</td></tr>
                    <tr><th scope="row">City</th><td>{studentDetails.address?.city || 'Not provided'}</td></tr>
                  </tbody>
                </table>
              </>
            ) : (
              <><p className="eyebrow">Student profile</p><h1>Your profile is ready.</h1><p className="intro">Your details were captured during registration and are now available here.</p></>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
