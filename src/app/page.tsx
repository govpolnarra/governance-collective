import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Nav */}
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

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
          Phase 1 — Invite Only
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-6 leading-tight">
          Practitioner-led knowledge
          <span className="text-brand-600"> for governance</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          A curated platform where field practitioners document what they know,
          find validated solutions, and connect with those working on the same problems.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary px-6 py-3 text-base">
            Enter Platform
          </Link>
        </div>
      </section>

      {/* Four Mandates */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-ink mb-12">What Governance Collective does</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '📚', title: 'Field Knowledge', desc: 'Structured playbooks from practitioners — what worked, what failed, and under what conditions.' },
            { icon: '✅', title: 'Validated Solutions', desc: 'Curated solution profiles for NGOs, social enterprises, and for-profit models with evidence.' },
            { icon: '🔗', title: 'Networking', desc: 'Requests board, practitioner directory, and district-to-solution matching.' },
            { icon: '🏛️', title: 'Policy Interface', desc: 'Action research, convenings, and training on working with government.' },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20 py-8 text-center text-sm text-slate-500">
        <p>Governance Collective &copy; 2026 &mdash; Invite-only, Bihar Phase 1</p>
      </footer>
    </main>
  );
}
