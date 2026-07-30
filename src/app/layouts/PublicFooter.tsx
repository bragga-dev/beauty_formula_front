import { Link } from "react-router-dom";
import { AtSign, Link2, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ROUTES } from "@/constants/routes";

export function PublicFooter() {
  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-bone-500">
            Estilo, confiança e atitude em cada detalhe. Barbearia &amp; salão de beleza.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-600 text-bone-400 transition-colors hover:border-gold-400 hover:text-gold-400">
              <AtSign className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-600 text-bone-400 transition-colors hover:border-gold-400 hover:text-gold-400">
              <Link2 className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gold-400">Navegação</h4>
          <ul className="mt-4 space-y-2 text-sm text-bone-400">
            <li><Link to={ROUTES.services} className="hover:text-bone-100">Serviços</Link></li>
            <li><Link to={ROUTES.team} className="hover:text-bone-100">Nosso Time</Link></li>
            <li><Link to={ROUTES.booking} className="hover:text-bone-100">Agendamento</Link></li>
            <li><Link to={ROUTES.about} className="hover:text-bone-100">Sobre Nós</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gold-400">Horário</h4>
          <ul className="mt-4 space-y-2 text-sm text-bone-400">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-bone-600" /> Seg a Sex: 09h às 20h</li>
            <li className="flex items-center gap-2 pl-6">Sáb: 09h às 18h</li>
            <li className="flex items-center gap-2 pl-6">Dom: Fechado</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gold-400">Contato</h4>
          <ul className="mt-4 space-y-2 text-sm text-bone-400">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-bone-600" /> (11) 99999-9999</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-bone-600" /> Rua das Palmeiras, 123 — Centro</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700 py-5 text-center text-xs text-bone-600">
        © {new Date().getFullYear()} Fórmula da Beleza. Todos os direitos reservados.
      </div>
    </footer>
  );
}
