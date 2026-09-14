"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

function obtenerMayorNumeroPartoDesdeHistorial() {
  let max = 0;

  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("historial-")) continue;

      const historial = JSON.parse(localStorage.getItem(key) || "[]");
      historial.forEach((item: any) => {
        if (item?.tipo === "Parto" && typeof item?.codigoParto === "string") {
          const match = item.codigoParto.match(/^P(\d+)/i);
          if (match) {
            const numero = Number(match[1]);
            if (numero > max) max = numero;
          }
        }
      });
    }
  } catch (e) {
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

  const [fecha, setFecha] = useState("");
  const [numLechones, setNumLechones] = useState("");
  const [vivos, setVivos] = useState("");
  const [muertos, setMuertos] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [pesoPromedio, setPesoPromedio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [codigoParto, setCodigoParto] = useState(() => obtenerSiguienteCodigoParto());
  const [error, setError] = useState("");

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

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

    const parto: any = {
      tipo: "Parto",
      codigoParto,
      fecha,
      lechones,
      vivos: vivosN,
      muertos: muertosN,
      horaInicio: horaInicio || undefined,
      horaFin: horaFin || undefined,
      pesoPromedio: pesoPromedio ? Number(pesoPromedio) : undefined,
      observaciones: observaciones || undefined,
      mensaje: `Parto: ${lechones} lechones`,
    };

    const key = `historial-${id}`;
    const hist = JSON.parse(localStorage.getItem(key) || "[]");

    if (hist.length > 0 && hist[0]?.tipo === "Parto") {
      alert("No se puede registrar Parto de forma consecutiva");
      return;
    }

    hist.unshift(parto);
    localStorage.setItem(key, JSON.stringify(hist));

    const lote = {
      codigoParto,
      cerdaId: id,
      fechaNacimiento: fecha,
      lechones,
      vivos: vivosN,
      muertos: muertosN,
      pesoPromedio: pesoPromedio ? Number(pesoPromedio) : undefined,
      observaciones: observaciones || undefined,
      createdAt: new Date().toISOString(),
      activo: true,
    };

    const lotes = JSON.parse(localStorage.getItem("engorde-lotes") || "[]");
    const yaExiste = lotes.some((l: any) => l.codigoParto === codigoParto);
    if (!yaExiste) {
      lotes.unshift(lote);
      localStorage.setItem("engorde-lotes", JSON.stringify(lotes));
    }

    const numero = Number(codigoParto.replace("P", ""));
    localStorage.setItem("parto-index", String(numero));

    const todas = JSON.parse(localStorage.getItem("cerdas") || "[]");
    const idx = todas.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      todas[idx].lechones = lechones || todas[idx].lechones || 0;
      localStorage.setItem("cerdas", JSON.stringify(todas));
    }

    try {
      localStorage.setItem("last-new-registro", JSON.stringify({ cerdaId: id, tipo: "Parto" }));
    } catch (e) {}

    router.replace(`/cerda/${id}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-stone-100 p-3">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-[1.5rem] shadow-xl border border-emerald-100 p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wide">
                Registro sanitario
              </span>
              <h1 className="mt-1 text-lg font-black text-stone-900">Registro de Parto</h1>
            </div>
            <button
              onClick={() => router.replace(`/cerda/${id}`)}
              className="h-7 w-7 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100 transition"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[9px] font-semibold text-stone-700 mb-1">Cod.</label>
                <input
                  type="text"
                  value={codigoParto}
                  readOnly
                  disabled
                  className="w-full rounded-md px-2 py-1 border border-emerald-200 bg-emerald-50 text-emerald-900 font-black tracking-wide focus:outline-none text-[11px] h-8"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-stone-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-md px-2 py-1 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-[11px] h-8"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-stone-700 mb-1">Inicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full rounded-md px-2 py-1 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-[11px] h-8"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-stone-700 mb-1">Fin</label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full rounded-md px-2 py-1 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-[11px] h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Lechones</label>
                <input
                  type="number"
                  min="0"
                  value={numLechones}
                  onChange={(e) => setNumLechones(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Vivos</label>
                <input
                  type="number"
                  min="0"
                  value={vivos}
                  onChange={(e) => setVivos(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Muertos</label>
                <input
                  type="number"
                  min="0"
                  value={muertos}
                  onChange={(e) => setMuertos(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Peso promedio (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pesoPromedio}
                  onChange={(e) => setPesoPromedio(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-[11px] text-emerald-800">
                  <span className="font-bold">Consistencia:</span>
                  <span className="ml-2">{Math.max(0, Number(vivos || 0) + Number(muertos || 0))}</span>
                  <span className="mx-2">/</span>
                  <span>{numLechones || 0} lechones</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full rounded-xl px-3 py-2 border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-20 resize-none text-sm"
                placeholder="Ej.: parto normal, limpieza completa..."
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={guardarParto}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-xl shadow-sm transition text-sm"
              >
                Guardar Parto
              </button>
              <button
                onClick={() => router.replace(`/cerda/${id}`)}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2 rounded-xl transition text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
