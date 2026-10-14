import { Container } from "@/components/ui/container";
import type { LegalDocument } from "@/lib/legal/content";

// Página legal (aviso legal, privacidad, cookies): título, introducción y secciones.
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{document.title}</h1>
        <p className="mt-2 text-sm text-stone-500">{document.updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-stone-700">{document.intro}</p>

        <div className="mt-10 space-y-10">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl font-semibold">{section.title}</h2>
              {section.list && (
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-stone-700 marker:text-terracotta-500">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div className="mt-3 overflow-x-auto rounded-2xl border border-sand-200 bg-white">
                  <table className="w-full min-w-[32rem] text-left text-sm">
                    <thead className="bg-sand-100 text-stone-600">
                      <tr>
                        {section.table.head.map((cell) => (
                          <th key={cell} scope="col" className="px-4 py-3 font-semibold">
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]} className="border-t border-sand-200 align-top">
                          {row.map((cell, index) => (
                            <td key={index} className={`px-4 py-3 ${index === 0 ? "font-mono text-xs" : ""}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-stone-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
