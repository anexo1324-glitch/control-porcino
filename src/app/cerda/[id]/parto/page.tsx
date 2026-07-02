"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PartoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [fecha, setFecha] = useState("");
  const [numLechones, setNumLechones] = useState("");
  const [vivos, setVivos] = useState("");
  const [muertos, setMuertos] = useState("");
  const [pesoPromedio, setPesoPromedio] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    // default fecha a hoy
    const hoy = new Date().toISOString().split("T")[0];
    setFecha(hoy);
  }, []);

  function guardarParto() {
    if (!fecha) return;

    const parto: any = {
      tipo: "Parto",
      fecha,
      lechones: Number(numLechones) || 0,
      vivos: Number(vivos) || 0,
      muertos: Number(muertos) || 0,
      pesoPromedio: pesoPromedio ? Number(pesoPromedio) : undefined,
      observaciones: observaciones || undefined,
      mensaje: `Parto: ${numLechones || 0} lechones`,
    };

    const key = `historial-${id}`;
    const hist = JSON.parse(localStorage.getItem(key) || "[]");
    // Prevent consecutive Parto records
    if (hist.length > 0 && hist[0]?.tipo === "Parto") {
      alert("No se puede registrar Parto de forma consecutiva");
      return;
    }
    hist.unshift(parto);
    localStorage.setItem(key, JSON.stringify(hist));

    // actualizar cerda (lechones)
    const todas = JSON.parse(localStorage.getItem("cerdas") || "[]");
    const idx = todas.findIndex((c: any) => c.id === id);
    if (idx >= 0) {
      todas[idx].lechones = Number(numLechones) || todas[idx].lechones || 0;
      localStorage.setItem("cerdas", JSON.stringify(todas));
    }

    // Mark this as the last newly created registro so the cerda page can open it
    try {
      localStorage.setItem("last-new-registro", JSON.stringify({ cerdaId: id, tipo: "Parto" }));
    } catch (e) {}

    router.replace(`/cerda/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] p-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Registro de Parto</h1>
          <button onClick={() => router.replace(`/cerda/${id}`)} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Fecha del parto</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1 w-full rounded-2xl px-3 py-2 border border-gray-300 bg-gray-50" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">Lechones</label>
              <input type="number" min="0" value={numLechones} onChange={(e) => setNumLechones(e.target.value)} className="mt-1 w-full rounded-2xl px-3 py-2 border border-gray-300 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Vivos</label>
              <input type="number" min="0" value={vivos} onChange={(e) => setVivos(e.target.value)} className="mt-1 w-full rounded-2xl px-3 py-2 border border-gray-300 bg-gray-50" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Muertos</label>
              <input type="number" min="0" value={muertos} onChange={(e) => setMuertos(e.target.value)} className="mt-1 w-full rounded-2xl px-3 py-2 border border-gray-300 bg-gray-50" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Peso promedio (kg)</label>
            <input type="number" step="0.1" value={pesoPromedio} onChange={(e) => setPesoPromedio(e.target.value)} className="mt-1 w-full rounded-2xl px-3 py-2 border border-gray-300 bg-gray-50" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Observaciones</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="mt-1 w-full rounded-2xl px-3 py-2 border border-gray-300 bg-gray-50 h-24" />
          </div>

          <div className="flex gap-3">
            <button onClick={guardarParto} className="flex-1 bg-emerald-700 text-white py-2 rounded-2xl">Guardar Parto</button>
            <button onClick={() => router.replace(`/cerda/${id}`)} className="flex-1 bg-gray-200 py-2 rounded-2xl">Cancelar</button>
          </div>
        </div>
      </div>
    </main>
  );
}
