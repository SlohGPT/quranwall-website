import { useState } from 'react';
import Reveal from './ui/Reveal';
import SectionHeading from './ui/SectionHeading';
import StarPattern from './ui/StarPattern';
import { glassCardClass } from './ui/GlassCard';
import { faqs } from '../data/faqs';
import { Scene } from './visuals';

const testimonials = [
    {
        quote: "QuranWall has transformed my morning routine. Instead of checking social media, I start with the Quran.",
        author: 'Aisha M.',
        role: 'First Waitlist Member',
        image: '/assets/avatars/avatar-4.jpg',
    },
    {
        quote: "As a busy mom, I needed something simple. Every time I check my phone, I'm reminded of Allah's promises.",
        author: 'Fatima K.',
        role: 'First Waitlist Member',
        image: '/assets/avatars/avatar-5.jpg',
    },
    {
        quote: "I've tried many Islamic apps, but this is different. It meets me where I am, on my lock screen.",
        author: 'Yusuf L.',
        role: 'First Waitlist Member',
        image: '/assets/avatars/avatar-6.jpg',
    },
];

export default function TestimonialsAndFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="testimonials-faq" className="section-space relative overflow-hidden bg-surface">
            <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(217,185,104,0.07),transparent)]" />
            <StarPattern opacity={0.022} fade="left" />

            <div className="container-main relative">
                <div className="grid items-start gap-20 lg:grid-cols-2 lg:gap-24">

                    {/* LEFT COLUMN: Testimonials */}
                    <div>
                        <SectionHeading eyebrow="Testimonials" title="Loved by believers" muted="everywhere" className="mb-12" />

                        <div className="space-y-5">
                            {testimonials.map((testimonial, i) => (
                                <Reveal key={testimonial.author} delay={i * 0.1} className={i % 2 === 1 ? 'lg:ml-8' : 'lg:mr-8'}>
                                    <figure className={`${glassCardClass} overflow-hidden p-6 sm:p-8 transition duration-300 hover:border-brand/30`}>
                                        <svg aria-hidden="true" viewBox="0 0 32 24" className="mb-4 h-6 w-8 fill-brand/70">
                                            <path d="M0 24V13.2C0 5.6 4.2 1 11.4 0l1 3.6C8.4 4.6 6.6 7 6.4 10.4H12V24H0Zm18 0V13.2C18 5.6 22.2 1 29.4 0l1 3.6c-4 1-5.8 3.4-6 6.8H30V24H18Z" />
                                        </svg>
                                        <blockquote>
                                            <p className="font-serif text-lg font-medium leading-relaxed text-white/90 sm:text-xl">
                                                "{testimonial.quote}"
                                            </p>
                                        </blockquote>
                                        <figcaption className="mt-6 flex items-center gap-4 border-t border-white/[0.08] pt-5">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.author}
                                                width={44}
                                                height={44}
                                                className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-brand/30 ring-offset-2 ring-offset-surface"
                                                loading="lazy"
                                            />
                                            <div>
                                                <p className="font-bold text-white">{testimonial.author}</p>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-light/80">
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FAQ (answers stay in the DOM when collapsed, for SSR and crawlers) */}
                    <div id="faq">
                        <div className="mb-12 flex items-end justify-between gap-6">
                            <SectionHeading eyebrow="FAQ" title="Common questions" />
                            <Scene name="support" className="hidden w-36 flex-none sm:block lg:w-32 xl:w-40" />
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, index) => {
                                const open = openIndex === index;
                                return (
                                    <Reveal key={index} delay={index * 0.06} y={12}>
                                        <div
                                            className={`${glassCardClass} !rounded-[22px] overflow-hidden transition-colors duration-300 ${
                                                open ? '!border-brand/40 !bg-white/[0.05]' : 'hover:border-white/20'
                                            }`}
                                        >
                                            <h3>
                                                <button
                                                    type="button"
                                                    id={`faq-question-${index}`}
                                                    onClick={() => setOpenIndex(open ? null : index)}
                                                    className="group flex w-full items-center justify-between gap-4 rounded-[22px] p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-6"
                                                    aria-expanded={open}
                                                    aria-controls={`faq-answer-${index}`}
                                                >
                                                    <span className={`font-medium leading-snug transition-colors ${open ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                                                        {faq.question}
                                                    </span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                                                            open ? 'rotate-45 bg-brand text-brand-ink' : 'bg-white/[0.06] text-white/50 group-hover:text-white'
                                                        }`}
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </span>
                                                </button>
                                            </h3>
                                            {/* grid-rows 0fr -> 1fr animates height without measuring; text stays in the DOM */}
                                            <div
                                                id={`faq-answer-${index}`}
                                                role={open ? 'region' : undefined}
                                                aria-labelledby={`faq-question-${index}`}
                                                aria-hidden={!open}
                                                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
                                                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                                }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <p className="px-5 pb-6 text-sm leading-relaxed text-white/60 sm:px-6 lg:text-base">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Reveal>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
