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
  const [estiloTarjetas, setEstiloTarjetas] = useState<"normal" | "original">("original");

  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const [id, setId] = useState("");
  const [idError, setIdError] = useState("");
  const [raza, setRaza] = useState("Camborough");
  const [otraRaza, setOtraRaza] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaError, setFechaError] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");

  const [cerdas, setCerdas] = useState<any[]>([]);

  useEffect(() => {
    const datos = JSON.parse(
      localStorage.getItem("cerdas") || "[]"
    );

    setCerdas(datos);
    setEstadoFiltro("Todos");

    const estiloGuardado = localStorage.getItem("gestacion-estiloTarjetas");
    if (estiloGuardado === "original" || estiloGuardado === "normal") {
      setEstiloTarjetas(estiloGuardado);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gestacion-estiloTarjetas", estiloTarjetas);
  }, [estiloTarjetas]);

  // CERRAR MENÚ AL TOCAR FUERA
  useEffect(() => {
    function handleClickOutside() {
      setMenuIndex(null);
    }

    if (menuIndex !== null) {
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
  }, [menuIndex]);

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
    setFecha("");
    setFechaError("");
    setCaracteristicas("");
    setEditIndex(null);
  }

  function eliminarCerda(index: number) {
    setConfirmDeleteIndex(index);
    setMenuIndex(null);
  }

  function confirmarEliminarCerda() {
    if (confirmDeleteIndex === null) return;

    const cerdaAEliminar = cerdas[confirmDeleteIndex];

    // Eliminar cerda de la lista
    const nuevas = cerdas.filter((_, i) => i !== confirmDeleteIndex);

    guardar(nuevas);

    // Eliminar historial asociado
    localStorage.removeItem(`historial-${cerdaAEliminar.id}`);

    setConfirmDeleteIndex(null);
  }

  function cancelarEliminarCerda() {
    setConfirmDeleteIndex(null);
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

    setCaracteristicas(
      c.caracteristicas
    );

    setEditIndex(index);

    setMostrarFormulario(true);

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
        return "bg-pink-500 text-white";
      case "Baja":
        return "bg-red-500 text-white";
      case "Celo":
        return "bg-yellow-500 text-black";
      case "Tratamiento":
        return "bg-pink-500 text-white";
      default:
        return "bg-pink-500 text-white";
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
        return "from-pink-500 to-pink-400";
      case "Baja":
        return "from-red-500 to-red-400";
      default:
        return "from-pink-500 to-pink-400";
    }
  }

  function obtenerMensajeStyles(estado?: string) {
    switch (estado) {
      case "Gestación":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          title: "text-blue-700",
          content: "text-blue-900",
        };
      case "Lactancia":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          title: "text-green-700",
          content: "text-green-900",
        };
      case "Próxima a Celo":
      case "Celo":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          title: "text-yellow-700",
          content: "text-yellow-800",
        };
      case "Aborto":
      case "Tratamiento":
        return {
          bg: "bg-pink-50",
          border: "border-pink-200",
          title: "text-pink-700",
          content: "text-pink-800",
        };
      case "Baja":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          title: "text-red-700",
          content: "text-red-800",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          title: "text-gray-700",
          content: "text-gray-900",
        };
    }
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

    if (!razaFinal) return;

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

    setIdError("");

    const nueva = {
      id: idMayus,
      raza: razaFinal,
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

  return (
    <PageShell bgColor="#ffffff" className="p-4 text-slate-900">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold text-pink-600">
                Gestación
              </h1>
              <p className="text-gray-600 mt-2">
                Inventario hembras
              </p>
            </div>

            <button
              onClick={() =>
                setEstiloTarjetas(
                  estiloTarjetas === "normal"
                    ? "original"
                    : "normal"
                )
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink-500 bg-white text-lg font-bold text-pink-600 shadow-sm transition hover:bg-pink-50"
              aria-label="Cambiar estilo de tarjetas"
            >
              ⊞
            </button>
          </div>
        </div>

        {/* BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar ID..."
          value={buscar}
          onChange={(e) =>
            setBuscar(e.target.value)
          }
          className="
            w-full
            p-4
            rounded-2xl
            bg-gray-100
            border
            border-gray-300
            mb-6
            outline-none
            text-black
          "
        />

        {/* CARDS */}
        <div className={`${estiloTarjetas === "original" ? "space-y-2" : "grid grid-cols-2 gap-3"}`}>

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
            const msgStyles = obtenerMensajeStyles(estadoLabel);

            if (estiloTarjetas === "original") {
              return (
                <div
                  key={index}
                  onClick={() => router.push(`/cerda/${cerda.id}`)}
                  className="w-full relative overflow-hidden rounded-[32px] p-2.5 min-h-[110px] text-left shadow-xl active:scale-95 transition duration-200 bg-white cursor-pointer"
                >
                  <div className={`absolute inset-y-0 left-0 w-2 rounded-r-3xl bg-gradient-to-b ${obtenerBarraColor(estadoLabel)}`} />
                  <div className="relative flex h-full flex-col justify-between gap-2 pl-4 pr-10">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1">
                          <h2 className="text-lg font-bold text-black">{cerda.id}</h2>
                          <p className="text-gray-500 text-sm mt-1 leading-tight">{cerda.raza}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap ${obtenerEstadoStyles(estadoLabel)}`}>
                          {estadoLabel}
                        </span>
                      </div>

                      {ultimoRegistro?.mensaje && (
                        <div className={`mt-2 ${msgStyles.bg} border ${msgStyles.border} p-2 rounded-2xl`}>
                          <p className={`${msgStyles.title} text-xs font-medium`}>Mensaje</p>
                          <p className={`${msgStyles.content} font-bold mt-1 text-sm`}>{ultimoRegistro.mensaje}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">{index + 1}/{filtradas.length}</div>
                    </div>
                  </div>

                  <button
                    aria-haspopup="true"
                    aria-expanded={menuIndex === index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuIndex(menuIndex === index ? null : index);
                    }}
                    className="
                      absolute
                      top-2
                      right-2
                      text-black
                      text-2xl
                      font-bold
                      px-2
                      hover:text-pink-600
                      transition-colors
                    "
                    aria-label={`Abrir menú para ${cerda.id}`}
                  >
                    ⋯
                  </button>

                  {menuIndex === index && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="
                        absolute
                        top-10
                        right-2
                        bg-white
                        border
                        border-gray-300
                        rounded-xl
                        shadow-lg
                        overflow-hidden
                        z-50
                        text-black
                      "
                    >
                      <button
                        onClick={() => editarCerda(index)}
                        className="
                          block
                          px-4
                          py-2
                          text-sm
                          hover:bg-pink-100
                          w-full
                          text-left
                        "
                        aria-label={`Editar ${cerda.id}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarCerda(index)}
                        className="
                          block
                          px-4
                          py-2
                          text-sm
                          hover:bg-red-100
                          w-full
                          text-left
                        "
                        aria-label={`Eliminar ${cerda.id}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={index}
                onClick={() => router.push(`/cerda/${cerda.id}`)}
                className="
                  relative
                  bg-white
                  rounded-2xl
                  p-4
                  border
                  border-pink-300
                  shadow-md
                  hover:shadow-lg
                  transition-shadow
                  cursor-pointer
                  active:scale-95
                  transition
                "
              >
                <h2 className="text-lg font-bold">{cerda.id}</h2>
                <p className="text-gray-600 text-sm">{cerda.raza}</p>
                <p className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold mt-1 ${obtenerEstadoStyles(estadoLabel)}`}>
                  {estadoLabel}
                </p>

                {ultimoRegistro?.mensaje && (
                  <div className={`mt-3 ${msgStyles.bg} border ${msgStyles.border} p-3 rounded-2xl`}>
                    <p className={`${msgStyles.title} text-sm font-medium`}>Mensaje</p>
                    <p className={`${msgStyles.content} font-bold mt-1`}>{ultimoRegistro.mensaje}</p>
                  </div>
                )}

                <button
                  aria-haspopup="true"
                  aria-expanded={menuIndex === index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuIndex(menuIndex === index ? null : index);
                  }}
                  className="
                    absolute
                    top-2
                    right-2
                    text-black
                    text-2xl
                    font-bold
                    px-2
                    hover:text-pink-600
                    transition-colors
                  "
                  aria-label={`Abrir menú para ${cerda.id}`}
                >
                  ⋯
                </button>

                {menuIndex === index && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="
                      absolute
                      top-10
                      right-2
                      bg-white
                      border
                      border-gray-300
                      rounded-xl
                      shadow-lg
                      overflow-hidden
                      z-50
                      text-black
                    "
                  >
                    <button
                      onClick={() => editarCerda(index)}
                      className="
                        block
                        px-4
                        py-2
                        text-sm
                        hover:bg-pink-100
                        w-full
                        text-left
                      "
                      aria-label={`Editar ${cerda.id}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCerda(index)}
                      className="
                        block
                        px-4
                        py-2
                        text-sm
                        hover:bg-red-100
                        w-full
                        text-left
                      "
                      aria-label={`Eliminar ${cerda.id}`}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* BOTÓN + */}
        <div className="relative">
          <button
            onClick={() => setMostrarMenuFlotante(!mostrarMenuFlotante)}
            className="
              fixed
              bottom-6
              right-6
              bg-gradient-to-br
              from-pink-500
              to-pink-600
              text-white
              w-16
              h-16
              rounded-full
              text-4xl
              shadow-lg
              hover:shadow-2xl
              hover:scale-110
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

              <div className="fixed bottom-24 right-6 bg-white border border-gray-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                  <label className="text-xs font-semibold text-gray-700 block mb-3 uppercase tracking-wider">Filtrar por estado</label>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => {
                      setEstadoFiltro(e.target.value);
                      setMostrarMenuFlotante(false);
                    }}
                    className="w-full rounded-xl bg-white border border-gray-300 px-3 py-2 text-sm text-black font-medium hover:border-pink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    setEstiloTarjetas(
                      estiloTarjetas === "normal"
                        ? "original"
                        : "normal"
                    );
                    setMostrarMenuFlotante(false);
                  }}
                  className="block w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors group"
                  aria-label="Cambiar estilo de tarjetas"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <span className="text-slate-600 text-lg">⊞</span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-black">
                        Cambiar estilo
                      </p>
                      <p className="text-xs text-gray-500">
                        {estiloTarjetas === "original" ? "Tarjetas" : "Tarjetas cuadriculadas"}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="border-t border-gray-100" />

                <button
  onClick={() => {
    setMostrarMenuFlotante(false);
    router.push("/tareas");
  }}
  className="block w-full px-6 py-4 text-left hover:bg-yellow-50 transition-colors group"
>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
      <span className="text-yellow-600 font-bold text-lg">!</span>
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
                  className="block w-full px-6 py-4 text-left hover:bg-pink-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                      <span className="text-pink-600 font-bold text-lg">+</span>
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

        {/* FORMULARIO */}
        {mostrarFormulario && (

          <div
            className="
              fixed
              inset-0
              bg-black/40
              flex
              items-center
              justify-center
              p-4
            "
          >

            <div
              className="
                bg-white
                w-full
                max-w-md
                rounded-3xl
                p-6
                text-black
              "
            >

              <h2
                className="
                  text-3xl
                  font-bold
                  text-pink-600
                  mb-6
                "
              >
                {editIndex !== null
                  ? "Editar Cerda"
                  : "Nueva Cerda"}
              </h2>

                <button
                  onClick={() => setMostrarFormulario(false)}
                  aria-label="Cerrar formulario"
                  className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

              <div className="space-y-4">

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
                      h-14
                      px-4
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
                    h-14
                    px-4
                    rounded-2xl
                    bg-gray-100
                    border
                    border-gray-300
                    outline-none
                    text-black
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
                      h-14
                      px-4
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
                      h-14
                      px-4
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
                    px-4
                    py-3
                    rounded-2xl
                    bg-gray-100
                    border
                    border-gray-300
                    outline-none
                    text-black
                    resize-none
                    placeholder:text-gray-500
                  "
                />

                {/* BOTÓN */}
                <button
                  onClick={agregarOCrear}
                  className="
                    w-full
                    bg-pink-500
                    text-white
                    py-4
                    rounded-2xl
                    text-lg
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
                    bg-gray-300
                    py-4
                    rounded-2xl
                    text-lg
                    text-black
                  "
                >
                  Cancelar
                </button>

              </div>

            </div>

          </div>

        )}

        {/* CONFIRM DELETE MODAL */}
        {confirmDeleteIndex !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
              <h3 className="text-lg font-bold text-black">Confirmar eliminación</h3>
              <p className="text-sm text-gray-600 mt-2">¿Eliminar la cerda <span className="font-semibold">{cerdas[confirmDeleteIndex].id}</span>? Esta acción no se puede deshacer.</p>

              <div className="mt-4 flex gap-3 justify-end">
                <button onClick={cancelarEliminarCerda} className="px-4 py-2 rounded-2xl bg-gray-100">Cancelar</button>
                <button onClick={confirmarEliminarCerda} className="px-4 py-2 rounded-2xl bg-red-500 text-white">Eliminar</button>
              </div>
            </div>
          </div>
        )}

      </div>

    </PageShell>
  );
}