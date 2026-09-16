"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import SummaryCard from "@/components/SummaryCard";
import PageShell from "@/components/PageShell";
import { tasksPendingMessage } from '@/utils/messages';
import { cargarCerdasDeStorage, contarTareasPendientes, generarTareasPendientes, calcularTareasPendientes, Cerda } from '@/utils/pendingTasks';

const modulos = [
  {
    nombre: "Gestación",
    descripcion: "Control de partos e inseminación",
    ruta: "/gestacion",
    color: "from-emerald-600 to-emerald-500",
    icon: "🐖",
  },
  {
    nombre: "Engorde",
    descripcion: "Seguimiento de peso y alimentación",
    ruta: "/engorde",
    color: "from-emerald-600 to-emerald-500",
    icon: "🐷",
  },
  {
    nombre: "Contabilidad",
    descripcion: "Ingresos, gastos y producción",
    ruta: "/contabilidad",
    color: "from-emerald-600 to-emerald-500",
    icon: "💼",
  },
  {
    nombre: "Indicadores",
    descripcion: "Estadísticas y rendimiento",
    ruta: "/indicadores",
    color: "from-emerald-600 to-emerald-500",
    icon: "📊",
  },
  {
    nombre: "Tratamientos",
    descripcion: "Salud y medicamentos",
    ruta: "/tratamientos",
    color: "from-emerald-600 to-emerald-500",
    icon: "🩺",
  },
  {
    nombre: "Bioseguridad",
    descripcion: "Protocolos sanitarios",
    ruta: "/bioseguridad",
    color: "from-emerald-600 to-emerald-500",
    icon: "🛡️",
  },
];

function obtenerEstadoActual(historial: unknown[]) {
  if (!Array.isArray(historial) || historial.length === 0) {
    return "Activa";
  }

  const ultimo = historial[0] as { tipo?: string };

  switch (ultimo.tipo) {
    case "Inseminación":
      return "Gestación";
    case "Parto":
      return "Lactancia";
    case "Destete":
      return "Próxima a Celo";
    case "Aborto":
      return "Aborto";
    case "Baja":
      return "Baja";
    case "Celo":
      return "Celo";
    case "Tratamiento":
      return "Tratamiento";
    default:
      return "Activa";
  }
}

function obtenerCerdasCriticas(datos: Cerda[]) {
  const tareasCriticas = calcularTareasPendientes(datos).filter(
    (tarea) => tarea.prioridad === "critica"
  );
  return Array.from(new Set(tareasCriticas.map((tarea) => tarea.id)));
}

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const menuItems = [
    { nombre: 'Inicio', ruta: '/dashboard', icon: '🏠' },
    { nombre: 'Producción', ruta: '/gestacion', icon: '🐖' },
    { nombre: 'Indicadores', ruta: '/indicadores', icon: '📈' },
    { nombre: 'Ajustes', ruta: '/ajustes', icon: '⚙️' },
  ];

  const [cerdas, setCerdas] = useState<Cerda[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return cargarCerdasDeStorage();
  });

  const pendingTasks = useMemo(() => calcularTareasPendientes(cerdas), [cerdas]);
  const pendientes = pendingTasks.length;
  const cerdasCriticas = useMemo(() => obtenerCerdasCriticas(cerdas), [cerdas]);

  useEffect(() => {
    const handleStorage = () => {
      setCerdas(cargarCerdasDeStorage());
    };

    const handleFocus = () => {
      setCerdas(cargarCerdasDeStorage());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Evitar que el botón de retroceder del navegador salga del dashboard
  const totalCerdos = cerdas.length;
  const gestantes = useMemo(() => {
    return cerdas.reduce((count, cerda) => {
      const historial = JSON.parse(
        localStorage.getItem(`historial-${cerda.id}`) || "[]"
      );
      return obtenerEstadoActual(historial) === "Gestación" ? count + 1 : count;
    }, 0);
  }, [cerdas]);

  const resumen = [
    {
      nombre: "Cerdos",
      valor: totalCerdos,
      detalle: "Total",
      icon: "🐖",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      nombre: "Gestantes",
      valor: gestantes,
      detalle: "En producción",
      icon: "🐷",
      iconBg: "bg-gray-100 text-gray-700",
    },
    {
      nombre: "Lechones",
      valor: "54",
      detalle: "Esta semana",
      icon: "🐽",
      iconBg: "bg-amber-50 text-amber-700",
    },
    {
      nombre: "Rendimiento",
      valor: "92%",
      detalle: "Este mes",
      icon: "📝",
      iconBg: "bg-sky-50 text-sky-700",
    },
  ];

  return (
    <PageShell bgColor="#f5f5f7" className="flex flex-col">
      <div className="mx-auto flex max-w-xl flex-col gap-3 flex-1">
        <Header 
          title="El Mirador" 
          subtitle="Sistema integral de producción porcina"
          bgColor="#f5f5f7"
        />

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Resumen rápido</h2>
            <span className="text-xs text-slate-500">Actualizado hoy</span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {resumen.map((item) => (
              <SummaryCard
                key={item.nombre}
                nombre={item.nombre}
                valor={item.valor}
                detalle={item.detalle}
                icon={item.icon}
                iconBg={item.iconBg}
                bgColor="#f5f5f7"
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Módulos</h2>
          <div className="grid gap-2">
            {modulos.map((modulo) => (
              <button
                key={modulo.nombre}
                type="button"
                onClick={() => router.push(modulo.ruta)}
                className="flex items-center justify-between gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-800">
                    {modulo.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{modulo.nombre}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{modulo.descripcion}</p>
                  </div>
                </div>
                <span className="text-xl text-slate-400">›</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed left-0 right-0 bottom-6 flex justify-center">
        <div className="w-full max-w-sm rounded-full bg-slate-200/85 px-4 py-2 shadow-xl border border-slate-300/60 backdrop-blur-md">
          <div className="flex items-center justify-between h-full">
            {menuItems.map((item) => {
              const isActive = pathname?.startsWith(item.ruta);
              return (
                <button
                  key={item.nombre}
                  type="button"
                  onClick={() => router.push(item.ruta)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 text-xs w-24 transition-all duration-150 ease-out ${isActive ? 'text-emerald-800 font-semibold' : 'text-slate-600'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[11px] font-semibold uppercase">{item.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {pendientes > 0 && (
        <button
          type="button"
          onClick={() => router.push('/tareas')}
          className="fixed right-4 bottom-28 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl transition hover:bg-emerald-700"
          aria-label="Ver alertas pendientes"
        >
          <span className="text-2xl">🔔</span>
          <span className="pointer-events-none absolute -right-1 top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-emerald-800 shadow-sm">
            {pendientes}
          </span>
        </button>
      )}

      {/* Toasts removed */}
    </PageShell>
  );
}
