import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/app/providers/toast-context";

export function ContactPage() {
  const { push } = useToast();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Não existe endpoint de contato na API — a mensagem é apenas
    // simulada localmente. Trocar por chamada real quando disponível.
    setTimeout(() => {
      setSubmitting(false);
      push("Mensagem enviada! Retornaremos em breve.", "success");
      (e.target as HTMLFormElement).reset();
    }, 900);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-widest text-crimson-400">Fale Conosco</span>
      <h1 className="mt-2 text-4xl">Entre em Contato</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Nome completo" placeholder="Digite seu nome" required />
            <Input label="E-mail" type="email" placeholder="Digite seu e-mail" required />
          </div>
          <Select label="Assunto" defaultValue="">
            <option value="" disabled>Selecione um assunto</option>
            <option value="agendamento">Agendamento</option>
            <option value="duvida">Dúvida</option>
            <option value="elogio">Elogio</option>
            <option value="reclamacao">Reclamação</option>
          </Select>
          <Textarea label="Mensagem" placeholder="Digite sua mensagem" required rows={5} />
          <Button type="submit" isLoading={submitting} size="lg">
            <Send className="h-4 w-4" /> Enviar Mensagem
          </Button>
        </form>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <Phone className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Telefone / WhatsApp</p>
              <p className="text-sm text-bone-500">(11) 99999-9999</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <Mail className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">E-mail</p>
              <p className="text-sm text-bone-500">contato@formuladabeleza.com.br</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <MapPin className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Endereço</p>
              <p className="text-sm text-bone-500">Rua das Palmeiras, 123 — Centro, São Paulo/SP</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <Clock className="h-5 w-5 shrink-0 text-gold-400" />
            <div>
              <p className="text-sm text-bone-100">Horário</p>
              <p className="text-sm text-bone-500">Seg a Sex: 09h–20h · Sáb: 09h–18h · Dom: Fechado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
