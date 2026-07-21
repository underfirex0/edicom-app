import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-copper mb-3">
            EDICOM · Télécontact.ma
          </div>
          <h1 className="font-display text-[28px] font-semibold leading-tight">
            Qualification commerciale B2B
          </h1>
        </div>
        <div className="bg-panel border border-line rounded-3xl shadow-panel p-8 space-y-3">
          <Link
            href="/login"
            className="focus-ring block w-full text-center rounded-2xl bg-ink text-white font-medium py-3.5 hover:bg-black transition-colors"
          >
            Espace candidat
          </Link>
          <p className="text-center text-[13px] text-muted pt-2">
            Vous avez reçu un lien d&apos;invitation ? Ouvrez-le directement depuis votre email ou WhatsApp.
          </p>
        </div>
        <div className="text-center mt-6">
          <Link href="/admin/login" className="focus-ring text-[12.5px] text-muted hover:text-ink font-mono">
            Administration →
          </Link>
        </div>
      </div>
    </main>
  );
}
