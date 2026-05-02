import { useEffect, useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import AppointmentCard from "../components/AppointmentCard";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";

export default function AppointmentHistoryPage() {
  const { authUser } = useAuth();
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    const doctorsSnapshot = await getDocs(collection(db, "doctors"));
    const doctorMap = Object.fromEntries(
      doctorsSnapshot.docs.map((docItem) => [docItem.id, { id: docItem.id, ...docItem.data() }])
    );

    const appointmentQuery = query(collection(db, "appointments"), where("patientId", "==", authUser.uid));
    const appointmentSnapshot = await getDocs(appointmentQuery);

    const list = appointmentSnapshot.docs.map((docItem) => {
      const data = docItem.data();
      const doctor = doctorMap[data.doctorId];

      return {
        id: docItem.id,
        ...data,
        doctorName: doctor?.name || data.doctorName || "Doctor",
        specialization: doctor?.specialization || "General Physician"
      };
    });

    list.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    setAppointments(list);
  };

  useEffect(() => {
    if (authUser) {
      loadAppointments();
    }
  }, [authUser]);

  const cancelAppointment = async (appointmentId) => {
    await updateDoc(doc(db, "appointments", appointmentId), { status: "Cancelled" });
    await loadAppointments();
  };

  return (
    <DashboardLayout title="Appointment History" subtitle="Review and manage your booked appointments.">
      <section className="panel">
        <div className="stack">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment}>
              {appointment.status === "Booked" && (
                <button className="btn btn-danger" onClick={() => cancelAppointment(appointment.id)}>
                  Cancel
                </button>
              )}
            </AppointmentCard>
          ))}
          {!appointments.length && <p className="muted">No appointments found.</p>}
        </div>
      </section>
    </DashboardLayout>
  );
}
