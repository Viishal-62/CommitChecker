import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  Search, 
  Download, 
  Github, 
  AlertCircle,
  Copy,
  Check,
  Clock,
  ArrowRight,
  GitBranch,
  Terminal,
  Users, // Added Users icon
  Eye    // Added Eye icon
} from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('https://github.com/s-mahali/Echoletter');
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repoInfo, setRepoInfo] = useState(null);
  const [copiedSha, setCopiedSha] = useState(null);
  const [visitorCount, setVisitorCount] = useState(0);
 

 
  useEffect(() => {
    const PERSISTENT_KEY = 'site_visitor_count';
    const SESSION_KEY = 'hasVisitedSession';
    
 
    const isNewSession = sessionStorage.getItem(SESSION_KEY) === null;
    
    let currentCount = parseInt(localStorage.getItem(PERSISTENT_KEY) || '0', 10);
 
    if (currentCount === 0) {
      currentCount = 500; 
    }

    if (isNewSession) {
 
      currentCount += 1;
      localStorage.setItem(PERSISTENT_KEY, currentCount.toString());
      

      let existingSession = sessionStorage.getItem(SESSION_KEY);

      if(!existingSession){
sessionStorage.setItem(SESSION_KEY, 'true');
      }
   
      
    }
    
    setVisitorCount(currentCount);

  }, []);
 

  const extractRepoDetails = (repoUrl) => {
    try {
      const cleanUrl = repoUrl.replace(/\/$/, "");
      const parts = cleanUrl.split("/");
      if (parts.length < 2) return null;
      return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    } catch (e) {
      return null;
    }
  };

  const formatDateDetails = (isoString) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const timeStr = date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    return { dateStr, timeStr };
  };

  const fetchCommits = async (e) => {
    if (e) e.preventDefault();
    
    const details = extractRepoDetails(url);
    if (!details) {
      setError("Invalid GitHub URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setCommits([]);
    setRepoInfo(details);

    try {
      const response = await fetch(`https://api.github.com/repos/${details.owner}/${details.repo}/commits?per_page=100`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error("Repo not found.");
        if (response.status === 403) throw new Error("API Limit exceeded.");
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.length === 0) setError("No commits found.");
      else setCommits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (sha) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-teal-500/30">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #262626 1px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.4 }}>
      </div>

      <style>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-clean { border: none !important; background: none !important; padding-left: 0 !important; }
          .print-text-black { color: black !important; }
          .print-border { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px; }
        }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        
        {/* Navbar-like Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-neutral-800 pb-6 gap-6 md:gap-0">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center shadow-2xl">
              <Terminal className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Commit<span className="text-teal-500">Log</span></h1>
              <p className="text-neutral-500 text-sm font-medium mt-1">Repository Inspector & Exporter</p>
            </div>
          </div>
          
          {/* Right Side: Visitor Count & Export Button */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            
            {/* Website Visitor Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/30 border border-neutral-800 rounded-md text-xs font-medium text-neutral-400 no-print">
              <div className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </div>
              <Users className="w-3.5 h-3.5" />
              <span className="text-neutral-300 font-mono">{visitorCount.toLocaleString()}</span>
              <span className="hidden sm:inline">visitors</span>
            </div>

            {commits.length > 0 && (
              <button 
                onClick={handlePrint}
                className="no-print group flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-teal-500/50 hover:text-teal-400 text-neutral-400 rounded-md transition-all duration-300 text-sm font-medium"
              >
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Export PDF
              </button>
            )}
          </div>
        </div>

        {/* Input Field */}
        <div className="no-print mb-12">
          <form onSubmit={fetchCommits} className="relative group max-w-2xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0a0a] rounded-lg border border-neutral-800 p-1.5 shadow-2xl">
              <div className="pl-4 pr-3 text-neutral-500">
                <Github className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="github.com/owner/repo"
                className="flex-1 bg-transparent border-none text-neutral-200 placeholder-neutral-600 focus:ring-0 focus:outline-none h-10 font-mono text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-neutral-100 hover:bg-white text-black px-5 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : <>Explore <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
          {error && (
            <div className="max-w-2xl mx-auto mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-950/20 px-4 py-2 rounded border border-red-900/50">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>

        {/* Results */}
        {commits.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Repo Header + Total Commits Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-neutral-500 font-mono uppercase tracking-wider">
                <GitBranch className="w-4 h-4" />
                <span>{repoInfo?.owner}</span>
                <span className="text-neutral-700">/</span>
                <span className="text-teal-500 font-bold">{repoInfo?.repo}</span>
              </div>

              {/* Total Commits Display */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 border border-neutral-800 rounded-full text-xs font-medium text-neutral-400">
                <GitCommit className="w-4 h-4 text-teal-500" />
                <span className="text-neutral-200 font-bold">{commits.length}</span>
                <span>commits fetched</span>
              </div>
            </div>

            <div className="relative border-l border-neutral-800 ml-3 md:ml-6 space-y-12 pb-12">
              {commits.map((commit, index) => {
                const { dateStr, timeStr } = formatDateDetails(commit.commit.author.date);
                const isFirst = index === 0;

                return (
                  <div key={commit.sha} className="relative pl-8 md:pl-12 print-border">
                    <div className={`absolute -left-[5px] md:-left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 ${isFirst ? 'bg-teal-500 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-[#0a0a0a] border-neutral-700'}`}></div>

                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group">
                      <div className="md:w-32 flex-shrink-0 pt-0.5">
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isFirst ? 'text-teal-400' : 'text-neutral-300'} print-text-black`}>{dateStr}</span>
                            <span className="text-xs text-neutral-500 font-mono mt-1">{timeStr}</span>
                          </div>
                      </div>

                      <div className="flex-1 bg-neutral-900/30 hover:bg-neutral-900/60 border border-neutral-800/50 hover:border-neutral-700 rounded-lg p-5 transition-all duration-200 print-clean">
                        <p className="text-neutral-200 text-sm md:text-base leading-relaxed mb-4 print-text-black">
                          {commit.commit.message}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                          <div className="flex items-center gap-3">
                            {commit.author?.avatar_url ? (
                              <img 
                                src={commit.author.avatar_url} 
                                alt={commit.commit.author.name}
                                className="w-6 h-6 rounded-full border border-neutral-700"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                                {commit.commit.author.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs font-medium text-neutral-400 print-text-black">{commit.commit.author.name}</span>
                          </div>

                          <div className="flex items-center gap-3">
                              <div className="hidden md:flex items-center gap-1 group/sha cursor-pointer" onClick={() => copyToClipboard(commit.sha)}>
                                <span className="font-mono text-[10px] text-neutral-600 group-hover/sha:text-teal-500 transition-colors">
                                  {commit.sha.substring(0, 7)}
                                </span>
                                {copiedSha === commit.sha ? (
                                  <Check className="w-3 h-3 text-teal-500" />
                                ) : (
                                  <Copy className="w-3 h-3 text-neutral-700 group-hover/sha:text-teal-500" />
                                )}
                              </div>
                              <a 
                                href={commit.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="no-print text-neutral-600 hover:text-white transition-colors"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!commits.length && !loading && !error && (
          <div className="text-center mt-32">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 mb-6 border border-neutral-800">
              <GitCommit className="w-8 h-8 text-neutral-700" />
            </div>
            <p className="text-neutral-500 font-mono text-sm">Waiting for repository input...</p>
          </div>
        )}
      </div>
    </div>
  );
}
