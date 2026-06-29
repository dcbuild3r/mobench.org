import { useState, type ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Bot, Check, ChevronDown, Copy, ExternalLink, FileText, MessageCircle, Search } from 'lucide-react'
import { SyntaxHighlightedCode } from '@/components/code-highlight'
import { GithubIcon, WorldMark, GITHUB_URL, WORLD_URL } from '@/components/icons'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/docs')({
  component: Docs,
})

type PageId =
  | 'home'
  | 'intro'
  | 'install'
  | 'quick'
  | 'configuration'
  | 'benchmarks'
  | 'sdk'
  | 'cli'
  | 'browserstack'
  | 'ci'
  | 'profiling'
  | 'reports'
  | 'packages'
  | 'troubleshooting'

interface PageDef {
  id: PageId
  label: string
  group: string
  toc: [string, string][]
}

const PAGES: PageDef[] = [
  {
    id: 'home',
    label: 'Overview',
    group: 'Introduction',
    toc: [
      ['Start here', 'start'],
      ['What is covered', 'covered'],
      ['Common path', 'path'],
      ['API links', 'links'],
    ],
  },
  {
    id: 'intro',
    label: 'Concepts',
    group: 'Introduction',
    toc: [
      ['What mobench is', 'what'],
      ['How the system fits', 'system'],
      ['Artifact flow', 'flow'],
      ['Crate ecosystem', 'ecosystem'],
    ],
  },
  {
    id: 'install',
    label: 'Installation',
    group: 'Getting started',
    toc: [
      ['Install CLI', 'cli'],
      ['Cargo setup', 'cargo'],
      ['Android setup', 'android'],
      ['iOS setup', 'ios'],
      ['Verify setup', 'verify'],
    ],
  },
  {
    id: 'quick',
    label: 'Quickstart',
    group: 'Getting started',
    toc: [
      ['Initialize config', 'init'],
      ['Write a benchmark', 'write'],
      ['Build artifacts', 'build'],
      ['Run locally', 'local'],
      ['Run on devices', 'devices'],
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    group: 'Getting started',
    toc: [
      ['TOML config', 'toml'],
      ['BrowserStack block', 'browserstack'],
      ['Device inputs', 'devices'],
      ['Validation', 'validation'],
    ],
  },
  {
    id: 'benchmarks',
    label: 'Writing benchmarks',
    group: 'Guides',
    toc: [
      ['Basic shape', 'basic'],
      ['Setup functions', 'setup'],
      ['Macro behavior', 'macro'],
      ['Discovery', 'discovery'],
      ['Best practices', 'best'],
    ],
  },
  {
    id: 'sdk',
    label: 'SDK reference',
    group: 'Guides',
    toc: [
      ['Architecture', 'architecture'],
      ['Feature flags', 'features'],
      ['Runner APIs', 'runner'],
      ['Builders', 'builders'],
      ['Re-exports', 'exports'],
    ],
  },
  {
    id: 'cli',
    label: 'CLI reference',
    group: 'Reference',
    toc: [
      ['Commands', 'commands'],
      ['Run command', 'run'],
      ['Build command', 'build'],
      ['Fixture helpers', 'fixtures'],
      ['Global flags', 'global'],
    ],
  },
  {
    id: 'browserstack',
    label: 'BrowserStack',
    group: 'Reference',
    toc: [
      ['Credentials', 'credentials'],
      ['Device names', 'names'],
      ['Release uploads', 'release'],
      ['Fetching results', 'fetch'],
    ],
  },
  {
    id: 'ci',
    label: 'CI workflows',
    group: 'Reference',
    toc: [
      ['CI command', 'command'],
      ['Matrix validation', 'matrix'],
      ['Device resolution', 'resolution'],
      ['Sticky reports', 'sticky'],
    ],
  },
  {
    id: 'profiling',
    label: 'Profiling',
    group: 'Reference',
    toc: [
      ['What profiling does', 'what'],
      ['Local native capture', 'local'],
      ['Timeline phases', 'phases'],
    ],
  },
  {
    id: 'reports',
    label: 'Outputs & reports',
    group: 'Reference',
    toc: [
      ['Output directory', 'directory'],
      ['Run outputs', 'run'],
      ['Programmatic types', 'types'],
      ['Summary extraction', 'summary'],
    ],
  },
  {
    id: 'packages',
    label: 'Packages & API',
    group: 'Reference',
    toc: [
      ['mobench', 'mobench'],
      ['mobench-sdk', 'sdk'],
      ['mobench-macros', 'macros'],
      ['docs.rs', 'docsrs'],
    ],
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    group: 'Reference',
    toc: [
      ['Benchmarks missing', 'missing'],
      ['Build failures', 'build'],
      ['BrowserStack failures', 'browserstack'],
      ['Noisy results', 'noise'],
    ],
  },
]

const DOCSRS = {
  mobench: 'https://docs.rs/mobench/latest/mobench/',
  sdk: 'https://docs.rs/mobench-sdk/latest/mobench_sdk/',
  macros: 'https://docs.rs/mobench-macros/latest/mobench_macros/',
}

const DOCS_URL = 'https://docs.mobench.org'

const C = {
  dollar: 'text-[#8A9163]',
  cmd: 'text-[#2E7D1B]',
  flag: 'text-[#9A6411]',
  out: 'text-[#6C7850]',
  ok: 'text-[#1E8A3B]',
  str: 'text-[#4E7A1C]',
  kw: 'text-[#8A3DB0]',
}

const AI_LINKS = [
  ['ChatGPT', 'https://chatgpt.com/?q='],
  ['Claude', 'https://claude.ai/new?q='],
  ['Gemini', 'https://gemini.google.com/app?prompt='],
  ['Grok', 'https://grok.com/?q='],
] as const

function docsPageMarkdown(active: PageDef) {
  const article = document.querySelector('[data-docs-article]')
  const pageText = article?.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? active.label
  const source = window.location.href

  return [`# ${active.label === 'Overview' ? 'mobench documentation' : active.label}`, '', `Source: ${source}`, '', pageText].join('\n')
}

function aiPromptForPage(markdown: string) {
  return [
    'Use this mobench documentation page as context.',
    'Explain the page, call out the important implementation details, and suggest the next concrete steps.',
    '',
    markdown,
  ].join('\n')
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function DocsActions({ active }: { active: PageDef }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentMarkdown = () => docsPageMarkdown(active)

  const copyPage = async () => {
    await copyText(currentMarkdown())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const viewMarkdown = () => {
    const blob = new Blob([currentMarkdown()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
    setOpen(false)
  }

  const askAi = (baseUrl: string) => {
    const prompt = aiPromptForPage(currentMarkdown())
    window.open(`${baseUrl}${encodeURIComponent(prompt)}`, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[rgba(20,18,12,0.16)] bg-white px-3 font-sans text-[13px] font-medium text-ink shadow-[0_8px_24px_-22px_rgba(20,18,12,0.5)]"
        aria-expanded={open}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy page'}</span>
        <span className="sm:hidden">{copied ? 'Done' : 'Copy'}</span>
        <ChevronDown size={15} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(326px,calc(100vw-40px))] overflow-hidden rounded-xl border border-[rgba(20,18,12,0.14)] bg-[#15130f] p-1.5 text-white shadow-[0_24px_70px_-28px_rgba(20,18,12,0.7)]">
          <button
            onClick={copyPage}
            className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left font-sans hover:bg-white/8"
          >
            <Copy size={17} className="mt-0.5 text-white/80" />
            <span>
              <span className="block text-[14px] font-medium text-white">Copy page</span>
              <span className="mt-1 block text-[12.5px] leading-[1.35] text-white/50">Copy page as Markdown for LLMs</span>
            </span>
          </button>

          <button
            onClick={viewMarkdown}
            className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left font-sans hover:bg-white/8"
          >
            <FileText size={17} className="mt-0.5 text-white/80" />
            <span>
              <span className="block text-[14px] font-medium text-white">View as Markdown</span>
              <span className="mt-1 block text-[12.5px] leading-[1.35] text-white/50">Open this page as plain text</span>
            </span>
          </button>

          <div className="border-t border-white/10 px-3 pb-2 pt-3">
            <div className="mb-2 flex items-center gap-3">
              <MessageCircle size={17} className="text-white/80" />
              <div>
                <div className="text-[14px] font-medium text-white">Ask AI about this page</div>
                <div className="mt-1 text-[12.5px] leading-[1.35] text-white/50">Open this page as context in a new chat</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pl-[29px]">
              {AI_LINKS.map(([label, baseUrl]) => (
                <button
                  key={label}
                  onClick={() => askAi(baseUrl)}
                  className="inline-flex cursor-pointer items-center justify-between rounded-md bg-white/6 px-2.5 py-2 text-left text-[12.5px] font-medium text-white/85 hover:bg-white/12"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Bot size={13} />
                    {label}
                  </span>
                  <ExternalLink size={12} className="text-white/45" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="rounded-[5px] bg-[rgba(20,18,12,0.06)] px-1.5 py-px font-mono text-[14px]">{children}</span>
}

function H1({ children }: { children: ReactNode }) {
  return <h1 className="m-0 mb-[18px] text-[clamp(34px,10vw,50px)] font-semibold leading-[1.04] tracking-[-0.045em]">{children}</h1>
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="m-0 mb-9 text-[16.5px] leading-[1.68] text-muted sm:mb-11 sm:text-[21px] sm:leading-[1.6]">{children}</p>
}

function H2({ id, children, tight }: { id: string; children: ReactNode; tight?: boolean }) {
  return (
    <h2
      id={id}
      className={cn(
        'text-[25px] font-semibold tracking-[-0.03em] [scroll-margin-top:116px] sm:text-[30px] xl:[scroll-margin-top:90px]',
        tight ? 'mb-[18px] mt-2' : 'mb-[18px] mt-11 sm:mt-[60px]',
      )}
    >
      {children}
    </h2>
  )
}

function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('m-0 mb-3.5 text-[16px] leading-[1.72] text-ink-soft sm:text-[17.5px] sm:leading-[1.78]', className)}>{children}</p>
}

function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <SyntaxHighlightedCode className={cn('max-w-full overflow-x-auto rounded-xl bg-leaf px-4 py-4 font-mono text-[12.5px] leading-[1.8] text-code sm:px-5 sm:py-[18px] sm:text-[13.5px] sm:leading-[1.9]', className)}>
      {children}
    </SyntaxHighlightedCode>
  )
}

function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div className="my-7 flex gap-3.5 rounded-xl border border-green/20 bg-green/5 px-5 py-[18px]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F7A2E" strokeWidth="1.8" className="mt-px flex-none">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <circle cx="12" cy="8" r="0.6" fill="#3F7A2E" />
      </svg>
      <p className="m-0 text-[14.5px] leading-[1.6] text-ink-soft">{children}</p>
    </div>
  )
}

function Table({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[rgba(20,18,12,0.10)] bg-white">
      {rows.map(([label, body]) => (
        <div key={label} className="grid grid-cols-1 border-b border-[rgba(20,18,12,0.08)] last:border-b-0 sm:grid-cols-[180px_1fr]">
          <div className="bg-[#F6F1E1] px-4 py-3 font-mono text-[13px] text-green">{label}</div>
          <div className="px-4 py-3 text-[15px] leading-[1.6] text-ink-soft">{body}</div>
        </div>
      ))}
    </div>
  )
}

function Cards({ children }: { children: ReactNode }) {
  return <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(238px,1fr))]">{children}</div>
}

function HubCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-[7px] rounded-2xl border border-[rgba(20,18,12,0.10)] bg-white px-6 py-6 text-left font-sans transition-all hover:-translate-y-[3px] hover:border-green/50 hover:shadow-[0_16px_36px_-24px_rgba(20,18,12,0.45)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink">{title}</span>
        <span className="text-[18px] text-green">-&gt;</span>
      </div>
      <span className="text-[14.5px] leading-[1.5] text-muted">{desc}</span>
    </button>
  )
}

function LinkCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-[7px] rounded-2xl border border-[rgba(20,18,12,0.10)] bg-white px-6 py-[22px] no-underline transition-all hover:-translate-y-[3px] hover:border-green/50 hover:shadow-[0_16px_36px_-24px_rgba(20,18,12,0.45)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-semibold text-ink">{title}</span>
        <span className="text-[15px] text-faint">external</span>
      </div>
      <span className="text-sm leading-[1.5] text-muted">{desc}</span>
    </a>
  )
}

