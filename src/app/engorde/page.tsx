"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";

type LoteEngorde = {
  codigoParto: string;
  cerdaId: string;
  fechaNacimiento: string;
  horaInicio?: string;
  tipoParto?: string;
  asistidoPor?: string;
  lechones: number;
  vivos: number;
  muertos: number;
  pesoPromedio?: number;
  observaciones?: string;
  observacionesLechones?: string;
  raza?: string;
  pesoCerda?: number;
  estadoSalud?: string;
  createdAt?: string;
  activo?: boolean;
};

function parsearFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function formatearFechaCorta(fecha: string) {
  if (!fecha) return "-";

  const d = parsearFechaLocal(fecha);
  if (Number.isNaN(d.getTime())) return fecha;

  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  return `${meses[d.getMonth()]}-${d.getDate()}-${d.getFullYear()}`;
}

function calcularDiasDesdeNacimiento(fechaNacimiento: string) {
  if (!fechaNacimiento) return 0;

  const nacimiento = parsearFechaLocal(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return 0;

  const hoy = new Date();
  const inicio = new Date(nacimiento.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
  const final = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const diff = final.getTime() - inicio.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function EngordePage() {
  const [lotes, setLotes] = useState<LoteEngorde[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("engorde-lotes") || "[]") as LoteEngorde[];
    } catch {
      return [];
    }
  });
  const [busqueda, setBusqueda] = useState("");

  const cambiarEstadoLote = (codigoParto: string) => {
    const copia = lotes.map((lote) => {
      if (lote.codigoParto !== codigoParto) return lote;

      return {
        ...lote,
        activo: lote.activo === false ? true : false,
      };
    });

    setLotes(copia);
    localStorage.setItem("engorde-lotes", JSON.stringify(copia));
  };

  const lotesActivos = lotes.filter((lote) => lote.activo !== false);

  const textoBusqueda = busqueda.trim().toLowerCase();
  const resultados = lotes.filter((lote) => !textoBusqueda ||
    lote.codigoParto.toLowerCase().includes(textoBusqueda) ||
    lote.cerdaId.toLowerCase().includes(textoBusqueda) ||
    lote.fechaNacimiento.toLowerCase().includes(textoBusqueda)
  );
  const activosFiltrados = resultados.filter((lote) => lote.activo !== false);
  const lotesFiltrados = [
    ...activosFiltrados,
    ...resultados.filter((lote) => lote.activo === false),
  ];

  const totalLechones = lotesActivos.reduce((acc, lote) => acc + (lote.lechones || 0), 0);
  const totalVivos = lotesActivos.reduce((acc, lote) => acc + (lote.vivos || 0), 0);
  const promedioDias = lotesActivos.length
    ? Math.round(lotesActivos.reduce((acc, lote) => acc + calcularDiasDesdeNacimiento(lote.fechaNacimiento), 0) / lotesActivos.length)
    : 0;

  return (
    <PageShell bgColor="#ffffff" className="p-3 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Engorde</h1>
              <p className="text-xs text-slate-500 mt-1">Inventario de lotes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-3">
            <div className="rounded-2xl bg-emerald-100 p-1.5 shadow-sm border border-emerald-200">
              <p className="text-[8px] uppercase tracking-[0.24em] text-emerald-700 font-semibold">Lotes</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{lotesActivos.length}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">Activos</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-1.5 shadow-sm border border-emerald-100">
              <p className="text-[8px] uppercase tracking-[0.24em] text-emerald-700 font-semibold">Lechones</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{totalLechones}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">Total</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-1.5 shadow-sm border border-slate-200">
              <p className="text-[8px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Vivos</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{totalVivos}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">Nacidos</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-1.5 shadow-sm border border-slate-200">
              <p className="text-[8px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Promedio</p>
              <p className="mt-0.5 text-base font-extrabold text-emerald-900">{promedioDias}</p>
              <p className="mt-0.5 text-[8px] text-slate-500">Días</p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Buscar por código, ID madre o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 rounded-2xl bg-gray-100 border border-gray-300 outline-none text-black text-sm"
          />
        </div>

        {lotesFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Sin registros
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lotesFiltrados.map((lote, index) => {
              const dias = calcularDiasDesdeNacimiento(lote.fechaNacimiento);
              const codigo = lote.codigoParto || `P${String(index + 1).padStart(3, "0")}`;
              const activo = lote.activo !== false;

              return (
                <article key={`${lote.codigoParto}-${lote.fechaNacimiento}-${index}`} className={`w-full relative overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md active:scale-[0.99] ${activo ? "border-gray-200 bg-white" : "border-red-300 bg-red-50"}`}>
                  <div className={`absolute inset-y-0 left-0 w-2 rounded-r-3xl bg-gradient-to-b ${activo ? "from-emerald-500 to-lime-400" : "from-red-500 to-rose-400"}`} />

                  <div className="relative z-10 p-2">
                    <div className="relative flex flex-col gap-1 pl-3 pr-8">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-xl text-sm shrink-0 ${activo ? "bg-emerald-100" : "bg-red-100"}`}>🐷</div>
                          <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-950">{codigo}</h2>
                            <p className="text-gray-500 text-[11px] mt-0.5">Lote de engorde</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap ${activo ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}> 
                            {activo ? "Activo" : "Inactivo"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarEstadoLote(lote.codigoParto);
                            }}
                            className={`rounded-full px-2 py-1 text-[9px] font-bold ${activo ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {activo ? "Desactivar" : "Reactivar"}
                          </button>
                        </div>
                      </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
                          <span>📅 {formatearFechaCorta(lote.fechaNacimiento)}</span>
                          <span>⏱ {lote.horaInicio || "Sin hora"}</span>
                          <span>🐖 Madre: {lote.cerdaId}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-center">
                          <div className={`rounded-lg p-1 ${activo ? "bg-emerald-50" : "bg-red-100"}`}><p className="text-[9px] text-slate-500">Días</p><p className="text-sm font-black text-emerald-900">{dias}</p></div>
                          <div className="rounded-lg bg-slate-50 p-1"><p className="text-[9px] text-slate-500">Total</p><p className="text-sm font-black text-slate-900">{lote.lechones}</p></div>
                          <div className="rounded-lg bg-emerald-50 p-1"><p className="text-[9px] text-slate-500">Vivos</p><p className="text-sm font-black text-emerald-800">{lote.vivos}</p></div>
                          <div className="rounded-lg bg-red-50 p-1"><p className="text-[9px] text-slate-500">Muertos</p><p className="text-sm font-black text-red-700">{lote.muertos}</p></div>
                        </div>

                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-800">{lote.tipoParto || "Parto"}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{lote.asistidoPor || "Sin asistencia"}</span>
                          {lote.pesoPromedio != null && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">{lote.pesoPromedio} kg/lechón</span>}
                          {lote.estadoSalud && <span className="rounded-full bg-sky-50 px-2 py-1 text-sky-800">Cerda: {lote.estadoSalud}</span>}
                        </div>

                        {(lote.observaciones || lote.observacionesLechones) && <p className="truncate rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-600">📝 {lote.observacionesLechones || lote.observaciones}</p>}
                      </div>
                    </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}