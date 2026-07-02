"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";

export default function Gestacion() {
  const router = useRouter();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [mostrarMenuFlotante, setMostrarMenuFlotante] = useState(false);

  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [activeTouchIndex, setActiveTouchIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [deletePinInput, setDeletePinInput] = useState("");
  const [deletePinError, setDeletePinError] = useState("");

  const [id, setId] = useState("");
  const [idError, setIdError] = useState("");
  const [raza, setRaza] = useState("Camborough");
  const [otraRaza, setOtraRaza] = useState("");
  const [peso, setPeso] = useState("");
  const [pesoError, setPesoError] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaError, setFechaError] = useState("");
  const [razaError, setRazaError] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");

  const [cerdas, setCerdas] = useState<any[]>([]);

  const DIAS_GESTACION = 114;
  const MESES = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  function formatearFechaCorta(fecha: string): string {
    const d = new Date(fecha);
    const dia = d.getDate();
    const mes = MESES[d.getMonth()];
    const anio = d.getFullYear();
    return `${mes}-${dia}-${anio}`;
  }

  function calcularParto(fechaInseminacion: string) {
    const f = new Date(fechaInseminacion);
    f.setDate(f.getDate() + DIAS_GESTACION);
    return f.toISOString().split("T")[0];
  }

  function calcularDiasEntre(fechaInicio: string, fechaFin: string) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  }

  function calcularDiasParaParto(fechaInseminacion: string) {
    const diasDesde = calcularDiasEntre(
      fechaInseminacion,
      new Date().toISOString().split("T")[0]
    );
    return Math.max(0, DIAS_GESTACION - diasDesde);
  }

  useEffect(() => {
    const datos = JSON.parse(
      localStorage.getItem("cerdas") || "[]"
    );

    setCerdas(datos);
    setEstadoFiltro("Todos");
  }, []);

  // CERRAR MENÚ AL TOCAR FUERA
  useEffect(() => {
    function handleClickOutside() {
      setMenuIndex(null);
      setSwipedIndex(null);
    }

    if (menuIndex !== null || swipedIndex !== null) {
      document.addEventListener(
        "click",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside
      );
    };
  }, [menuIndex, swipedIndex]);

  function guardar(nuevas: any[]) {
    setCerdas(nuevas);

    localStorage.setItem(
      "cerdas",
      JSON.stringify(nuevas)
    );
  }

  function resetForm() {
    setId("");
    setIdError("");
    setRaza("Camborough");
    setOtraRaza("");
    setPeso("");
    setPesoError("");
    setFecha("");
    setFechaError("");
    setRazaError("");
    setCaracteristicas("");
    setEditIndex(null);
  }

  function eliminarCerda(index: number) {
    setConfirmDeleteIndex(index);
    setMenuIndex(null);
  }

  function confirmarEliminarCerda() {
    if (confirmDeleteIndex === null) return;

    if (deletePinInput !== "0030") {
      setDeletePinError("Clave incorrecta");
      return;
    }

    const cerdaAEliminar = cerdas[confirmDeleteIndex];

    const nuevas = cerdas.filter((_, i) => i !== confirmDeleteIndex);

    guardar(nuevas);

    localStorage.removeItem(`historial-${cerdaAEliminar.id}`);

    setConfirmDeleteIndex(null);
    setDeletePinInput("");
    setDeletePinError("");
  }

  function cancelarEliminarCerda() {
    setConfirmDeleteIndex(null);
    setDeletePinInput("");
    setDeletePinError("");
  }

  function editarCerda(index: number) {
    const c = cerdas[index];

    const razasBase = [
      "Camborough",
      "Landrace",
      "Large White",
      "Yorkshire",
      "Duroc",
      "Pietrain",
      "Hampshire",
    ];

    setId(c.id);

    setRaza(
      razasBase.includes(c.raza)
        ? c.raza
        : "OTRA"
    );

    setOtraRaza(
      razasBase.includes(c.raza)
        ? ""
        : c.raza
    );

    setFecha(c.fecha);
    setPeso(c.peso || "");

    setCaracteristicas(
      c.caracteristicas
    );

    setEditIndex(index);

    setMostrarFormulario(true);
    setSwipedIndex(null);

    setMenuIndex(null);
  }

  function obtenerEstadoPorRegistro(tipo?: string) {
    switch (tipo) {
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

  function obtenerEstadoStyles(estado?: string) {
    switch (estado) {
      case "Gestación":
        return "bg-blue-500 text-white";
      case "Lactancia":
        return "bg-green-500 text-white";
      case "Próxima a Celo":
        return "bg-yellow-500 text-black";
      case "Aborto":
        return "bg-rose-500 text-white";
      case "Baja":
        return "bg-red-500 text-white";
      case "Celo":
        return "bg-yellow-500 text-black";
      case "Tratamiento":
        return "bg-emerald-700 text-white";
      case "Activa":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-slate-300 text-slate-800";
    }
  }

  function obtenerBarraColor(estado?: string) {
    switch (estado) {
      case "Gestación":
        return "from-blue-500 to-blue-400";
      case "Lactancia":
        return "from-green-500 to-green-400";
      case "Próxima a Celo":
      case "Celo":
        return "from-yellow-500 to-yellow-400";
      case "Aborto":
      case "Tratamiento":
        return "from-rose-500 to-rose-400";
      case "Baja":
        return "from-red-500 to-red-400";
      case "Activa":
        return "from-pink-200 to-pink-100";
      default:
        return "from-emerald-700 to-emerald-500";
    }
  }

  function obtenerPanelStyles(estado?: string) {
    switch (estado) {
      case "Gestación":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          title: "text-blue-700",
          content: "text-blue-900",
          secondary: "text-blue-600",
        };
      case "Lactancia":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          title: "text-green-700",
          content: "text-green-900",
          secondary: "text-green-600",
        };
      case "Próxima a Celo":
      case "Celo":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          title: "text-yellow-700",
          content: "text-yellow-800",
          secondary: "text-yellow-600",
        };
      case "Aborto":
      case "Tratamiento":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          title: "text-rose-700",
          content: "text-rose-800",
          secondary: "text-rose-600",
        };
      case "Baja":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          title: "text-red-700",
          content: "text-red-800",
          secondary: "text-red-600",
        };
      case "Activa":
        return {
          bg: "bg-pink-50",
          border: "border-pink-200",
          title: "text-pink-700",
          content: "text-pink-900",
          secondary: "text-pink-600",
        };
      default:
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          title: "text-emerald-700",
          content: "text-emerald-900",
          secondary: "text-emerald-600",
        };
    }
  }

  function handleTouchStart(e: React.TouchEvent, idx: number) {
    setActiveTouchIndex(idx);
    setTouchStartX(e.touches[0].clientX);
    setTouchCurrentX(e.touches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent, idx: number) {
    if (activeTouchIndex !== idx || touchStartX === null) return;
    setTouchCurrentX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent, idx: number) {
    if (touchStartX === null || touchCurrentX === null) {
      setActiveTouchIndex(null);
      setTouchStartX(null);
      setTouchCurrentX(null);
      return;
    }

    const dx = touchCurrentX - touchStartX;
    const threshold = -60;

    if (dx < threshold) {
      setSwipedIndex(idx);
    } else if (swipedIndex === idx && dx > 40) {
      setSwipedIndex(null);
    }

    setActiveTouchIndex(null);
    setTouchStartX(null);
    setTouchCurrentX(null);
  }

  function agregarOCrear() {
    const razaFinal =
      raza === "OTRA"
        ? otraRaza
        : raza;

    if (!id.trim()) {
      setIdError("El ID es obligatorio");
      return;
    }

    if (!razaFinal) {
      setRazaError("La raza es obligatoria");
      return;
    }

    if (!peso.trim()) {
      setPesoError("El peso es obligatorio");
      return;
    }

    const pesoFinal = peso.replace(",", ".");
    const pesoNumero = parseFloat(pesoFinal);
    if (Number.isNaN(pesoNumero) || pesoNumero <= 0) {
      setPesoError("Peso inválido");
      return;
    }

    const idMayus = id.toUpperCase();
    const idYaExiste = cerdas.some(
      (cerda, index) => 
        cerda.id === idMayus && 
        (editIndex === null || index !== editIndex)
    );

    if (idYaExiste) {
      setIdError("Este ID ya existe");
      return;
    }

    if (!fecha) {
      setFechaError("La fecha de llegada es obligatoria");
      return;
    }

    const llegadaDate = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (llegadaDate.getTime() > hoy.getTime()) {
      setFechaError("La fecha de llegada no puede ser futura");
      return;
    }

    setIdError("");
    setRazaError("");
    setPesoError("");
    setFechaError("");

    const nueva = {
      id: idMayus,
      raza: razaFinal,
      peso,
      fecha,
      caracteristicas,
      estado: "GESTACIÓN",
    };

    if (editIndex !== null) {
      const confirmar = confirm(
        "¿Confirmas actualizar cerda?"
      );

      if (!confirmar) return;

      const nuevas = [...cerdas];

      nuevas[editIndex] = nueva;

      guardar(nuevas);

    } else {

      guardar([
        ...cerdas,
        nueva,
      ]);
    }

    setMostrarFormulario(false);

    resetForm();
  }

  const filtradas = cerdas.filter(
    (c) => {
      const matchesId = (c.id || "").toLowerCase().includes(buscar.toLowerCase());

      const historialRaw = JSON.parse(
        localStorage.getItem(`historial-${c.id}`) || "[]"
      );
      const historial = Array.isArray(historialRaw) ? historialRaw : [];
      const ultimoRegistro = historial[0] || null;
      const estado = ultimoRegistro
        ? obtenerEstadoPorRegistro(ultimoRegistro.tipo)
        : "Activa";

      const matchesEstado = estadoFiltro === "Todos" || estado === estadoFiltro;

      return matchesId && matchesEstado;
    }
  ).sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  const totales = cerdas.reduce(
    (acc, cerda) => {
      const historialRaw = JSON.parse(
        localStorage.getItem(`historial-${cerda.id}`) || "[]"
      );
      const historial = Array.isArray(historialRaw) ? historialRaw : [];
      const ultimoRegistro = historial[0] || null;
      const estadoLabel = ultimoRegistro
        ? obtenerEstadoPorRegistro(ultimoRegistro.tipo)
        : "Activa";

      const ultimaInseminacion = historial.find(
        (r: any) => r.tipo === "Inseminación"
      );
      const diasParaParto = ultimaInseminacion
        ? calcularDiasParaParto(ultimaInseminacion.fecha)
        : null;

      acc.gestantes += estadoLabel === "Gestación" ? 1 : 0;
      acc.lactando += estadoLabel === "Lactancia" ? 1 : 0;
      acc.proxPartos +=
        estadoLabel === "Gestación" && diasParaParto !== null && diasParaParto <= 14
          ? 1
          : 0;
      acc.alertas += [
        "Aborto",
        "Baja",
        "Celo",
        "Tratamiento",
        "Próxima a Celo",
      ].includes(estadoLabel)
        ? 1
        : 0;

      return acc;
    },
    {
      gestantes: 0,
      lactando: 0,
      proxPartos: 0,
      alertas: 0,
    }
  );

  return (
    <PageShell bgColor="#ffffff" className="p-3 text-slate-900">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">
                Gestación
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Inventario de hembras
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-3">
            <div className="rounded-2xl bg-emerald-100 p-1.5 shadow-sm border border-emerald-200">
              <p className="text-[8px] uppercase tracking-[0.24em] text-emerald-700 font-semibold">Gestantes</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{totales.gestantes}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">{cerdas.length ? `${Math.round((totales.gestantes / cerdas.length) * 100)}%` : '0%'}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-1.5 shadow-sm border border-emerald-100">
              <p className="text-[8px] uppercase tracking-[0.24em] text-emerald-700 font-semibold">Lactando</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{totales.lactando}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">{cerdas.length ? `${Math.round((totales.lactando / cerdas.length) * 100)}%` : '0%'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-1.5 shadow-sm border border-slate-200">
              <p className="text-[8px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Próx. partos</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{totales.proxPartos}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">Nuevos en 14 días</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-1.5 shadow-sm border border-slate-200">
              <p className="text-[8px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Alertas</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{totales.alertas}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">Requieren atención</p>
            </div>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="mb-4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Buscar por ID, nombre o raza..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full p-2 rounded-2xl bg-gray-100 border border-gray-300 outline-none text-black text-sm"
          />
        </div>

        {/* CARDS */}
        {filtradas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Sin registros
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

            {filtradas.map((cerda, index) => {
            const historialRaw = JSON.parse(
              localStorage.getItem(`historial-${cerda.id}`) || "[]"
            );
            const historial = Array.isArray(historialRaw)
              ? historialRaw
              : [];

            const ultimoRegistro = historial[0] || null;
            const estadoLabel = ultimoRegistro
              ? obtenerEstadoPorRegistro(ultimoRegistro.tipo)
              : "Activa";
            const panelStyles = obtenerPanelStyles(estadoLabel);

            const ultimaInseminacion = historial.find(
              (item: any) => item.tipo === "Inseminación"
            );
            const diasDesdeInseminacion = ultimaInseminacion
              ? calcularDiasEntre(
                  ultimaInseminacion.fecha,
                  new Date().toISOString().split("T")[0]
                )
              : null;
            const diasParaParto = ultimaInseminacion
              ? calcularDiasParaParto(ultimaInseminacion.fecha)
              : null;
            const progresoGestacion = diasDesdeInseminacion !== null
              ? Math.min(100, Math.max(0, Math.round((diasDesdeInseminacion / DIAS_GESTACION) * 100)))
              : null;
            const isActiveMove = activeTouchIndex === index && touchStartX !== null && touchCurrentX !== null;
            const moveDx = isActiveMove ? Math.min(0, touchCurrentX! - touchStartX!) : 0;
            const isSwiped = swipedIndex === index;
            const translateX = isSwiped ? -96 : moveDx;

            return (
              <div
                key={index}
                className="w-full relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md active:scale-[0.99]"
              >
                <div className={`absolute inset-y-0 right-0 z-0 flex flex-col items-end justify-center gap-2 pr-3 bg-emerald-50/90 border-l border-emerald-100 w-24 transition duration-200 ${isSwiped ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                  <button
                    data-swipe-ignore="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwipedIndex(null);
                      editarCerda(index);
                    }}
                    className="w-full rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm"
                  >
                    Editar
                  </button>
                  <button
                    data-swipe-ignore="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwipedIndex(null);
                      eliminarCerda(index);
                    }}
                    className="w-full rounded-lg bg-red-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm"
                  >
                    Eliminar
                  </button>
                </div>

                <div
                  className="relative z-10 p-2.5 cursor-pointer"
                  onClick={() => {
                    if (isSwiped) {
                      setSwipedIndex(null);
                      return;
                    }
                    router.push(`/cerda/${cerda.id}`);
                  }}
                  onTouchStart={(e) => { handleTouchStart(e, index); e.stopPropagation(); }}
                  onTouchMove={(e) => { handleTouchMove(e, index); e.stopPropagation(); }}
                  onTouchEnd={(e) => { handleTouchEnd(e, index); e.stopPropagation(); }}
                  style={{ transform: `translateX(${translateX}px)` }}
                >
                  <div className={`absolute inset-y-0 left-0 w-2 rounded-r-3xl bg-gradient-to-b ${obtenerBarraColor(estadoLabel)}`} />
                  <div className="relative flex flex-col gap-1.5 pl-3 pr-8">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-sm shrink-0">🐷</div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-950">{cerda.id}</h2>
                        <p className="text-gray-500 text-[11px] mt-0.5">{cerda.raza}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap ${obtenerEstadoStyles(estadoLabel)}`}>
                      {estadoLabel}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{ultimoRegistro?.tipo === "Inseminación" ? `IA: ${formatearFechaCorta(ultimoRegistro.fecha)}` : `Llegada: ${formatearFechaCorta(cerda.fecha)}`}</span>
                    </div>
                    {progresoGestacion !== null && estadoLabel === "Gestación" ? (
                      <div className="space-y-2">
                        <div className="text-[9px] text-slate-500 uppercase tracking-[0.18em]">Progreso de gestación</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${progresoGestacion}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-500">
                          <span>{progresoGestacion}%</span>
                          <span>{diasParaParto !== null ? `Faltan ${diasParaParto} días` : ""}</span>
                        </div>
                      </div>
                    ) : diasDesdeInseminacion !== null ? (
                      <div className="flex items-center gap-1.5">
                        <span>⏱</span>
                        <span>{diasDesdeInseminacion} días</span>
                      </div>
                    ) : null}
                    {cerda.caracteristicas ? (
                      <div className="flex items-center gap-1.5">
                        <span>📝</span>
                        <span>{cerda.caracteristicas}</span>
                      </div>
                    ) : null}

                    <div className={`rounded-2xl border p-1.5 ${panelStyles.bg} ${panelStyles.border}`}>
                      {estadoLabel === "Gestación" && diasParaParto !== null ? (
                        <>
                          <p className={`text-[9px] uppercase tracking-[0.18em] ${panelStyles.title}`}>Parto</p>
                          <p className={`mt-0.5 text-xs font-semibold ${panelStyles.content}`}>{formatearFechaCorta(calcularParto(ultimaInseminacion?.fecha || cerda.fecha))}</p>
                          <p className={`mt-0.5 text-[9px] ${panelStyles.secondary}`}>Quedan {diasParaParto} días</p>
                        </>
                      ) : ultimoRegistro?.tipo === "Evento" ? (
                        <>
                          <p className={`text-[9px] uppercase tracking-[0.18em] ${panelStyles.title}`}>Evento</p>
                          <p className={`mt-0.5 text-xs font-semibold ${panelStyles.content}`}>Nuevo evento registrado</p>
                        </>
                      ) : estadoLabel === "Lactancia" ? (
                        <>
                          <p className={`text-[9px] uppercase tracking-[0.18em] ${panelStyles.title}`}>Lactancia</p>
                          <p className={`mt-0.5 text-xs font-semibold ${panelStyles.content}`}>{ultimoRegistro?.mensaje || "En lactancia"}</p>
                        </>
                      ) : (
                        <>
                          <p className={`text-[9px] uppercase tracking-[0.18em] ${panelStyles.title}`}>Seguimiento</p>
                          <p className={`mt-0.5 text-xs font-semibold ${panelStyles.content}`}>{ultimoRegistro?.mensaje || "Pendiente"}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                </div>
              </div>
            );
            })}

          </div>
        )}

        {/* BOTÓN + */}
        <div className="relative">
          <button
            onClick={() => setMostrarMenuFlotante(!mostrarMenuFlotante)}
            className="
              fixed
              bottom-[1.5rem]
              right-5
              bg-gradient-to-br
              from-emerald-700
              to-emerald-900
              text-white
              w-14
              h-14
              rounded-full
              text-3xl
              shadow-lg
              hover:shadow-xl
              hover:scale-105
              active:scale-95
              transition-all
              duration-200
            "
            aria-label="Abrir menú de opciones"
          >
            <span className={`inline-block transition-transform duration-300 ${mostrarMenuFlotante ? 'rotate-45' : ''}`}>
              +
            </span>
          </button>

          {mostrarMenuFlotante && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMostrarMenuFlotante(false)}
              />

              <div className="fixed bottom-16 right-4 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="px-3 py-2 bg-gradient-to-br from-white to-emerald-50 border-b border-slate-100">
                  <label className="text-[9px] font-semibold text-slate-700 block mb-1 uppercase tracking-[0.2em]">Filtrar por estado</label>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => {
                      setEstadoFiltro(e.target.value);
                      setMostrarMenuFlotante(false);
                    }}
                    className="w-full rounded-2xl bg-white border border-gray-300 px-3 py-2 text-xs text-black font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    aria-label="Filtrar por estado"
                  >
                    <option>Todos</option>
                    <option>Activa</option>
                    <option>Gestación</option>
                    <option>Lactancia</option>
                    <option>Próxima a Celo</option>
                    <option>Celo</option>
                    <option>Aborto</option>
                    <option>Baja</option>
                    <option>Tratamiento</option>
                  </select>
                </div>

                <div className="border-t border-gray-100" />

                <button
  onClick={() => {
    setMostrarMenuFlotante(false);
    router.push("/tareas");
  }}
  className="block w-full px-2 py-2 text-left hover:bg-emerald-50 transition-colors group"
>
  <div className="flex items-center gap-2">
<div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                      <span className="text-yellow-600 font-bold text-xs">!</span>
    </div>

    <div>
      <p className="text-sm font-semibold text-black">
        Alertas
      </p>

      <p className="text-xs text-gray-500">
        Ver tareas
      </p>
    </div>
  </div>
</button>

                <div className="border-t border-gray-100" />

                <button
                  onClick={() => {
                    resetForm();
                    setMostrarFormulario(true);
                    setMostrarMenuFlotante(false);
                  }}
                  className="block w-full px-2 py-2 text-left hover:bg-emerald-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <span className="text-emerald-800 font-bold text-xs">+</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">Agregar Cerda</p>
                      <p className="text-xs text-gray-500">Nueva hembra</p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* CONFIRMAR ELIMINACIÓN */}
        {confirmDeleteIndex !== null && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-3">
            <div className="w-full max-w-sm rounded-3xl bg-white p-4 text-black shadow-2xl">
              <h3 className="text-lg font-bold text-emerald-900">Eliminar cerda {cerdas[confirmDeleteIndex]?.id || ""}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Ingresa la clave de confirmación. Esta acción no se podrá restablecer!
              </p>

              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deletePinInput}
                onChange={(e) => setDeletePinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder=""
                className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-black outline-none"
              />

              {deletePinError ? <p className="mt-2 text-sm text-red-600">{deletePinError}</p> : null}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={cancelarEliminarCerda}
                  className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminarCerda}
                  className="rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        {mostrarFormulario && (

          <div
            className="
              fixed
              inset-0
              z-[70]
              bg-black/40
              flex
              items-center
              justify-center
              p-3
            "
          >

            <div
              className="
                bg-white
                w-full
                max-w-sm
                rounded-3xl
                p-3
                text-black
              "
            >

              <h2
                className="
                  text-lg
                  font-bold
                  text-emerald-900
                  mb-3
                "
              >
                {editIndex !== null
                  ? "Editar Cerda"
                  : "Nueva Cerda"}
              </h2>

                <button
                  onClick={() => setMostrarFormulario(false)}
                  aria-label="Cerrar formulario"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

              <div className="space-y-3">

                {/* ID */}
                <div>
                  <input
                    type="text"
                    placeholder="ID"
                    value={id}
                    onChange={(e) => {
                      setId(
                        e.target.value.toUpperCase()
                      );
                      if (idError) setIdError("");
                    }}
                    aria-label="ID de la cerda"
                    className={`
                      w-full
                      h-12
                      px-3
                      rounded-2xl
                      bg-gray-100
                      border
                      ${idError ? "border-red-500" : "border-gray-300"}
                      outline-none
                      uppercase
                      text-black
                      placeholder:text-gray-500
                    `}
                  />
                  {idError && (
                    <p className="text-xs text-red-600 mt-2">
                      {idError}
                    </p>
                  )}
                </div>

                {/* RAZA */}
                <select
                  value={raza}
                  onChange={(e) =>
                    setRaza(e.target.value)
                  }
                  aria-label="Raza"
                  className="
                    w-full
                    h-12
                    px-3
                    rounded-2xl
                    bg-gray-100
                    border
                    border-gray-300
                    outline-none
                    text-black
                    text-sm
                  "
                >

                  <option value="Camborough">
                    Camborough
                  </option>

                  <option value="Landrace">
                    Landrace
                  </option>

                  <option value="Large White">
                    Large White
                  </option>

                  <option value="Yorkshire">
                    Yorkshire
                  </option>

                  <option value="Duroc">
                    Duroc
                  </option>

                  <option value="Pietrain">
                    Pietrain
                  </option>

                  <option value="Hampshire">
                    Hampshire
                  </option>

                  <option value="OTRA">
                    Otra
                  </option>

                </select>

                {/* OTRA RAZA */}
                {raza === "OTRA" && (

                  <input
                    type="text"
                    placeholder="Escribe la raza"
                    value={otraRaza}
                    onChange={(e) =>
                      setOtraRaza(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      px-3
                      rounded-2xl
                      bg-gray-100
                      border
                      border-gray-300
                      outline-none
                      text-black
                      placeholder:text-gray-500
                    "
                  />

                )}

                <div>
                  <p className="text-sm mb-2 text-gray-600">Peso (kg)</p>
                  <input
                    type="tel"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    value={peso}
                    onChange={(e) => {
                      const nuevo = e.target.value.replace(/[^0-9.,]/g, "");
                      setPeso(nuevo);
                      if (pesoError) setPesoError("");
                    }}
                    placeholder="Ej: 70.0"
                    aria-label="Peso"
                    className={`w-full h-12 px-3 rounded-2xl bg-gray-100 border ${pesoError ? "border-red-500" : "border-gray-300"} outline-none text-black text-sm`}
                  />
                  {pesoError && <p className="mt-2 text-xs text-red-600">{pesoError}</p>}
                </div>

                {/* FECHA */}
                <div>

                  <p className="text-sm mb-2 text-gray-600">
                    Fecha de llegada
                  </p>

                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      if (fechaError) setFechaError("");
                    }}
                    aria-label="Fecha de llegada"
                    className={`
                      w-full
                      h-12
                      px-3
                      rounded-2xl
                      bg-gray-100
                      border
                      ${fechaError ? "border-red-500" : "border-gray-300"}
                      outline-none
                      text-black
                      appearance-none
                    `}
                  />

                  {fechaError && (
                    <p className="text-xs text-red-600 mt-2">
                      {fechaError}
                    </p>
                  )}

                </div>

                {/* CARACTERÍSTICAS */}
                <textarea
                  value={caracteristicas}
                  onChange={(e) =>
                    setCaracteristicas(
                      e.target.value
                    )
                  }
                  placeholder="Características"
                  aria-label="Características"
                  className="
                    w-full
                    h-20
                    px-3
                    py-2
                    rounded-2xl
                    bg-gray-100
                    border
                    border-gray-300
                    outline-none
                    text-black
                    resize-none
                    placeholder:text-gray-500
                    text-sm
                  "
                />

                {/* BOTÓN */}
                <button
                  onClick={agregarOCrear}
                  className="
                    w-full
                    bg-emerald-800
                    text-white
                    py-2.5
                    rounded-2xl
                    text-sm
                    font-bold
                  "
                >
                  {editIndex !== null
                    ? "Actualizar"
                    : "Agregar"}
                </button>

                {/* CANCELAR */}
                <button
                  onClick={() =>
                    setMostrarFormulario(false)
                  }
                  className="
                    w-full
                    bg-gray-200
                    py-2.5
                    rounded-2xl
                    text-sm
                    text-black
                  "
                >
                  Cancelar
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </PageShell>
  );
}