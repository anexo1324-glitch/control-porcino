"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const modulos = [
    {
      nombre: "Gestación",
      descripcion: "Control de partos e inseminación",
      ruta: "/gestacion",
      color: "from-pink-500 to-pink-400",
    },

    {
      nombre: "Engorde",
      descripcion: "Seguimiento de peso y alimentación",
      ruta: "/engorde",
      color: "from-orange-500 to-orange-400",
    },

    {
      nombre: "Contabilidad",
      descripcion: "Ingresos, gastos y producción",
      ruta: "/contabilidad",
      color: "from-emerald-500 to-emerald-400",
    },

    {
      nombre: "Indicadores",
      descripcion: "Estadísticas y rendimiento",
      ruta: "/indicadores",
      color: "from-blue-500 to-blue-400",
    },

    {
      nombre: "Tratamientos",
      descripcion: "Medicamentos y vacunas",
      ruta: "/tratamientos",
      color: "from-violet-500 to-violet-400",
    },

    {
      nombre: "Bioseguridad",
      descripcion: "Protocolos sanitarios",
      ruta: "/bioseguridad",
      color: "from-cyan-500 to-cyan-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f7] p-4">

      <div className="max-w-md mx-auto">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-black text-black leading-tight">
            PORCÍCOLA
            <br />
            EL MIRADOR
          </h1>

          <p className="text-gray-500 mt-3 text-base">
            Sistema de gestión inteligente
          </p>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-4">

          {modulos.map((modulo, index) => (

            <button
              key={index}
              onClick={() => router.push(modulo.ruta)}
              className="
                relative
                overflow-hidden
                rounded-3xl
                p-4
                h-44
                text-left
                shadow-md
                active:scale-95
                transition
                bg-white
              "
            >

              {/* FONDO COLOR */}
              <div
                className={`
                  absolute
                  top-0
                  left-0
                  w-full
                  h-2
                  bg-gradient-to-r
                  ${modulo.color}
                `}
              />

              {/* CONTENIDO */}
              <div className="flex flex-col justify-between h-full">

                <div>

                  <h2 className="text-xl font-bold text-black">
                    {modulo.nombre}
                  </h2>

                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    {modulo.descripcion}
                  </p>

                </div>

                {/* BOTÓN */}
                <div>

                  <div
                    className={`
                      w-full
                      py-3
                      rounded-2xl
                      text-white
                      text-sm
                      font-bold
                      text-center
                      bg-gradient-to-r
                      ${modulo.color}
                    `}
                  >
                    Entrar
                  </div>

                </div>

              </div>

            </button>

          ))}

        </div>

      </div>

    </main>
  );
}