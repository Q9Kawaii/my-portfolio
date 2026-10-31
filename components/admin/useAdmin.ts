"use client";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/firebase-config";

export type AdminState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "denied"; user: User }
  | { status: "admin"; user: User };

/**
 * Client-side gate for the admin UI. It only controls what is shown:
 * every write is enforced by firestore.rules and every API call
 * re-verifies the ID token on the server.
 */
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (!user) setState({ status: "signed-out" });
        else if (user.emailVerified && isAdminEmail(user.email)) setState({ status: "admin", user });
        else {
          setState({ status: "denied", user });
          void signOut(auth);
        }
      }),
    [],
  );
  return state;
}
