"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";
import { sendPushNotification, requestNotificationPermission } from "@/utils/notifications";

export default function Dashboard() {
  const router = useRouter();
  const [pendientes, setPendientes] = useState(0);
  const { toasts, addToast, removeToast } = useToast();
  const [notificacionesPermitidas, setNotificacionesPermitidas] = useState(false);

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
      color: "from-pink-500 to-pink-400",
    },
    {
      nombre: "Contabilidad",
      descripcion: "Ingresos, gastos y producción",
      ruta: "/contabilidad",
      color: "from-pink-500 to-pink-400",
    },
    {
      nombre: "Indicadores",
      descripcion: "Estadísticas y rendimiento",
      ruta: "/indicadores",
      color: "from-pink-500 to-pink-400",
    },
    {
      nombre: "Tratamientos",
      descripcion: "Medicamentos y vacunas",
      ruta: "/tratamientos",
      color: "from-pink-500 to-pink-400",
    },
    {
      nombre: "Bioseguridad",
      descripcion: "Protocolos sanitarios",
      ruta: "/bioseguridad",
      color: "from-pink-500 to-pink-400",
    },
  ];

  useEffect(() => {
    calcularPendientes();
    const handleStorage = () => calcularPendientes();
    window.addEventListener("storage", handleStorage);

    // Solicitar permiso para notificaciones push
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

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function calcularDiasEntre(fechaInicio: string, fechaFin: string) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function calcularPendientes() {
    const cerdas = JSON.parse(localStorage.getItem("cerdas") || "[]");
    const cerdasConTareas = new Set<string>();
    const cerdasCriticas: string[] = [];
    const hoy = new Date().toISOString().split("T")[0];

    cerdas.forEach((cerda: any) => {
      const historial = JSON.parse(
        localStorage.getItem(`historial-${cerda.id}`) || "[]"
      );
      if (!Array.isArray(historial) || historial.length === 0) return;

      const ultimoRegistro = historial[0];
      if (["Baja", "Vendida", "Muerta"].includes(ultimoRegistro.tipo)) return;

      const diasDesdeUltimo = calcularDiasEntre(ultimoRegistro.fecha, hoy);

      // Búsqueda de registros clave
      const regInseminacion = historial.find((r: any) => r.tipo === "Inseminación");
      const regParto = historial.find((r: any) => r.tipo === "Parto");
      const regDestete = historial.find((r: any) => r.tipo === "Destete");
      const regCelo = historial.find((r: any) => r.tipo === "Celo");

      let tieneTarea = false;
      let esCritica = false;

      // Alertas CRÍTICAS
      if (regInseminacion) {
        const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha, hoy);
        if ((diasDesdeInseminacion >= 110 && diasDesdeInseminacion <= 114) || 
            (diasDesdeInseminacion >= 115 && !regParto)) {
          tieneTarea = true;
          esCritica = true;
          cerdasCriticas.push(cerda.id);
        }
      }

      // Alertas ALTAS
      if (!tieneTarea && regInseminacion) {
        const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha, hoy);
        if (
          (diasDesdeInseminacion >= 18 && diasDesdeInseminacion <= 24 && !regParto && !historial.some((r: any) => r.tipo === "Aborto")) ||
          (diasDesdeInseminacion >= 100 && diasDesdeInseminacion <= 109)
        ) {
          tieneTarea = true;
        }
      }

      if (!tieneTarea && regDestete) {
        const diasDesdeDestete = calcularDiasEntre(regDestete.fecha, hoy);
        if (diasDesdeDestete >= 3 && diasDesdeDestete <= 7) {
          tieneTarea = true;
        }
      }

      if (!tieneTarea && regCelo) {
        const diasDesdeCelo = calcularDiasEntre(regCelo.fecha, hoy);
        if (diasDesdeCelo >= 0 && diasDesdeCelo <= 10) {
          tieneTarea = true;
        }
      }

      // Alertas MEDIAS
      if (!tieneTarea && regInseminacion) {
        const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha, hoy);
        if (
          (diasDesdeInseminacion >= 25 && diasDesdeInseminacion <= 35) ||
          (diasDesdeInseminacion >= 70 && diasDesdeInseminacion <= 90)
        ) {
          tieneTarea = true;
        }
      }

      if (!tieneTarea && regParto) {
        const diasDesdeParto = calcularDiasEntre(regParto.fecha, hoy);
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

    setPendientes(cerdasConTareas.size);

    // Enviar notificaciones para alertas críticas
    if (cerdasCriticas.length > 0 && notificacionesPermitidas) {
      cerdasCriticas.forEach((cerdaId) => {
        sendPushNotification(`🔴 Alerta Crítica - ${cerdaId}`, {
          body: "Acción inmediata requerida - Verifica en Tareas",
          tag: `critica-${cerdaId}`,
        });
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] p-4 pb-28">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-black leading-none">
            PORCÍCOLA
            <br />
            EL MIRADOR
          </h1>

          <p className="text-gray-500 mt-3 text-base">
            🐷Sistema de gestión inteligente🐷
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modulos.map((modulo, index) => (
            <button
              key={index}
              onClick={() => router.push(modulo.ruta)}
              className="relative overflow-hidden rounded-3xl p-4 min-h-[140px] text-left shadow-md active:scale-95 transition bg-white"
            >
              <div className="flex h-full flex-col justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-black">
                    {modulo.nombre}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 leading-tight">
                    {modulo.descripcion}
                  </p>
                </div>

                <div
                  className={`w-full rounded-2xl py-2 text-center text-sm font-semibold text-white bg-gradient-to-r ${modulo.color}`}
                >
                  Entrar
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push("/tareas")}
        className="fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-2xl text-slate-700 shadow-2xl shadow-pink-300/50 transition hover:bg-pink-400"
        aria-label="Ir a tareas"
      >
        <span className="relative inline-flex h-full w-full items-center justify-center text-slate-700">
          🔔
          {pendientes > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-lg">
              {pendientes}
            </span>
          )}
        </span>
      </button>
      <ToastContainer toasts={toasts} removeToast={removeToast} />    </main>
  );
}
