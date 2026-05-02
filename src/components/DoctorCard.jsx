import { Link } from "react-router-dom";

export default function DoctorCard({ doctor, showBookButton = true }) {
  return (
    <article className="card">
      <div className="badge">Doctor</div>
      <h3>{doctor.name}</h3>
      <p className="muted">{doctor.specialization || "General Physician"}</p>
      <p className="small-text">Slots: {(doctor.availableSlots || []).join(", ") || "No slots added"}</p>

      {showBookButton && (
        <Link to={`/book/${doctor.id}`} className="btn btn-primary">
          Book Appointment
        </Link>
      )}
    </article>
  );
}
