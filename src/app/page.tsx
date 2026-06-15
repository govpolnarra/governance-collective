import Link from 'next/link';

export default function LandingPage() {
  const pillars = [
    { title: 'Field Knowledge', desc: 'Evidence-labelled playbooks that explain the problem, what was tried, what failed, and where it may transfer.' },
    { title: 'Validated Solutions', desc: 'Curated solution profiles with adoption conditions, government interface, risks, and endorsements.' },
    { title: 'District Canvas', desc: 'A continuity layer for active problems, action labs, decisions, actors, bottlenecks, and handover notes.' },
    { title: 'Learning / GovCap', desc: 'Practical learning resources for people inside and outside government, derived from field evidence.' },
  ]

  return (
    <main className="min-h-screen bg-surface text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <span className="font-semibold text-ink">Governance Collective</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm">Sign in</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
          Phase 1 · Invite-only · Human curated
        </div>
        <h1 className="max-w-4xl text-4xl sm:text-6xl font-bold text-ink mb-6 leading-tight">
          A curated source-of-truth for governance problem-solving.
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-3xl">
          Governance Collective helps fellows, officers, practitioners, mentors, and solution providers discover field-tested knowledge, validate solution fit, maintain district continuity, and learn from real Action Labs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/login" className="btn-primary px-6 py-3 text-base">
            Sign in / Request access
          </Link>
          <span className="inline-flex items-center text-sm text-slate-500">Not an open directory. No self-publishing without review.</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-ink mb-8">What the Collective holds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item) => (
            <div key={item.title} className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold mb-2">Curation over volume</p>
            <p className="text-sm text-slate-600">The platform earns trust through review, evidence labels, and context notes, not by collecting every possible listing.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold mb-2">Diagnosis before solutions</p>
            <p className="text-sm text-slate-600">Requests and Action Labs start from a clear problem before solution providers become relevant.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold mb-2">Layered access</p>
            <p className="text-sm text-slate-600">Public summaries, registered libraries, trusted district workspaces, and curator-only raw notes remain separate.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 mt-20 py-8 text-center text-sm text-slate-500">
        <p>Governance Collective &copy; 2026 · Invite-only, Bihar Phase 1</p>
      </footer>
    </main>
  );
}
