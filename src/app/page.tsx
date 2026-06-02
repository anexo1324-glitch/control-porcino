"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFade(true); // inicia animación de salida
    }, 1500);

    const timer2 = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">

      <div
        className={`text-center transition-all duration-500 ${
          fade ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >

        {/* LOGO */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={300}
          height={300}
          className="mx-auto"
          priority
        />

        <h1 className="text-3xl font-bold text-green-700 mt-6">
          PORCÍCOLA 
          EL MIRADOR
        </h1>

        <p className="text-black font-bold mt-2">
          Gestión Inteligente
        </p>

      </div>

    </main>
  );
}