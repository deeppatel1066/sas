import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="logout-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="logout-dialog" role="alertdialog" aria-modal="true" aria-labelledby="logout-title" aria-describedby="logout-description">
        <span className="logout-dialog-icon"><LogOut size={21} /></span>
        <h2 id="logout-title">Log out?</h2>
        <p id="logout-description">Are you sure you want to end this session?</p>
        <div className="logout-dialog-actions">
          <button className="logout-cancel" type="button" onClick={onCancel}><X size={16} />No, stay</button>
          <button className="logout-confirm" type="button" onClick={onConfirm}><LogOut size={16} />Yes, log out</button>
        </div>
      </section>
    </div>
  );
}
