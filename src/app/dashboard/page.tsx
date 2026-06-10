"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import Header from "@/components/Header";
import SummaryCard from "@/components/SummaryCard";
import PageShell from "@/components/PageShell";
import { sendPushNotification, requestNotificationPermission } from "@/utils/notifications";

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

interface Cerda {
  id: string;
  [key: string]: unknown;
}

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

type Registro = {
  tipo?: string;
  fecha?: string;
};

function cargarCerdasDeStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const datos = JSON.parse(localStorage.getItem("cerdas") || "[]");
  return Array.isArray(datos) ? datos : [];
}

function calcularDiasEntre(fechaInicio: string, fechaFin: string) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diff = fin.getTime() - inicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function obtenerPendientes(datos: Cerda[]) {
  const cerdasConTareas = new Set<string>();
  const hoy = new Date().toISOString().split("T")[0];

  datos.forEach((cerda) => {
    const historial = JSON.parse(
      localStorage.getItem(`historial-${cerda.id}`) || "[]"
    ) as unknown[];

    if (!Array.isArray(historial) || historial.length === 0) return;

    const ultimoRegistro = historial[0] as Registro;
    if (["Baja", "Vendida", "Muerta"].includes(ultimoRegistro.tipo || "")) return;

    const diasDesdeUltimo = calcularDiasEntre(ultimoRegistro.fecha || hoy, hoy);

    const regInseminacion = historial.find(
      (registro) => (registro as Registro).tipo === "Inseminación"
    ) as Registro | undefined;
    const regParto = historial.find(
      (registro) => (registro as Registro).tipo === "Parto"
    ) as Registro | undefined;
    const regDestete = historial.find(
      (registro) => (registro as Registro).tipo === "Destete"
    ) as Registro | undefined;
    const regCelo = historial.find(
      (registro) => (registro as Registro).tipo === "Celo"
    ) as Registro | undefined;

    let tieneTarea = false;

    if (regInseminacion) {
      const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha || hoy, hoy);
      if ((diasDesdeInseminacion >= 110 && diasDesdeInseminacion <= 114) ||
          (diasDesdeInseminacion >= 115 && !regParto)) {
        tieneTarea = true;
      }
    }

    if (!tieneTarea && regInseminacion) {
      const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha || hoy, hoy);
      if (
        (diasDesdeInseminacion >= 18 && diasDesdeInseminacion <= 24 && !regParto && !historial.some((registro) => (registro as Registro).tipo === "Aborto")) ||
        (diasDesdeInseminacion >= 100 && diasDesdeInseminacion <= 109)
      ) {
        tieneTarea = true;
      }
    }

    if (!tieneTarea && regDestete) {
      const diasDesdeDestete = calcularDiasEntre(regDestete.fecha || hoy, hoy);
      if (diasDesdeDestete >= 3 && diasDesdeDestete <= 7) {
        tieneTarea = true;
      }
    }

    if (!tieneTarea && regCelo) {
      const diasDesdeCelo = calcularDiasEntre(regCelo.fecha || hoy, hoy);
      if (diasDesdeCelo >= 0 && diasDesdeCelo <= 10) {
        tieneTarea = true;
      }
    }

    if (!tieneTarea && regInseminacion) {
      const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha || hoy, hoy);
      if (
        (diasDesdeInseminacion >= 25 && diasDesdeInseminacion <= 35) ||
        (diasDesdeInseminacion >= 70 && diasDesdeInseminacion <= 90)
      ) {
        tieneTarea = true;
      }
    }

    if (!tieneTarea && regParto) {
      const diasDesdeParto = calcularDiasEntre(regParto.fecha || hoy, hoy);
      if ((diasDesdeParto >= 1 && diasDesdeParto <= 5) || (diasDesdeParto >= 21 && diasDesdeParto <= 28)) {
        tieneTarea = true;
      }
    }

    if (!tieneTarea && diasDesdeUltimo > 60) {
      tieneTarea = true;
    }

    if (tieneTarea) {
      cerdasConTareas.add(cerda.id);
    }
  });

  return cerdasConTareas.size;
}

