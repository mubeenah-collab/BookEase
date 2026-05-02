import { useEffect, useState } from "react";
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";

export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { authUser, profile } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      const snapshot = await getDoc(doc(db, "doctors", doctorId));
      if (snapshot.exists()) {
        setDoctor({ id: snapshot.id, ...snapshot.data() });
      }
    };

    loadDoctor();
  }, [doctorId]);

  const handleBook = async (event) => {
    event.preventDefault();
    setError("");

    if (!date || !time) {
      setError("Please select a date and time slot.");
      return;
    }

    setLoading(true);

    try {
      const appointmentId = `${doctorId}_${date}_${time}`.replace(/\s+/g, "_");
      const appointmentRef = doc(db, "appointments", appointmentId);

      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(appointmentRef);

        if (existing.exists() && existing.data().status !== "Cancelled") {
          throw new Error("This slot is already booked.");
        }

        transaction.set(appointmentRef, {
          id: appointmentId,
          patientId: authUser.uid,
          patientName: profile?.name || "Patient",
          doctorId,
          doctorName: doctor?.name || "Doctor",
          date,
          time,
          status: "Booked",
          createdAt: serverTimestamp()
        });
      });

      navigate("/appointments");
    } catch (err) {
      setError(err.message || "Unable to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <DashboardLayout title="Book Appointment" subtitle="Loading doctor details...">
        <section className="panel">Loading...</section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Book with Dr. ${doctor.name}`}
      subtitle={`Specialization: ${doctor.specialization || "General Physician"}`}
    >
      <section className="panel narrow">
        <form className="form" onSubmit={handleBook}>
          <label>Date</label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />

          <label>Available Slot</label>
          <select value={time} onChange={(event) => setTime(event.target.value)} required>
            <option value="">Select a slot</option>
            {(doctor.availableSlots || []).map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          {error && <p className="error">{error}</p>}

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </section>
    </DashboardLayout>
  );
}
