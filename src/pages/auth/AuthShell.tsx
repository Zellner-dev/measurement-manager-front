import type { ReactNode } from 'react'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="relative flex flex-col justify-between overflow-hidden bg-brand px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))] text-black lg:w-1/2 lg:p-14">
        <span className="font-display text-xl font-extrabold uppercase">
          Workout<span className="text-white">.</span>Manager
        </span>
        <p className="mt-10 font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-6xl lg:text-8xl">
          Treine.
          <br />
          Registre.
          <br />
          Evolua.
        </p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full border-[36px] border-black/10"
        />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-4xl font-extrabold uppercase">{title}</h1>
          <p className="mb-8 mt-1 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
