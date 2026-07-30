import { Award, Users2, Sparkle, Star } from "lucide-react";

const STATS = [
  { icon: Award, value: "+5", label: "Anos de Experiência" },
  { icon: Users2, value: "+10K", label: "Clientes Satisfeitos" },
  { icon: Sparkle, value: "100%", label: "Foco em Qualidade" },
  { icon: Star, value: "5.0", label: "Avaliação Média" },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-widest text-crimson-400">Sobre Nós</span>
      <h1 className="mt-2 text-4xl">A Fórmula da Beleza</h1>
      <p className="mt-6 text-lg text-bone-400">
        Nascemos com o propósito de elevar a autoestima e realçar a beleza de cada cliente com
        qualidade, estilo e atendimento de excelência. Aqui, unimos técnica, paixão e as melhores
        marcas do mercado para entregar resultados que falam por si.
      </p>
      <p className="mt-4 text-lg text-accent-script">"Não é apenas um corte, é sobre atitude e confiança."</p>

      <div className="razor-line mt-10 w-full max-w-xs" />

      <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-card border border-ink-700 bg-ink-800/60 p-5 text-center">
            <s.icon className="mx-auto h-6 w-6 text-gold-400" />
            <p className="mt-3 font-display text-2xl text-bone-50">{s.value}</p>
            <p className="mt-1 text-xs text-bone-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
