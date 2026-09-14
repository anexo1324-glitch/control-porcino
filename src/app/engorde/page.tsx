"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";

type LoteEngorde = {
  codigoParto: string;
  cerdaId: string;
  fechaNacimiento: string;
  lechones: number;
  vivos: number;
  muertos: number;
  pesoPromedio?: number;
  observaciones?: string;
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
  const [lotes, setLotes] = useState<LoteEngorde[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    try {
      const datos = JSON.parse(localStorage.getItem("engorde-lotes") || "[]");
      setLotes(datos);
    } catch (e) {
      setLotes([]);
    }
  }, []);

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

  const lotesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const resultados = lotes.filter((lote) => {
      if (!texto) return true;

      return (
        lote.codigoParto.toLowerCase().includes(texto) ||
        lote.cerdaId.toLowerCase().includes(texto) ||
        lote.fechaNacimiento.toLowerCase().includes(texto)
      );
    });

    const activos = resultados.filter((lote) => lote.activo !== false);
    const inactivos = resultados.filter((lote) => lote.activo === false);

    return [...activos, ...inactivos];
  }, [lotes, busqueda]);

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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Sin registros
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lotesFiltrados.map((lote, index) => {
              const dias = calcularDiasDesdeNacimiento(lote.fechaNacimiento);
              const codigo = lote.codigoParto || `P${String(index + 1).padStart(3, "0")}`;
              const activo = lote.activo !== false;

              return (
                <article key={`${lote.codigoParto}-${lote.fechaNacimiento}-${index}`} className={`w-full relative overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md active:scale-[0.99] ${activo ? "border-gray-200 bg-white" : "border-red-300 bg-red-50"}`}> 
                  <div className={`absolute inset-y-0 left-0 w-2 rounded-r-3xl bg-gradient-to-b ${activo ? "from-emerald-500 to-lime-400" : "from-red-500 to-rose-400"}`} />

                  <div className="relative z-10 p-2.5">
                    <div className="relative flex flex-col gap-1.5 pl-3 pr-8">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-2xl text-sm shrink-0 ${activo ? "bg-emerald-100" : "bg-red-100"}`}>🐷</div>
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

                      <div className="space-y-1.5 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span>📅</span>
                          <span>Nacimiento: {formatearFechaCorta(lote.fechaNacimiento)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className={`rounded-2xl border p-1.5 ${activo ? "border-slate-100 bg-emerald-50" : "border-red-100 bg-red-100"}`}>
                            <p className={`text-[9px] uppercase tracking-[0.18em] font-semibold ${activo ? "text-emerald-700" : "text-red-700"}`}>Días actuales</p>
                            <p className={`mt-0.5 text-sm font-black ${activo ? "text-emerald-900" : "text-red-900"}`}>{dias}</p>
                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
                            <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Lechones</p>
                            <p className="mt-0.5 text-sm font-black text-slate-900">{lote.lechones}</p>
                          </div>
                        </div>

                        <div className={`rounded-2xl border p-1.5 ${activo ? "bg-emerald-50 border-emerald-100" : "bg-red-100 border-red-200"}`}>
                          <p className={`text-[9px] uppercase tracking-[0.18em] font-semibold ${activo ? "text-emerald-700" : "text-red-700"}`}>ID madre</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-900">{lote.cerdaId}</p>
                        </div>

                        <div className="rounded-2xl border p-1.5 bg-slate-50 border-slate-200">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-500 uppercase tracking-[0.18em]">Vivos / Muertos</span>
                            <span className="font-bold text-slate-900">{lote.vivos} / {lote.muertos}</span>
                          </div>
                        </div>
                      </div>
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