import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Terminal, ArrowLeft } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";

export function AdminLogin() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else if (mode === "login") {
      navigate("/admin/dashboard");
    } else {
      setError("Account created! You can now log in.");
      setMode("login");
    }
  };

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
              <p className="text-xs text-slate-500 font-mono">
                {mode === "login" ? "$ auth login" : "$ auth register"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 font-mono text-xs">! {error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              <Lock className="h-4 w-4" />
              {loading
                ? "Authenticating..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="text-xs text-slate-500 hover:text-accent transition-colors"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
