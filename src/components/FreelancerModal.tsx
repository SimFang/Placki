import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { COPY } from '../i18n';
import type { FreelancerProfile, Language } from '../types';
import { FreelancerAvatar } from './FreelancerAvatar';

interface FreelancerModalProps {
  freelancer: FreelancerProfile | null;
  lang: Language;
  onClose: () => void;
}

export function FreelancerModal({ freelancer, lang, onClose }: FreelancerModalProps) {
  const t = COPY[lang];

  useEffect(() => {
    if (!freelancer) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [freelancer, onClose]);

  return (
    <AnimatePresence>
      {freelancer && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px] flex items-center justify-center p-4"
        >
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="freelancer-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-white rounded-3xl border border-black/[0.08] shadow-[0_28px_70px_-15px_rgba(0,0,0,0.22)] p-6 sm:p-8"
          >
            {/* Header with Profile Photo, Name, Rate & Close */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <FreelancerAvatar
                  name={freelancer.name}
                  avatarUrl={freelancer.avatarUrl}
                  size="lg"
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span className="font-mono tabular-nums font-medium text-[#111111]">
                      #{String(freelancer.rank).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-[#111111]">{freelancer.platform}</span>
                    {freelancer.handle && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{freelancer.handle}</span>
                      </>
                    )}
                  </div>

                  <h2
                    id="freelancer-modal-title"
                    className="text-xl sm:text-2xl font-semibold text-[#111111] tracking-tight mt-1"
                  >
                    {freelancer.name}
                  </h2>
                  <p className="text-sm text-neutral-600 mt-0.5">{freelancer.title}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={t.modal.close}
                className="w-9 h-9 rounded-full border border-black/[0.08] hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key Metrics Strip with Highlighted Rate */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 my-6 border-y border-black/[0.06]">
              <div>
                <div className="text-[11px] text-neutral-500">{t.modal.rate}</div>
                <div className="text-base font-semibold text-[#111111] font-mono tabular-nums mt-0.5">
                  {freelancer.rate}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-500">{t.modal.rating}</div>
                <div className="text-sm font-medium text-[#111111] font-mono tabular-nums mt-1">
                  ★ {freelancer.rating} ({freelancer.reviewsCount})
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-500">{t.modal.experience}</div>
                <div className="text-sm font-medium text-[#111111] mt-1">
                  {freelancer.experience}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-500">{t.modal.location}</div>
                <div className="text-sm font-medium text-[#111111] mt-1 truncate">
                  {freelancer.location}
                </div>
              </div>
            </div>

            {/* Description (Prominent Bio) */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500">{t.modal.about}</h3>
              <p className="text-[14.5px] text-neutral-800 leading-relaxed mt-1.5">
                {freelancer.bio}
              </p>
            </div>

            {/* Why this profile matches */}
            <div className="mt-5 pt-5 border-t border-black/[0.06]">
              <h3 className="text-xs font-semibold text-amber-900">
                {t.modal.whyMatch}
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed mt-1.5">
                {freelancer.matchReason}
              </p>
            </div>

            {/* Deliverables */}
            {freelancer.deliverables.length > 0 && (
              <div className="mt-5 pt-5 border-t border-black/[0.06]">
                <h3 className="text-xs font-semibold text-neutral-500">
                  {t.modal.deliverables}
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {freelancer.deliverables.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-neutral-800"
                    >
                      <Check className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills (Unboxed typographic list) */}
            {freelancer.skills.length > 0 && (
              <div className="mt-5 pt-5 border-t border-black/[0.06]">
                <h3 className="text-xs font-semibold text-neutral-500">{t.modal.skills}</h3>
                <p className="text-sm text-neutral-700 mt-1.5">
                  {freelancer.skills.join(' · ')}
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="mt-7 pt-5 border-t border-black/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {t.modal.responseTime} :{' '}
                <span className="font-mono text-[#111111]">{freelancer.responseTime}</span>
              </div>
              <a
                href={freelancer.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-sm font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.modal.visitProfile(freelancer.platform)}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
