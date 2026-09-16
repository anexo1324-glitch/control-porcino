"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Registro = {
  tipo?: string;
  codigoParto?: string;
};

type CerdaGuardada = {
  id?: string;
  codigo?: string;
  nombre?: string;
  raza?: string;
  peso?: number;
  fecha?: string;
  caracteristicas?: string;
  estado?: string;
  lechones?: number;
};

function obtenerMayorNumeroPartoDesdeHistorial() {
  let max = 0;

  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("historial-")) continue;

      const historial = JSON.parse(localStorage.getItem(key) || "[]");
      historial.forEach((item: Registro) => {
        if (item?.tipo === "Parto" && typeof item?.codigoParto === "string") {
          const match = item.codigoParto.match(/^P(\d+)/i);
          if (match) {
            const numero = Number(match[1]);
            if (numero > max) max = numero;
          }
        }
      });
    }
  } catch {
    max = 0;
  }

  return max;
}

function obtenerSiguienteCodigoParto() {
  const ultimoNumeroAlmacenado = Number(localStorage.getItem("parto-index") || "0");
  const mayorNumeroEnHistorial = obtenerMayorNumeroPartoDesdeHistorial();
  const numeroBase = Math.max(ultimoNumeroAlmacenado, mayorNumeroEnHistorial);
  const siguienteNumero = numeroBase + 1;
  return `P${String(siguienteNumero).padStart(3, "0")}`;
}

