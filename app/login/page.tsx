"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Diese Seite selbst zeigt nichts an — AuthGate fängt sie ab, solange keine
// Sitzung besteht, und zeigt dort das Login/Registrieren-Formular
// (siehe components/AuthGate.tsx). Ist man schon eingeloggt und landet
// trotzdem hier (z.B. Lesezeichen), geht es direkt ins Dashboard weiter.
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
