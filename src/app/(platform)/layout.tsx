import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import { BookOpen, ClipboardCheck, Compass, FlaskConical, GraduationCap, Home, Landmark, Lightbulb, Search, Send, Settings, ShieldCheck, Users } from 'lucide-react';
import { isAdminRole, isCuratorRole, roleLabel } from '@/lib/access';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/districts', label: 'Districts', icon: Landmark },
  { href: '/action-labs', label: 'Action Labs', icon: FlaskConical },
  { href: '/playbooks', label: 'Playbooks', icon: BookOpen },
  { href: '/solutions', label: 'Solutions', icon: ShieldCheck },
  { href: '/requests', label: 'Requests', icon: ClipboardCheck },
  { href: '/people', label: 'People', icon: Users },
  { href: '/learning', label: 'Learning / GovCap', icon: GraduationCap },
  { href: '/solution-studio', label: 'Solution Studio', icon: Lightbulb },
  { href: '/my-submissions', label: 'My Submissions', icon: Send },
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
    .select('full_name, role, access_tier')
    .eq('id', user!.id)
    .single();

  const isCurator = isCuratorRole(profile?.role);
  const isAdmin = isAdminRole(profile?.role);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 bg-white border-r border-slate-200 flex-col fixed h-full hidden lg:flex">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Governance Collective</p>
              <p className="text-xs text-slate-400">Phase 1</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}

          {isCurator && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Curator</p>
              </div>
              <Link
                href="/curation"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Curation Studio</span>
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase px-3">Admin</p>
              </div>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span>User Approvals</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 w-full hover:bg-slate-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-slate-400 capitalize">{roleLabel(profile?.role)}</p>
            </div>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-slate-900">Governance Collective</Link>
        <Link href="/discover" className="btn-secondary px-3 py-1.5">Discover</Link>
      </div>

      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
