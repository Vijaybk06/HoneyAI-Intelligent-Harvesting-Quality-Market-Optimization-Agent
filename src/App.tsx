import { FormEvent, useMemo, useState } from "react";
import {
  analyzeHoneyRelevance,
  buildFocusPoints,
  defaultPaperShelf,
  executeHoneySearch,
  isHoneyQuery,
  summarizeSources,
  type SourceDocument,
} from "./lib/searchAgent";

type HoneyProfile = {
  name: string;
  region: string;
  keywords: string[];
  pricePerKg: string;
  condition: string;
  atmosphere: string;
  marketingTip: string;
  inventory: string;
};

const honeyProfiles: HoneyProfile[] = [
  {
    name: "Royal Amber",
    region: "Western Ghats • India",
    keywords: ["amber", "western", "ghats", "floral", "royal"],
    pricePerKg: "₹520 / kg",
    condition: "Moisture 16.8%, pollen-rich, premium floral blend.",
    atmosphere: "Harvest window stable for 2 weeks, humidity 62%.",
    marketingTip: "Position as limited micro-lot, bundle with artisanal teas.",
    inventory: "2.1T in cooperative cold storage, batch tested 18 Nov.",
  },
  {
    name: "Golden Valley",
    region: "Sonoma • USA",
    keywords: ["golden", "valley", "california", "sonoma"],
    pricePerKg: "$11.50 / kg",
    condition: "Moisture 17.5%, tasting notes of citrus peel and pine.",
    atmosphere: "Dry front keeps nectar yield high; bee stress minimal.",
    marketingTip: "Target farm-to-table cafes, highlight sustainable apiaries.",
    inventory: "4.8T available FOB Oakland, QC cleared 20 Nov.",
  },
  {
    name: "Desert Bloom",
    region: "Rajasthan • India",
    keywords: ["desert", "rajasthan", "acacia", "bloom"],
    pricePerKg: "₹410 / kg",
    condition: "Low crystallization, acacia-forward profile, light hue.",
    atmosphere: "Warm nights boost nectar flow; monitor dust ingress.",
    marketingTip: "Bundle with ayurvedic wellness kits, emphasize low GI.",
    inventory: "3.3T raw drums, filtration pending — ready in 48h.",
  },
  {
    name: "Nordic Heather",
    region: "Skåne • Sweden",
    keywords: ["heather", "nordic", "sweden", "skane"],
    pricePerKg: "€18.20 / kg",
    condition: "Thixotropic texture, high antioxidant payload.",
    atmosphere: "Cool, clean air mass; apiaries operating at 82% capacity.",
    marketingTip: "Premium gifting SKU, pair with rye crackers and cheese.",
    inventory: "1.2T, ships with full EU organic dossier.",
  },
];

const quickInsights = [
  { label: "Avg Spot Price", value: "₹486 / kg", trend: "+3.4% WoW" },
  { label: "Top Demand Zone", value: "Delhi NCR", trend: "Retail +11%" },
  { label: "Exporter Backlog", value: "6 days", trend: "Clearing faster" },
  { label: "Moisture Range", value: "16.5 – 18.1%", trend: "All within BIS" },
];

type AgentSnapshot = {
  summary: string;
  focus: string[];
  sources: SourceDocument[];
  provider: "serpapi" | "mock";
  latency: number;
  keyword: string;
  profile: HoneyProfile;
  papers: SourceDocument[];
};

