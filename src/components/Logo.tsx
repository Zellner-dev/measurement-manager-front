export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-2xl font-extrabold uppercase leading-none tracking-tight ${className}`}>
      Workout<span className="text-brand">.</span>Manager
    </span>
  )
}
