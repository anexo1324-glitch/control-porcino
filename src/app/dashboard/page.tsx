"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import Header from "@/components/Header";
import SummaryCard from "@/components/SummaryCard";
import PageShell from "@/components/PageShell";
import { sendPushNotification, requestNotificationPermission } from "@/utils/notifications";
import { tasksPendingMessage, NOTIFICATION_TAGS } from '@/utils/messages';

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
  const pathname = usePathname();
  const menuItems = [
    { nombre: 'Inicio', ruta: '/dashboard', icon: '🏠' },
    { nombre: 'Producción', ruta: '/gestacion', icon: '🐖' },
    { nombre: 'Indicadores', ruta: '/indicadores', icon: '📈' },
    { nombre: 'Ajustes', ruta: '/ajustes', icon: '⚙️' },
  ];

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
  const lastPendientesRef = useRef<number | null>(null);

  useEffect(() => {
    const handleStorage = () => {
      setCerdas(cargarCerdasDeStorage());
    };

    requestNotificationPermission().then((permitido) => {
      if (permitido) {
        setNotificacionesPermitidas(true);
      }
    });

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [addToast]);

  // Notificaciones periódicas deshabilitadas: se removió el envío cada 15s

  useEffect(() => {
    if (!notificacionesPermitidas) return;

    if (pendientes === 0) {
      lastPendientesRef.current = pendientes;
      return;
    }

    if (lastPendientesRef.current === pendientes) return;

    lastPendientesRef.current = pendientes;

    const { title, body } = tasksPendingMessage(pendientes);
    void sendPushNotification(title, {
      body,
      tag: NOTIFICATION_TAGS.PENDIENTES,
    });
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
      <div className="mx-auto flex max-w-xl flex-col gap-3 flex-1">
        <Header 
          title="El Mirador" 
          subtitle="Sistema integral de producción porcina"
          bgColor="#f5f5f7"
        />

        <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-3 py-2 shadow-sm">
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </PageShell>
  );
}