function App() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ query: string; time: string }[]>([]);
  const [snapshot, setSnapshot] = useState<AgentSnapshot | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [insightDepth, setInsightDepth] = useState(3);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);

  const suggestions = useMemo(
    () => [
      "Rajasthan acacia outlook vs EU orders",
      "Honey prices for Delhi wellness retail",
      "Best marketing hook for Nordic heather drums",
    ],
    []
  );

  const pickProfile = (prompt: string): HoneyProfile => {
    const normalized = prompt.toLowerCase();
    return (
      honeyProfiles.find((profile) =>
        profile.keywords.some((keyword) => normalized.includes(keyword))
      ) ??
      honeyProfiles[Math.floor(Math.random() * honeyProfiles.length)]
    );
  };

  const handleSearch = async (event?: FormEvent, seedQuery?: string) => {
    event?.preventDefault();
    const effectiveQuery = seedQuery ?? query;
    if (!effectiveQuery.trim()) {
      return;
    }

    // Intelligent analysis for queries without explicit "honey" keyword
    const honeyCheck = isHoneyQuery(effectiveQuery);
    if (!honeyCheck) {
      const analysis = analyzeHoneyRelevance(effectiveQuery);
      if (analysis.isRelated && analysis.confidence >= 0.7) {
        // It's related, proceed with search
      } else {
        setError(
          analysis.confidence > 0.3
            ? `Your query might be related to honey (${Math.round(analysis.confidence * 100)}% confidence: ${analysis.reason}), but it's not clear enough. Please include honey-related keywords or rephrase your question about honey/beekeeping.`
            : "Please enter honey or honey-bee related query only. Your query doesn't appear to be related to honey or beekeeping."
        );
        return;
      }
    }

    setIsLoading(true);
    setError("");
    const wantsResearch = /\b(paper|study|research|report|pdf)\b/i.test(
      effectiveQuery
    );
    setShowSources(wantsResearch);
    const started = performance.now();

    try {
      const searchSummary = await executeHoneySearch(effectiveQuery.trim());
      const summary = summarizeSources(
        effectiveQuery.trim(),
        searchSummary.sources,
        searchSummary.papers
      );
      const focus = buildFocusPoints(searchSummary.sources, insightDepth);
      const profile = pickProfile(effectiveQuery);

      setSnapshot({
        summary,
        focus,
        sources: searchSummary.sources,
        provider: searchSummary.provider,
        latency: Math.max(60, Math.round(performance.now() - started)),
        keyword: effectiveQuery.trim(),
        profile,
        papers: searchSummary.papers,
      });
      const historyEntry = {
        query: effectiveQuery.trim(),
        time: new Date().toLocaleTimeString(),
      };
      setHistory((prev) => [historyEntry, ...prev.slice(0, 19)]);
      setQuery("");
    } catch (agentError) {
      setError(
        agentError instanceof Error
          ? agentError.message
          : "Unable to reach the search agent."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#020305] text-white"
      onClick={() => {
        if (showHistoryMenu) {
          setShowHistoryMenu(false);
        }
      }}
    >
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,196,0,0.18),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.05),_transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#050910] to-black opacity-95" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
          {/* Left Sidebar Toggle - Top Left */}
          <button
            type="button"
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className="fixed left-4 top-4 z-50 rounded-lg bg-black/80 border border-white/20 p-2.5 hover:bg-black/90 transition shadow-lg"
            aria-label="Toggle history sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-300"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Left Sidebar History */}
          {showLeftSidebar && (
            <div
              className="fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Query History</h2>
                  <button
                    type="button"
                    onClick={() => setShowLeftSidebar(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <ul className="space-y-2">
                  {history.length ? (
                    history.map((item, idx) => (
                      <li
                        key={`${item.time}-${idx}`}
                        onClick={() => {
                          setQuery(item.query);
                          setShowLeftSidebar(false);
                          handleSearch(undefined, item.query);
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer hover:bg-white/10 hover:border-amber-200/30 transition group"
                      >
                        <p className="text-sm text-white group-hover:text-amber-200">
                          {item.query}
                        </p>
                        <p className="text-xs text-white/50 mt-1">{item.time}</p>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center">
                      <p className="text-sm text-white/50">
                        No queries yet. Start asking to build history!
                      </p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Header with Honey AI Agent Title */}
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🍯</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 animate-pulse-glow shadow-lg shadow-emerald-400/50"></div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Honey AI Agent
                </h1>
                <p className="text-sm text-amber-200/80 mt-1">
                  Intelligent Market Intelligence System
                </p>
              </div>
            </div>
          </header>

          <main className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_45px_90px_rgba(0,0,0,0.5)]">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col gap-4 md:flex-row"
                >
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                      🍯
                    </span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Ask about honey prices, quality, market trends..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-4 text-sm text-white placeholder:text-white/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Synthesizing…" : "Ask HoneyAI"}
                  </button>
                </form>
                <div className="mt-4 grid gap-3 text-sm text-white/60 md:grid-cols-3">
                  {suggestions.map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={(event) => handleSearch(event, tip)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:border-amber-200 hover:text-white"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/60 p-8">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
                    Agent response
                  </p>
                  {snapshot && (
                    <button
                      type="button"
                      onClick={() => setShowSources((prev) => !prev)}
                      className="self-start rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white hover:border-amber-200"
                    >
                      {showSources ? "Hide research trail" : "Show sources"}
                    </button>
                  )}
                </div>

                {snapshot ? (
                  <div className="mt-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {snapshot.keyword}
                      </h2>
                      <div className="mt-3 text-white/80 whitespace-pre-line leading-relaxed">
                        {snapshot.summary.split('\n').map((line, idx) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className="text-amber-200">
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return <span key={pIdx}>{part}</span>;
                              })}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {snapshot.focus.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    {showSources && snapshot.sources.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.5em] text-amber-200">
                          Sources (hidden unless requested)
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {snapshot.sources
                            .filter((source) => {
                              // Only show sources with valid URLs that are not mock/test URLs
                              const url = source.url.toLowerCase();
                              return (
                                url.startsWith('http://') ||
                                url.startsWith('https://')
                              ) && !url.includes('example.com') && !url.includes('#');
                            })
                            .map((source) => (
                              <a
                                key={source.url + source.position}
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 transition hover:border-amber-200 hover:text-white"
                              >
                                <p className="font-semibold text-white">
                                  {source.title}
                                </p>
                                <p className="text-xs text-amber-200">
                                  {source.hostname}
                                </p>
                                <p className="mt-2 text-white/70">
                                  {source.snippet}
                                </p>
                              </a>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-white/60">
                    Ask anything about honey harvest, pricing, export paperwork,
                    or marketing copy. I’ll search quietly and reply with a plan.
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              {/* Market Information Boxes */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200 mb-3">
                  Market Information
                </p>
                <div className="grid gap-3">
                  {quickInsights.map((insight) => (
                    <div
                      key={insight.label}
                      className="rounded-xl border border-white/5 bg-white/5 p-3"
                    >
                      <p className="text-xs text-white/60">{insight.label}</p>
                      <p className="text-lg font-semibold text-white mt-1">
                        {insight.value}
                      </p>
                      <p className="text-xs text-emerald-300 mt-1">
                        {insight.trend}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-200 mb-3">
                  System Status
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Search Layer:</span>
                    <span className="font-semibold text-white">
                      {snapshot?.provider === "serpapi"
                        ? "Live Google"
                        : "Local Graph"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Latency:</span>
                    <span className="font-semibold text-white">
                      {snapshot?.latency ?? 0}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Research Papers - Only show when query is research-related */}
              {snapshot?.papers.length &&
              /\b(paper|papers|study|studies|research|report|pdf|whitepaper|journal|publication)\b/i.test(
                snapshot.keyword
              ) ? (
                <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-200 mb-3">
                    Research Papers
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {snapshot.papers
                      .filter((paper) => {
                        const url = paper.url.toLowerCase();
                        return (
                          (url.startsWith('http://') ||
                            url.startsWith('https://')) &&
                          !url.includes('example.com')
                        );
                      })
                      .slice(0, 5)
                      .map((paper) => {
                        const isGovernment = ["usda", "fao", "nih", "icar", "eu", "ec.europa", "cdc", "gov", "government"].some(
                          (gov) => paper.hostname.toLowerCase().includes(gov)
                        );
                        return (
                          <a
                            key={paper.url}
                            href={paper.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 transition hover:border-amber-200 hover:text-white"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-white text-sm">
                                  {paper.title}
                                </p>
                                <p className="text-xs text-amber-200 mt-1">
                                  {paper.hostname}
                                </p>
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">
                                  {paper.snippet}
                                </p>
                              </div>
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                                isGovernment 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {isGovernment ? 'Gov' : 'Journal'}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                  </div>
                  {snapshot.papers.length > 0 && (
                    <p className="text-xs text-white/50 mt-3">
                      Showing {Math.min(snapshot.papers.length, 5)} of {snapshot.papers.length} research papers. 
                      {Math.round((snapshot.papers.filter((p) => 
                        ["usda", "fao", "nih", "icar", "eu", "ec.europa", "cdc", "gov", "government"].some(
                          (gov) => p.hostname.toLowerCase().includes(gov)
                        )
                      ).length / snapshot.papers.length) * 100)}% are government research papers.
                    </p>
                  )}
                </div>
              ) : null}
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
