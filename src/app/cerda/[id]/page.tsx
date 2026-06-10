"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const DIAS_GESTACION = 114;

export default function CerdaDetalle() {
  const { id } = useParams();
  const router = useRouter();

  const [cerda, setCerda] = useState<any>(null);
  const [registros, setRegistros] = useState<any[]>([]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [registroAbierto, setRegistroAbierto] = useState<number | null>(null);

  const [tipo, setTipo] = useState("Inseminación");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [mensajeAviso, setMensajeAviso] = useState("");

  useEffect(() => {
    const datos = JSON.parse(
      localStorage.getItem("cerdas") || "[]"
    );

    const encontrada = datos.find(
      (c: any) => c.id === id
    );

    setCerda(encontrada);

    const hist = JSON.parse(
      localStorage.getItem(
        `historial-${id}`
      ) || "[]"
    );

    const registrosLimpios = Array.isArray(hist)
      ? hist.filter((registro: any) => registro.tipo !== "Aviso")
      : [];

    setRegistros(registrosLimpios);

  }, [id]);

  function guardar(nuevos: any[]) {
    setRegistros(nuevos);

    localStorage.setItem(
      `historial-${id}`,
      JSON.stringify(nuevos)
    );
  }

  useEffect(() => {
    if (!mensajeAviso) return;

    const timer = window.setTimeout(() => {
      setMensajeAviso("");
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [mensajeAviso]);

  function mostrarAviso(mensaje: string) {
    setMensajeAviso(mensaje);
  }

  function eliminarRegistro(index: number) {
    const nuevos = registros.filter(
      (_, i) => i !== index
    );

    guardar(nuevos);
    setRegistroAbierto(null);
  }

  function eliminarHistorialCompleto() {
    if (
      !confirm(
        "¿Eliminar Historial? esta accion no se podra reestablecer"
      )
    ) {
      return;
    }

    localStorage.removeItem(
      `historial-${id}`
    );

    setRegistros([]);
    setMostrarMenu(false);
  }

  function calcularParto(
    fechaInseminacion: string
  ) {
    const f = new Date(fechaInseminacion);

    f.setDate(
      f.getDate() + DIAS_GESTACION
    );

    return f
      .toISOString()
      .split("T")[0];
  }

  function obtenerEstadoActual() {
    if (registros.length === 0) {
      return "Activa";
    }

    const ultimo = registros[0];

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

  function calcularDiasEntre(fechaInicio: string, fechaFin: string) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function agregarRegistro() {
    if (!fecha) return;

    const ultimoTipo = registros[0]?.tipo;
    const ultimaInseminacion = registros.find(
      (registro) => registro.tipo === "Inseminación"
    );
    const ultimoParto = registros.find(
      (registro) => registro.tipo === "Parto"
    );

    const diasDesdeInseminacion = ultimaInseminacion
      ? calcularDiasEntre(ultimaInseminacion.fecha, fecha)
      : null;
    const diasDesdeParto = ultimoParto
      ? calcularDiasEntre(ultimoParto.fecha, fecha)
      : null;

    if (ultimoTipo === "Inseminación") {
      if (tipo === "Celo") {
        mostrarAviso("Revisar Ciclo Reproductivo");
        return;
      }

      if (tipo === "Parto") {
        if (diasDesdeInseminacion === null || diasDesdeInseminacion < 110) {
          mostrarAviso("Revisar Ciclo Reproductivo");
          return;
        }
      }

      if (tipo === "Destete") {
        if (diasDesdeInseminacion === null || diasDesdeInseminacion < 114) {
          mostrarAviso("Revisar Ciclo Reproductivo");
          return;
        }
      }
    }

    if (ultimoTipo === "Celo") {
      if (["Parto", "Destete", "Aborto"].includes(tipo)) {
        mostrarAviso("Revisar Ciclo Reproductivo");
        return;
      }
    }

    if (ultimoTipo === "Parto") {
      if (tipo === "Inseminación") {
        if (diasDesdeParto === null || diasDesdeParto < 21) {
          mostrarAviso("Revisar Ciclo Reproductivo");
          return;
        }
      }
    }

    if (ultimoTipo === "Destete") {
      if (tipo === "Parto") {
        mostrarAviso("Revisar Ciclo Reproductivo");
        return;
      }
    }

    let nuevo: any = {
      tipo,
      fecha,
      descripcion,
    };

    // INSEMINACIÓN
    if (tipo === "Inseminación") {
      const partoEst = calcularParto(fecha);
      nuevo.partoEstimado = partoEst;
      nuevo.mensaje = `Parto estimado: ${partoEst}`;
    }

    // ABORTO
    if (tipo === "Aborto") {
      nuevo.mensaje =
        "Reiniciar ciclo reproductivo";
    }

    // BAJA
    if (tipo === "Baja") {
      nuevo.mensaje =
        "Cerda dada de baja";
    }

    // PARTO
    if (tipo === "Parto") {
      const d = new Date(fecha);
      const d21 = new Date(d);
      d21.setDate(d21.getDate() + 21);
      const d28 = new Date(d);
      d28.setDate(d28.getDate() + 28);
      const f21 = d21.toISOString().split("T")[0];
      const f28 = d28.toISOString().split("T")[0];

      nuevo.mensaje = `Destete entre ${f21} y ${f28}`;
    }

    // DESTETE
    if (tipo === "Destete") {
      const d = new Date(fecha);
      d.setDate(d.getDate() + 3);
      const fechaCelo = d.toISOString().split("T")[0];
      nuevo.mensaje = `Próxima a Celo ${fechaCelo}`;
    }

    // CELO
    if (tipo === "Celo") {
      nuevo.mensaje = "Revisar Celo";
    }

    const nuevos = [
      nuevo,
      ...registros,
    ];

    guardar(nuevos);

    setMostrarForm(false);

    setFecha("");
    setDescripcion("");
  }

  if (!cerda) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f5f7] text-black">
        <p>Cerda no encontrada</p>
      </main>
    );
  }

  const estadoActual = obtenerEstadoActual();
  const estadoClase =
    estadoActual === "Baja"
      ? "bg-red-500 text-white"
      : estadoActual === "Gestación"
      ? "bg-blue-500 text-white"
      : estadoActual === "Lactancia"
      ? "bg-green-500 text-white"
      : estadoActual === "Próxima a Celo"
      ? "bg-yellow-500 text-black"
      : "bg-pink-500 text-white";

  const partoRegistro = registros.find((r) => r.tipo === "Parto");
  const ultimaInseminacion = registros.find((r) => r.tipo === "Inseminación");
  const textoParto = partoRegistro?.fecha || ultimaInseminacion?.partoEstimado || "-";

  return (
    <main className="min-h-screen bg-[#f5f5f7] p-4">

      {mensajeAviso && (
        <div className="fixed left-1/2 bottom-12 z-[9999] -translate-x-1/2 mx-auto w-auto max-w-xs whitespace-nowrap rounded-full bg-red-500 px-6 py-2 text-center text-sm font-bold text-white shadow-lg">
          {mensajeAviso}
        </div>
      )}

      <div className="max-w-md mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() => router.back()}
            className="bg-white shadow border border-gray-200 px-4 py-2 rounded-2xl text-black"
          >
            ←
          </button>

          <h1 className="text-2xl font-black text-black">{cerda.id}</h1>

          <div className="relative">

            <button
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="bg-white shadow border border-gray-200 px-3 py-2 rounded-2xl text-black"
            >
              ⋮
            </button>

            {mostrarMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMostrarMenu(false)} />

                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">

                  <button
                    onClick={eliminarHistorialCompleto}
                    className="px-4 py-3 text-red-600 font-bold whitespace-nowrap"
                  >
                    Eliminar historial
                  </button>

                </div>
              </>
            )}

          </div>

        </div>

        {/* INFO: tarjeta estilo lista (avatar, id, raza, stats y actividad) */}
        <div className="bg-white rounded-3xl p-3 shadow-md border border-gray-100">

          <div className="flex items-start gap-3">

            <div className={`w-1 rounded-l-2xl ${
              estadoActual === "Baja"
                ? "bg-red-500"
                : estadoActual === "Gestación"
                ? "bg-blue-500"
                : estadoActual === "Lactancia"
                ? "bg-green-500"
                : estadoActual === "Próxima a Celo"
                ? "bg-yellow-500"
                : "bg-pink-500"
            }`} />

            <div className="flex-1 flex items-start gap-4">

              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-pink-500">
                    <path fill="currentColor" d="M12 2c-1.1 0-2 .9-2 2 0 .5.2 1 .5 1.3C8.8 6 7 7 7 9v1H5c-1.1 0-2 .9-2 2v1c0 1.7 1.3 3 3 3h1v1c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-1h1c1.7 0 3-1.3 3-3v-1c0-1.1-.9-2-2-2h-2V9c0-2-1.8-3-3.5-3.7.3-.3.5-.8.5-1.3 0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1">

                <div className="flex justify-between items-start">

                  <div>
                    <h2 className="text-2xl font-bold text-black">{cerda.id}</h2>
                    <p className="text-sm text-gray-500 mt-1">{cerda.raza}</p>

                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="font-medium">Parto:</span>
                        <span className="text-gray-700">{textoParto}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                        <span className="text-gray-700">Lechones: {cerda.lechones ?? "-"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M7 21V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span className="text-gray-700">Jaula: {cerda.jaula ?? "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${estadoClase}`}>
                      {estadoActual.toUpperCase()}
                    </span>

                    <div className="mt-3 border border-green-100 bg-green-50 p-3 rounded-2xl text-left max-w-xs">
                      <p className="text-green-700 text-sm font-medium">Próxima actividad</p>
                      <p className="text-green-900 font-bold">Destete programado</p>
                      <p className="text-xs text-gray-500">23 Jun — 30 Jun 2026</p>
                    </div>
                  </div>

                </div>

                <p className="text-sm text-gray-500 mt-3">{cerda.caracteristicas}</p>

              </div>

            </div>

          </div>

        </div>

        {/* HISTORIAL */}
        <div className="mt-6">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <h2 className="text-xl font-bold text-black">
                Historial
              </h2>

              <select
                value={filtro}
                onChange={(e) =>
                  setFiltro(e.target.value)
                }
                className="
                  bg-white
                  border
                  border-gray-300
                  rounded-xl
                  px-2
                  py-1
                  text-sm
                  text-black
                "
              >
                <option>Todos</option>
                <option>Inseminación</option>
                <option>Celo</option>
                <option>Parto</option>
                <option>Destete</option>
                <option>Aborto</option>
                <option>Baja</option>
                <option>Tratamiento</option>
              </select>

            </div>

            <button
              onClick={() =>
                setMostrarForm(true)
              }
              className="
                bg-pink-500
                text-white
                px-4
                py-2
                rounded-2xl
                font-bold
              "
            >
              +
            </button>

          </div>

          <div className="space-y-2">

            {registros.length === 0 && (

              <div
                className="
                  bg-white
                  rounded-2xl
                  p-5
                  text-center
                  text-gray-500
                  border
                  border-gray-200
                "
              >
                Sin registros
              </div>

            )}

            {registros
              .filter(
                (r) =>
                  filtro === "Todos" ||
                  r.tipo === filtro
              )
              .map((r, i) => (

              <div
                key={i}
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                "
              >

                <div
                  className="
                    absolute
                    inset-y-0
                    right-0
                    w-24
                    bg-red-500
                    flex
                    items-center
                    justify-center
                    z-0
                  "
                >
                  <button
                    onClick={() => eliminarRegistro(i)}
                    className="
                      text-white
                      font-bold
                    "
                  >
                    Eliminar
                  </button>
                </div>

                <div
                  onTouchStart={(e) =>
                    setTouchStart(
                      e.touches[0].clientX
                    )
                  }
                  onTouchEnd={(e) => {
                    const distancia =
                      touchStart -
                      e.changedTouches[0].clientX;

                    if (distancia > 60) {
                      setRegistroAbierto(i);
                    }

                    if (distancia < -60) {
                      setRegistroAbierto(null);
                    }
                  }}
                  className={`
                    relative
                    z-10
                    relative
                    z-10
                    bg-white
                    rounded-2xl
                    p-3
                    shadow-sm
                    border
                    border-gray-200
                    transition-transform
                    duration-300
                    ${
                      registroAbierto === i
                        ? "-translate-x-24"
                        : ""
                    }
                  `}
                >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="font-semibold text-black text-sm">
                      {r.tipo}
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.fecha}
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <div
                      className="
                        bg-pink-100
                        text-pink-600
                        text-xs
                        font-bold
                        px-3
                        py-1
                        rounded-full
                      "
                    >
                      Registro
                    </div>

                  </div>

                </div>

                {r.partoEstimado && (

                  <div
                    className="
                      mt-3
                      bg-green-50
                      border
                      border-green-200
                      p-3
                      rounded-2xl
                    "
                  >

                    <p className="text-green-700 text-sm font-medium">
                      Parto estimado
                    </p>

                    <p className="text-green-900 font-bold">
                      {r.partoEstimado}
                    </p>

                  </div>

                )}

                {r.descripcion && (

                  <p className="text-gray-700 mt-3 text-sm">
                    {r.descripcion}
                  </p>

                )}

                {r.mensaje && !r.partoEstimado && (

                  <div
                    className="
                      mt-3
                      bg-yellow-50
                      border
                      border-yellow-200
                      p-3
                      rounded-2xl
                    "
                  >

                    <p className="text-yellow-700 text-sm font-medium">
                      Mensaje
                    </p>

                    <p className="text-yellow-800 text-sm mt-1">
                      {r.mensaje}
                    </p>

                  </div>

                )}

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* MODAL */}
      {mostrarForm && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            p-4
            z-50
          "
        >

          <div
            className="
              bg-white
              w-full
              max-w-md
              rounded-3xl
              p-6
            "
          >

            <h2 className="text-2xl font-bold text-black mb-5">
              Nuevo registro
            </h2>

            {/* TIPO */}
            <select
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value)
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
                mb-4
              "
            >
              <option>
                Inseminación
              </option>

              <option>
                Celo
              </option>

              <option>
                Parto
              </option>

              <option>
                Destete
              </option>

              <option>
                Aborto
              </option>

              <option>
                Baja
              </option>

              <option>
                Tratamiento
              </option>

            </select>

            {/* FECHA */}
            <div className="mb-4">

              <p className="text-sm mb-2 text-gray-500">
                Fecha
              </p>

              <input
                type="date"
                value={fecha}
                onChange={(e) =>
                  setFecha(
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
                  appearance-none
                "
              />

            </div>

            {/* DESCRIPCIÓN */}
            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              className="
                w-full
                h-24
                px-4
                py-3
                rounded-2xl
                bg-gray-100
                border
                border-gray-300
                outline-none
                text-black
                resize-none
                mb-4
              "
            />

            {/* BOTONES */}
            <button
              onClick={agregarRegistro}
              className="
                w-full
                bg-pink-500
                text-white
                py-4
                rounded-2xl
                font-bold
              "
            >
              Guardar
            </button>

            <button
              onClick={() =>
                setMostrarForm(false)
              }
              className="
                w-full
                bg-gray-200
                text-black
                py-4
                rounded-2xl
                mt-3
              "
            >
              Cancelar
            </button>

          </div>

        </div>

      )}

    </main>
  );
}