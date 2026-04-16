import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Landing })

function Landing() {
  return (
    <main className="hero-page relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <div className="hero-bg-orb hero-bg-orb-a" aria-hidden="true" />
      <div className="hero-bg-orb hero-bg-orb-b" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="relative z-[1] mx-auto w-full max-w-3xl">
        <div className="rise-in text-left">
          <h1 className="display-title hero-headline mb-8 font-medium text-balance text-[var(--text)] sm:mb-10 lg:mb-12">
            Design in the browser,
            <br />
            openly.
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-[1.6] text-[var(--text-muted)] sm:mb-12 sm:text-xl sm:leading-[1.55] lg:text-[1.375rem] lg:leading-[1.5]">
            Open-source canvas for layouts and graphics. No account — start
            blank, export when you are done.
          </p>
          <div
            className="mb-10 h-px w-14 bg-[var(--text)] opacity-[0.12] sm:mb-11"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/create"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--text)] px-10 py-3.5 text-base font-medium text-white no-underline hover:bg-[#262626] sm:min-h-14 sm:px-12 sm:py-4 sm:text-[1.0625rem]"
            >
              Open editor
            </Link>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/[0.14] bg-white/70 px-8 py-3.5 text-base font-medium text-[var(--text)] no-underline backdrop-blur-sm hover:border-black/[0.22] hover:bg-white sm:min-h-14 sm:px-10 sm:py-4 sm:text-[1.0625rem]"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
