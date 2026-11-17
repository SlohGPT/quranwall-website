import { useState } from 'react';
import { faqs } from '../data/faqs';

/**
 * A small step diagram for the one setup answer. Every label restates a sentence of that answer
 * ("How does QuranWall work?" in src/data/faqs.ts); nothing here is new copy. Decorative: the answer text has it all.
 */
const FLOW_FOR = 'How does QuranWall work?';
const FLOW = ['Pick an ayah', 'Edit text, font and colour', 'Tap Make It Mine', 'Shortcuts sets your Lock Screen'];

function Flow() {
  return (
    <ol aria-hidden="true" className="mx-5 mb-5 grid list-none grid-cols-2 gap-3 pl-0 sm:grid-cols-4">
      {FLOW.map((label, i) => (
        <li key={label} className="relative flex flex-col items-center gap-2 text-center">
          {i < FLOW.length - 1 && (
            <span className="absolute left-[calc(50%+22px)] top-4 hidden h-px w-[calc(100%-44px)] border-t border-dashed border-brand/40 sm:block" />
          )}
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-brand/50 bg-brand/15 text-sm font-bold text-brand">
            {i + 1}
          </span>
          <span className="text-[13px] leading-snug text-white/75">{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-space bg-surface">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-brand font-medium mb-3 tracking-wide uppercase text-sm">FAQ</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-3xl overflow-hidden bg-gradient-to-br from-surface-card to-surface-elevated border-2 transition-all duration-300 ${
                  open ? 'border-brand/40' : 'border-brand/20'
                }`}
              >
                <button
                  type="button"
                  id={`faq-q-${index}`}
                  aria-expanded={open}
                  aria-controls={`faq-a-${index}`}
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className={`font-medium pr-4 ${open ? 'text-white' : 'text-white/80'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    open ? 'bg-brand text-brand-ink rotate-45' : 'bg-surface-card text-white/60'
                  }`}>
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
                {/* The answer is always in the HTML (server-rendered, never unmounted): a closed one is collapsed with CSS. */}
                <div
                  id={`faq-a-${index}`}
                  role="region"
                  aria-labelledby={`faq-q-${index}`}
                  className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-5 pb-5 text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                    {faq.question === FLOW_FOR && <Flow />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
