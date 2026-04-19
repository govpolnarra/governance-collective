import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/playbooks', label: 'Playbooks', icon: '📚' },
  { href: '/solutions', label: 'Solutions', icon: '✅' },
  { href: '/requests', label: 'Requests', icon: '📌' },
  { href: '/learning', label: 'Learning', icon: '🎓' },
];

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user!.id)
    .single();
  const isCurator = profile?.role === 'curator' || profile?.role === 'admin';
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Governance Collective</p>
              <p className="text-xs text-slate-500">Phase 1</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          {isCurator && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Curator</p>
              </div>
              <Link
                href="/curator/queue"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span>📝</span>
                <span>Curation Queue</span>
              </Link>
            </>
          )}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-medium text-xs">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role ?? 'contributor'}</p>
            </div>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
