import { useState } from "react";
import { UserPlus, CheckCircle2, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
];

export function AdminsManager() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<"idle" | "creating" | "created" | "error">("idle");
  const [message, setMessage] = useState("");
  const [createdAdmins, setCreatedAdmins] = useState<string[]>([]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setStatus("creating");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (PASSWORD_RULES.some((r) => !r.test(password))) {
      setStatus("error");
      setMessage("Password does not meet all requirements.");
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setStatus("error");
        setMessage("Authentication error. Please re-login.");
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(result.error || "Failed to create admin.");
      } else {
        setStatus("created");
        setCreatedAdmins((prev) => [...prev, email]);
        setEmail("");
        setPassword("");
        setMessage(`Admin account created for ${result.user.email}`);
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const passedRules = PASSWORD_RULES.filter((r) => r.test(password)).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Manage Admins</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-accent" />
              Create New Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="newadmin@example.com"
                  required
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
                        <span>{r.test(password) ? "✓" : "○"}</span>
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {status === "created" && (
                <div className="flex items-start gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-start gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <Button type="submit" disabled={status === "creating"} className="w-full">
                <UserPlus className="h-4 w-4" />
                {status === "creating" ? "Creating..." : "Create Admin Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Admin Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Current admin</span>
                <span className="font-mono text-accent text-xs">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Public registration</span>
                <span className="font-mono text-red-400">Disabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session type</span>
                <span className="font-mono text-slate-300">Browser-session</span>
              </div>
              {createdAdmins.length > 0 && (
                <div className="pt-4 border-t border-base-700">
                  <p className="text-xs text-slate-500 mb-2">Recently created:</p>
                  {createdAdmins.map((a) => (
                    <p key={a} className="font-mono text-xs text-accent">{a}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
