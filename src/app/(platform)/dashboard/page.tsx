import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('full_name, role, organisation').eq('id', user!.id).single();
  const { count: playbookCount } = await supabase.from('playbooks').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: solutionCount } = await supabase.from('solution_profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: requestCount } = await supabase.from('requests').select('*', { count: 'exact', head: true });
  const isCurator = ['curator','admin'].includes(profile?.role ?? '');
  let queueCount = 0;
  if (isCurator) {
    const { count } = await supabase.from('curation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    queueCount = count ?? 0;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening in the Governance Collective.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Playbooks</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{playbookCount ?? 0}</p>
          <Link href="/playbooks" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Browse all →</Link>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Solutions</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{solutionCount ?? 0}</p>
          <Link href="/solutions" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Browse all →</Link>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Open Requests</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{requestCount ?? 0}</p>
          <Link href="/requests" className="text-xs text-blue-600 hover:underline mt-1 inline-block">View all →</Link>
        </div>
      </div>

      {isCurator && queueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="font-medium text-amber-900">📝 {queueCount} item{queueCount !== 1 ? 's' : ''} awaiting curation</p>
          <Link href="/curator/queue" className="text-sm text-amber-700 hover:underline mt-1 inline-block">Go to curation queue →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/playbooks/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
              <span>📚</span> Submit a Playbook
            </Link>
            <Link href="/solutions/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
              <span>✅</span> List a Solution
            </Link>
            <Link href="/requests" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
              <span>📌</span> Post a Request
            </Link>
            <Link href="/learning/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
              <span>🎓</span> Share a Learning
            </Link>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">Your Profile</h2>
          <div className="space-y-1">
            <p className="text-sm text-slate-600"><span className="font-medium">Name:</span> {profile?.full_name ?? 'Not set'}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Role:</span> {profile?.role ?? 'contributor'}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Org:</span> {profile?.organisation ?? 'Not set'}</p>
          </div>
          <Link href="/profile" className="text-xs text-blue-600 hover:underline mt-3 inline-block">Edit profile →</Link>
        </div>
      </div>
    </div>
  );
}
