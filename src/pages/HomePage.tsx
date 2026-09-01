import { Link } from "react-router-dom";
import { CalendarClock, ShieldCheck, Sparkles, Users, ArrowRight, Scissors } from "lucide-react";
import { Carousel } from "@/components/ui/Carousel";
import { ServiceCard } from "@/features/services/ServiceCard";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmployeeCard } from "@/features/team/EmployeeCard";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePublicServices } from "@/hooks/useServices";
import { useTeam } from "@/hooks/useTeam";
import { ROUTES } from "@/constants/routes";
import heroImage from "@/assets/home-salom.jpg";

const FEATURES = [
  { icon: ShieldCheck, title: "Atendimento Premium", desc: "Experiência feita para você, do início ao fim." },
  { icon: Users, title: "Profissionais Experts", desc: "Especialistas em realçar o seu estilo." },
  { icon: Sparkles, title: "Produtos de Qualidade", desc: "Trabalhamos com as melhores marcas do mercado." },
  { icon: CalendarClock, title: "Agendamento Fácil", desc: "Escolha o serviço, o profissional e o horário." },
];

export function HomePage() {
  const { data: servicesPage, isLoading: loadingServices, isError: servicesError, refetch: refetchServices } =
    usePublicServices(1, 10);
  const { data: teamPage, isLoading: loadingTeam, isError: teamError, refetch: refetchTeam } = useTeam(1, 8);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-32 lg:px-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/5 px-4 py-1.5 text-xs uppercase tracking-widest text-gold-400">
              <Scissors className="h-3.5 w-3.5" />  Salão de Beleza
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
            <div className="razor-line mt-10 max-w-xs" />
          </div>
        </div>

        <div className="relative border-t border-ink-700 bg-ink-900/60">
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

        {loadingServices ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : servicesError ? (
          <div className="mt-8">
            <ErrorState onRetry={() => refetchServices()} />
          </div>
        ) : (
          <Carousel className="mt-8" itemClassName="w-[85%] sm:w-[47%] lg:w-[31%]">
            {(servicesPage?.items ?? []).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </Carousel>
        )}
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

          {loadingTeam ? (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : teamError ? (
            <div className="mt-8">
              <ErrorState onRetry={() => refetchTeam()} />
            </div>
          ) : (
            <Carousel className="mt-8" itemClassName="w-[42%] sm:w-[26%] lg:w-[19%]">
              {(teamPage?.items ?? []).map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </Carousel>
          )}
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d968.4175963275967!2d-40.08055473038109!3d-13.858813497095076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x740af4347440833%3A0xd7b7e6c78bcc40b4!2sPra%C3%A7a%20da%20bandeira%2C%20164%20-%20Centro%2C%20Jequi%C3%A9%20-%20BA%2C%2045200-310!5e0!3m2!1spt-BR!2sbr!4v1785977567284!5m2!1spt-BR!2sbr"
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