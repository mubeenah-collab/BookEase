# BookEase - Clinic Appointment Booking System

BookEase is a React + Firebase clinic appointment booking platform with role-based dashboards for Patient, Doctor, and Admin users.

## Tech Stack

- React.js (functional components + hooks)
- React Router
- Firebase Authentication
- Firebase Firestore
- Basic CSS

## Folder Structure

src/
- components/
- pages/
- firebase/
- context/
- routes/

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment values:
   - Duplicate `.env.example` to `.env`
   - Fill Firebase values from your Firebase project
3. Start app:
   ```bash
   npm run dev
   ```

## Firebase Requirements

### Authentication
Enable Email/Password sign-in in Firebase Authentication.

### Firestore Collections

- users
  - id
  - name
  - email
  - role (`patient`, `doctor`, `admin`)
- doctors
  - id
  - name
  - specialization
  - availableSlots (array)
- appointments
  - id
  - patientId
  - doctorId
  - date
  - time
  - status (`Booked`, `Completed`, `Cancelled`)

## Role Flows

- Patient:
  - View doctors
  - Book appointment
  - View appointment history
  - Cancel booked appointment
- Doctor:
  - Manage available slots
  - View appointments
  - Mark appointment as Completed/Cancelled
- Admin:
  - Add/update doctors
  - Manage doctor profiles
  - View all appointments

## Double Booking Prevention

Booking uses a deterministic appointment document id (`doctorId_date_time`) and a Firestore transaction. If a non-cancelled appointment already exists for that slot, booking is rejected.

## Notes

- Register page supports selecting role at signup.
- Doctor dashboard auto-creates a doctor profile document for doctor users if missing.
