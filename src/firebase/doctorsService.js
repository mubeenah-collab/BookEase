import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_DOCTORS = [
  {
    id: "doctor_amina",
    name: "Dr. Amina Patel",
    specialization: "Cardiology",
    availableSlots: ["09:00 AM", "10:30 AM", "02:00 PM"]
  },
  {
    id: "doctor_james",
    name: "Dr. James Cooper",
    specialization: "Dermatology",
    availableSlots: ["11:00 AM", "01:30 PM", "03:30 PM"]
  },
  {
    id: "doctor_li",
    name: "Dr. Li Wen",
    specialization: "Pediatrics",
    availableSlots: ["08:30 AM", "12:00 PM", "04:00 PM"]
  },
  {
    id: "doctor_sofia",
    name: "Dr. Sofia Romero",
    specialization: "Orthopedics",
    availableSlots: ["09:30 AM", "01:00 PM", "05:00 PM"]
  },
  {
    id: "doctor_elena",
    name: "Dr. Elena Novak",
    specialization: "Neurology",
    availableSlots: ["09:15 AM", "11:45 AM", "03:00 PM"]
  },
  {
    id: "doctor_omar",
    name: "Dr. Omar Rahman",
    specialization: "ENT",
    availableSlots: ["10:00 AM", "12:30 PM", "04:30 PM"]
  },
  {
    id: "doctor_hana",
    name: "Dr. Hana Kim",
    specialization: "Gynecology",
    availableSlots: ["08:45 AM", "01:15 PM", "05:15 PM"]
  },
  {
    id: "doctor_miguel",
    name: "Dr. Miguel Santos",
    specialization: "Ophthalmology",
    availableSlots: ["09:00 AM", "02:15 PM", "06:00 PM"]
  },
  {
    id: "doctor_nora",
    name: "Dr. Nora Alvi",
    specialization: "Endocrinology",
    availableSlots: ["10:15 AM", "01:45 PM", "04:45 PM"]
  },
  {
    id: "doctor_isaac",
    name: "Dr. Isaac Mensah",
    specialization: "Pulmonology",
    availableSlots: ["09:45 AM", "12:15 PM", "03:45 PM"]
  },
  {
    id: "doctor_priya",
    name: "Dr. Priya Nair",
    specialization: "Nephrology",
    availableSlots: ["08:00 AM", "11:30 AM", "02:30 PM"]
  },
  {
    id: "doctor_ryan",
    name: "Dr. Ryan Holt",
    specialization: "Gastroenterology",
    availableSlots: ["10:00 AM", "01:00 PM", "05:30 PM"]
  }
];

export async function getOrSeedDoctors() {
  const doctorsRef = collection(db, "doctors");
  const snapshot = await getDocs(doctorsRef);
  const existingDoctors = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
  const existingIds = new Set(existingDoctors.map((doctor) => doctor.id));
  const missingDoctors = DEFAULT_DOCTORS.filter((doctor) => !existingIds.has(doctor.id));

  if (!missingDoctors.length) {
    return existingDoctors;
  }

  const batch = writeBatch(db);

  missingDoctors.forEach((doctor) => {
    batch.set(doc(db, "doctors", doctor.id), doctor);
  });

  await batch.commit();

  return [...existingDoctors, ...missingDoctors];
}
