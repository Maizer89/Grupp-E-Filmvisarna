// Responsiv ram runt alla sidor. Mobilen först: vanliga klasser = mobil,
// sm: / md: / lg: = större skärmar.
export default function Sidlayout({ children }) {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}


export function Rutnat({ children }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
