export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-logo ${compact ? "compact" : ""}`}>
      <svg viewBox="0 0 170 100" aria-hidden="true" role="img">
        <g fill="none" stroke="#f26722" strokeWidth="8">
          <path d="M90 14 A36 36 0 1 0 90 86" />
          <path d="M84 24 A28 28 0 1 0 84 76" />
          <path d="M78 33 A20 20 0 1 0 78 67" />
          <path d="M72 41 A13 13 0 1 0 72 59" />
        </g>
        <rect x="96" y="38" width="24" height="24" transform="rotate(45 108 50)" fill="#f26722" />
      </svg>
      <span>CHHAPERIA</span>
    </div>
  );
}
