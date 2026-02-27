import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me, type SafeUser } from "../api/auth";
import { clearToken } from "../auth/token";

export default function AppPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearToken();
    navigate("/signin", { replace: true });
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const u = await me();
        if (!cancelled) setUser(u);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";
        if (!cancelled) {
          setError(message);
          //   ProtectedRoute already validates via /auth/me so AppPage doesn’t need to logout on error
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-semibold">Auth Task</div>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome to the application.
          </h1>

          {loading && <p className="text-gray-500">Loading your profile...</p>}

          {!loading && user && (
            <div className="mt-4 space-y-1 text-gray-700">
              <p>
                Signed in as <span className="font-semibold">{user.name}</span>
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}

          {!loading && error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
