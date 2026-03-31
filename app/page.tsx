export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Kazira Clinical Intelligence
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Revenue intelligence for private dental clinics in Nairobi.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
