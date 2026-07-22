export default function TestDonePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-teal flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5L9.5 18L20 6" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-[22px] font-semibold">Merci, c&apos;est enregistré</h1>
        <p className="text-[14.5px] text-muted mt-3 leading-relaxed">
          Vous pouvez patienter — le chef d&apos;entretien va vous recevoir dans un instant.
        </p>
      </div>
    </main>
  );
}
