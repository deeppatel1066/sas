import { CheckCircle2, CircleX, X } from 'lucide-react';

export default function StatusPopup({ success, title, message, details, onClose }) {
  const Icon = success ? CheckCircle2 : CircleX;

  return (
    <div
      className="status-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="status-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="status-title"
        aria-describedby="status-message"
      >
        <div className={success ? 'status-icon success' : 'status-icon error'}>
          <Icon size={30} />
        </div>
        <h2 id="status-title">{title}</h2>
        <p id="status-message" className="status-message">{message}</p>
        {details && <p className="status-details">{details}</p>}
        <button className="status-close" type="button" onClick={onClose}>
          <X size={15} />
          {success ? 'Continue' : 'Try again'}
        </button>
      </section>
    </div>
  );
}
