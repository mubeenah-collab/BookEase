import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import DoctorCard from "../components/DoctorCard";
import AppointmentCard from "../components/AppointmentCard";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { getOrSeedDoctors } from "../firebase/doctorsService";

export default function PatientDashboard() {
  const { authUser, profile } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const doctorList = await getOrSeedDoctors();
      setDoctors(doctorList);

      const appointmentQuery = query(
        collection(db, "appointments"),
        where("patientId", "==", authUser.uid)
      );
      const appointmentSnapshot = await getDocs(appointmentQuery);
      const list = appointmentSnapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      list.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
      setAppointments(list.slice(0, 3));
    };

    if (authUser) {
      loadData();
    }
  }, [authUser]);

  return (
    <DashboardLayout
      title={`Hello, ${profile?.name || "Patient"}`}
      subtitle="Find doctors, book slots, and keep track of your appointments."
      actions={
        <Link className="btn btn-primary" to="/doctors">
          Explore Doctors
        </Link>
      }
    >
      <section className="grid two-col">
        <div className="panel">
          <h2>Top Doctors</h2>
          <div className="card-grid">
            {doctors.slice(0, 3).map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
            {!doctors.length && <p className="muted">No doctors available yet.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="row between">
            <h2>Recent Appointments</h2>
            <Link to="/appointments">View All</Link>
          </div>
          <div className="stack">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
            {!appointments.length && <p className="muted">No appointments booked yet.</p>}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
