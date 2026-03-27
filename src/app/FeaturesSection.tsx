"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Microphone as Mic,
  ChatCircleText as MessageSquare,
  ChartBar as BarChart2,
  ArrowsClockwise as RefreshCw,
  Brain,
  Target,
  Trophy as Award,
  Users,
  Lightning as Zap,
  TrendUp as TrendingUp,
  ArrowRight,
  Sparkle as Sparkles,
  CheckCircle,
  Star,
} from "@phosphor-icons/react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
} from "framer-motion";
import Link from "next/link";

// ─── Services / Feature cards ───────────────────────────────────────────────

const services = [
  {
    icon: <Target className="w-6 h-6" />,
    secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#1D9E75]/60" />,
    title: "Personalizado por vaga",
    description:
      "Informe a vaga, empresa e nível de experiência. A IA gera perguntas reais — do jeito que o recrutador perguntaria, não perguntas genéricas de tutorial.",
    position: "left",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#1D9E75]/60" />,
    title: "Uma pergunta por vez",
    description:
      "Sem pressão de ver tudo de uma vez. Responda no seu ritmo, como numa entrevista de verdade. Sem distrações, sem julgamento.",
    position: "left",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#1D9E75]/60" />,
    title: "Múltiplos contextos",
    description:
      "Além de entrevistas, simule seminários, apresentações acadêmicas, apresentação pessoal e trabalhos em grupo — tudo em um só lugar.",
    position: "left",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#1D9E75]/60" />,
    title: "Feedback objetivo",
    description:
      "Score de 0 a 100, ponto forte específico e o que melhorar — com linguagem direta. Sem elogio vazio, sem achismo.",
    position: "right",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#1D9E75]/60" />,
    title: "Pratique sem limite",
    description:
      "Cada simulação é única. Mude a empresa, mude a vaga. Quanto mais você pratica, mais natural fica no dia que importa.",
    position: "right",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#1D9E75]/60" />,
    title: "Dica acionável",
    description:
      "Além do feedback geral, cada simulação termina com uma dica concreta para você aplicar amanhã — não daqui a um mês.",
    position: "right",
  },
];

const stats = [
  { icon: <Award className="w-6 h-6" />, value: 94, label: "Taxa de satisfação", suffix: "%" },
  { icon: <Users className="w-6 h-6" />, value: 3, label: "Minutos por simulação", suffix: "min" },
  { icon: <TrendingUp className="w-6 h-6" />, value: 6, label: "Perguntas por sessão", suffix: "" },
  { icon: <Zap className="w-6 h-6" />, value: 5, label: "Contextos disponíveis", suffix: "" },
];

// ─── Framer variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

// ─── ServiceItem ─────────────────────────────────────────────────────────────