export default function PartoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  });
  const [numLechones, setNumLechones] = useState("");
  const [vivos, setVivos] = useState("");
  const [muertos, setMuertos] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [pesoPromedio, setPesoPromedio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [observacionesLechones, setObservacionesLechones] = useState("");
  const [codigoParto] = useState(() => obtenerSiguienteCodigoParto());
  const [tipoParto, setTipoParto] = useState("Normal");
  const [asistidoPor, setAsistidoPor] = useState("Personal");
  const [error, setError] = useState("");
  const [avisoCiclo, setAvisoCiclo] = useState(false);
  const cerda = typeof window === "undefined"
    ? undefined
    : (JSON.parse(localStorage.getItem("cerdas") || "[]") as CerdaGuardada[])
      .find((item) => item.id === id);
  const nombreCerda = cerda?.codigo || cerda?.nombre || String(id);


  function guardarParto() {
    setError("");

    const lechones = Number(numLechones);
    const vivosN = Number(vivos);
    const muertosN = Number(muertos);

    if (!fecha) {
      setError("Debes elegir una fecha del parto.");
      return;
    }

    if (!numLechones || Number.isNaN(lechones) || lechones < 0) {
      setError("Ingresa la cantidad total de lechones.");
      return;
    }

    if (Number.isNaN(vivosN) || Number.isNaN(muertosN) || vivosN < 0 || muertosN < 0) {
      setError("Los valores de vivos y muertos deben ser números válidos.");
      return;
    }

    if (vivosN + muertosN !== lechones) {
      setError("La suma de vivos + muertos debe ser igual al número total de lechones.");
      return;
    }

    const parto: Registro & Record<string, unknown> = {
      tipo: "Parto",
      codigoParto,
      fecha,
      lechones,
      vivos: vivosN,
      muertos: muertosN,
      horaInicio: horaInicio || undefined,
      tipoParto,
      asistidoPor,
      pesoPromedio: pesoPromedio ? Number(pesoPromedio) : undefined,
      observaciones: observaciones || undefined,
      observacionesLechones: observacionesLechones || undefined,
      raza: cerda?.raza,
      pesoCerda: cerda?.peso,
      fechaIngreso: cerda?.fecha,
      caracteristicasCerda: cerda?.caracteristicas,
      estadoSalud: cerda?.estado,
      mensaje: `Parto: ${lechones} lechones`,
    };

    const key = `historial-${id}`;
    const hist = JSON.parse(localStorage.getItem(key) || "[]");

    if (hist.length > 0 && hist[0]?.tipo === "Parto") {
      setAvisoCiclo(true);
      window.setTimeout(() => router.replace(`/cerda/${id}`), 1000);
      return;
    }

    hist.unshift(parto);
    localStorage.setItem(key, JSON.stringify(hist));

    const lote = {
      codigoParto,
      cerdaId: id,
      fechaNacimiento: fecha,
      horaInicio: horaInicio || undefined,
      tipoParto,
      asistidoPor,
      lechones,
      vivos: vivosN,
      muertos: muertosN,
      pesoPromedio: pesoPromedio ? Number(pesoPromedio) : undefined,
      observaciones: observaciones || undefined,
      observacionesLechones: observacionesLechones || undefined,
      raza: cerda?.raza,
      pesoCerda: cerda?.peso,
      estadoSalud: cerda?.estado,
      createdAt: new Date().toISOString(),
      activo: true,
    };

    const lotes = JSON.parse(localStorage.getItem("engorde-lotes") || "[]") as Array<{ codigoParto?: string }>;
    const yaExiste = lotes.some((lote) => lote.codigoParto === codigoParto);
    if (!yaExiste) {
      lotes.unshift(lote);
      localStorage.setItem("engorde-lotes", JSON.stringify(lotes));
    }

    const numero = Number(codigoParto.replace("P", ""));
    localStorage.setItem("parto-index", String(numero));

    const todas = JSON.parse(localStorage.getItem("cerdas") || "[]") as CerdaGuardada[];
    const idx = todas.findIndex((cerda) => cerda.id === id);
    if (idx >= 0) {
      todas[idx].lechones = lechones || todas[idx].lechones || 0;
      localStorage.setItem("cerdas", JSON.stringify(todas));
    }

    try {
      localStorage.setItem("last-new-registro", JSON.stringify({ cerdaId: id, tipo: "Parto" }));
    } catch {}

    router.replace(`/cerda/${id}`);
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
  const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-3 text-slate-900 md:p-5">
      <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-emerald-100 bg-white p-3 shadow-xl md:p-5">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button onClick={() => router.replace(`/cerda/${id}`)} className="mt-1 text-3xl leading-none text-emerald-700" aria-label="Volver">‹</button>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800">🐷 Registro sanitario</span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Registro de <span className="text-slate-800">Parto</span></h1>
              <p className="mt-1 text-sm font-bold text-emerald-700">Lote: {codigoParto}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900"><span className="text-2xl">🐷</span><span>Cerda<br /><strong>{nombreCerda}</strong></span></div>
          <button onClick={() => router.replace(`/cerda/${id}`)} className="hidden h-12 w-12 rounded-full border border-slate-200 text-3xl text-slate-600 sm:block" aria-label="Cerrar">×</button>
        </header>

        <div className="space-y-4">
          {avisoCiclo && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-700">
              Revisar ciclo reproductivo
            </div>
          )}
          <section className="form-section">
            <h2>▣ &nbsp; Información del parto</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div><label className={labelClass}>Fecha del parto <b className="text-red-500">*</b></label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Hora del parto <b className="text-red-500">*</b></label><input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Duración del parto</label><input type="text" placeholder="02:30" className={inputClass} /></div>
              <div><label className={labelClass}>Tipo de parto <b className="text-red-500">*</b></label><select value={tipoParto} onChange={(e) => setTipoParto(e.target.value)} className={inputClass}><option>Normal</option><option>Asistido</option><option>Distócico</option></select></div>
              <div><label className={labelClass}>Parto asistido por</label><select value={asistidoPor} onChange={(e) => setAsistidoPor(e.target.value)} className={inputClass}><option>Personal</option><option>Veterinario</option><option>Nadie</option></select></div>
              <div><label className={labelClass}>Observaciones del parto</label><input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Ej. sin complicaciones..." className={inputClass} /></div>
            </div>
          </section>

          <section className="form-section">
            <h2>🐽 &nbsp; Lechones nacidos</h2>
            <div className="grid grid-cols-3 gap-2">
              <div><label className={labelClass}>Total nacidos <b className="text-red-500">*</b></label><input type="number" inputMode="numeric" pattern="[0-9]*" min="0" step="1" value={numLechones} onChange={(e) => setNumLechones(e.target.value)} className={inputClass} placeholder="0" /></div>
              <div><label className={labelClass}>Vivos <b className="text-red-500">*</b></label><input type="number" inputMode="numeric" pattern="[0-9]*" min="0" step="1" value={vivos} onChange={(e) => setVivos(e.target.value)} className={inputClass} placeholder="0" /></div>
              <div><label className={labelClass}>Muertos</label><input type="number" inputMode="numeric" pattern="[0-9]*" min="0" step="1" value={muertos} onChange={(e) => setMuertos(e.target.value)} className={inputClass} placeholder="0" /></div>
              <div><label className={labelClass}>Peso promedio al nacer (kg)</label><input type="number" step="0.1" value={pesoPromedio} onChange={(e) => setPesoPromedio(e.target.value)} className={inputClass} placeholder="0.00" /></div>
              <div className="col-span-3"><label className={labelClass}>Observaciones de los lechones</label><textarea value={observacionesLechones} onChange={(e) => setObservacionesLechones(e.target.value)} maxLength={300} placeholder="Ej. lechones pequeños, débiles, etc..." className={`${inputClass} h-14 resize-none`} /><span className="float-right text-[10px] text-slate-400">{observacionesLechones.length}/300</span></div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="!mb-2 !py-2">🐖 &nbsp; Datos de la cerda</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-slate-700">
              <span><b className="text-slate-500">ID:</b> {nombreCerda}</span>
              <span><b className="text-slate-500">Raza:</b> {cerda?.raza || "No registrada"}</span>
              <span><b className="text-slate-500">Peso:</b> {cerda?.peso ?? "No registrado"} kg</span>
              <span><b className="text-slate-500">Estado:</b> {cerda?.estado || "No registrado"}</span>
              <span className="min-w-0 max-w-full truncate"><b className="text-slate-500">Características:</b> {cerda?.caracteristicas || "Sin características registradas"}</span>
            </div>
          </section>

          <section className="form-section">
            <h2>▤ &nbsp; Notas adicionales</h2>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} maxLength={500} placeholder="Agrega cualquier información relevante..." className={`${inputClass} h-20 resize-none`} /><span className="float-right text-[10px] text-slate-400">{observaciones.length}/500</span>
          </section>

          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}
          <div className="flex gap-3 pt-1"><button onClick={() => router.replace(`/cerda/${id}`)} className="flex-1 rounded-2xl border-2 border-emerald-600 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50"> &nbsp; Cancelar</button><button onClick={guardarParto} className="flex-1 rounded-2xl bg-emerald-600 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700"> &nbsp; Registrar parto</button></div>
        </div>
      </div>
      <style jsx>{`.form-section { border: 1px solid #d9f0e8; border-radius: 1rem; padding: .75rem; } .form-section h2 { margin: 0 0 .75rem; border-radius: .8rem; background: #effaf6; padding: .55rem .75rem; color: #116b55; font-size: 1rem; font-weight: 800; }`}</style>
    </main>
  );
}
