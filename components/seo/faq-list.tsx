export interface FaqItem {
  q: string;
  a: string;
}

/** Same visual FAQ disclosure pattern as ToolSeoSection, for pages that build their own section order. */
export function FaqList({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {faqs.map((faq, i) => (
        <details key={i} className="group p-4 open:pb-4">
          <summary className="cursor-pointer list-none marker:content-none">
            <span className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium leading-snug">{faq.q}</h3>
              <span aria-hidden className="shrink-0 text-muted-foreground group-open:rotate-180">
                ▾
              </span>
            </span>
          </summary>
          <p className="mt-2 text-muted-foreground leading-relaxed">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
