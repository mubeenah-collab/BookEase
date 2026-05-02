export default function AppointmentCard({ appointment, children }) {
  return (
    <article className="card appointment-card">
      <div className="row between">
        <h3>{appointment.doctorName || appointment.patientName || "Appointment"}</h3>
        <span className={`status status-${appointment.status?.toLowerCase()}`}>{appointment.status}</span>
      </div>
      <p className="muted">Date: {appointment.date}</p>
      <p className="muted">Time: {appointment.time}</p>
      {appointment.specialization && <p className="small-text">Specialization: {appointment.specialization}</p>}
      {children && <div className="row gap mt">{children}</div>}
    </article>
  );
}
