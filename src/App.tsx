import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { FreelancerAvatar } from './components/FreelancerAvatar';
import { FreelancerModal } from './components/FreelancerModal';
import { Loading3D } from './components/Loading3D';
import { COPY } from './i18n';
import type { FreelancerProfile, Language, MatchResponse, PlatformFilter } from './types';

type ViewState = 'idle' | 'loading' | 'results';

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [pitch, setPitch] = useState('');
  const [platform, setPlatform] = useState<PlatformFilter>('both');
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const [view, setView] = useState<ViewState>('idle');
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Fiverr' | 'Malt'>('all');
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const t = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPlatformMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleTextareaResize = (value: string) => {
    setPitch(value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
    }
  };

  const runSearch = async (pitchText: string) => {
    const trimmed = pitchText.trim();
    if (trimmed.length < 5) return;

    setErrorMsg(null);
    setPlatformMenuOpen(false);
    setView('loading');
    setActiveFilter('all');

    try {
      const response = await fetch('/api/match-freelancers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitch: trimmed,
          lang,
          platform,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.errorGeneric);
      }

      setResults(data as MatchResponse);
      setView('results');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.errorGeneric);
      setView('idle');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runSearch(pitch);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (pitch.trim().length >= 5) {
        void runSearch(pitch);
      }
    }
  };

  const handleExampleClick = (example: string) => {
    setPitch(example);
    void runSearch(example);
  };

  const handleReset = () => {
    setView('idle');
    setErrorMsg(null);
    setSelectedFreelancer(null);
    window.setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const filteredFreelancers = (results?.freelancers || []).filter((f) => {
    if (activeFilter === 'all') return true;
    return f.platform === activeFilter;
  });

  const fiverrCount = (results?.freelancers || []).filter((f) => f.platform === 'Fiverr').length;
  const maltCount = (results?.freelancers || []).filter((f) => f.platform === 'Malt').length;

  return (
    <div className="relative min-h-screen bg-white text-[#111111] overflow-x-hidden">
      {/* Warm Center Radial Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden"
      >
        <div
          className="w-[820px] h-[560px] rounded-full blur-[95px] opacity-75"
          style={{
            background:
              'radial-gradient(circle at 50% 46%, rgba(253, 224, 71, 0.36) 0%, rgba(253, 186, 116, 0.2) 38%, rgba(255, 255, 255, 0) 75%)',
          }}
        />
      </div>

      {/* Minimal Top Bar */}
      <header className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleReset}
          className="text-[16px] font-semibold tracking-tight text-[#111111] whitespace-nowrap shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
        >
          Placki
        </button>

        <div className="flex items-center gap-3 shrink-0">
          {view === 'results' && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-[#111111] hover:bg-black/[0.04] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.newPitch}</span>
            </button>
          )}

          {/* Language Switcher FR / EN */}
          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center p-0.5 rounded-lg bg-black/[0.04] border border-black/[0.06]"
          >
            <button
              type="button"
              onClick={() => setLang('fr')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'fr'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-neutral-500 hover:text-[#111111]'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-neutral-500 hover:text-[#111111]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {view === 'idle' && (
            <motion.section
              key="idle-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 pb-16 pt-4"
            >
              {/* Centered Headline */}
              <h1 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.025em] text-[#111111] text-center text-balance max-w-2xl mb-7">
                {t.headline}
              </h1>

              {/* Central Minimalist Panel */}
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-[660px] bg-white/95 backdrop-blur-md rounded-[22px] border border-black/[0.08] shadow-[0_14px_44px_-12px_rgba(0,0,0,0.09)] p-4 sm:p-5 transition-all focus-within:shadow-[0_20px_54px_-12px_rgba(0,0,0,0.13)] focus-within:border-black/[0.15]"
              >
                <textarea
                  ref={textareaRef}
                  value={pitch}
                  onChange={(e) => handleTextareaResize(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  rows={3}
                  aria-label={t.headline}
                  className="w-full min-h-[88px] max-h-[220px] resize-none bg-transparent text-[15px] leading-relaxed text-[#111111] placeholder:text-neutral-400 focus:outline-none"
                />

                <div className="flex items-center justify-between gap-3 pt-3">
                  {/* Bottom-left Platform Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setPlatformMenuOpen((prev) => !prev)}
                      aria-expanded={platformMenuOpen}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] bg-neutral-50/90 hover:bg-neutral-100 text-xs font-medium text-neutral-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{t.platformLabels[platform]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    <AnimatePresence>
                      {platformMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.14 }}
                          className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl border border-black/[0.08] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.14)] p-1 z-30"
                        >
                          {(['both', 'malt', 'fiverr'] as PlatformFilter[]).map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setPlatform(option);
                                setPlatformMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                platform === option
                                  ? 'bg-neutral-100 text-[#111111]'
                                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-[#111111]'
                              }`}
                            >
                              {t.platformLabels[option]}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom-right Circular Black Submit Button */}
                  <button
                    type="submit"
                    disabled={pitch.trim().length < 5}
                    aria-label={t.submitLabel}
                    title={t.submitLabel}
                    className="w-9 h-9 rounded-full bg-[#111111] text-white hover:bg-neutral-800 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Error Feedback */}
              {errorMsg && (
                <div
                  role="alert"
                  className="w-full max-w-[660px] mt-4 px-4 py-3 rounded-xl bg-red-50/90 border border-red-200 text-xs sm:text-sm text-red-800 flex items-center justify-between gap-3"
                >
                  <span>{errorMsg}</span>
                  <button
                    type="button"
                    onClick={() => void runSearch(pitch)}
                    className="font-medium underline underline-offset-2 shrink-0 cursor-pointer"
                  >
                    {t.retry}
                  </button>
                </div>
              )}

              {/* Subtle Example Pitches Below Panel */}
              <div className="w-full max-w-[660px] mt-6">
                <p className="text-[13px] font-medium text-neutral-600 mb-2.5">
                  {t.examplesTitle}
                </p>
                <div className="flex flex-col items-start gap-2">
                  {t.examples.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="group inline-flex items-center gap-2 max-w-full px-4 py-2 rounded-full border border-dashed border-black/[0.12] hover:border-black/25 bg-white/75 hover:bg-white text-[13px] text-neutral-600 hover:text-[#111111] transition-all text-left cursor-pointer"
                    >
                      <span className="truncate">{example}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {view === 'loading' && (
            <Loading3D key="loading-view" lang={lang} pitch={pitch} />
          )}

          {view === 'results' && results && (
            <motion.section
              key="results-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-24"
            >
              {/* Results Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-7 border-b border-black/[0.06]">
                <div className="max-w-2xl">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[#111111] transition-colors mb-3 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.editPitch}</span>
                  </button>

                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] text-balance">
                    {t.resultsTitle}
                  </h1>

                  <p className="text-sm sm:text-[15px] text-neutral-600 mt-1.5 leading-relaxed">
                    {results.pitchSummary || t.resultsSubtitle}
                  </p>

                  {results.detectedDomains.length > 0 && (
                    <p className="text-xs text-neutral-500 mt-2">
                      {results.detectedDomains.join(' · ')}
                    </p>
                  )}
                </div>

                {/* Interactive Platform Filter */}
                <div className="inline-flex items-center p-1 rounded-xl bg-black/[0.04] border border-black/[0.06] self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-white text-[#111111] shadow-xs'
                        : 'text-neutral-600 hover:text-[#111111]'
                    }`}
                  >
                    {t.filterAll} ({results.freelancers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('Malt')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      activeFilter === 'Malt'
                        ? 'bg-white text-[#111111] shadow-xs'
                        : 'text-neutral-600 hover:text-[#111111]'
                    }`}
                  >
                    Malt ({maltCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('Fiverr')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      activeFilter === 'Fiverr'
                        ? 'bg-white text-[#111111] shadow-xs'
                        : 'text-neutral-600 hover:text-[#111111]'
                    }`}
                  >
                    Fiverr ({fiverrCount})
                  </button>
                </div>
              </div>

              {/* 10 Freelancers Grid */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8"
                style={{ perspective: '1000px' }}
              >
                {filteredFreelancers.map((freelancer, idx) => (
                  <motion.article
                    key={freelancer.id}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 18, rotateX: 8 }
                    }
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.32,
                      delay: shouldReduceMotion ? 0 : idx * 0.045,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group bg-white/95 backdrop-blur-sm rounded-2xl border border-black/[0.08] p-5 sm:p-6 hover:border-black/[0.16] hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-between gap-5"
                  >
                    <div>
                      {/* Top Header: Profile Photo + Identity + Prominent Rate */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <FreelancerAvatar
                            name={freelancer.name}
                            avatarUrl={freelancer.avatarUrl}
                            size="md"
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                              <span className="font-mono tabular-nums font-medium text-neutral-400">
                                {String(freelancer.rank).padStart(2, '0')}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-[#111111]">
                                {freelancer.platform}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">{freelancer.location}</span>
                            </div>

                            <h2 className="text-[17px] font-semibold text-[#111111] tracking-tight mt-0.5 truncate">
                              {freelancer.name}
                            </h2>
                            <p className="text-[13.5px] font-medium text-neutral-600 truncate">
                              {freelancer.title}
                            </p>
                          </div>
                        </div>

                        {/* Highlighted Rate Display */}
                        <div className="text-right shrink-0 pt-0.5">
                          <div className="text-[11px] font-medium text-neutral-400">
                            {t.rateLabel}
                          </div>
                          <div className="text-[16px] sm:text-[17px] font-semibold font-mono tabular-nums text-[#111111] tracking-tight whitespace-nowrap mt-0.5">
                            {freelancer.rate}
                          </div>
                        </div>
                      </div>

                      {/* Highlighted Description Block */}
                      <div className="mt-4 pt-4 border-t border-black/[0.05]">
                        <div className="text-[11px] font-semibold text-neutral-400 mb-1">
                          {t.descriptionLabel}
                        </div>
                        <p className="text-[14px] leading-[1.6] text-neutral-800 line-clamp-3">
                          {freelancer.bio}
                        </p>
                      </div>

                      {/* Personalized Match Reason */}
                      <div className="mt-3.5 pt-3 border-t border-black/[0.05]">
                        <p className="text-[13px] leading-relaxed text-neutral-600 line-clamp-2">
                          <span className="font-semibold text-[#111111]">
                            {t.matchLabel} :{' '}
                          </span>
                          {freelancer.matchReason}
                        </p>
                      </div>

                      {/* Clean Unboxed Rating, Experience & Skills */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                        <span className="font-mono tabular-nums font-medium text-[#111111]">
                          ★ {freelancer.rating}
                        </span>
                        <span className="text-neutral-400">({freelancer.reviewsCount})</span>
                        <span aria-hidden="true">·</span>
                        <span>{freelancer.experience}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {t.responseLabel} {freelancer.responseTime}
                        </span>
                      </div>

                      {freelancer.skills.length > 0 && (
                        <p className="text-xs text-neutral-500 mt-2 truncate">
                          {freelancer.skills.join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedFreelancer(freelancer)}
                        className="text-xs font-medium text-neutral-700 hover:text-[#111111] underline underline-offset-4 decoration-black/20 hover:decoration-black/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {t.viewDetails}
                      </button>

                      <a
                        href={freelancer.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>{t.openOnPlatform(freelancer.platform)}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Freelancer Detail Modal */}
      <FreelancerModal
        freelancer={selectedFreelancer}
        lang={lang}
        onClose={() => setSelectedFreelancer(null)}
      />
    </div>
  );
}
