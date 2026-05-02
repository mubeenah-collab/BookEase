import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import AppointmentCard from "../components/AppointmentCard";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";

export default function DoctorDashboard() {
  const { authUser, profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [slotInput, setSlotInput] = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);

  const doctorRef = authUser ? doc(db, "doctors", authUser.uid) : null;

  const loadDashboard = async () => {
    if (!authUser || !doctorRef) {
      return;
    }

    await setDoc(
      doctorRef,
      {
        id: authUser.uid,
        name: profile?.name || "Doctor",
        specialization: "General Physician",
        availableSlots: []
      },
      { merge: true }
    );

    const doctorSnapshot = await getDocs(query(collection(db, "doctors"), where("id", "==", authUser.uid)));
    const currentDoctor = doctorSnapshot.docs[0]?.data();
    setDoctorProfile(currentDoctor || null);

    const appointmentQuery = query(collection(db, "appointments"), where("doctorId", "==", authUser.uid));
    const appointmentSnapshot = await getDocs(appointmentQuery);
    const list = appointmentSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    list.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    setAppointments(list);
  };

  useEffect(() => {
    if (authUser) {
      loadDashboard();
    }
  }, [authUser]);

  const updateStatus = async (appointmentId, status) => {
    await updateDoc(doc(db, "appointments", appointmentId), { status });
    await loadDashboard();
  };

  const addSlot = async () => {
    const trimmed = slotInput.trim();
    if (!trimmed || !doctorRef) {
      return;
    }

    await updateDoc(doctorRef, {
      availableSlots: arrayUnion(trimmed)
    });

    setSlotInput("");
    await loadDashboard();
  };

  const removeSlot = async (slot) => {
    if (!doctorRef) {
      return;
    }

    await updateDoc(doctorRef, {
      availableSlots: arrayRemove(slot)
    });

    await loadDashboard();
  };

  return (
    <DashboardLayout
      title={`Doctor Dashboard - ${profile?.name || "Doctor"}`}
      subtitle="Manage your availability and patient appointments."
    >
      <section className="grid two-col">
        <div className="panel">
          <h2>Available Slots</h2>
          <div className="row gap">
            <input
              type="text"
              placeholder="e.g. 10:00 AM"
              value={slotInput}
              onChange={(event) => setSlotInput(event.target.value)}
            />
            <button className="btn btn-primary" onClick={addSlot}>
              Add Slot
            </button>
          </div>

          <div className="slot-list mt">
            {(doctorProfile?.availableSlots || []).map((slot) => (
              <div key={slot} className="row between slot-item">
                <span>{slot}</span>
                <button className="btn btn-danger" onClick={() => removeSlot(slot)}>
                  Remove
                </button>
              </div>
            ))}
            {!(doctorProfile?.availableSlots || []).length && (
              <p className="muted">No slots configured yet.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Appointments</h2>
          <div className="stack">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment}>
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(appointment.id, "Completed")}
                  disabled={appointment.status !== "Booked"}
                >
                  Complete
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => updateStatus(appointment.id, "Cancelled")}
                  disabled={appointment.status !== "Booked"}
                >
                  Cancel
                </button>
              </AppointmentCard>
            ))}
            {!appointments.length && <p className="muted">No appointments assigned.</p>}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
