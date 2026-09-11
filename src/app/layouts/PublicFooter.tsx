import { Link } from "react-router-dom";
import { MapPin, Phone, Clock } from "lucide-react";
import { PaymentBrands } from "@/components/ui/PaymentBrands";
import { ROUTES } from "@/constants/routes";
import formula1Image from "@/assets/formula-1.jpg";

export function PublicFooter() {
  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <Link to={ROUTES.home} className="flex items-center gap-3">
            <img src={formula1Image} alt="Fórmula da Beleza" className="h-10 w-auto object-contain" />
            <span className="font-display text-lg font-bold text-bone-50">
              Fórmula da Beleza
            </span>
          </Link>
          <p className="mt-4 text-sm text-bone-500">
            Estilo, confiança e atitude em cada detalhe.
          </p>
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
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-bone-600" /> Seg a Sáb: 08h às 19h</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-gold-400">Contato</h4>
          <ul className="mt-4 space-y-2 text-sm text-bone-400">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-bone-600" /> (73) 99887-5268</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-bone-600" /> Av. Franz Gedeon, Centro —  Praça da Bandeira</li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-xs uppercase tracking-widest text-gold-400">Formas de pagamento</h4>
          <PaymentBrands className="mt-4" />
        </div>
      </div>
      <div className="border-t border-ink-700 py-5 text-center text-xs text-bone-600">
        © {new Date().getFullYear()} Fórmula da Beleza. Todos os direitos reservados. · CNPJ 27.766.761/0001-05
      </div>
    </footer>
  );
}