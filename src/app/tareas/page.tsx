"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import PageShell from "@/components/PageShell";
import ToastContainer from "@/components/ToastContainer";
import { sendPushNotification, requestNotificationPermission } from "@/utils/notifications";

export default function Tareas() {
  const router = useRouter();

  const [tareas, setTareas] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todas");
  const [buscar, setBuscar] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    generarTareas();
    requestNotificationPermission();
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
    const fechaHoy = new Date(hoy);

    cerdas.forEach((cerda: any) => {
      const historial = JSON.parse(
        localStorage.getItem(`historial-${cerda.id}`) || "[]"
      );

      if (!Array.isArray(historial) || historial.length === 0) return;

      const ultimoRegistro = historial[0];
      const diasDesdeUltimo = calcularDiasEntre(ultimoRegistro.fecha, hoy);

      // EXCLUSIÓN: No generar tareas para cerdas inactivas
      if (["Baja", "Vendida", "Muerta"].includes(ultimoRegistro.tipo)) return;

      // ===== REGLAS BASADAS EN INSEMINACIÓN =====

      const regInseminacion = historial.find((r: any) => r.tipo === "Inseminación");
      if (regInseminacion) {
        const diasDesdeInseminacion = calcularDiasEntre(regInseminacion.fecha, hoy);

        // REGLA 1: Confirmación de gestación (Día 25-35)
        if (diasDesdeInseminacion >= 25 && diasDesdeInseminacion <= 35) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Confirmación de gestación",
            prioridad: "media",
            descripcion: "Realizar chequeo o ecografía para confirmar gestación",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 2: Posible repetición de celo (Día 18-24)
        const tieneParto = historial.some((r: any) => r.tipo === "Parto");
        const tieneAborto = historial.some((r: any) => r.tipo === "Aborto");
        const tieneNuevaInseminacion = historial.filter((r: any) => r.tipo === "Inseminación").length > 1;

        if (
          diasDesdeInseminacion >= 18 &&
          diasDesdeInseminacion <= 24 &&
          !tieneParto &&
          !tieneAborto &&
          !tieneNuevaInseminacion
        ) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Posible repetición de celo",
            prioridad: "alta",
            descripcion: "Verificar retorno a celo",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 3: Desparasitación gestacional (Día 70-90)
        const tieneDesparasitacion = historial.some(
          (r: any) =>
            r.tipo === "Desparasitación" &&
            calcularDiasEntre(regInseminacion.fecha, r.fecha) > 0
        );
        if (
          diasDesdeInseminacion >= 70 &&
          diasDesdeInseminacion <= 90 &&
          !tieneDesparasitacion
        ) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Desparasitación gestacional",
            prioridad: "media",
            descripcion: "Aplicar desparasitante durante la gestación",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 4: Monitoreo preparto (Día 100-109)
        if (diasDesdeInseminacion >= 100 && diasDesdeInseminacion <= 109) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Monitoreo preparto",
            prioridad: "alta",
            descripcion: "Vigilar signos de proximidad al parto",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 5: Parto próximo (Día 110-114)
        if (diasDesdeInseminacion >= 110 && diasDesdeInseminacion <= 114) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Parto próximo",
            prioridad: "critica",
            descripcion: "Preparar maternidad y supervisión",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 6: Parto retrasado (Día 115+)
        if (diasDesdeInseminacion >= 115 && !tieneParto) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Parto retrasado",
            prioridad: "critica",
            descripcion: "Revisar inmediatamente - Gestación prolongada",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 19: Preparación de maternidad (Día 105-110)
        if (diasDesdeInseminacion >= 105 && diasDesdeInseminacion <= 110) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Traslado a maternidad",
            prioridad: "alta",
            descripcion: "Preparar instalaciones para parto",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }

        // REGLA 18: Gestación sin confirmar (>35 días sin confirmación)
        const confirmacionGestacion = historial.find(
          (r: any) => r.tipo === "Confirmación de Gestación"
        );
        if (diasDesdeInseminacion > 35 && !confirmacionGestacion && !tieneParto) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Gestación sin confirmar",
            prioridad: "alta",
            descripcion: "Revisar estado reproductivo",
            dias: diasDesdeInseminacion,
            fecha: regInseminacion.fecha,
          });
        }
      }

      // ===== REGLAS BASADAS EN PARTO =====

      const regParto = historial.find((r: any) => r.tipo === "Parto");
      if (regParto) {
        const diasDesdeParto = calcularDiasEntre(regParto.fecha, hoy);

        // REGLA 7: Revisión postparto (Día 1-5)
        if (diasDesdeParto >= 1 && diasDesdeParto <= 5) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Revisión postparto",
            prioridad: "media",
            descripcion: "Evaluar estado de la cerda y la camada",
            dias: diasDesdeParto,
            fecha: regParto.fecha,
          });
        }

        // REGLA 8: Vacuna Parvo-Lepto (Día 10-14)
        const tieneParvoLepto = historial.some(
          (r: any) =>
            r.tipo === "Parvo-Lepto" &&
            calcularDiasEntre(regParto.fecha, r.fecha) > 0
        );
        if (diasDesdeParto >= 10 && diasDesdeParto <= 14 && !tieneParvoLepto) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Vacuna Parvo-Lepto",
            prioridad: "media",
            descripcion: "Aplicar refuerzo reproductivo",
            dias: diasDesdeParto,
            fecha: regParto.fecha,
          });
        }

        // REGLA 9: Destete próximo (Día 21-28)
        if (diasDesdeParto >= 21 && diasDesdeParto <= 28) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Destete próximo",
            prioridad: "media",
            descripcion: "Programar destete de la camada",
            dias: diasDesdeParto,
            fecha: regParto.fecha,
          });
        }
      }

      // ===== REGLAS BASADAS EN DESTETE =====

      const regDestete = historial.find((r: any) => r.tipo === "Destete");
      if (regDestete) {
        const diasDesdeDestete = calcularDiasEntre(regDestete.fecha, hoy);

        // REGLA 10: Próximo celo (Día 3-7)
        if (diasDesdeDestete >= 3 && diasDesdeDestete <= 7) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Detección de celo",
            prioridad: "alta",
            descripcion: "Monitorear aparición de celo postdestete",
            dias: diasDesdeDestete,
            fecha: regDestete.fecha,
          });
        }
      }

      // ===== REGLAS BASADAS EN CELO =====

      const regCelo = historial.find((r: any) => r.tipo === "Celo");
      if (regCelo) {
        const diasDesdeCelo = calcularDiasEntre(regCelo.fecha, hoy);

        // REGLA 11: Inseminación pendiente (Día 0-10)
        if (diasDesdeCelo >= 0 && diasDesdeCelo <= 10) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Inseminación pendiente",
            prioridad: "alta",
            descripcion: "Programar inseminación",
            dias: diasDesdeCelo,
            fecha: regCelo.fecha,
          });
        }
      }

      // ===== REGLAS BASADAS EN TRATAMIENTO =====

      const regTratamiento = historial.find((r: any) => r.tipo === "Tratamiento");
      if (regTratamiento && diasDesdeUltimo <= 14) {
        // REGLA 12: Seguimiento de tratamiento (14 días)
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Seguimiento sanitario",
          prioridad: "media",
          descripcion: "Verificar evolución del tratamiento",
          dias: diasDesdeUltimo,
          fecha: regTratamiento.fecha,
        });
      }

      // ===== REGLAS BASADAS EN VACUNACIÓN =====

      const regVacunacion = historial.find((r: any) => r.tipo === "Vacunación");
      if (regVacunacion) {
        const diasDesdeVacunacion = calcularDiasEntre(regVacunacion.fecha, hoy);
        // REGLA 13: Vacunación programada (cada 180 días)
        if (diasDesdeVacunacion >= 180 && diasDesdeVacunacion <= 190) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Vacunación programada",
            prioridad: "media",
            descripcion: "Mantener plan sanitario vigente",
            dias: diasDesdeVacunacion,
            fecha: regVacunacion.fecha,
          });
        }
      }

      // ===== REGLAS BASADAS EN DESPARASITACIÓN =====

      const regDesparasitacion = historial.find((r: any) => r.tipo === "Desparasitación");
      if (regDesparasitacion) {
        const diasDesdeDesparasitacion = calcularDiasEntre(regDesparasitacion.fecha, hoy);
        // REGLA 14: Desparasitación programada (cada 120 días)
        if (diasDesdeDesparasitacion >= 120 && diasDesdeDesparasitacion <= 130) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Desparasitación programada",
            prioridad: "media",
            descripcion: "Mantener control parasitario",
            dias: diasDesdeDesparasitacion,
            fecha: regDesparasitacion.fecha,
          });
        }
      }

      // ===== REGLAS GENERALES DE INACTIVIDAD =====

      // REGLA 15: Sin registros recientes (>30 días)
      if (diasDesdeUltimo > 30 && diasDesdeUltimo <= 60) {
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Actualizar información",
          prioridad: "baja",
          descripcion: "No existen registros recientes",
          dias: diasDesdeUltimo,
          fecha: ultimoRegistro.fecha,
        });
      }

      // REGLA 16: Cerda inactiva (>60 días)
      if (diasDesdeUltimo > 60) {
        nuevasTareas.push({
          id: cerda.id,
          tipo: "Revisar estado productivo",
          prioridad: "media",
          descripcion: "Verificar situación reproductiva",
          dias: diasDesdeUltimo,
          fecha: ultimoRegistro.fecha,
        });
      }

      // ===== REGLAS ADICIONALES VETERINARIAS =====

      // Detectar múltiples abortos consecutivos
      const abortos = historial.filter((r: any) => r.tipo === "Aborto");
      if (abortos.length >= 2) {
        const dos_ultimos = abortos.slice(0, 2);
        if (
          calcularDiasEntre(dos_ultimos[1].fecha, dos_ultimos[0].fecha) <= 180
        ) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Evaluación reproductiva",
            prioridad: "alta",
            descripcion: "Múltiples abortos detectados - Revisar continuidad en el plantel",
            dias: 0,
            fecha: hoy,
          });
        }
      }

      // Detectar múltiples repeticiones de celo
      const celos = historial.filter((r: any) => r.tipo === "Celo");
      if (celos.length >= 3) {
        const tres_ultimos = celos.slice(0, 3);
        if (
          calcularDiasEntre(tres_ultimos[2].fecha, tres_ultimos[0].fecha) <= 90
        ) {
          nuevasTareas.push({
            id: cerda.id,
            tipo: "Evaluación reproductiva",
            prioridad: "alta",
            descripcion: "Repeticiones de celo consecutivas - Revisar continuidad en el plantel",
            dias: 0,
            fecha: hoy,
          });
        }
      }
    });

    // Remover duplicados por tipo y cerda
    const tareasUnicas = nuevasTareas.filter((tarea, index, self) =>
      index === self.findIndex((t) => t.id === tarea.id && t.tipo === tarea.tipo)
    );

    // Ordenar por: Prioridad -> Vencidas -> Hoy -> Próx 7 días -> Próx 30 días -> Resto
    const prioridadNum = { critica: 0, alta: 1, media: 2, baja: 3 };
    const calcularOrden = (tarea: any) => {
      if (tarea.dias < 0) return 0; // Vencidas
      if (tarea.dias === 0) return 1; // Hoy
      if (tarea.dias <= 7) return 2; // Próximos 7 días
      if (tarea.dias <= 30) return 3; // Próximos 30 días
      return 4; // Resto
    };

    tareasUnicas.sort((a, b) => {
      const prioridadA = prioridadNum[a.prioridad as keyof typeof prioridadNum];
      const prioridadB = prioridadNum[b.prioridad as keyof typeof prioridadNum];
      if (prioridadA !== prioridadB) return prioridadA - prioridadB;

      const ordenA = calcularOrden(a);
      const ordenB = calcularOrden(b);
      if (ordenA !== ordenB) return ordenA - ordenB;

      return a.dias - b.dias;
    });

    setTareas(tareasUnicas);

    // Mostrar notificaciones para tareas críticas
    const tareasCriticas = tareasUnicas.filter((t) => t.prioridad === "critica");
    if (tareasCriticas.length > 0) {
      addToast(
        "🔴 Alertas Críticas",
        `${tareasCriticas.length} tarea(s) crítica(s) requiere(n) acción inmediata`,
        "error",
        8000
      );
      
      // Enviar notificación push para cada tarea crítica
      tareasCriticas.forEach((tarea) => {
        void sendPushNotification(`🔴 ${tarea.tipo}`, {
          body: `${tarea.id}: ${tarea.descripcion}`,
          tag: `critica-${tarea.id}-${tarea.tipo}`,
        });
      });
    }
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

  return (
    <PageShell bgColor="#ffffff" className="p-4 text-slate-900">
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </PageShell>
  );
}
