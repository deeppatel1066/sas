import { useState } from 'react';
import { CalendarCheck, FilePlus2, Home, LogOut, UserRound, UsersRound } from 'lucide-react';
import LogoutConfirmation from './LogoutConfirmation.jsx';

export default function TeacherNavbar({ teacherInitial, teacherView, onHome, onStudents, onCreate, onAttendance, onProfile, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <>
    <nav className="teacher-navbar" aria-label="Teacher navigation">
      <button className="teacher-logo" type="button" title="Teacher profile" onClick={onProfile}>
        {teacherInitial}
      </button>
      <div className="nav-links">
        <button className={teacherView === 'home' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onHome}><Home size={16} />Home</button>
        <button className={teacherView === 'students' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onStudents}><UsersRound size={16} />Students</button>
        <button className={teacherView === 'create' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onCreate}><FilePlus2 size={16} />Create class</button>
        <button className={teacherView === 'sheets' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onAttendance}><CalendarCheck size={16} />Attendance</button>
        <button className={teacherView === 'profile' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onProfile}><UserRound size={16} />Profile</button>
        <button className="nav-link logout-nav-link" type="button" onClick={() => setConfirmLogout(true)}><LogOut size={16} />Log out</button>
      </div>
    </nav>
    {confirmLogout && <LogoutConfirmation onCancel={() => setConfirmLogout(false)} onConfirm={onLogout} />}
    </>
  );
}
