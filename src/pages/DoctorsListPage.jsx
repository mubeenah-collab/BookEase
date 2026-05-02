import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DoctorCard from "../components/DoctorCard";
import { getOrSeedDoctors } from "../firebase/doctorsService";

export default function DoctorsListPage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const loadDoctors = async () => {
      const list = await getOrSeedDoctors();
      setDoctors(list);
    };

    loadDoctors();
  }, []);

  return (
    <DashboardLayout
      title="Doctors"
      subtitle="Browse all doctors and reserve an available appointment slot."
    >
      <section className="panel">
        <div className="card-grid">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
          {!doctors.length && <p className="muted">No doctors found.</p>}
        </div>
      </section>
    </DashboardLayout>
  );
}
