import { ArrowRight, BookOpen, CalendarCheck, CheckCircle2, UsersRound } from 'lucide-react';

export default function CoverPage({ onSignIn, onSignUp }) {
  return (
    <main className="app-shell cover-shell">
      <section className="cover-page">
        <header className="cover-topbar">
          <div className="cover-brand">
            <span className="cover-brand-mark"><CalendarCheck size={19} /></span>
            <span>Classroom<span className="cover-brand-light"> / attendance</span></span>
          </div>
          <span className="cover-top-note">A clearer way to keep track</span>
        </header>
        <section className="cover-main">
          <div className="cover-copy">
            <p className="eyebrow">Student attendance system</p>
            <h1>Every class.<br />Accounted for.</h1>
            <p className="cover-description">Teachers organize subject classes and attendance. Students join with a class code and keep their attendance history in one place.</p>
            <div className="cover-actions">
              <button className="cover-primary" type="button" onClick={onSignIn}>Sign in <ArrowRight size={17} /></button>
              <button className="cover-secondary" type="button" onClick={onSignUp}>Sign up</button>
            </div>
          </div>
          <aside className="cover-highlights" aria-label="Attendance workflow">
            <p className="cover-highlights-title">A shared classroom workflow</p>
            <div className="cover-highlight"><span><UsersRound size={18} /></span><div><strong>Teacher-led classes</strong><small>Organize students by subject and course.</small></div></div>
            <div className="cover-highlight"><span><BookOpen size={18} /></span><div><strong>Simple class access</strong><small>Students join using a class code.</small></div></div>
            <div className="cover-highlight"><span><CheckCircle2 size={18} /></span><div><strong>Clear attendance records</strong><small>Review submitted attendance and history.</small></div></div>
          </aside>
        </section>
        <footer className="cover-footer">
          <span>For teachers and students</span>
          <button type="button" onClick={onSignIn}>Choose your role <ArrowRight size={15} /></button>
        </footer>
      </section>
    </main>
  );
}
