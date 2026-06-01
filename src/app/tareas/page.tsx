"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Tareas() {
  const router = useRouter();

  const [tareas, setTareas] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todas");
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    generarTareas();
  }, []);

  function calcularDiasEntre(fechaInicio: string, fechaFin: string) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function generarTareas() {
    const cerdas = JSON.parse(
      localStorage.getItem("cerdas") || "[]"
    );

    const nuevasTareas: any[] = [];
    const hoy = new Date().toISOString().split("T")[0];

    cerdas.forEach((cerda: any) => {
      const historial = JSON.parse(
        localStorage.getItem(`historial-${cerda.id}`) || "[]"
      );

      if (!Array.isArray(historial) || historial.length === 0) return;

      const ultimoRegistro = historial[0];
      const diasDesdeUltimo = calcularDiasEntre(
        ultimoRegistro.fecha,
        hoy
      );

      // REGLA 1: Revisar celos próximos
      if (
        ultimoRegistro.tipo === "Destete" &&
        diasDesdeUltimo >= 0 &&
        diasDesdeUltimo <= 5
      ) {
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Revisar Celo",
          prioridad: "alta",
          descripcion: `Está próxima a entrar en celo después del destete`,
          dias: diasDesdeUltimo,
          fecha: ultimoRegistro.fecha,
        });
      }

      // REGLA 2: Destetes próximos (21-28 días después de parto)
      const registroParto = historial.find(
        (r: any) => r.tipo === "Parto"
      );
      if (registroParto) {
        const diasDesdeParto = calcularDiasEntre(
          registroParto.fecha,
          hoy
        );
        if (diasDesdeParto >= 20 && diasDesdeParto <= 28) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Destete Próximo",
            prioridad: "media",
            descripcion: `Está en lactancia y es próximo el destete (${diasDesdeParto} días)`,
            dias: diasDesdeParto,
            fecha: registroParto.fecha,
          });
        }
      }

      // REGLA 3: Partos estimados
      const registroInseminacion = historial.find(
        (r: any) => r.tipo === "Inseminación"
      );
      if (registroInseminacion && registroInseminacion.partoEstimado) {
        const diasAlParto = calcularDiasEntre(
          hoy,
          registroInseminacion.partoEstimado
        );
        if (diasAlParto >= -3 && diasAlParto <= 7) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Parto Estimado",
            prioridad: "alta",
            descripcion: `Parto estimado para el ${registroInseminacion.partoEstimado} (${Math.abs(diasAlParto)} días)`,
            dias: diasAlParto,
            fecha: registroInseminacion.partoEstimado,
          });
        }
      }

      // REGLA 4: Tratamientos activos
      const registroTratamiento = historial.find(
        (r: any) => r.tipo === "Tratamiento"
      );
      if (registroTratamiento && diasDesdeUltimo <= 14) {
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Seguimiento Tratamiento",
          prioridad: "media",
          descripcion: `Tratamiento registrado hace ${diasDesdeUltimo} días`,
          dias: diasDesdeUltimo,
          fecha: registroTratamiento.fecha,
        });
      }

      // REGLA 5: Chequeos rutinarios de gestación
      if (
        ultimoRegistro.tipo === "Inseminación" &&
        diasDesdeUltimo >= 25 &&
        diasDesdeUltimo <= 35
      ) {
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Chequeo Gestación",
          prioridad: "baja",
          descripcion: `Hacer chequeo de confirmación de gestación`,
          dias: diasDesdeUltimo,
          fecha: ultimoRegistro.fecha,
        });
      }

      // REGLA 6: Monitoreo de gestación tardía
      if (
        ultimoRegistro.tipo === "Inseminación" &&
        diasDesdeUltimo >= 100 &&
        diasDesdeUltimo <= 110
      ) {
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Monitoreo Pre-Parto",
          prioridad: "alta",
          descripcion: `Gestación avanzada, preparar para parto inminente`,
          dias: diasDesdeUltimo,
          fecha: ultimoRegistro.fecha,
        });
      }
    });

    // Ordenar por prioridad y días
    const prioridadNum = {
      alta: 1,
      media: 2,
      baja: 3,
    };

    nuevasTareas.sort((a, b) => {
      if (prioridadNum[a.prioridad as keyof typeof prioridadNum] !== 
          prioridadNum[b.prioridad as keyof typeof prioridadNum]) {
        return (
          prioridadNum[a.prioridad as keyof typeof prioridadNum] -
          prioridadNum[b.prioridad as keyof typeof prioridadNum]
        );
      }
      return a.dias - b.dias;
    });

    setTareas(nuevasTareas);
  }

  const tiposUnicos = [
    "Todas",
    ...new Set(tareas.map((t) => t.tipo)),
  ];

  const filtradas = tareas.filter((tarea) => {
    const matchesFiltro =
      filtro === "Todas" || tarea.tipo === filtro;
    const matchesBuscar = tarea.id
      .toLowerCase()
      .includes(buscar.toLowerCase());

    return matchesFiltro && matchesBuscar;
  });

  const obtenerColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-50 border-red-200 text-red-700";
      case "media":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "baja":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const obtenerIconoPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "🔴";
      case "media":
        return "🟡";
      case "baja":
        return "🔵";
      default:
        return "⚪";
    }
  };

  return (
    <main className="min-h-screen bg-white text-black p-4">
      <div className="max-w-md mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pink-600">
              Tareas
            </h1>
            <p className="text-gray-600 mt-2">
              {filtradas.length} pendiente{filtradas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="bg-white shadow border border-gray-200 px-4 py-2 rounded-2xl text-black"
          >
            ←
          </button>
        </div>

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar ID..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full p-4 rounded-2xl bg-gray-100 border border-gray-300 mb-4 outline-none text-black"
        />

        {/* FILTROS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tiposUnicos.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`
                whitespace-nowrap
                px-4
                py-2
                rounded-full
                font-medium
                transition-colors
                ${
                  filtro === tipo
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {tipo}
            </button>
          ))}
        </div>

        {/* TAREAS */}
        <div className="space-y-3">
          {filtradas.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500 border border-gray-200">
              {tareas.length === 0
                ? "No hay tareas registradas"
                : "No hay tareas que coincidan"}
            </div>
          )}

          {filtradas.map((tarea, index) => (
            <div
              key={index}
              onClick={() => router.push(`/cerda/${tarea.id}`)}
              className="
                bg-white
                rounded-2xl
                p-4
                border
                border-gray-200
                shadow-sm
                hover:shadow-md
                transition-shadow
                cursor-pointer
              "
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{obtenerIconoPrioridad(tarea.prioridad)}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-black">{tarea.id}</h3>
                    <span
                      className={`
                        text-xs
                        font-bold
                        px-2
                        py-1
                        rounded-full
                        border
                        ${obtenerColorPrioridad(tarea.prioridad)}
                      `}
                    >
                      {tarea.prioridad.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {tarea.tipo}
                  </p>

                  <p className="text-xs text-gray-600 mb-2">
                    {tarea.descripcion}
                  </p>

                  <p className="text-xs text-gray-500">
                    📅 {tarea.fecha}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-gray-400">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
