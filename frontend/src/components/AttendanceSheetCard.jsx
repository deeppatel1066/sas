import { useState } from 'react';

export default function AttendanceSheetCard({ sheet, onAllow, onAllowAll }) {
  const [isAllowingAll, setIsAllowingAll] = useState(false);
  const pendingCount = sheet.students.filter((student) => student.status === 'pending').length;

  async function handleAllowAll() {
    setIsAllowingAll(true);
    try {
      await onAllowAll(sheet.id);
    } finally {
      setIsAllowingAll(false);
    }
  }

  return (
    <article className="attendance-sheet-card">
      <header className="attendance-sheet-header">
        <div>
          <span className="card-kicker">Class · {sheet.teacherName}</span>
          <h2>{sheet.subject}</h2>
        </div>
        <div className="attendance-sheet-actions">
          {pendingCount > 0 && <button className="allow-button" type="button" onClick={handleAllowAll} disabled={isAllowingAll}>
            {isAllowingAll ? 'Allowing...' : `Allow all (${pendingCount})`}
          </button>}
          <time dateTime={sheet.attendanceDate}>{new Date(`${sheet.attendanceDate}T00:00:00`).toLocaleDateString()}</time>
        </div>
      </header>
      <div className="attendance-table-wrap">
        <table className="attendance-table">
          <thead>
            <tr>
              <th scope="col">Enroll</th>
              <th scope="col">Name</th>
              <th scope="col">Gender</th>
              <th scope="col">Attended in</th>
            </tr>
          </thead>
          <tbody>
            {sheet.students.length > 0 ? sheet.students.map((student) => (
              <tr key={student.id}>
                <td>{student.enrollmentNo}</td>
                <td>{student.name}</td>
                <td>{student.gender}</td>
                <td className="attendance-status-cell">
                  <span className={`attendance-status is-${student.status}`}>{student.status}</span>
                  {student.status === 'pending' && <button className="allow-button" type="button" onClick={() => onAllow(student.requestId)}>Allow</button>}
                </td>
              </tr>
            )) : (
              <tr><td className="attendance-empty" colSpan="4">No students have joined this class.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
