"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import { cargarCerdasDeStorage, calcularTareasPendientes, Cerda, PendingTask } from "@/utils/pendingTasks";

export default function Tareas() {
  const router = useRouter();

  const [tareas, setTareas] = useState<PendingTask[]>([]);
  const [filtro, setFiltro] = useState("Todas");
  const [buscar, setBuscar] = useState("");
  

  useEffect(() => {
    const cerdas = cargarCerdasDeStorage();
    setTareas(calcularTareasPendientes(cerdas));
  }, []);

  const tiposUnicos = ["Todas", ...Array.from(new Set(tareas.map((t) => t.tipo)))] as string[];

  const filtradas = tareas.filter((tarea) => {
    const matchesFiltro = filtro === "Todas" || tarea.tipo === filtro;
    const matchesBuscar = tarea.id.toLowerCase().includes(buscar.toLowerCase());
    return matchesFiltro && matchesBuscar;
  });

  const obtenerColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case "critica":
        return "bg-red-100 border-red-300 text-red-800";
      case "alta":
        return "bg-orange-50 border-orange-200 text-orange-700";
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
      case "critica":
        return "🔴";
      case "alta":
        return "🟠";
      case "media":
        return "🟡";
      case "baja":
        return "🔵";
      default:
        return "⚪";
    }
  };

  function obtenerPanelStyles(prioridad: string) {
    switch (prioridad) {
      case "critica":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          title: "text-red-700",
          content: "text-red-900",
          secondary: "text-red-600",
        };
      case "alta":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          title: "text-orange-700",
          content: "text-orange-900",
          secondary: "text-orange-600",
        };
      case "media":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          title: "text-yellow-700",
          content: "text-yellow-900",
          secondary: "text-yellow-600",
        };
      case "baja":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          title: "text-blue-700",
          content: "text-blue-900",
          secondary: "text-blue-600",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          title: "text-slate-700",
          content: "text-slate-900",
          secondary: "text-slate-600",
        };
    }
  }

  function obtenerBarraColor(prioridad: string) {
    switch (prioridad) {
      case "critica":
        return "from-red-500 to-red-400";
      case "alta":
        return "from-orange-500 to-orange-400";
      case "media":
        return "from-yellow-500 to-yellow-400";
      case "baja":
        return "from-blue-500 to-blue-400";
      default:
        return "from-slate-400 to-slate-300";
    }
  }

  return (
    <PageShell bgColor="#ffffff" className="p-4 text-slate-900">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pink-600">Tareas</h1>
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

        <input
          type="text"
          placeholder="Buscar ID..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full p-4 rounded-2xl bg-gray-100 border border-gray-300 mb-4 outline-none text-black"
        />

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tiposUnicos.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
                filtro === tipo ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtradas.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500 border border-gray-200">
              {tareas.length === 0 ? "No hay tareas registradas" : "No hay tareas que coincidan"}
            </div>
          )}

          {filtradas.map((tarea, index) => {
            const styles = obtenerPanelStyles(tarea.prioridad);
            const barra = obtenerBarraColor(tarea.prioridad);
            return (
              <div
                key={index}
                onClick={() => router.push(`/cerda/${tarea.id}`)}
                className={`relative overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} shadow-sm hover:shadow-md transition cursor-pointer`}
              >
                <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${barra}`} />
                <div className="p-4 pl-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{obtenerIconoPrioridad(tarea.prioridad)}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-bold ${styles.title}`}>{tarea.id}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${obtenerColorPrioridad(tarea.prioridad)}`}>
                          {tarea.prioridad.toUpperCase()}
                        </span>
                      </div>

                      <p className={`text-sm font-semibold ${styles.secondary} mb-1`}>{tarea.tipo}</p>

                      <p className={`text-xs ${styles.content} mb-2`}>{tarea.descripcion}</p>

                      <p className="text-xs text-gray-500">📅 {tarea.fecha}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-400">→</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toasts removed */}
    </PageShell>
  );
}
