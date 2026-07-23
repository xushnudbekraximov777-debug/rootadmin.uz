import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Input, Textarea, Label } from "../ui/input";

export function ContactSection({ email }: { email: string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus("error");
      setError("Please fill in name, email, and message.");
      return;
    }
    setStatus("sending");
    const { error } = await supabase.from("messages").insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
      <div className="mb-10 flex items-center gap-2">
        <span className="text-accent">
          <Mail className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-slate-100">Contact</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-base-600 to-transparent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-slate-400 leading-relaxed">
            Have a project in mind or a network that needs securing? Send a message and I'll get
            back to you. Whether it's network design, server administration, or security consulting,
            I'm open to opportunities.
          </p>
          <div className="mt-6 space-y-3 font-mono text-sm">
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-slate-400 hover:text-accent transition-colors">
              <Mail className="h-4 w-4 text-accent" />
              {email}
            </a>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="glass rounded-xl p-6 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Project inquiry"
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell me about your project..."
              rows={5}
            />
          </div>

          {status === "sent" && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Message sent! I'll get back to you soon.
            </div>
          )}
          {status === "error" && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <Button type="submit" disabled={status === "sending"} className="w-full">
            <Send className="h-4 w-4" />
            {status === "sending" ? "Sending..." : "Send Message"}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
