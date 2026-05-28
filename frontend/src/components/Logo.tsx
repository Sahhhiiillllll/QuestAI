import Link from 'next/link';

export function Logo({ href = '/', size = 'md' }: { href?: string; size?: 'sm' | 'md' }) {
  const icon = size === 'sm' ? 28 : 32;
  const text = size === 'sm' ? 17 : 20;

  return (
    <Link href={href} className="logo-link">
      <span className="logo-icon" style={{ width: icon, height: icon }}>
        <svg viewBox="0 0 32 32" fill="none" width={icon} height={icon}>
          <defs>
            <linearGradient id="vGrad" x1="4" y1="4" x2="28" y2="28">
              <stop stopColor="#FF8A3D" />
              <stop offset="1" stopColor="#E85D4A" />
            </linearGradient>
          </defs>
          <path d="M6 26L16 4l10 22H20l-4-9-4 9H6z" fill="url(#vGrad)" />
        </svg>
      </span>
      <span className="logo-text" style={{ fontSize: text }}>QuestAI</span>
    </Link>
  );
}
