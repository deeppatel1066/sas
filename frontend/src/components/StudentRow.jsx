export default function StudentRow({ student }) {
  return (
    <div className="student-row">
      <span><small>Enrollment no.</small><strong>{student.enrollmentNo}</strong></span>
      <span><small>Name</small><strong>{student.name}</strong></span>
      <span><small>Gender</small><strong>{student.gender}</strong></span>
      <span><small>Phone</small><strong>{student.phone}</strong></span>
    </div>
  );
}
