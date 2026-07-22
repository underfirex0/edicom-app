"use client";

import { useState } from "react";
import { TestShell, SectionEyebrow } from "@/components/TestShell";
import { FormField, FormInput, FormSelect, YesNoToggle } from "@/components/TestFormFields";
import { PrimaryButton } from "@/components/ui";
import type { PersonalInfo } from "@/lib/types";

export default function PersonalInfoStep({
  initial,
  onNext,
}: {
  initial: PersonalInfo;
  onNext: (data: PersonalInfo) => void;
}) {
  const [data, setData] = useState<PersonalInfo>(initial);

  const requiredFilled =
    data.fullName.trim() &&
    data.phone.trim() &&
    data.email.trim() &&
    data.city.trim() &&
    data.age.trim() &&
    data.familyStatus &&
    data.drivingLicense !== null &&
    data.vehicle !== null &&
    data.availability &&
    data.desiredSalary.trim() &&
    data.startDate.trim();

  function set<K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  return (
    <TestShell wide>
      <SectionEyebrow>Informations personnelles</SectionEyebrow>
      <h1 className="font-display text-[22px] font-semibold mb-6">Faisons connaissance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nom et prénom">
          <FormInput value={data.fullName} onChange={(e) => set("fullName", e.target.value)} required />
        </FormField>
        <FormField label="Téléphone">
          <FormInput
            type="tel"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="06 12 34 56 78"
            required
          />
        </FormField>
        <FormField label="E-mail">
          <FormInput type="email" value={data.email} onChange={(e) => set("email", e.target.value)} required />
        </FormField>
        <FormField label="Ville">
          <FormInput value={data.city} onChange={(e) => set("city", e.target.value)} required />
        </FormField>
        <FormField label="Âge">
          <FormInput
            type="number"
            min={16}
            max={70}
            value={data.age}
            onChange={(e) => set("age", e.target.value)}
            required
          />
        </FormField>
        <FormField label="Situation familiale">
          <FormSelect value={data.familyStatus} onChange={(e) => set("familyStatus", e.target.value)} required>
            <option value="" disabled>
              Choisir…
            </option>
            <option value="celibataire">Célibataire</option>
            <option value="marie_sans_enfants">Marié(e) sans enfants</option>
            <option value="marie_avec_enfants">Marié(e) avec enfants</option>
            <option value="autre">Autre</option>
          </FormSelect>
        </FormField>
        <FormField label="Permis de conduire">
          <YesNoToggle name="drivingLicense" value={data.drivingLicense} onChange={(v) => set("drivingLicense", v)} />
        </FormField>
        <FormField label="Véhicule">
          <YesNoToggle name="vehicle" value={data.vehicle} onChange={(v) => set("vehicle", v)} />
        </FormField>
        <FormField label="Disponibilité">
          <FormSelect value={data.availability} onChange={(e) => set("availability", e.target.value)} required>
            <option value="" disabled>
              Choisir…
            </option>
            <option value="immediate">Immédiate</option>
            <option value="1_2_semaines">1 à 2 semaines</option>
            <option value="1_mois">Sous 1 mois</option>
            <option value="plus_1_mois">Plus d'un mois</option>
          </FormSelect>
        </FormField>
        <FormField label="Salaire fixe souhaité (MAD)">
          <FormInput
            value={data.desiredSalary}
            onChange={(e) => set("desiredSalary", e.target.value)}
            placeholder="ex. 4 000"
            required
          />
        </FormField>
        <FormField label="Date possible d'embauche" span2>
          <FormInput type="date" value={data.startDate} onChange={(e) => set("startDate", e.target.value)} required />
        </FormField>
      </div>

      <PrimaryButton className="mt-8 w-full" disabled={!requiredFilled} onClick={() => onNext(data)}>
        Continuer
      </PrimaryButton>
    </TestShell>
  );
}
