import { useState, type FormEvent } from "react";
import { Phone, Mail, MapPin, Clock, Send, AtSign, FileText } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/app/providers/toast-context";
import { useCreateContact } from "@/hooks/useContacts";
import { CONTACT_SUBJECT_LABELS } from "@/types/contact";
import type { ContactSubject } from "@/types/contact";
import type { ApiError } from "@/types/common";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  subject: "" as ContactSubject | "",
  message: "",
};

export function ContactPage() {
  const { push } = useToast();
  const { mutateAsync, isPending } = useCreateContact();
  const [form, setForm] = useState(EMPTY_FORM);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.subject) {
      push("Selecione um assunto.", "error");
      return;
    }
    try {
      await mutateAsync({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      });
      push("Mensagem enviada! Retornaremos em breve.", "success");
      setForm(EMPTY_FORM);
    } catch (err) {
      const detail = (err as ApiError).detail;
      push(typeof detail === "string" ? detail : "Não foi possível enviar sua mensagem.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-widest text-crimson-400">Fale Conosco</span>
      <h1 className="mt-2 text-4xl">Entre em Contato</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Nome completo"
              placeholder="Digite seu nome"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Telefone / WhatsApp"
            placeholder="(xx) xxxxx-xxxx"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
          <Select
            label="Assunto"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value as ContactSubject }))}
            required
          >
            <option value="" disabled>
              Selecione um assunto
            </option>
            {Object.entries(CONTACT_SUBJECT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Textarea
            label="Mensagem"
            placeholder="Digite sua mensagem"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            required
            rows={5}
          />
          <Button type="submit" isLoading={isPending} size="lg">
            <Send className="h-4 w-4" /> Enviar Mensagem
          </Button>
        </form>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <Phone className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Telefone / WhatsApp</p>
              <p className="text-sm text-bone-500">(73) 99887-5268</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <Mail className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">E-mail</p>
              <p className="text-sm text-bone-500">raphaela789@hotmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <MapPin className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Endereço</p>
              <p className="text-sm text-bone-500">Av. Franz Gedeon, Centro —  Praça da Bandeira — Jequié / Ba</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <Clock className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Horário</p>
              <p className="text-sm text-bone-500">Seg a Sáb: 08h–19h </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <AtSign className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Instagram</p>
              <a
                href="https://www.instagram.com/_formuladabeleza/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone-500 hover:text-gold-400"
              >
                @_formuladabeleza
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <FileText className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">CNPJ</p>
              <p className="text-sm text-bone-500">27.766.761/0001-05</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}