export function Docs() {
  const [page, setPage] = useState<PageId>('home')
  const [qtab, setQtab] = useState(0)
  const active = PAGES.find((p) => p.id === page) ?? PAGES[0]
  const groups = Array.from(new Set(PAGES.map((p) => p.group)))
  const index = PAGES.findIndex((p) => p.id === page)
  const prev = index > 0 ? PAGES[index - 1] : null
  const next = index < PAGES.length - 1 ? PAGES[index + 1] : null
  const go = (id: PageId) => setPage(id)

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-50 border-b border-[rgba(20,18,12,0.09)] bg-[rgba(244,239,221,0.82)] backdrop-blur-[14px]">
        <div className="flex h-[60px] items-center justify-between gap-4 px-5 sm:px-7">
          {typeof window !== 'undefined' && window.location.hostname === 'docs.mobench.org' ? (
            <a href="https://mobench.org" className="flex items-center gap-2.5 no-underline text-ink">
              <span className="text-[19px] font-semibold tracking-[-0.045em]">mobench</span>
              <span className="rounded-[5px] border border-[rgba(20,18,12,0.16)] px-1.5 py-0.5 font-mono text-[10.5px] text-faint">docs</span>
            </a>
          ) : (
            <Link to="/" className="flex items-center gap-2.5 no-underline text-ink">
              <span className="text-[19px] font-semibold tracking-[-0.045em]">mobench</span>
              <span className="rounded-[5px] border border-[rgba(20,18,12,0.16)] px-1.5 py-0.5 font-mono text-[10.5px] text-faint">docs</span>
            </Link>
          )}
          <div className="hidden max-w-[420px] flex-1 items-center gap-[9px] rounded-[9px] border border-[rgba(20,18,12,0.14)] bg-white px-3 py-2 text-faint md:flex">
            <Search size={15} />
            <span className="flex-1 text-[13.5px]">Search docs</span>
            <span className="rounded-[5px] border border-[rgba(20,18,12,0.14)] px-1.5 py-px font-mono text-[11px]">⌘K</span>
          </div>
          <DocsActions active={active} />
          <div className="flex items-center gap-4 text-[13.5px] text-muted">
            {typeof window !== 'undefined' && window.location.hostname === 'docs.mobench.org' ? (
              <a href="https://mobench.org" className="no-underline text-inherit">
                Home
              </a>
            ) : (
              <Link to="/" className="no-underline text-inherit">
                Home
              </Link>
            )}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-[7px] rounded-lg border border-[rgba(20,18,12,0.16)] px-3 py-[7px] text-ink no-underline sm:flex"
            >
              <GithubIcon width={14} height={14} />
              GitHub
            </a>
          </div>
        </div>
      </header>

        <div className="mx-auto flex max-w-[1600px] flex-col items-stretch xl:flex-row xl:items-start">
          <aside className="mb-scroll sticky top-[60px] z-30 w-full flex-none overflow-x-auto whitespace-nowrap border-b border-[rgba(20,18,12,0.08)] bg-cream px-5 py-3 sm:px-7 xl:h-[calc(100vh-60px)] xl:w-[282px] xl:overflow-y-auto xl:whitespace-normal xl:border-b-0 xl:border-r xl:py-10 xl:pl-[34px] xl:pr-[22px]">
          {groups.map((g) => (
              <div key={g} className="contents xl:mb-[26px] xl:block">
                <div className="hidden mb-3 pl-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faintest xl:block">{g}</div>
              {PAGES.filter((p) => p.group === g).map((p) => {
                const isActive = p.id === page
                return (
                  <button
                    key={p.id}
                    onClick={() => go(p.id)}
                    className={cn(
                        'mr-1 inline-block cursor-pointer whitespace-nowrap rounded-[9px] px-3.5 py-[9px] text-left text-[14px] leading-[1.35] xl:mb-[3px] xl:mr-0 xl:block xl:w-full xl:text-[14.5px]',
                      isActive
                          ? 'bg-green/10 font-medium text-green xl:shadow-[inset_2px_0_0_#3F7A2E]'
                        : 'font-normal text-muted hover:text-ink',
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          ))}
            <div className="mt-[30px] hidden border-t border-[rgba(20,18,12,0.08)] pt-[22px] xl:block">
            <a href={DOCS_URL} className="block px-3 py-1.5 text-[13px] font-medium text-green no-underline">
              docs.mobench.org
            </a>
            <a href={DOCSRS.mobench} target="_blank" rel="noreferrer" className="block px-3 py-1.5 text-[13px] text-faint no-underline">
              API reference on docs.rs
            </a>
            <a href={WORLD_URL} target="_blank" rel="noreferrer" className="flex items-center gap-[7px] px-3 py-1.5 text-[13px] text-faint no-underline">
              <WorldMark width={16} height={16} /> Built by World
            </a>
          </div>
        </aside>

          <main className="mb-scroll flex min-h-[calc(100vh-112px)] w-full min-w-0 flex-1 justify-center px-5 pb-20 pt-9 sm:px-7 sm:pt-12 xl:h-[calc(100vh-60px)] xl:overflow-y-auto xl:px-12 xl:pb-[130px] xl:pt-14">
            <article className="w-full max-w-[920px]" data-docs-article>
            {page !== 'home' && (
              <div className="mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-green">{active.group}</div>
            )}

            {page === 'home' && <HomePage go={go} qtab={qtab} setQtab={setQtab} />}
            {page === 'intro' && <IntroPage />}
            {page === 'install' && <InstallPage />}
            {page === 'quick' && <QuickPage />}
            {page === 'configuration' && <ConfigurationPage />}
            {page === 'benchmarks' && <BenchmarkPage />}
            {page === 'sdk' && <SdkPage />}
            {page === 'cli' && <CliPage />}
            {page === 'browserstack' && <BrowserStackPage />}
            {page === 'ci' && <CiPage />}
            {page === 'profiling' && <ProfilingPage />}
            {page === 'reports' && <ReportsPage />}
            {page === 'packages' && <PackagesPage />}
            {page === 'troubleshooting' && <TroubleshootingPage />}

            <div className="mt-16 flex flex-col justify-between gap-4 border-t border-[rgba(20,18,12,0.1)] pt-7 sm:flex-row">
              {prev ? (
                <button
                  onClick={() => go(prev.id)}
                  className="flex-1 cursor-pointer rounded-xl border border-[rgba(20,18,12,0.12)] bg-white px-[18px] py-4 text-left font-sans"
                >
                  <span className="mb-[5px] block font-mono text-[11px] text-faint">PREVIOUS</span>
                  <span className="text-[15px] font-medium text-ink">{prev.label}</span>
                </button>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <button
                  onClick={() => go(next.id)}
                  className="flex-1 cursor-pointer rounded-xl border border-[rgba(20,18,12,0.12)] bg-white px-[18px] py-4 text-left font-sans sm:text-right"
                >
                  <span className="mb-[5px] block font-mono text-[11px] text-faint">NEXT</span>
                  <span className="text-[15px] font-medium text-ink">{next.label}</span>
                </button>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          </article>
        </main>

        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[218px] flex-none overflow-y-auto px-7 pb-12 pl-[18px] pt-[60px] xl:block">
          <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-faintest">On page</div>
          <div className="flex flex-col gap-[11px] border-l border-[rgba(20,18,12,0.1)] pl-4">
            {active.toc.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="text-[13px] leading-[1.4] text-muted no-underline hover:text-green">
                {label}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function HomePage({
  go,
  qtab,
  setQtab,
}: {
  go: (id: PageId) => void
  qtab: number
  setQtab: (n: number) => void
}) {
  const qLabels = ['Install', 'Configure', 'Annotate', 'Run']
  return (
    <div>
      <button
        onClick={() => go('quick')}
        className="mb-[34px] flex w-full cursor-pointer flex-wrap items-center gap-2 rounded-[18px] border border-green/20 bg-green/[0.07] px-3 py-2 text-left font-sans transition-all hover:border-green/50 hover:bg-green/10 sm:inline-flex sm:w-auto sm:gap-3 sm:rounded-[40px] sm:pl-4 sm:pr-2"
      >
        <span className="rounded-[30px] bg-green px-[9px] py-[3px] font-mono text-[10.5px] uppercase tracking-[0.06em] text-white">0.1.41</span>
        <span className="min-w-0 flex-1 text-[14px] leading-[1.35] text-ink-soft sm:flex-none sm:text-[14.5px]">Complete guide for mobench, mobench-sdk, and mobench-macros</span>
        <span className="text-[14px] font-medium text-green sm:pr-2">Get started</span>
      </button>

      <H1>mobench documentation</H1>
      <Lead>
        Build, run, report, and profile Rust benchmarks on mobile platforms using the mobench CLI, SDK runtime,
        generated mobile runners, and <Mono>#[benchmark]</Mono> macro.
      </Lead>

      <div id="start" className="mb-11 flex flex-col gap-3 [scroll-margin-top:116px] sm:flex-row sm:flex-wrap xl:[scroll-margin-top:90px]">
        <button onClick={() => go('install')} className="cursor-pointer rounded-[10px] bg-green px-5 py-3 font-sans text-[15px] font-medium text-white hover:bg-green-dark">
          Install mobench
        </button>
        <button onClick={() => go('quick')} className="cursor-pointer rounded-[10px] border border-[rgba(20,18,12,0.16)] bg-white px-5 py-3 font-sans text-[15px] font-medium text-ink">
          Quickstart
        </button>
        <a href={DOCSRS.mobench} target="_blank" rel="noreferrer" className="rounded-[10px] border border-[rgba(20,18,12,0.16)] bg-white px-5 py-3 text-[15px] font-medium text-ink no-underline">
          Rustdoc API
        </a>
      </div>

      <H2 id="covered" tight>What is covered</H2>
      <Cards>
        <HubCard title="CLI workflows" desc="init, build, run, ci run, doctor, config validate, devices resolve, fixture helpers, reports, fetch, and package commands." onClick={() => go('cli')} />
        <HubCard title="Benchmark authoring" desc="Function signatures, setup data, discovery, inventory registration, black_box usage, and deterministic benchmark style." onClick={() => go('benchmarks')} />
        <HubCard title="SDK APIs" desc="Feature flags, BenchmarkBuilder, BenchSpec, run_benchmark, AndroidBuilder, IosBuilder, timing, registry, and FFI helpers." onClick={() => go('sdk')} />
        <HubCard title="Automation" desc="BrowserStack credentials, device selection, CI summaries, matrix validation, sticky PR reports, and output files." onClick={() => go('ci')} />
      </Cards>

      <H2 id="path">Common path</H2>
        <div className="overflow-hidden rounded-2xl border border-[rgba(20,18,12,0.10)] shadow-[0_18px_44px_-34px_rgba(20,18,12,0.4)]">
          <div className="mb-scroll flex gap-1 overflow-x-auto border-b border-[rgba(20,18,12,0.08)] bg-[#EFE9D5] p-[9px]">
          {qLabels.map((label, i) => (
            <button
              key={label}
              onClick={() => setQtab(i)}
              className={cn('cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 font-sans text-[13.5px]', qtab === i ? 'bg-ink text-white' : 'text-muted hover:bg-white/60')}
            >
              {label}
            </button>
          ))}
        </div>
          <div className="bg-leaf p-3 sm:p-6">
          {qtab === 0 && (
            <Code>
              <Line cmd="cargo install mobench" />
              <Line cmd="cargo install cargo-ndk" />
              <Line cmd="rustup target add aarch64-linux-android" />
            </Code>
          )}
          {qtab === 1 && (
            <Code>
              <Line cmd="cargo mobench init --target android --output bench-config.toml" />
              <div>target = "android"</div>
              <div>function = "my_crate::hash_benchmark"</div>
              <div>iterations = 100</div>
              <div>warmup = 10</div>
            </Code>
          )}
          {qtab === 2 && (
            <Code>
              <div><span className={C.kw}>use</span> mobench_sdk::{'{'}benchmark, black_box{'}'};</div>
              <div>#[benchmark]</div>
              <div>pub fn hash_benchmark() {'{'} black_box(work()); {'}'}</div>
            </Code>
          )}
          {qtab === 3 && (
            <Code>
              <Line cmd='cargo mobench run --target android --function my_crate::hash_benchmark --iterations 100 --warmup 10 --devices "Google Pixel 7-13.0" --release' />
            </Code>
          )}
        </div>
      </div>

      <H2 id="links">API links</H2>
      <Cards>
        <LinkCard title="mobench rustdoc" desc="CLI overview, commands, config module, structs, enums, and programmatic run helpers." href={DOCSRS.mobench} />
        <LinkCard title="mobench-sdk rustdoc" desc="Runtime, builders, modules, feature flags, re-exports, macros, and runner APIs." href={DOCSRS.sdk} />
        <LinkCard title="mobench-macros rustdoc" desc="#[benchmark] usage, setup support, registration behavior, and requirements." href={DOCSRS.macros} />
      </Cards>
    </div>
  )
}

function IntroPage() {
  return (
    <div>
      <H1>Concepts</H1>
      <Lead>mobench is a three-crate ecosystem for running Rust benchmark functions through generated mobile runners.</Lead>

      <H2 id="what" tight>What mobench is</H2>
      <P>
        The <Mono>mobench</Mono> crate is the command-line orchestrator. It builds Rust code for Android or
        iOS, packages generated mobile apps, runs benchmarks locally or on BrowserStack devices, plans supported
        local native profiling captures, and writes benchmark reports.
      </P>
      <P>
        The <Mono>mobench-sdk</Mono> crate is the runtime and build library used by that CLI. It owns the timing
        harness, benchmark registry, runner APIs, codegen, mobile builders, shared types, and FFI helpers.
      </P>
      <P>
        The <Mono>mobench-macros</Mono> crate provides the <Mono>#[benchmark]</Mono> attribute. Most projects
        import it through <Mono>mobench_sdk::benchmark</Mono>.
      </P>

      <H2 id="system">How the system fits</H2>
      <Table
        rows={[
          ['Author', <>Write public Rust functions and mark them with <Mono>#[benchmark]</Mono>.</>],
          ['Register', <>The macro uses inventory registration and a fully-qualified name based on <Mono>module_path!()</Mono>.</>],
          ['Generate', <>The SDK codegen and builders create mobile runners under <Mono>target/mobench/</Mono>.</>],
          ['Package', <>Android output includes APK artifacts; iOS output includes an xcframework, Xcode runner project, and IPA packaging path.</>],
          ['Execute', <>Run locally, run on selected BrowserStack devices, or orchestrate a CI run.</>],
          ['Report', <>Collect per-device outputs and normalized summaries for humans and automation.</>],
        ]}
      />

      <H2 id="flow">Artifact flow</H2>
      <Code className="mb-7">
        <div>Rust crate + #[benchmark]</div>
        <div>  -&gt; mobench-sdk registry and timing harness</div>
        <div>  -&gt; generated Android/iOS runner</div>
        <div>  -&gt; APK / xcframework / IPA</div>
        <div>  -&gt; local device or BrowserStack run</div>
        <div>  -&gt; summary.json / summary.md / results.csv</div>
      </Code>

      <H2 id="ecosystem">Crate ecosystem</H2>
      <InfoCallout>
        The older mobench-runner crate has been consolidated into mobench-sdk as its timing module.
      </InfoCallout>
      <Table
        rows={[
          ['mobench', 'CLI tool for build, run, profile, report, CI, fixtures, BrowserStack, and packaging workflows.'],
          ['mobench-sdk', 'Core SDK with timing, registry, runner, builders, codegen, FFI helpers, macros, and shared types.'],
          ['mobench-macros', 'Procedural macro crate for benchmark registration and setup-aware benchmark wrappers.'],
        ]}
      />
    </div>
  )
}

function InstallPage() {
  return (
    <div>
      <H1>Installation</H1>
      <Lead>Install the CLI and configure the host toolchains for the mobile targets you plan to build.</Lead>

      <H2 id="cli" tight>Install CLI</H2>
      <Code className="mb-7">
        <Line cmd="cargo install mobench" />
      </Code>

      <H2 id="cargo">Cargo setup</H2>
      <P>Add the SDK and inventory to each crate that contains benchmarks. The crate-type entries are required for mobile FFI outputs.</P>
      <Code className="mb-7">
        <div>[dependencies]</div>
        <div>mobench-sdk = "0.1.41"</div>
        <div>inventory = "0.3"</div>
        <div className="mt-3">[lib]</div>
        <div>crate-type = ["cdylib", "staticlib", "lib"]</div>
      </Code>
      <P>If your benchmarks expose custom FFI types, add UniFFI and related build dependencies. For most benchmark-only crates, the SDK built-in types and generated runner are enough.</P>
      <Code className="mb-7">
        <div>[dependencies]</div>
        <div>uniffi = {'{'} version = "0.28", features = ["cli"] {'}'}</div>
        <div>thiserror = "1.0"</div>
        <div>serde = {'{'} version = "1.0", features = ["derive"] {'}'}</div>
        <div className="mt-3">[build-dependencies]</div>
        <div>uniffi = {'{'} version = "0.28", features = ["build"] {'}'}</div>
      </Code>

      <H2 id="android">Android setup</H2>
      <ul className="m-0 mb-[22px] list-disc pl-[22px] text-[17.5px] leading-[1.85] text-ink-soft">
        <li>Install Android NDK.</li>
        <li>Set <Mono>ANDROID_NDK_HOME</Mono>.</li>
        <li>Install <Mono>cargo-ndk</Mono> with <Mono>cargo install cargo-ndk</Mono>.</li>
        <li>Add <Mono>aarch64-linux-android</Mono> with rustup.</li>
        <li>Add optional ABI targets only when you configure them explicitly.</li>
      </ul>

      <H2 id="ios">iOS setup</H2>
      <ul className="m-0 mb-[22px] list-disc pl-[22px] text-[17.5px] leading-[1.85] text-ink-soft">
        <li>Use macOS with Xcode command-line tools.</li>
        <li>Install <Mono>uniffi-bindgen</Mono> when custom UniFFI types are needed.</li>
        <li>Optionally install <Mono>xcodegen</Mono>.</li>
        <li>Add <Mono>aarch64-apple-ios</Mono>, <Mono>aarch64-apple-ios-sim</Mono>, and <Mono>x86_64-apple-ios</Mono>.</li>
      </ul>

      <H2 id="verify">Verify setup</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench doctor" />
        <Line cmd="cargo mobench list" />
        <Line cmd="cargo mobench build --target android --dry-run" />
      </Code>
    </div>
  )
}

function QuickPage() {
  return (
    <div>
      <H1>Quickstart</H1>
      <Lead>Initialize configuration, define one benchmark, build mobile artifacts, and run locally or on BrowserStack.</Lead>

      <H2 id="init" tight>Initialize config</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench init --target android --output bench-config.toml" />
      </Code>

      <H2 id="write">Write a benchmark</H2>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::{'{'}benchmark, black_box{'}'};</div>
        <div />
        <div>#[benchmark]</div>
        <div>pub fn my_expensive_operation() {'{'}</div>
        <div>  let result = expensive_computation();</div>
        <div>  black_box(result);</div>
        <div>{'}'}</div>
      </Code>

      <H2 id="build">Build artifacts</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench build --target android" />
        <Line cmd="cargo mobench build --target ios" />
      </Code>

      <H2 id="local">Run locally</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench run --target android --function my_expensive_operation --local-only" />
      </Code>

      <H2 id="devices">Run on devices</H2>
      <Code className="mb-7">
        <Line cmd='cargo mobench run --target android --function my_expensive_operation --iterations 100 --warmup 10 --devices "Google Pixel 7-13.0" --release' />
      </Code>
    </div>
  )
}

function ConfigurationPage() {
  return (
    <div>
      <H1>Configuration</H1>
      <Lead>mobench accepts command-line arguments and TOML configuration for repeatable local and CI runs.</Lead>

      <H2 id="toml" tight>TOML config</H2>
      <Code className="mb-7">
        <div>target = "android"</div>
        <div>function = "my_crate::my_benchmark"</div>
        <div>iterations = 100</div>
        <div>warmup = 10</div>
      </Code>
      <Table
        rows={[
          ['target', <>Mobile target, usually <Mono>android</Mono> or <Mono>ios</Mono>.</>],
          ['function', 'Benchmark function name, often fully-qualified for unambiguous registry lookup.'],
          ['iterations', 'Measured iterations collected after warmup.'],
          ['warmup', 'Warmup iterations used to stabilize caches and runtime state.'],
        ]}
      />

      <H2 id="browserstack">BrowserStack block</H2>
      <Code className="mb-7">
        <div>[browserstack]</div>
        <div>app_automate_username = "${'{'}BROWSERSTACK_USERNAME{'}'}"</div>
        <div>app_automate_access_key = "${'{'}BROWSERSTACK_ACCESS_KEY{'}'}"</div>
        <div>project = "my-project"</div>
      </Code>

      <H2 id="devices">Device inputs</H2>
      <P>
        Device inputs can come from direct flags such as <Mono>--devices</Mono>, config files, or matrix/profile
        resolution through the <Mono>devices resolve</Mono> command. The public CLI API models those inputs with
        <Mono>DeviceSelection</Mono>.
      </P>
      <Code className="mb-7">
        <Line cmd='cargo mobench run --target android --function my_benchmark --devices "Google Pixel 7-13.0"' />
        <Line cmd="cargo mobench devices resolve" />
      </Code>

      <H2 id="validation">Validation</H2>
      <P>Use validation before CI jobs spend time building or uploading mobile artifacts.</P>
      <Code className="mb-7">
        <Line cmd="cargo mobench config validate" />
        <Line cmd="cargo mobench doctor" />
      </Code>
    </div>
  )
}

function BenchmarkPage() {
  return (
    <div>
      <H1>Writing benchmarks</H1>
      <Lead>Benchmarks are public Rust functions registered by the <Mono>#[benchmark]</Mono> attribute for mobile execution.</Lead>

      <H2 id="basic" tight>Basic shape</H2>
      <P>Simple benchmarks take no parameters, return <Mono>()</Mono>, and should not panic during normal execution.</P>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::{'{'}benchmark, black_box{'}'};</div>
        <div />
        <div>#[benchmark]</div>
        <div>pub fn sum_vector() {'{'}</div>
        <div>  let data = vec![1, 2, 3, 4, 5];</div>
        <div>  let sum: i32 = data.iter().sum();</div>
        <div>  black_box(sum);</div>
        <div>{'}'}</div>
      </Code>

      <H2 id="setup">Setup functions</H2>
      <P>Use setup when input construction is expensive and should not be included in the measured section.</P>
      <Code className="mb-7">
        <div>fn setup_data() -&gt; Vec&lt;u8&gt; {'{'}</div>
        <div>  vec![0u8; 1_000_000]</div>
        <div>{'}'}</div>
        <div />
        <div>#[benchmark(setup = setup_data)]</div>
        <div>pub fn hash_benchmark(data: &amp;Vec&lt;u8&gt;) {'{'}</div>
        <div>  black_box(compute_hash(data));</div>
        <div>{'}'}</div>
      </Code>

      <H2 id="macro">Macro behavior</H2>
      <Table
        rows={[
          ['Preserves function', 'The original Rust function remains callable as normal.'],
          ['Registers inventory', 'A static registration is submitted so SDK discovery can find the benchmark at runtime.'],
          ['Names benchmark', <>The macro captures a fully-qualified name with <Mono>module_path!()</Mono>.</>],
          ['Handles setup', 'Setup/teardown-style wrappers keep expensive setup outside the measured section when configured.'],
        ]}
      />

      <H2 id="discovery">Discovery</H2>
      <P>Use registry helpers when functions are not showing up.</P>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::{'{'}discover_benchmarks, list_benchmark_names{'}'};</div>
        <div />
        <div>for name in list_benchmark_names() {'{'} println!("{'{}'}", name); {'}'}</div>
        <div>for bench in discover_benchmarks() {'{'} println!("{'{}'}", bench.name); {'}'}</div>
      </Code>

      <H2 id="best">Best practices</H2>
      <ul className="m-0 mb-[22px] list-disc pl-[22px] text-[17.5px] leading-[1.85] text-ink-soft">
        <li>Wrap computed results with <Mono>black_box</Mono> to prevent compiler elimination.</li>
        <li>Keep measured code deterministic and avoid file I/O in the hot path.</li>
        <li>Use setup functions for expensive input creation.</li>
        <li>Start with 5-10 warmup iterations and 50-100 measured iterations.</li>
        <li>Expect more variance on mobile devices than desktop machines.</li>
      </ul>
    </div>
  )
}

function SdkPage() {
  return (
    <div>
      <H1>SDK reference</H1>
      <Lead>mobench-sdk provides the runtime, builders, generated mobile runners, and shared types used by the CLI.</Lead>

      <H2 id="architecture" tight>Architecture</H2>
      <Table
        rows={[
          ['timing', 'Core timing infrastructure and lightweight mobile benchmark harness.'],
          ['registry', 'Runtime discovery for #[benchmark] functions, behind registry or full features.'],
          ['runner', 'Benchmark execution engine with BenchmarkBuilder, BenchSpec, and run_benchmark.'],
          ['builders', 'Android and iOS build automation. Enables codegen.'],
          ['codegen', 'Project and mobile app template generation.'],
          ['types', 'Common config, report, sample, build, target, FFI, and error types.'],
          ['ffi', 'Unified UniFFI integration helpers.'],
          ['native_c_abi', 'Native JSON C ABI for benchmark runners.'],
        ]}
      />

      <H2 id="features">Feature flags</H2>
      <Table
        rows={[
          ['full', 'Default. Full SDK with build automation, templates, registry, and normal integration surface.'],
          ['registry', 'Benchmark macro, inventory registry, and runtime execution without build tooling.'],
          ['builders', 'Android/iOS build automation; enables codegen.'],
          ['codegen', 'Project and mobile app template generation.'],
          ['runner-only', 'Minimal timing-only mode for mobile binaries where size matters.'],
        ]}
      />
      <Code className="mb-7">
        <div>[dependencies]</div>
        <div>mobench-sdk = {'{'} version = "0.1.41", default-features = false, features = ["runner-only"] {'}'}</div>
      </Code>

      <H2 id="runner">Runner APIs</H2>
      <P>Use <Mono>BenchmarkBuilder</Mono> for fluent execution or <Mono>BenchSpec</Mono> with <Mono>run_benchmark</Mono> for explicit specs.</P>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::BenchmarkBuilder;</div>
        <div />
        <div>let report = BenchmarkBuilder::new("my_benchmark")</div>
        <div>  .iterations(100)</div>
        <div>  .warmup(10)</div>
        <div>  .run()?;</div>
        <div>println!("Mean: {'{}'} ns", report.mean_ns());</div>
      </Code>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::{'{'}BenchSpec, run_benchmark{'}'};</div>
        <div />
        <div>let spec = BenchSpec::new("my_benchmark", 50, 5)?;</div>
        <div>let report = run_benchmark(spec)?;</div>
        <div>println!("Collected {'{}'} samples", report.samples.len());</div>
      </Code>

      <H2 id="builders">Builders</H2>
      <P>Use builders when you want to drive mobile app creation from Rust instead of shelling out through the CLI.</P>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::builders::AndroidBuilder;</div>
        <div><span className={C.kw}>use</span> mobench_sdk::{'{'}BuildConfig, BuildProfile, Target{'}'};</div>
        <div />
        <div>let builder = AndroidBuilder::new(".", "my-bench-crate")</div>
        <div>  .verbose(true)</div>
        <div>  .output_dir("target/mobench");</div>
        <div />
        <div>let config = BuildConfig {'{'} target: Target::Android, profile: BuildProfile::Release, incremental: true {'}'};</div>
        <div>let result = builder.build(&amp;config)?;</div>
      </Code>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::builders::{'{'}IosBuilder, SigningMethod{'}'};</div>
        <div />
        <div>let builder = IosBuilder::new(".", "my-bench-crate").verbose(true);</div>
        <div>let result = builder.build(&amp;config)?;</div>
        <div>let ipa = builder.package_ipa("BenchRunner", SigningMethod::AdHoc)?;</div>
      </Code>

      <H2 id="exports">Re-exports</H2>
      <P>The SDK re-exports the common surface most users need:</P>
      <Table
        rows={[
          ['Macros', <><Mono>benchmark</Mono>, <Mono>debug_benchmarks!</Mono>, <Mono>export_native_c_abi!</Mono></>],
          ['Runner', <><Mono>BenchmarkBuilder</Mono>, <Mono>BenchSpec</Mono>, <Mono>run_benchmark</Mono></>],
          ['Discovery', <><Mono>discover_benchmarks</Mono>, <Mono>find_benchmark</Mono>, <Mono>list_benchmark_names</Mono></>],
          ['Types', <><Mono>BenchError</Mono>, <Mono>BenchSample</Mono>, <Mono>RunnerReport</Mono>, <Mono>BuildConfig</Mono>, <Mono>BuildProfile</Mono>, <Mono>BuildResult</Mono>, <Mono>Target</Mono></>],
          ['Timing', <><Mono>BenchSummary</Mono>, <Mono>SemanticPhase</Mono>, <Mono>TimingError</Mono>, <Mono>profile_phase</Mono>, <Mono>run_closure</Mono></>],
        ]}
      />
    </div>
  )
}

function CliPage() {
  return (
    <div>
      <H1>CLI reference</H1>
      <Lead>The mobench CLI is the command surface for project setup, builds, device runs, CI, fixtures, reports, and packaging.</Lead>

      <H2 id="commands" tight>Commands</H2>
      <Table
        rows={[
          ['init', 'Initialize a benchmark project.'],
          ['build', 'Build mobile artifacts such as Android APKs and iOS xcframework outputs.'],
          ['run', 'Execute benchmarks locally or on selected devices.'],
          ['ci run', 'Run standardized CI orchestration and write summary.json, summary.md, and results.csv.'],
          ['doctor', 'Validate local and CI prerequisites.'],
          ['config validate', 'Validate run configuration and matrix contracts.'],
          ['devices resolve', 'Resolve deterministic device sets from matrix or profile inputs.'],
          ['fixture ...', 'Manage fixture init, build, verify, and cache-key lifecycle helpers.'],
          ['report ...', 'Render markdown and publish sticky PR comments.'],
          ['list', 'List discovered benchmark functions.'],
          ['fetch', 'Retrieve BrowserStack results.'],
          ['package-ipa', 'Package an iOS app as IPA.'],
          ['package-xcuitest', 'Package an XCUITest runner.'],
        ]}
      />

      <H2 id="run">Run command</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench run --target android --function my_benchmark --local-only" />
        <Line cmd='cargo mobench run --target android --function my_benchmark --iterations 100 --warmup 10 --devices "Google Pixel 7-13.0" --release' />
      </Code>

      <H2 id="build">Build command</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench build --target android" />
        <Line cmd="cargo mobench build --target ios" />
        <Line cmd="cargo mobench build --target android --output-dir target/mobench" />
      </Code>

      <H2 id="fixtures">Fixture helpers</H2>
      <P>Fixture helpers are intended for repeatable CI/devex flows: initialize a fixture, build it, verify it, and derive cache keys.</P>
      <Code className="mb-7">
        <Line cmd="cargo mobench fixture init" />
        <Line cmd="cargo mobench fixture build" />
        <Line cmd="cargo mobench fixture verify" />
        <Line cmd="cargo mobench fixture cache-key" />
      </Code>

      <H2 id="global">Global flags</H2>
      <P>Use <Mono>--dry-run</Mono> to preview work without changing artifacts, and <Mono>--verbose</Mono> or <Mono>-v</Mono> to print detailed command output.</P>
    </div>
  )
}

function BrowserStackPage() {
  return (
    <div>
      <H1>BrowserStack</H1>
      <Lead>mobench integrates with BrowserStack App Automate for Android benchmark runs on real devices.</Lead>

      <H2 id="credentials" tight>Credentials</H2>
      <P>Set credentials through environment variables or the BrowserStack config block.</P>
      <Code className="mb-7">
        <Line cmd='export BROWSERSTACK_USERNAME="your_username"' />
        <Line cmd='export BROWSERSTACK_ACCESS_KEY="your_access_key"' />
      </Code>
      <Code className="mb-7">
        <div>[browserstack]</div>
        <div>app_automate_username = "${'{'}BROWSERSTACK_USERNAME{'}'}"</div>
        <div>app_automate_access_key = "${'{'}BROWSERSTACK_ACCESS_KEY{'}'}"</div>
        <div>project = "my-project"</div>
      </Code>

      <H2 id="names">Device names</H2>
      <P>Pass BrowserStack device names directly for ad hoc runs, or resolve deterministic sets through matrix/profile tooling.</P>
      <Code className="mb-7">
        <Line cmd='cargo mobench run --target android --function my_benchmark --devices "Google Pixel 7-13.0" --release' />
        <Line cmd="cargo mobench devices resolve" />
      </Code>

      <H2 id="release">Release uploads</H2>
      <P>Use <Mono>--release</Mono> for smaller APK uploads when sending Android builds to BrowserStack.</P>

      <H2 id="fetch">Fetching results</H2>
      <P>Use <Mono>fetch</Mono> when you need to retrieve BrowserStack results after a run or from a follow-up automation.</P>
      <Code className="mb-7">
        <Line cmd="cargo mobench fetch" />
      </Code>
    </div>
  )
}

function CiPage() {
  return (
    <div>
      <H1>CI workflows</H1>
      <Lead>CI mode standardizes output files and report generation so benchmark results can be attached to pull requests.</Lead>

      <H2 id="command" tight>CI command</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench ci run" />
        <div className={C.out}>summary.json</div>
        <div className={C.out}>summary.md</div>
        <div className={C.out}>results.csv</div>
      </Code>

      <H2 id="matrix">Matrix validation</H2>
      <P>Validate run config and matrix contracts before scheduling expensive build or device work.</P>
      <Code className="mb-7">
        <Line cmd="cargo mobench config validate" />
      </Code>

      <H2 id="resolution">Device resolution</H2>
      <P>Resolve devices from profiles or matrices into deterministic sets so CI runs are reproducible.</P>
      <Code className="mb-7">
        <Line cmd="cargo mobench devices resolve" />
      </Code>

      <H2 id="sticky">Sticky reports</H2>
      <P>The report command renders markdown and can publish sticky pull-request comments for benchmark summaries.</P>
      <Code className="mb-7">
        <Line cmd="cargo mobench report" />
      </Code>
    </div>
  )
}

function ProfilingPage() {
  return (
    <div>
      <H1>Profiling</H1>
      <Lead>mobench can plan and execute supported local native profiling captures alongside benchmark runs.</Lead>

      <H2 id="what" tight>What profiling does</H2>
      <P>Profiling is separate from ordinary benchmark reporting. It is used when you need local native capture data to understand where time is going.</P>

      <H2 id="local">Local native capture</H2>
      <Code className="mb-7">
        <Line cmd="cargo mobench profile run --target android --provider local --backend android-native --function my_expensive_operation" />
      </Code>

      <H2 id="phases">Timeline phases</H2>
      <P>The SDK exposes timing helpers such as <Mono>profile_phase</Mono> and semantic phase types for code that needs structured timing spans.</P>
      <Code className="mb-7">
        <div><span className={C.kw}>use</span> mobench_sdk::{'{'}profile_phase, SemanticPhase{'}'};</div>
      </Code>
    </div>
  )
}

function ReportsPage() {
  return (
    <div>
      <H1>Outputs & reports</H1>
      <Lead>mobench keeps generated files in Rust-friendly output directories and normalizes reports for automation.</Lead>

      <H2 id="directory" tight>Output directory</H2>
      <Code className="mb-7">
        <div>target/mobench/</div>
        <div>  android/</div>
        <div>    app/src/main/jniLibs/</div>
        <div>    app/build/outputs/apk/</div>
        <div>  ios/</div>
        <div>    sample_fns.xcframework/</div>
        <div>    BenchRunner/</div>
        <div>    BenchRunner.ipa</div>
      </Code>
      <P>Use <Mono>--output-dir</Mono> when you need a different artifact root.</P>

      <H2 id="run">Run outputs</H2>
      <Table
        rows={[
          ['summary.json', 'Machine-readable run summary for automation.'],
          ['summary.md', 'Human-readable markdown summary for pull requests or logs.'],
          ['results.csv', 'Tabular benchmark samples/results for analysis.'],
        ]}
      />

      <H2 id="types">Programmatic types</H2>
      <Table
        rows={[
          ['Report', 'Standardized output file locations produced by a run.'],
          ['RunRequest', 'Programmatic request payload for running a mobench benchmark flow.'],
          ['RunResult', 'Result returned by a programmatic mobench run request.'],
          ['ExtractedBenchmarkResult', 'Unified result extracted from per-device benchmark outputs.'],
          ['DeviceSelection', 'Device input sources used by RunRequest.'],
          ['MobileTarget', 'Mobile platform target for build/run operations.'],
        ]}
      />

      <H2 id="summary">Summary extraction</H2>
      <P>The CLI exposes helpers such as <Mono>extract_benchmark_summary</Mono> and <Mono>run_request</Mono> for normalized programmatic workflows.</P>
    </div>
  )
}

function PackagesPage() {
  return (
    <div>
      <H1>Packages & API</H1>
      <Lead>The site is a practical guide. Exact structs, methods, feature gates, and item-level docs live on docs.rs.</Lead>

      <H2 id="mobench" tight>mobench</H2>
      <P>The CLI crate for build, run, profile, report, BrowserStack, config validation, fixtures, packaging, and programmatic run request helpers.</P>
      <LinkCard title="mobench on docs.rs" desc="CLI overview, commands, modules, structs, enums, and functions." href={DOCSRS.mobench} />

      <H2 id="sdk">mobench-sdk</H2>
      <P>The runtime crate with timing, registry, runner, builders, codegen, FFI helpers, common types, macros, and re-exports.</P>
      <LinkCard title="mobench-sdk on docs.rs" desc="SDK architecture, feature flags, builders, runner APIs, modules, macros, and types." href={DOCSRS.sdk} />

      <H2 id="macros">mobench-macros</H2>
      <P>The procedural macro crate for <Mono>#[benchmark]</Mono>. Most users import the macro from <Mono>mobench_sdk</Mono>.</P>
      <LinkCard title="mobench-macros on docs.rs" desc="Attribute macro usage, setup support, registration behavior, and requirements." href={DOCSRS.macros} />

      <H2 id="docsrs">docs.rs</H2>
      <InfoCallout>
        When this site and docs.rs disagree, prefer docs.rs for exact generated API details and prefer this site for workflow-level guidance.
      </InfoCallout>
    </div>
  )
}

function TroubleshootingPage() {
  return (
    <div>
      <H1>Troubleshooting</H1>
      <Lead>Most failures fall into four buckets: discovery, build toolchains, BrowserStack setup, or noisy benchmark design.</Lead>

      <H2 id="missing" tight>Benchmarks missing</H2>
      <ul className="m-0 mb-[22px] list-disc pl-[22px] text-[17.5px] leading-[1.85] text-ink-soft">
        <li>Ensure the function is annotated with <Mono>#[benchmark]</Mono>.</li>
        <li>Ensure the function is public.</li>
        <li>Simple benchmarks must take no parameters and return <Mono>()</Mono>.</li>
        <li>Setup benchmarks must take exactly one reference to the setup value and return <Mono>()</Mono>.</li>
        <li>Use <Mono>debug_benchmarks!</Mono>, <Mono>list_benchmark_names</Mono>, or <Mono>discover_benchmarks</Mono> to inspect registration.</li>
      </ul>

      <H2 id="build">Build failures</H2>
      <Table
        rows={[
          ['Android NDK', <>Check <Mono>ANDROID_NDK_HOME</Mono> and <Mono>cargo-ndk</Mono>.</>],
          ['Rust targets', 'Add the required Android or iOS targets with rustup.'],
          ['Crate type', <>Ensure <Mono>crate-type = ["cdylib", "staticlib", "lib"]</Mono> is present.</>],
          ['iOS host', 'Use macOS with Xcode command-line tools for iOS builds.'],
        ]}
      />

      <H2 id="browserstack">BrowserStack failures</H2>
      <P>Check credentials, device names, project configuration, and whether you used <Mono>--release</Mono> for smaller Android uploads.</P>
      <Code className="mb-7">
        <Line cmd='export BROWSERSTACK_USERNAME="your_username"' />
        <Line cmd='export BROWSERSTACK_ACCESS_KEY="your_access_key"' />
        <Line cmd="cargo mobench doctor" />
      </Code>

      <H2 id="noise">Noisy results</H2>
      <ul className="m-0 mb-[22px] list-disc pl-[22px] text-[17.5px] leading-[1.85] text-ink-soft">
        <li>Increase measured iterations toward 50-100.</li>
        <li>Use 5-10 warmup iterations.</li>
        <li>Remove file I/O, network access, random sleeps, and other side effects from measured code.</li>
        <li>Use setup functions for data construction.</li>
        <li>Expect lower-end phones to show higher variance because of thermal and scheduler behavior.</li>
      </ul>
    </div>
  )
}

function Line({ cmd }: { cmd: string }) {
  return (
    <div>
      <span className={C.dollar}>$</span> <span className={C.cmd}>{cmd}</span>
    </div>
  )
}
