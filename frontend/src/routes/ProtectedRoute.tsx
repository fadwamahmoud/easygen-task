import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, clearToken } from "../auth/token";
import { me } from "../api/auth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  // later redirect back after signin
  const location = useLocation();
  const token = getToken();

  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await me();
        if (!cancelled) setStatus("ok");
      } catch {
        if (!cancelled) {
          clearToken();
          setStatus("fail");
        }
      }
    })();

    return () => {
      // avoids setting state after unmount
      cancelled = true;
    };
  }, [token]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4">
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (status === "fail") {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
