"use client";

import { useState, useMemo, useEffect } from "react";
import {
  loadReport,
  loadHistoryManifest,
  loadHistoricalReport,
} from "@/lib/report-loader";
import { Status, ConformanceReport, HistoricalRun } from "@/types";

export default function Dashboard() {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [report, setReport] = useState<ConformanceReport | null>(null);
  const [loading, setLoading] = useState(true);

  const [historyRuns, setHistoryRuns] = useState<HistoricalRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("latest");

  useEffect(() => {
    let isMounted = true;

    Promise.all([loadReport(), loadHistoryManifest()]).then(
      ([currentReport, manifest]) => {
        if (!isMounted) return;

        setReport(currentReport);
        setHistoryRuns(manifest?.runs ?? []);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);


  const handleRunChange = async (runId: string) => {
    setSelectedRunId(runId);
    setLoading(true);
    setExpandedRow(null);
    setFilter("ALL");
    setSearchQuery("");

    try {
      const nextReport =
        runId === "latest"
          ? await loadReport()
          : await loadHistoricalReport(runId);

      setReport(nextReport);
    } finally {
      setLoading(false);
    }
  };


  const filteredResults = useMemo(() => {
    if (!report || !report.results) return [];

    return report.results.filter((res) => {
      const matchesFilter = filter === "ALL" || res.status === filter;
      const matchesSearch =
        res.test_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, report]);

  // Error / Empty States for the report itself
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full">
          <h2 className="text-red-600 text-xl font-bold mb-2">Report Unavailable</h2>
          <p className="text-gray-600">Failed to load the conformance report data.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "PASS":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAIL":
        return "bg-red-100 text-red-800 border-red-200";
      case "ERROR":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "SKIPPED":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getBadge = (status: Status) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}
        aria-label={`Status: ${status}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contract Conformance</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">Profile: {report.profile}</span>
                <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">Fixture: {report.fixture}</span>
              </div>
              <div className="mt-4 max-w-md">
                <label
                  htmlFor="run-selector"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Report run
                </label>

                <select
                  id="run-selector"
                  value={selectedRunId}
                  onChange={(event) => void handleRunChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="latest">Latest report</option>

                  {historyRuns.map((run) => (
                    <option key={run.id} value={run.id}>
                      {new Date(run.timestamp).toLocaleString()} - {run.status} -{" "}
                      {run.summary.passed}/{run.summary.total} passed
                    </option>
                  ))}
                </select>

                {historyRuns.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Historical runs are currently unavailable.
                  </p>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">Overall Result</div>
              {getBadge(report.status)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mt-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col justify-between">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{report.summary.total}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex flex-col justify-between">
              <div className="text-sm font-medium text-green-700">Passed</div>
              <div className="text-3xl font-bold text-green-800 mt-1">{report.summary.passed}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex flex-col justify-between">
              <div className="text-sm font-medium text-red-700">Failed</div>
              <div className="text-3xl font-bold text-red-800 mt-1">{report.summary.failed}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 flex flex-col justify-between">
              <div className="text-sm font-medium text-orange-700">Errors</div>
              <div className="text-3xl font-bold text-orange-800 mt-1">{report.summary.errors}</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div className="text-sm font-medium text-gray-600">Skipped</div>
              <div className="text-3xl font-bold text-gray-700 mt-1">{report.summary.skipped}</div>
            </div>
          </div>
        </header>

        {/* Results Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Controls */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Test Scenarios</h2>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search ID or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  aria-label="Search tests"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto" role="tablist" aria-label="Filter test results">
                {(["ALL", "PASS", "FAIL", "ERROR", "SKIPPED"] as const).map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={filter === f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${filter === f
                        ? "bg-gray-800 text-white shadow-sm ring-1 ring-gray-900"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-100">
            {filteredResults.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              filteredResults.map((result) => {
                const isExpanded = expandedRow === result.test_id;

                return (
                  <div key={result.test_id} className="transition-colors hover:bg-gray-50/50 group">
                    <button
                      className="w-full text-left p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus:outline-none focus:bg-gray-50"
                      onClick={() => setExpandedRow(isExpanded ? null : result.test_id)}
                      aria-expanded={isExpanded}
                      aria-controls={`detail-${result.test_id}`}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 overflow-hidden">
                        <div className="w-20 sm:w-24 shrink-0 pt-0.5 sm:pt-0">
                          {getBadge(result.status)}
                        </div>
                        <div className="font-mono text-xs sm:text-sm text-gray-500 w-full sm:w-40 shrink-0 truncate">
                          {result.test_id}
                        </div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                          {result.description}
                        </div>
                      </div>
                      <div className="hidden sm:block text-gray-400 group-hover:text-gray-600 transition-colors">
                        <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div id={`detail-${result.test_id}`} className="px-4 sm:px-6 pb-6 pt-2 bg-gray-50/80 border-t border-gray-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 sm:ml-[116px]">
                          <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Expected Behavior
                            </h4>
                            <p className="text-sm text-gray-800 font-mono break-words leading-relaxed">
                              {result.expected_behavior}
                            </p>
                          </div>

                          <div className={`bg-white p-4 sm:p-5 rounded-lg border shadow-sm relative overflow-hidden ${result.status === 'PASS' ? 'border-green-200' :
                              result.status === 'FAIL' ? 'border-red-200' :
                                result.status === 'ERROR' ? 'border-orange-200' : 'border-gray-200'
                            }`}>
                            <div className={`absolute top-0 left-0 w-1 h-full ${result.status === 'PASS' ? 'bg-green-500' :
                                result.status === 'FAIL' ? 'bg-red-500' :
                                  result.status === 'ERROR' ? 'bg-orange-500' : 'bg-gray-500'
                              }`}></div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <svg className={`w-4 h-4 ${result.status === 'PASS' ? 'text-green-500' :
                                  result.status === 'FAIL' ? 'text-red-500' :
                                    result.status === 'ERROR' ? 'text-orange-500' : 'text-gray-500'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Observed Behavior
                            </h4>
                            <p className="text-sm text-gray-800 font-mono break-words leading-relaxed">
                              {result.observed_behavior}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
