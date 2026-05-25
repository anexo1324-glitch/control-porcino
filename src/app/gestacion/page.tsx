"use client";

import { useEffect, useState } from "react";

export default function Gestacion() {

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [buscar, setBuscar] = useState("");

  const [id, setId] = useState("");

  const [raza, setRaza] = useState("");

  const [fecha, setFecha] = useState("");

  const [caracteristicas, setCaracteristicas] =
    useState("");

  const [cerdas, setCerdas] = useState<any[]>([]);

  useEffect(() => {

    const datos =
      JSON.parse(
        localStorage.getItem("cerdas") || "[]"
      );

    setCerdas(datos);

  }, []);

  function agregarCerda() {

    if (!id) return;

    const nuevaCerda = {

      id: id.toUpperCase(),

      raza,

      fecha,

      caracteristicas,

      estado: "GESTACIÓN",

    };

    const nuevasCerdas = [
      ...cerdas,
      nuevaCerda,
    ];

    setCerdas(nuevasCerdas);

    localStorage.setItem(
      "cerdas",
      JSON.stringify(nuevasCerdas)
    );

    setMostrarFormulario(false);

    setId("");
    setRaza("");
    setFecha("");
    setCaracteristicas("");
  }

  const filtradas = cerdas.filter(
    (cerda) =>
      (cerda.id || "")
        .toLowerCase()
        .includes(
          buscar.toLowerCase()
        )
  );

  return (

    <main className="min-h-screen bg-[#2a0820] text-white p-4">

      <div className="max-w-md mx-auto">

        <div className="mb-6">

          <h1 className="text-4xl font-bold text-pink-400">

            Gestación

          </h1>

          <p className="text-pink-200 mt-2">

            Inventario hembras

          </p>

        </div>

        <input
          type="text"
          placeholder="Buscar ID..."
          value={buscar}
          onChange={(e) =>
            setBuscar(e.target.value)
          }
          className="w-full p-4 rounded-2xl bg-[#4a1738] mb-6 outline-none"
        />

        <div className="space-y-4">

          {filtradas.map(
            (cerda, index) => (

              <div
                key={index}
                className="bg-[#4a1738] rounded-3xl p-5 border border-pink-500"
              >

                <div className="flex justify-between">

                  <div>

                    <h2 className="text-2xl font-bold">

                      {cerda.id}

                    </h2>

                    <p className="text-pink-200">

                      {cerda.raza}

                    </p>

                  </div>

                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-xl text-sm font-bold">

                    GESTACIÓN

                  </span>

                </div>

                <div className="mt-4">

                  <p className="text-pink-200">

                    Fecha llegada
                  </p>

                  <p className="text-xl font-bold">

                    {cerda.fecha}

                  </p>

                </div>

                <div className="mt-4">

                  <p className="text-pink-200">

                    Características
                  </p>

                  <p>

                    {cerda.caracteristicas}

                  </p>

                </div>

              </div>

            )
          )}

        </div>

        <button
          onClick={() =>
            setMostrarFormulario(true)
          }
          className="fixed bottom-6 right-6 bg-pink-500 w-16 h-16 rounded-full text-4xl shadow-lg"
        >

          +

        </button>

        {mostrarFormulario && (

          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">

            <div className="bg-[#4a1738] w-full max-w-md rounded-3xl p-6">

              <h2 className="text-3xl font-bold text-pink-400 mb-6">

                Nueva Cerda

              </h2>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="ID"
                  value={id}
                  onChange={(e) =>
                    setId(
                      e.target.value.toUpperCase()
                    )
                  }
                  className="w-full p-4 rounded-2xl bg-[#2a0820] outline-none uppercase"
                />

                <input
                  type="text"
                  placeholder="Raza"
                  value={raza}
                  onChange={(e) =>
                    setRaza(e.target.value)
                  }
                  className="w-full p-4 rounded-2xl bg-[#2a0820] outline-none"
                />

                <input
                  type="date"
                  value={fecha}
                  onChange={(e) =>
                    setFecha(e.target.value)
                  }
                  className="w-full p-4 rounded-2xl bg-[#2a0820] outline-none"
                />

                <textarea
                  placeholder="Características"
                  value={caracteristicas}
                  onChange={(e) =>
                    setCaracteristicas(
                      e.target.value
                    )
                  }
                  className="w-full p-4 rounded-2xl bg-[#2a0820] outline-none h-28"
                />

                <button
                  onClick={agregarCerda}
                  className="w-full bg-pink-500 py-4 rounded-2xl text-lg font-bold"
                >

                  Agregar

                </button>

                <button
                  onClick={() =>
                    setMostrarFormulario(false)
                  }
                  className="w-full bg-gray-700 py-4 rounded-2xl text-lg"
                >

                  Cancelar

                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}