import { ArrowLeft } from 'lucide-react';

export default function RoleSelectionPage({ role, roleDetails, onSelectRole, onContinue, onBack }) {
  return (
    <main className="app-shell">
      <section className="entry-page">
        <button className="text-button role-back" type="button" onClick={onBack}><ArrowLeft size={16} />Back</button>
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
              onClick={() => onSelectRole(value)}
            >
              <span className="role-mark" aria-hidden="true">{value === 'teacher' ? 'T' : 'S'}</span>
              <span className="role-text"><strong>{details.label}</strong><span>{details.description}</span></span>
              <span className="role-arrow" aria-hidden="true">-&gt;</span>
            </button>
          ))}
        </div>
        <button className="continue-button" type="button" disabled={!role} onClick={onContinue}>
          {role ? `Continue as ${roleDetails[role].label}` : 'Select a role to continue'}
        </button>
      </section>
    </main>
  );
}
