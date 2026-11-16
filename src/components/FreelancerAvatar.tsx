import { useState } from 'react';

interface FreelancerAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'md' | 'lg';
}

function getInitials(name: string): string {
  const parts = name
    .replace(/\([^)]*\)/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'PL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function FreelancerAvatar({
  name,
  avatarUrl,
  size = 'md',
}: FreelancerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const dimensions = size === 'lg' ? 'w-16 h-16 text-base' : 'w-12 h-12 text-xs';

  if (!avatarUrl || imgError) {
    return (
      <div
        aria-label={name}
        className={`${dimensions} rounded-2xl bg-gradient-to-br from-amber-50 to-stone-100 border border-black/[0.08] flex items-center justify-center font-semibold text-neutral-700 shrink-0 select-none`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} rounded-2xl overflow-hidden bg-stone-100 border border-black/[0.08] shadow-xs shrink-0`}
    >
      <img
        src={avatarUrl}
        alt={`Photo de profil de ${name}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}
