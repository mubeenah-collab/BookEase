import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import DashboardLayout from "../components/DashboardLayout";
import AppointmentCard from "../components/AppointmentCard";
import { db } from "../firebase/firebase";
import { getOrSeedDoctors } from "../firebase/doctorsService";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    linkedUserId: ""
  });

  const loadData = async () => {
    const usersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "patient")));
    const appointmentsSnapshot = await getDocs(collection(db, "appointments"));

    const doctorList = await getOrSeedDoctors();
    const patientMap = Object.fromEntries(usersSnapshot.docs.map((docItem) => [docItem.id, docItem.data()]));

    const appointmentList = appointmentsSnapshot.docs.map((docItem) => {
      const appointment = docItem.data();
      return {
        id: docItem.id,
        ...appointment,
        patientName: patientMap[appointment.patientId]?.name || appointment.patientName || "Patient"
      };
    });

    appointmentList.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

    setDoctors(doctorList);
    setAppointments(appointmentList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addDoctor = async (event) => {
    event.preventDefault();
    const doctorId = form.linkedUserId.trim() || `doctor_${Date.now()}`;

    await setDoc(
      doc(db, "doctors", doctorId),
      {
        id: doctorId,
        name: form.name,
        specialization: form.specialization,
        availableSlots: []
      },
      { merge: true }
    );

    setForm({ name: "", specialization: "", linkedUserId: "" });
    await loadData();
  };

  const updateDoctor = async (doctorId, payload) => {
    await updateDoc(doc(db, "doctors", doctorId), payload);
    await loadData();
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage doctors and monitor all clinic appointments.">
      <section className="grid two-col">
        <div className="panel">
          <h2>Add Doctor</h2>
          <form className="form" onSubmit={addDoctor}>
            <input
              type="text"
              placeholder="Doctor name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Specialization"
              value={form.specialization}
              onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Linked user id (optional)"
              value={form.linkedUserId}
              onChange={(event) => setForm((prev) => ({ ...prev, linkedUserId: event.target.value }))}
            />
            <button className="btn btn-primary">Add / Update Doctor</button>
          </form>
        </div>

        <div className="panel">
          <h2>Manage Doctor Profiles</h2>
          <div className="stack">
            {doctors.map((doctor) => (
              <article className="card" key={doctor.id}>
                <input
                  type="text"
                  value={doctor.name}
                  onChange={(event) =>
                    setDoctors((prev) =>
                      prev.map((item) =>
                        item.id === doctor.id ? { ...item, name: event.target.value } : item
                      )
                    )
                  }
                />
                <input
                  type="text"
                  value={doctor.specialization}
                  onChange={(event) =>
                    setDoctors((prev) =>
                      prev.map((item) =>
                        item.id === doctor.id ? { ...item, specialization: event.target.value } : item
                      )
                    )
                  }
                />
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    updateDoctor(doctor.id, {
                      name: doctor.name,
                      specialization: doctor.specialization
                    })
                  }
                >
                  Save Profile
                </button>
              </article>
            ))}
            {!doctors.length && <p className="muted">No doctor profiles yet.</p>}
          </div>
        </div>
      </section>

      <section className="panel mt">
        <h2>All Appointments</h2>
        <div className="stack">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
          {!appointments.length && <p className="muted">No appointments in the system.</p>}
        </div>
      </section>
    </DashboardLayout>
  );
}
