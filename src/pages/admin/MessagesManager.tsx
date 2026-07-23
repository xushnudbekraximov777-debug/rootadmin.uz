import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Reply, Inbox } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Message } from "../../lib/types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogTitle } from "../../components/ui/dialog";
import { Table, THead, Th, TBody, Tr, Td } from "../../components/ui/table";

export function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (msg: Message, read: boolean) => {
    await supabase.from("messages").update({ read }).eq("id", msg.id);
    await load();
    if (selected?.id === msg.id) setSelected({ ...msg, read });
  };

  const remove = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    if (selected?.id === id) setSelected(null);
    await load();
  };

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (!msg.read) {
      await supabase.from("messages").update({ read: true }).eq("id", msg.id);
      await load();
    }
  };

  if (loading) return <div className="font-mono text-accent animate-pulse">loading...</div>;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Inbox
          {unread > 0 && <Badge variant="warning" className="ml-3">{unread} unread</Badge>}
        </h1>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">// No messages yet.</p>
        </div>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <THead>
                <Tr>
                  <Th>Status</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Subject</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {messages.map((m) => (
                  <Tr key={m.id} className="cursor-pointer" onClick={() => openMessage(m)}>
                    <Td>
                      {m.read ? (
                        <MailOpen className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Mail className="h-4 w-4 text-accent" />
                      )}
                    </Td>
                    <Td className="font-medium text-slate-200">{m.name}</Td>
                    <Td className="font-mono text-xs">{m.email}</Td>
                    <Td>{m.subject || "—"}</Td>
                    <Td className="font-mono text-xs text-slate-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </Td>
                    <Td>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => markRead(m, !m.read)} className="text-slate-500 hover:text-accent" title={m.read ? "Mark unread" : "Mark read"}>
                          {m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                        </button>
                        <a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="text-slate-500 hover:text-accent" title="Reply">
                          <Reply className="h-4 w-4" />
                        </a>
                        <button onClick={() => remove(m.id)} className="text-slate-500 hover:text-red-400" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <DialogTitle>{selected.subject || "(no subject)"}</DialogTitle>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">From: <span className="text-slate-200">{selected.name}</span></span>
                <span className="text-slate-500 font-mono text-xs">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <a href={`mailto:${selected.email}`} className="text-xs text-accent hover:underline">{selected.email}</a>
              <div className="rounded-md border border-base-700 bg-base-900 p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
              <div className="flex gap-2 pt-2">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}>
                  <Button><Reply className="h-4 w-4" /> Reply via Email</Button>
                </a>
                <Button variant="danger" onClick={() => remove(selected.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
