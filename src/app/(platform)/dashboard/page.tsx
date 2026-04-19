import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('full_name, role, fellowship, organisation').eq('id', user!.id).single();
  const { count: playbookCount } = await supabase.from('playbooks').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: solutionCount } = await supabase.from('solution_profiles').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: requestCount } = await supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'open');
  const isCurator = ['curator','admin'].includes(profile?.role ?? '');
  let queueCount = 0;
  if (isCurator) {
    const { count } = await supabase.from('curation_queue').select('*', { count: 'exact', head: true }).is('decision', null);
    queueCount = count ?? 0;
  }
  const stats = [
    { label: 'Published Playbooks', value: playbookCount ?? 0, href: '/playbooks', icon: 'BOOK', color: 'bg-brand-50 text-brand-700' },
    { label: 'Validated Solutions', value: solutionCount ?? 0, href: '/solutions', icon: 'CHECK', color: 'bg-blue-50 text-blue-700' },
    { label: 'Open Requests', value: requestCount ?? 0, href: '/requests', icon: 'PIN', color: 'bg-amber-50 text-amber-700' },
    ...(isCurator ? [{ label: 'Pending Review', value: queueCount, href: '/curator/queue', icon: 'QUEUE', color: 'bg-purple-50 text-purple-700' }] : []),
  ];
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}</h1>
        <p className="text-slate-500 mt-1 text-sm capitalize">{profile?.role} {profile?.fellowship ? '· ' + profile.fellowship : ''}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href} className="card p-5 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-ink mt-2">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/playbooks/submit" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-ink">Submit a Playbook</h3>
          <p className="text-sm text-slate-500 mt-1">Document field knowledge from your work</p>
        </Link>
        <Link href="/solutions/submit" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-ink">Add a Solution</h3>
          <p className="text-sm text-slate-500 mt-1">List your validated solution or programme</p>
        </Link>
        <Link href="/requests" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-ink">Post a Request</h3>
          <p className="text-sm text-slate-500 mt-1">Ask the community for help or an intro</p>
        </Link>
        <Link href="/learning" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-ink">Browse Learning</h3>
          <p className="text-sm text-slate-500 mt-1">Capsules on working with government</p>
        </Link>
      </div>
    </div>
  );
}
