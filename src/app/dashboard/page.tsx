"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter();

  const modulos = [

    {
      nombre: "Gestación",
      descripcion: "Control de partos e inseminación",
      ruta: "/gestacion",
    },

    {
      nombre: "Engorde",
      descripcion: "Seguimiento de peso y alimentación",
      ruta: "/engorde",
    },

    {
      nombre: "Contabilidad",
      descripcion: "Ingresos, gastos y producción",
      ruta: "/contabilidad",
    },

    {
      nombre: "Indicadores",
      descripcion: "Estadísticas y rendimiento",
      ruta: "/indicadores",
    },

    {
      nombre: "Tratamientos",
      descripcion: "Medicamentos y vacunas",
      ruta: "/tratamientos",
    },

    {
      nombre: "Bioseguridad",
      descripcion: "Protocolos sanitarios",
      ruta: "/bioseguridad",
    },

  ];

  return (

    <main className="min-h-screen bg-white p-6">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold text-green-700 mb-3">

          Control Porcino

        </h1>

        <p className="text-green-500 mb-10 text-lg">

          Gestión inteligente de granjas porcinas

        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {modulos.map((modulo, index) => (

            <div
              key={index}
              className="bg-green-50 border border-green-100 p-6 rounded-3xl shadow"
            >

              <h2 className="text-2xl font-bold text-green-700 mb-3">

                {modulo.nombre}

              </h2>

              <p className="text-green-600">

                {modulo.descripcion}

              </p>

              <button
                onClick={() => router.push(modulo.ruta)}
                className="mt-6 bg-green-700 text-white px-5 py-3 rounded-2xl w-full"
              >

                Entrar

              </button>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}