function ServiceItem({
  icon,
  secondaryIcon,
  title,
  description,
  delay,
  direction,
}: {
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  direction: "left" | "right";
}) {
  return (
    <motion.div
      className="flex flex-col group"
      variants={itemVariants}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="flex items-center gap-3 mb-2"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className="relative text-[#1D9E75] bg-[#1D9E75]/10 p-3 rounded-xl transition-colors duration-300 group-hover:bg-[#1D9E75]/20 flex-shrink-0"
          whileHover={{ rotate: [0, -8, 8, -4, 0], transition: { duration: 0.4 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#1D9E75] transition-colors duration-300">
          {title}
        </h3>
      </motion.div>
      <motion.p
        className="text-sm text-gray-500 leading-relaxed pl-[60px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

// ─── StatCounter ─────────────────────────────────────────────────────────────

function StatCounter({
  icon,
  value,
  label,
  suffix,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}) {
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, { stiffness: 50, damping: 10 });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    } else if (!isInView && hasAnimated) {
      springValue.set(0);
      setHasAnimated(false);
    }
  }, [isInView, value, springValue, hasAnimated]);

  const displayValue = useTransform(springValue, (v) => Math.floor(v));

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-white transition-colors duration-300 shadow-sm"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-[#1D9E75]/8 flex items-center justify-center mb-3 text-[#1D9E75] group-hover:bg-[#1D9E75]/15 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
      >
        {icon}
      </motion.div>
      <div ref={countRef} className="text-3xl font-bold text-gray-900 flex items-center gap-0.5">
        <motion.span>{displayValue}</motion.span>
        <span className="text-xl">{suffix}</span>
      </div>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
      <motion.div className="w-8 h-0.5 bg-[#1D9E75] mt-3 group-hover:w-14 transition-all duration-300 rounded-full" />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 px-4 overflow-hidden relative"
      style={{
        background: "linear-gradient(to bottom, #f5f5f0, #ffffff)",
      }}
    >
      {/* Decorative blobs */}
      <motion.div
        className="absolute top-16 left-8 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(29,158,117,0.06)", y: y1 }}
      />
      <motion.div
        className="absolute bottom-16 right-8 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(29,158,117,0.05)", y: y2 }}
      />

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Hat / badge — dor do usuário */}
        <motion.div className="flex flex-col items-center mb-5" variants={itemVariants}>
          <motion.span
            className="flex items-center gap-2 text-[#1D9E75] font-semibold text-sm mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Mic className="w-4 h-4" />
            TREINAR COMUNICAÇÃO NÃO PRECISA SER CARO NEM CHATO
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 leading-tight max-w-2xl">
            Tudo que você precisa para chegar preparado
          </h2>
          <motion.div
            className="w-20 h-1 bg-[#1D9E75] mt-5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.div>

        <motion.p
          className="text-center max-w-xl mx-auto mb-16 text-gray-500 text-base leading-relaxed"
          variants={itemVariants}
        >
          Sem fonoaudiólogo caro. Sem curso genérico. Só prática real com feedback
          inteligente para o momento que importa.
        </motion.p>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

          {/* Left cards */}
          <div className="space-y-14">
            {services
              .filter((s) => s.position === "left")
              .map((s, i) => (
                <ServiceItem
                  key={`left-${i}`}
                  icon={s.icon}
                  secondaryIcon={s.secondaryIcon}
                  title={s.title}
                  description={s.description}
                  delay={i * 0.15}
                  direction="left"
                />
              ))}
          </div>

          {/* Center — mobile screenshot */}
          <div className="flex justify-center items-center order-first md:order-none mb-10 md:mb-0">
            <motion.div className="relative w-full max-w-[220px]" variants={itemVariants}>
              {/* Outer border accent */}
              <motion.div
                className="absolute inset-0 border-4 rounded-[2rem] -m-3 z-[-1]"
                style={{ borderColor: "rgba(29,158,117,0.25)" }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              <motion.div
                className="rounded-[1.75rem] overflow-hidden shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                {/* Mobile screenshot — tela de resposta de pergunta */}
                <img
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80&fit=crop"
                  alt="Dicto — simulação no celular"
                  className="w-full object-cover"
                  style={{ aspectRatio: "9/19" }}
                />

                {/* Overlay gradient + CTA */}
                <motion.div
                  className="absolute inset-0 flex items-end justify-center p-4"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(17,19,18,0.75) 0%, transparent 50%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Link href="/hub">
                    <motion.div
                      className="bg-white text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Começar agora <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Floating blobs around image */}
              <motion.div
                className="absolute -top-6 -right-10 w-16 h-16 rounded-full"
                style={{ background: "rgba(29,158,117,0.12)", y: y1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
              />
              <motion.div
                className="absolute -bottom-8 -left-12 w-20 h-20 rounded-full"
                style={{ background: "rgba(29,158,117,0.08)", y: y2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.1 }}
              />
            </motion.div>
          </div>

          {/* Right cards */}
          <div className="space-y-14">
            {services
              .filter((s) => s.position === "right")
              .map((s, i) => (
                <ServiceItem
                  key={`right-${i}`}
                  icon={s.icon}
                  secondaryIcon={s.secondaryIcon}
                  title={s.title}
                  description={s.description}
                  delay={i * 0.15}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((s, i) => (
            <StatCounter
              key={i}
              icon={s.icon}
              value={s.value}
              label={s.label}
              suffix={s.suffix}
              delay={i * 0.1}
            />
          ))}
        </motion.div>

        {/* Bottom CTA banner */}
        <motion.div
          className="mt-16 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white"
          style={{ background: "#111312" }}
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-1">
              Pronto para chegar preparado na entrevista?
            </h3>
            <p className="text-white/70 text-sm">
              Crie sua primeira simulação grátis em menos de 3 minutos.
            </p>
          </div>
          <Link href="/hub">
            <motion.div
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "#1D9E75" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
