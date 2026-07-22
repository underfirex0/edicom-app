export function FormField({
  label,
  children,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <label className={"block " + (span2 ? "md:col-span-2" : "")}>
      <span className="block text-[12.5px] font-medium text-ink/75 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "focus-ring w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14.5px] placeholder:text-muted/60";

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass + " " + (props.className ?? "")} />;
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputClass + " resize-none " + (props.className ?? "")} />;
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props} className={inputClass + " " + (props.className ?? "")}>
      {props.children}
    </select>
  );
}

export function YesNoToggle({
  name,
  value,
  onChange,
}: {
  name: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      {[
        { label: "Oui", v: true },
        { label: "Non", v: false },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onChange(o.v)}
          className={
            "focus-ring flex-1 rounded-xl border py-2.5 text-[14px] font-medium transition-colors " +
            (value === o.v ? "bg-ink text-white border-ink" : "bg-white border-line text-ink/70 hover:border-copper")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
