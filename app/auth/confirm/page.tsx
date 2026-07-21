"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Supabase's invite/recovery links generated via the admin API use the
// "implicit" flow: the session tokens come back as a URL *fragment*
// (`#access_token=...`), never as a `?code=` query param. Fragments are
// never sent to the server, so a Route Handler like /auth/callback can't
// see them at all. The Supabase browser client parses that fragment
// automatically as soon as it's instantiated on the client (detectSessionInUrl),
// so this page just needs to exist, wait a beat, and then move on.
function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") || "/set-password";

    async function run() {
      const rawHash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);

      const hashError = hashParams.get("error_description") || hashParams.get("error");
      if (hashError) {
        setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setError("Impossible d'établir votre session. Merci de demander un nouveau lien au recruteur.");
          return;
        }
        router.replace(next);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError("Impossible d'établir votre session. Merci de demander un nouveau lien au recruteur.");
          return;
        }
        router.replace(next);
        return;
      }

      setError("Votre lien d'invitation a expiré ou est invalide. Merci de demander un nouveau lien au recruteur.");
    }

    run();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <p className="text-[14.5px] text-coral bg-coral-soft rounded-xl px-4 py-3">{error}</p>
        ) : (
          <>
            <div className="w-9 h-9 mx-auto rounded-full border-2 border-line border-t-copper animate-spin mb-5" />
            <p className="text-[14.5px] text-muted">Vérification de votre lien…</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="w-9 h-9 mx-auto rounded-full border-2 border-line border-t-copper animate-spin" />
        </main>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
