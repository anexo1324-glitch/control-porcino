import Link from "next/link";

export default function Home() {

  return (

    <main className="min-h-screen bg-white flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-5xl font-bold text-green-700">
          Control Porcino
        </h1>

        <p className="text-green-500 mt-4 text-lg">
          Sistema inteligente de gestión porcina
        </p>

        <Link href="/dashboard">

          <button className="mt-10 bg-green-700 text-white px-8 py-4 rounded-2xl text-xl">

            Entrar

          </button>

        </Link>

      </div>

    </main>
  );
}