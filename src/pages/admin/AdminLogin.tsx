import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Terminal, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
];

function sanitizeError(msg: string): string {
  const safe = msg.replace(/[<>"'&]/g, "");
  if (/invalid credentials|invalid login|wrong password|not confirmed/i.test(safe))
    return "Invalid email or password.";
  if (/rate limit|too many/i.test(safe)) return "Too many attempts. Please wait a moment.";
  if (/network|fetch|connection/i.test(safe)) return "Network error. Check your connection.";
  return safe;
}

export function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (attempts >= 5) {
      setError("Too many failed attempts. Please reload the page and try again.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setAttempts((a) => a + 1);
      setError(sanitizeError(error));
    } else {
      navigate("/admin/dashboard");
    }
  };

  const passedRules = PASSWORD_RULES.filter((r) => r.test(password)).length;

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </a>

        <div className="glass rounded-xl p-8 border border-base-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-2">
              <Terminal className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-100">Admin Access</h1>
              <p className="text-xs text-slate-500 font-mono">$ auth login</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && passedRules < PASSWORD_RULES.length && (
                <div className="mt-2 space-y-1">
                  {PASSWORD_RULES.map((r) => (
                    <div
                      key={r.label}
                      className={`text-xs flex items-center gap-1.5 ${
                        r.test(password) ? "text-emerald-400" : "text-slate-600"
                      }`}
                    >
                      <span className={r.test(password) ? "✓" : "○"}>{r.test(password) ? "✓" : "○"}</span>
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 font-mono text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading || attempts >= 5} className="w-full">
              <Lock className="h-4 w-4" />
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
