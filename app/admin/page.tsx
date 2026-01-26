"use client";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const email = res.user.email;
    if (email === "yashdingar17@gmail.com") router.push("/admin/dashboard");
    else alert("Unauthorized — use admin email");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white/5 rounded-xl">
        <h2 className="text-2xl mb-4 text-white">Admin Login</h2>
        <button
          onClick={handleGoogle}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
