"use client";

import { useState } from "react";

type TestCase = {
  title: string;
  preconditions: string;
  steps: string[];
  expected_result: string;
};

export default function Home() {
  const [userStory, setUserStory] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [globalScore, setGlobalScore] = useState<number | null>(null);

  const presets = [
    {
      label: "Login Flow",
      text: "Como usuario registrado, quiero iniciar sesión con mi correo electrónico y contraseña para acceder a mi dashboard.",
    },
    {
      label: "Shopping Cart",
      text: "Como cliente de la tienda, quiero agregar productos al carrito y ver el total en tiempo real antes de pagar.",
    },
    {
      label: "Password Reset",
      text: "Como usuario, quiero solicitar un restablecimiento de contraseña mediante mi correo si he olvidado mi acceso.",
    },
  ];

  const handleGenerate = async () => {
    if (!userStory) return;
    
    setLoading(true);
    setError("");
    setTestCases([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/generate-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_story: userStory }),
      });

      if (!response.ok) {
        throw new Error("Error en la conexión con el motor de IA.");
      }

      const data = await response.json();
      setTestCases(data.test_cases);
      setGlobalScore(data.quality_score);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al generar los casos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-24 flex flex-col items-center bg-gray-50 dark:bg-black font-sans selection:bg-apple-blue selection:text-white transition-colors duration-300">
      
      {/* Header */}
      <div className="w-full max-w-4xl mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          TestMint.ai
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
          Generación Inteligente de Casos de Prueba
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-apple hover:shadow-appleHover transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Escribe tu Historia de Usuario (User Story)
            </label>
            <div className="group relative flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs cursor-help">
              ?
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-black text-white text-xs rounded-lg shadow-lg z-10 transition-opacity">
                Describe detalladamente la acción, el actor y el objetivo para resultados más precisos.
              </div>
            </div>
          </div>
          <textarea
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
            placeholder="Ej: Como usuario logueado en la plataforma, quiero poder filtrar mis transacciones por fecha límite..."
            className="w-full p-4 h-40 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue/50 dark:text-gray-100 text-gray-800 placeholder-gray-400 resize-none transition-all duration-200"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-medium py-1">Pruebas rápidas:</span>
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => setUserStory(preset.text)}
                className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading || userStory.length < 10}
              className="px-6 py-3 bg-apple-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full shadow-md transition-all duration-200 flex items-center justify-center min-w-[160px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </span>
              ) : (
                "Generar Casos"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-4xl mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium text-sm text-center">
          {error}
        </div>
      )}

      {/* Skeletons Layout */}
      {loading && (
        <div className="w-full max-w-4xl mt-12 space-y-6">
          <div className="h-8 w-48 skeleton mb-8" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-apple border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="h-6 w-3/4 skeleton" />
              <div className="h-4 w-1/4 skeleton" />
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full skeleton" />
                <div className="h-4 w-5/6 skeleton" />
                <div className="h-4 w-4/6 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Section */}
      {testCases.length > 0 && !loading && (
        <div className="w-full max-w-4xl mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            Resultados Generados
            <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              {testCases.length} Casos
            </span>
          </h2>
          <div className="space-y-6">
            {testCases.map((tc, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1c1c1e] p-6 md:p-8 rounded-2xl shadow-apple border border-gray-100 dark:border-gray-800 transition-all hover:shadow-appleHover">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight pr-4">
                    {idx + 1}. {tc.title}
                  </h3>
                  {idx === 0 && globalScore !== null && (
                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${
                      globalScore >= 0.8 ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" :
                      globalScore >= 0.5 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" :
                      "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    }`} title="Puntuación Global de Calidad">
                      Score Global: {globalScore}/1.0
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Precondiciones</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black p-3 rounded-lg">
                    {tc.preconditions}
                  </p>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Pasos</span>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 pl-1">
                    {tc.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">Resultado Esperado</span>
                  <p className="text-sm font-medium text-apple-blue dark:text-blue-400">
                    {tc.expected_result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
