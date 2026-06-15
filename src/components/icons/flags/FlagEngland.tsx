interface FlagProps {
  className?: string;
}

export function FlagEngland({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 60 40" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="40" fill="#fff" />
      <rect x="25" width="10" height="40" fill="#CE1124" />
      <rect y="15" width="60" height="10" fill="#CE1124" />
    </svg>
  );
}

export function FlagScotland({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 60 40" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="40" fill="#005EB8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
    </svg>
  );
}
