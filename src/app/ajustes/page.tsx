"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";

export default function AjustesPage() {
  const [abierto, setAbierto] = useState(false);

  return (
    <PageShell bgColor="#f5f5f7" className="p-6">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Ajustes</h1>
          <p className="mt-3 text-sm text-slate-600">
            Aquí puedes revisar las configuraciones disponibles de la app.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm">
          <button
            onClick={() => setAbierto((prev) => !prev)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Clave de eliminación</h2>
                <p className="mt-2 text-sm text-slate-600">
                  La clave para eliminar una cerda está fijada a <strong>0030</strong> y no puede modificarse.
                </p>
              </div>
              <span className="text-xl font-bold text-emerald-700">{abierto ? "˄" : "›"}</span>
            </div>
          </button>

          {abierto && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-sm text-slate-700">
                Si eliminas una cerda deberás ingresar la clave fija <strong>0030</strong>. Esta acción no puede deshacerse.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
