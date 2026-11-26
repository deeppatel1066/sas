import { useState } from 'react';
import { BookOpen, Clock3, Home, LogOut, UserRound } from 'lucide-react';
import LogoutConfirmation from './LogoutConfirmation.jsx';

export default function StudentNavbar({ studentInitial, studentView, onHome, onJoin, onHistory, onProfile, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <>
    <nav className="teacher-navbar student-navbar" aria-label="Student navigation">
      <button className="teacher-logo" type="button" title="Student profile" onClick={onProfile}>
        {studentInitial}
      </button>
      <div className="nav-links">
        <button className={studentView === 'home' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onHome}><Home size={16} />Home</button>
        <button className={studentView === 'join' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onJoin}><BookOpen size={16} />Join class</button>
        <button className={studentView === 'history' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onHistory}><Clock3 size={16} />History</button>
        <button className={studentView === 'profile' ? 'nav-link is-active' : 'nav-link'} type="button" onClick={onProfile}><UserRound size={16} />Profile</button>
        <button className="nav-link logout-nav-link" type="button" onClick={() => setConfirmLogout(true)}><LogOut size={16} />Log out</button>
      </div>
    </nav>
    {confirmLogout && <LogoutConfirmation onCancel={() => setConfirmLogout(false)} onConfirm={onLogout} />}
    </>
  );
}
