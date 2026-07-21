import { Card } from "@/components/ui";
import InviteForm from "./InviteForm";

export default function InvitePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-[24px] font-semibold">Inviter un candidat</h1>
        <p className="text-[14px] text-muted mt-1">
          Un compte est créé automatiquement et un lien d&apos;accès unique est généré. Le candidat choisit son
          mot de passe en ouvrant le lien, puis passe directement le test.
        </p>
      </div>
      <Card className="p-7">
        <InviteForm />
      </Card>
    </div>
  );
}
