import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, HeartPulse, Sparkles, ChevronRight } from "lucide-react";
import Container from "../components/layout/Container";
import pharmacyImage from "../assets/para.png";
import pharmacistImage from "../assets/Compounding Pharmacy Corpus Christi.png";
import interiorImage from "../assets/Nord Parisien - Inside Pharmacy.png";

// Reusable reveal animation
function Reveal({ children, className = "", delay = 0, direction = "up" }) {
  const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;
  const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans selection:bg-[#0ea5e9] selection:text-white">
      
      {/* 1. HERO PARALLAX SECTION */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-[#0ea5e9]">
        {/* Parallax Background */}
        <motion.div style={{ y: yHero }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0ea5e9]/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0ea5e9] via-transparent to-transparent z-10" />
          <img
            src={interiorImage}
            alt="Intérieur Pharmacie"
            className="h-full w-full object-cover opacity-80"
          />
        </motion.div>

        {/* Content */}
        <Container className="relative z-20 flex h-full flex-col items-center justify-center text-center">
          <Reveal delay={100} direction="up">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              L'art du soin
            </span>
          </Reveal>
          
          <Reveal delay={200} direction="up">
            <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Votre santé & beauté, notre signature.
            </h1>
          </Reveal>
          
          <Reveal delay={300} direction="up">
            <p className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-blue-100 sm:text-xl">
              Nous réinventons l'expérience parapharmacie. Un espace où l'expertise scientifique rencontre le raffinement des meilleurs soins dermo-cosmétiques.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 2. ÉDITORIAL & HISTOIRE */}
      <section className="relative z-20 -mt-16 pb-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left Image Column */}
            <div className="relative">
              <Reveal className="h-full">
                <div className="group relative h-full min-h-[500px] overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(14,165,233,0.15)]">
                  <img
                    src={pharmacyImage}
                    alt="Devanture Parapharmacie"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0ea5e9]/80 via-transparent to-transparent" />
                  
                  {/* Glass Card on Image */}
                  <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
                    <p className="text-xl font-medium text-white">"La beauté commence au moment où vous décidez d'être vous-même."</p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Text Column */}
            <div className="flex flex-col justify-center pt-8">
              <Reveal delay={100} direction="left">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#0ea5e9]/60">
                  Notre Histoire
                </p>
                <h2 className="mb-8 text-4xl font-bold leading-tight tracking-tight text-[#0ea5e9] md:text-5xl">
                  L'excellence comme <br/> point de départ.
                </h2>
                
                <div className="space-y-6 text-lg text-slate-600">
                  <p className="leading-relaxed">
                    Née d'une passion pour la santé et le bien-être, notre parapharmacie a été conçue comme un écrin de pureté. Nous sélectionnons chaque produit avec la plus grande rigueur, privilégiant les laboratoires qui partagent notre vision d'une efficacité saine et transparente.
                  </p>
                  <p className="leading-relaxed">
                    Plus qu'un simple point de vente, nous sommes un lieu de conseil. Nos experts dédient leur temps à comprendre votre peau, votre corps et vos attentes pour créer une approche sur-mesure.
                  </p>
                </div>

                <div className="mt-12 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-[#0ea5e9]">15+</span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Années d'expertise</span>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-[#0ea5e9]">5k+</span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Produits certifiés</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. EXPERTISE & VALEURS (GLASSMORPHISM CARDS) */}
      <section className="bg-[#eff6ff] py-32 rounded-[3rem] mx-4 sm:mx-8 my-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#dbeafe] to-transparent pointer-events-none" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal>
              <h2 className="text-4xl font-bold tracking-tight text-[#0ea5e9] md:text-5xl">Nos piliers fondateurs</h2>
              <p className="mt-6 text-lg text-slate-600">L'ambition de vous offrir ce qu'il y a de meilleur, sans compromis.</p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Sélection Rigoureuse",
                desc: "Tous nos produits respectent des chartes de qualité strictes et sont issus de laboratoires de confiance."
              },
              {
                icon: <HeartPulse className="h-8 w-8" />,
                title: "Conseil Pharmacien",
                desc: "Notre équipe est diplômée et formée pour répondre à toutes vos problématiques de santé et beauté."
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Efficacité Naturelle",
                desc: "Nous soutenons la dermo-cosmétique éco-responsable et les formulations hautement naturelles."
              }
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 150} direction="up">
                <div className="group h-full rounded-[2.5rem] bg-white/70 p-10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_40px_rgba(14,165,233,0.08)] border border-white">
                  <div className="mb-8 inline-flex rounded-2xl bg-[#0ea5e9] p-4 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-[#0ea5e9]">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. THE TEAM */}
      <section className="py-24">
        <Container>
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <Reveal direction="right">
                <h2 className="text-4xl font-bold tracking-tight text-[#0ea5e9] md:text-5xl mb-6">
                  Rencontrez nos spécialistes.
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-8">
                  Chaque personne de notre officine apporte son expertise. Qu'il s'agisse 
                  de soins capillaires, de routines anti-âge, ou de compléments alimentaires, 
                  ils sauront orienter votre choix avec justesse et bienveillance.
                </p>

                <ul className="space-y-5">
                  {[
                    "Consultations personnalisées",
                    "Aide à la lecture des compositions (INCI)",
                    "Démonstrations produits"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16a34a]/10 text-[#16a34a]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-medium text-slate-800">{text}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-12">
                  <Link
                    to="/info/contact"
                    className="inline-flex items-center gap-2 border-b-2 border-[#0ea5e9] pb-1 text-lg font-bold text-[#0ea5e9] transition-all hover:text-[#16a34a] hover:border-[#16a34a]"
                  >
                    Demander conseil
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </Reveal>
            </div>
            
            <div className="lg:col-span-7 order-1 lg:order-2">
              <Reveal direction="left" className="relative">
                <div className="relative overflow-hidden rounded-[3rem] shadow-2xl">
                  <img
                    src={pharmacistImage}
                    alt="Notre équipe"
                    className="w-full object-cover max-h-[600px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0ea5e9] via-transparent to-transparent opacity-60" />
                </div>
                
                {/* Floating element */}
               <motion.div 
                 animate={{ y: [0, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute -bottom-8 -left-8 rounded-3xl bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] hidden md:block border border-slate-100"
               >
                 <div className="flex items-center gap-4">
                   <div className="flex -space-x-4">
                     <div className="h-12 w-12 rounded-full border-2 border-white bg-slate-200"></div>
                     <div className="h-12 w-12 rounded-full border-2 border-white bg-slate-300"></div>
                     <div className="h-12 w-12 rounded-full border-2 border-white bg-slate-400"></div>
                     <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#0ea5e9] text-xs font-bold text-white">+5</div>
                   </div>
                   <div>
                     <p className="font-bold text-[#0ea5e9]">Équipe experte</p>
                     <p className="text-sm font-medium text-slate-500">À votre service</p>
                   </div>
                 </div>
               </motion.div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[3rem] bg-[#0ea5e9] px-8 py-20 text-center shadow-[0_30px_60px_rgba(14,165,233,0.3)] md:px-16 lg:px-24">
              
              {/* Decorative shapes */}
              <div className="absolute -top-[50%] -left-[10%] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 blur-3xl" />
              <div className="absolute -bottom-[50%] -right-[10%] h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-emerald-400/20 to-teal-500/20 blur-3xl" />
              
              <div className="relative z-10 mx-auto max-w-3xl">
                <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
                  Passez à l'étape supérieure pour votre peau.
                </h2>
                <p className="mb-10 text-lg sm:text-xl font-light text-blue-100">
                  Découvrez l'intégralité de nos collections, des marques pionnières aux nouveautés éco-conçues.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#0ea5e9] transition-all hover:scale-105 hover:bg-[#eff6ff] hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)]"
                >
                  Accéder à la boutique
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
      
    </div>
  );
}
