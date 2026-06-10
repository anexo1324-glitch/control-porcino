"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageShell from "@/components/PageShell";

export default function Home() {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2500);

    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <PageShell
      bgColor="#ffffff"
      className={`relative h-screen overflow-hidden transition-opacity duration-700 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Brillo superior */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/0 blur-3xl rounded-full" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex h-full min-h-0 box-border flex-col items-center justify-center px-5 py-6">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Logo Porcícola El Mirador"
            width={420}
            height={420}
            priority
            className="w-[220px] sm:w-[280px] md:w-[360px] h-auto"
          />

          {/* Título */}
          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-green-700 uppercase">
            Porcícola El Mirador
          </h1>

          <p className="text-base sm:text-xl text-gray-600">
            Gestión Inteligente
          </p>
        </div>

        <div className="flex w-full max-w-xl flex-col items-center gap-3">
          {/* Texto carga */}
          <p className="text-gray-600 text-sm sm:text-base text-center">
            Cargando módulos del sistema...
          </p>

          {/* Barra progreso */}
          <div className="w-full px-4 sm:px-0">
            <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full w-3/4 bg-gradient-to-r from-green-500 via-lime-500 to-green-600 rounded-full animate-[loading_3s_ease-in-out_infinite]" />
            </div>
          </div>

          {/* Versión */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-[1px] w-16 bg-green-200" />
              <span className="text-green-600 text-lg">🌱</span>
              <div className="h-[1px] w-16 bg-green-200" />
            </div>

            <p className="text-green-700 font-bold text-base sm:text-lg">
              Versión 2.0.0
            </p>

            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              © 2026 Porcícola El Mirador
            </p>
          </div>
        </div>
      </div>

      {/* Ondas inferiores */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1440 320"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,256L60,245.3C120,235,240,213,360,218.7C480,224,600,256,720,272C840,288,960,288,1080,266.7C1200,245,1320,203,1380,181.3L1440,160L1440,320L0,320Z"
          />
        </svg>
      </div>

      <style jsx global>{`
        html,
        body,
        #__next {
          overflow: hidden !important;
          height: 100% !important;
        }

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </PageShell>
  );
}