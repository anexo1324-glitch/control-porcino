"use client";

import PageShell from "@/components/PageShell";

export default function AjustesPage() {
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
          <h2 className="text-xl font-semibold">Modo claro</h2>
          <p className="mt-2 text-sm text-slate-600">
            El modo oscuro se ha eliminado. La aplicación usa un diseño claro constante.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
