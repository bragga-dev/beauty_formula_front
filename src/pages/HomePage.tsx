import { Link } from "react-router-dom";
import { CalendarClock, ShieldCheck, Sparkles, Users, ArrowRight, Scissors } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ServiceCard } from "@/features/services/ServiceCard";
import { ServiceCardSkeleton } from "@/features/services/ServiceCardSkeleton";
import { EmployeeCard } from "@/features/team/EmployeeCard";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePublicServices } from "@/hooks/useServices";
import { useTeam } from "@/hooks/useTeam";
import { ROUTES } from "@/constants/routes";

const FEATURES = [
  { icon: ShieldCheck, title: "Atendimento Premium", desc: "Experiência feita para você, do início ao fim." },
  { icon: Users, title: "Profissionais Experts", desc: "Especialistas em realçar o seu estilo." },
  { icon: Sparkles, title: "Produtos de Qualidade", desc: "Trabalhamos com as melhores marcas do mercado." },
  { icon: CalendarClock, title: "Agendamento Fácil", desc: "Escolha o serviço, o profissional e o horário." },
];

export function HomePage() {
  const { data: servicesPage, isLoading: loadingServices, isError: servicesError, refetch: refetchServices } =
    usePublicServices(1, 6);
  const { data: teamPage, isLoading: loadingTeam, isError: teamError, refetch: refetchTeam } = useTeam(1, 4);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/5 px-4 py-1.5 text-xs uppercase tracking-widest text-gold-400">
              <Scissors className="h-3.5 w-3.5" /> Barbearia &amp; Salão
            </span>
            <h1 className="mt-6 text-5xl leading-[1.05] sm:text-6xl">
              Estilo que impõe.
              <br />
              <span className="text-crimson-500">Confiança</span> que fica.
            </h1>
            <p className="mt-3 text-2xl text-accent-script">Mais que um corte, uma experiência.</p>
            <p className="mt-6 max-w-md text-bone-400">
              Na Fórmula da Beleza, unimos técnica, estilo e atendimento de excelência para realçar o que
              você tem de melhor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={ROUTES.booking} size="lg" variant="primary">
                <CalendarClock className="h-4 w-4" /> Agendar Horário
              </ButtonLink>
              <ButtonLink to={ROUTES.services} size="lg" variant="outline">
                Nossos Serviços
              </ButtonLink>
            </div>
            <div className="razor-line mt-10 max-w-xs" />
          </div>

          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-gold-400/20" />
            <div className="absolute inset-8 rounded-full border border-crimson-500/30" />
            <div className="flex h-52 w-52 items-center justify-center rounded-full border-2 border-gold-400 bg-ink-900 shadow-elevated">
              <Scissors className="h-20 w-20 text-crimson-500" strokeWidth={1.2} />
            </div>
          </div>
        </div>

        <div className="border-t border-ink-700 bg-ink-900/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <f.icon className="h-5 w-5 shrink-0 text-gold-400" />
                <div>
                  <p className="font-display text-xs uppercase tracking-wide text-bone-100">{f.title}</p>
                  <p className="mt-0.5 text-xs text-bone-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Serviços em destaque ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-crimson-400">Nossos Serviços</span>
            <h2 className="mt-2 text-3xl">Escolha seu estilo</h2>
          </div>
          <Link to={ROUTES.services} className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300">
            Ver todos os serviços <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingServices &&
            Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          {servicesError && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ErrorState onRetry={() => refetchServices()} />
            </div>
          )}
          {servicesPage?.items.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* ── Time ── */}
      <section className="border-t border-ink-700 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-crimson-400">Nosso Time</span>
              <h2 className="mt-2 text-3xl">Especialistas que fazem a diferença</h2>
            </div>
            <Link to={ROUTES.team} className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300">
              Conhecer equipe <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {loadingTeam &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-card bg-ink-700" />
              ))}
            {teamError && (
              <div className="col-span-2 sm:col-span-4">
                <ErrorState onRetry={() => refetchTeam()} />
              </div>
            )}
            {teamPage?.items.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-card border border-gold-400/30 bg-gradient-to-br from-ink-900 to-ink-800 p-10 text-center sm:p-16">
          <h2 className="text-3xl sm:text-4xl">Pronto para sua melhor versão?</h2>
          <p className="max-w-lg text-bone-400">
            Agende seu horário agora e garanta atendimento com quem entende do assunto.
          </p>
          <ButtonLink to={ROUTES.booking} size="lg" variant="primary">
            <CalendarClock className="h-4 w-4" /> Agendar Agora
          </ButtonLink>
        </div>
      </section>

      {/* ── Localização ── */}
      <section className="border-t border-ink-700 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-crimson-400">Onde Estamos</span>
              <h2 className="mt-2 text-3xl">Venha nos visitar</h2>
            </div>
          </div>

          <div className="mt-8 w-full overflow-hidden rounded-card border border-ink-700">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4615.114594732231!2d-40.079903400000006!3d-13.858839300000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x740af43474a16fb%3A0x511cb8ad7c37e54b!2sFormula%20da%20Beleza!5e1!3m2!1spt-BR!2sbr!4v1785384906142!5m2!1spt-BR!2sbr"
              className="h-[360px] w-full sm:h-[440px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Localização Fórmula da Beleza no Google Maps"
            />
          </div>
        </div>
      </section>
    </div>
  );
}