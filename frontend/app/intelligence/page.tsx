'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { intelApi, CompanyIntelligence, IntelDashboard, ExecutiveProfile } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function statusColor(status: string) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.default;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

function DashPanel({ title, icon, items }: { title: string; icon: string; items?: unknown[] }) {
  return (
    <div className="bg-slate-700/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="text-white text-xs font-semibold">{title}</h3>
      </div>
      {!items || items.length === 0 ? (
        <p className="text-slate-500 text-xs">No data</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((item, i) => (
            <li key={i} className="text-slate-300 text-xs">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function IntelligencePage() {
  const [records, setRecords] = useState<CompanyIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompanyIntelligence | null>(null);
  const [dashboard, setDashboard] = useState<IntelDashboard | null>(null);
  const [website, setWebsite] = useState('');
  const [accountId, setAccountId] = useState('');
  const [researching, setResearching] = useState(false);
  const [researchError, setResearchError] = useState('');
  const [researchSuccess, setResearchSuccess] = useState('');
  const [generatingBlog, setGeneratingBlog] = useState(false);

  useEffect(() => {
    async function load() {
      const [recs, dash] = await Promise.all([
        intelApi.listCompanyIntelligence().catch(() => [] as CompanyIntelligence[]),
        intelApi.getIntelDashboard().catch(() => null),
      ]);
      setRecords(recs);
      setDashboard(dash);
      setLoading(false);
    }
    load();
  }, []);

  async function handleResearch(e: React.FormEvent) {
    e.preventDefault();
    setResearching(true);
    setResearchError('');
    setResearchSuccess('');
    try {
      const data: { website: string; account_id?: number } = { website };
      if (accountId) data.account_id = parseInt(accountId, 10);
      const rec = await intelApi.researchCompany(data);
      setRecords((prev) => [rec, ...prev]);
      setResearchSuccess(`Research started for ${website}`);
      setWebsite('');
      setAccountId('');
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setResearching(false);
    }
  }

  async function handleGenerateBlog() {
    if (!selected) return;
    setGeneratingBlog(true);
    try {
      await intelApi.generateBlog(selected.id);
    } finally {
      setGeneratingBlog(false);
    }
  }

  return (
    <>
      <Header title="Strategic Intelligence Engine" />
      <div className="p-6 space-y-6">
        <p className="text-slate-400 text-sm">Public data research · Compliance guardrails enforced</p>

        {/* Research form */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Research Company</h2>
          <form onSubmit={handleResearch} className="flex flex-wrap gap-3 items-end">
            <input
              required
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="flex-1 min-w-48 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Account ID (optional)"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-48 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={researching}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {researching ? 'Researching…' : 'Run Research'}
            </button>
          </form>
          {researchError && <p className="text-red-400 text-sm mt-2">{researchError}</p>}
          {researchSuccess && <p className="text-green-400 text-sm mt-2">{researchSuccess}</p>}
        </div>

        {/* Records + Detail split */}
        <div className="flex gap-6">
          {/* Intelligence records list */}
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden min-w-0">
            <div className="px-5 py-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">Intelligence Records</h2>
            </div>
            {loading ? (
              <div className="space-y-2 p-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-400">No research records yet. Enter a company website above.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-700/50">
                {records.map((rec) => (
                  <li key={rec.id}>
                    <button
                      onClick={() => setSelected(selected?.id === rec.id ? null : rec)}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-700/50 transition-colors ${
                        selected?.id === rec.id ? 'bg-slate-700/70' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {rec.company_name ?? rec.website}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5 truncate">{rec.website}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor(rec.status)}`}>
                            {rec.status}
                          </span>
                          {rec.created_at && (
                            <span className="text-slate-500 text-xs hidden md:block">
                              {new Date(rec.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {selected?.id === rec.id && (
                        <div className="flex gap-4 mt-2 text-xs text-slate-400">
                          <span>{rec.expansion_signals?.length ?? 0} expansion signals</span>
                          <span>{rec.executive_profiles?.length ?? 0} executive profiles</span>
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-96 xl:w-[480px] bg-slate-800 border border-slate-700 rounded-xl overflow-auto p-5 flex-shrink-0 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg truncate">
                  {selected.company_name ?? selected.website}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white ml-2 flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {selected.business_model && (
                <Section title="Business Model">
                  <p className="text-slate-300 text-sm">{selected.business_model}</p>
                </Section>
              )}

              {selected.locations && selected.locations.length > 0 && (
                <Section title="Locations">
                  <ul className="space-y-1">
                    {selected.locations.map((l, i) => (
                      <li key={i} className="text-slate-300 text-sm">• {l}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {selected.expansion_signals && selected.expansion_signals.length > 0 && (
                <Section title="Expansion Signals">
                  <ul className="space-y-1">
                    {selected.expansion_signals.map((s, i) => (
                      <li key={i} className="text-green-400 text-sm">▸ {s}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {selected.technology_growth_indicators && selected.technology_growth_indicators.length > 0 && (
                <Section title="Technology Growth Indicators">
                  <ul className="space-y-1">
                    {selected.technology_growth_indicators.map((t, i) => (
                      <li key={i} className="text-blue-400 text-sm">▸ {t}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {selected.financial_health_summary && (
                <Section title="Financial Health Summary">
                  <p className="text-slate-300 text-sm">{selected.financial_health_summary}</p>
                </Section>
              )}

              {selected.competitor_mentions && selected.competitor_mentions.length > 0 && (
                <Section title="Competitor Mentions">
                  <ul className="space-y-1">
                    {selected.competitor_mentions.map((c, i) => (
                      <li key={i} className="text-slate-300 text-sm">• {c}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {selected.strategic_risk_factors && selected.strategic_risk_factors.length > 0 && (
                <Section title="Strategic Risk Factors">
                  <ul className="space-y-1">
                    {selected.strategic_risk_factors.map((r, i) => (
                      <li key={i} className="text-red-400 text-sm">⚠ {r}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {selected.potential_bid_opportunities && selected.potential_bid_opportunities.length > 0 && (
                <Section title="Potential Bid Opportunities">
                  <ul className="space-y-1">
                    {selected.potential_bid_opportunities.map((o, i) => (
                      <li key={i} className="text-yellow-400 text-sm">★ {o}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {selected.executive_profiles && selected.executive_profiles.length > 0 && (
                <Section title="Executive Profiles">
                  <div className="space-y-3">
                    {selected.executive_profiles.map((exec: ExecutiveProfile, i) => (
                      <div key={i} className="bg-slate-700/50 rounded-lg px-3 py-3">
                        <p className="text-white text-sm font-medium">{exec.name}</p>
                        <p className="text-slate-400 text-xs">{exec.role}</p>
                        {exec.communication_style && (
                          <p className="text-slate-300 text-xs mt-1">Style: {exec.communication_style}</p>
                        )}
                        {exec.conversation_angles && exec.conversation_angles.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {exec.conversation_angles.map((a, j) => (
                              <li key={j} className="text-blue-400 text-xs">→ {a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {selected.status === 'completed' && (
                <button
                  onClick={handleGenerateBlog}
                  disabled={generatingBlog}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {generatingBlog ? 'Generating…' : '✍ Generate Blog Post'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Feed */}
        {dashboard && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Intelligence Dashboard Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <DashPanel title="Expansion Signals" icon="📈" items={dashboard.expansion_signals} />
              <DashPanel title="Earnings Insights" icon="💰" items={dashboard.earnings_insights} />
              <DashPanel title="Competitive Activity" icon="⚔️" items={dashboard.competitive_activity} />
              <DashPanel title="Executive Activity" icon="👤" items={dashboard.executive_activity} />
              <DashPanel title="AI Investment Indicators" icon="🤖" items={dashboard.ai_investment_indicators} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