function obtenerCerdasCriticas(datos: Cerda[]) {
  const criticas: string[] = [];
  const hoy = new Date().toISOString().split("T")[0];

  datos.forEach((cerda) => {
    const historial = JSON.parse(
      localStorage.getItem(`historial-${cerda.id}`) || "[]"
    ) as unknown[];

    if (!Array.isArray(historial) || historial.length === 0) return;

    const regInseminacion = historial.find(
      (registro) => (registro as Registro).tipo === "Inseminación"
    ) as Registro | undefined;
    const regParto = historial.find(
      (registro) => (registro as Registro).tipo === "Parto"
    ) as Registro | undefined;

    if (!regInseminacion) return;

    const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha || hoy, hoy);
    if ((diasDesdeInseminacion >= 110 && diasDesdeInseminacion <= 114) ||
        (diasDesdeInseminacion >= 115 && !regParto)) {
      criticas.push(cerda.id);
    }
  });

  return criticas;
}

export default function Dashboard() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [notificacionesPermitidas, setNotificacionesPermitidas] = useState(false);
  const [cerdas, setCerdas] = useState<Cerda[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return cargarCerdasDeStorage();
  });

  const pendientes = useMemo(() => obtenerPendientes(cerdas), [cerdas]);
  const cerdasCriticas = useMemo(() => obtenerCerdasCriticas(cerdas), [cerdas]);

  useEffect(() => {
    const handleStorage = () => {
      setCerdas(cargarCerdasDeStorage());
    };

    requestNotificationPermission().then((permitido) => {
      if (permitido) {
        setNotificacionesPermitidas(true);
        addToast(
          "Notificaciones",
          "Notificaciones push habilitadas",
          "success",
          3000
        );
      }
    });

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [addToast]);

  useEffect(() => {
    if (!notificacionesPermitidas || pendientes === 0) return;

    const intervalId = window.setInterval(() => {
      void sendPushNotification(`📌 Tienes ${pendientes} tarea(s) pendiente(s)`, {
        body: "Abre Tareas para ver lo que debes atender.",
        tag: `pendiente-tareas`,
      });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [pendientes, notificacionesPermitidas]);

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
      <div className="mx-auto flex max-w-xl flex-col gap-4 flex-1">
        <Header 
          title="El Mirador" 
          subtitle="Sistema integral de producción porcina"
          bgColor="#f5f5f7"
        />

        <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-3 py-3 shadow-sm">
          <div className="absolute right-0 top-0 h-full w-28 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_60%)]" />
          <div className="absolute -bottom-6 left-6 h-20 w-20 rounded-full bg-emerald-100 opacity-80" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold text-emerald-900">¡Hola!</p>
              <p className="mt-1 max-w-xs text-sm text-slate-600">
                Administra tu granja fácil y rápido.
              </p>
            </div>
            <div className="hidden h-24 w-24 rounded-3xl bg-emerald-100 p-3 sm:block">
              <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-emerald-200 p-3">
                <div className="h-2 w-full rounded-full bg-emerald-300" />
                <div className="h-2 w-3/4 rounded-full bg-emerald-300" />
                <div className="h-2 w-1/2 rounded-full bg-emerald-300" />
                <div className="self-end rounded-full border border-emerald-300 bg-white px-2 py-1 text-xs font-semibold text-emerald-700">
                  Granja
                </div>
              </div>
            </div>
          </div>
        </section>

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
                className="flex items-center justify-between gap-3 overflow-hidden rounded-[26px] border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-2xl">
                    {modulo.icon}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-950">{modulo.nombre}</p>
                    <p className="mt-1 text-sm text-slate-500">{modulo.descripcion}</p>
                  </div>
                </div>
                <span className="text-2xl text-slate-400">›</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl p-3">
        <div className="mx-auto flex max-w-xl items-center justify-between text-slate-600">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center gap-1 text-emerald-700"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-[11px] font-semibold uppercase">Inicio</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/gestacion")}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🐖</span>
            <span className="text-[11px] font-semibold uppercase">Producción</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/indicadores")}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">📈</span>
            <span className="text-[11px] font-semibold uppercase">Indicadores</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/ajustes")}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-[11px] font-semibold uppercase">Ajustes</span>
          </button>
        </div>
      </nav>

      <button
        onClick={() => router.push("/tareas")}
        className="fixed bottom-24 right-4 z-30 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl text-slate-800 shadow-md shadow-slate-300/50 transition hover:bg-gray-300"
        aria-label="Ir a alertas"
      >
        <span className="relative inline-flex h-full w-full items-center justify-center">
          🕜
          {pendientes > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-[1.4rem] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-slate-700 shadow-sm">
              {pendientes}
            </span>
          )}
        </span>
      </button>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </PageShell>
  );
}
