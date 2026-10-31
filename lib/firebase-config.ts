// Firebase web config is public by design (security comes from Firestore rules),
// so the committed values act as a fallback when env vars are not set.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBK96MEX37D9pMI-6D8vO1fbQ46vknSikw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "myportfolio-q9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "myportfolio-q9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "myportfolio-q9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "128961410653",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:128961410653:web:c7fda775cbf915d825ffb4",
};

const rawAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "yashdingar17@gmail.com";

/** Emails allowed into the admin dashboard. Must match firestore.rules. */
export const ADMIN_EMAILS = rawAdmins
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());
