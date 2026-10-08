"use client";

import { useState } from "react";
import { mockReport } from "@/data/mockReport";
import { Status, ScenarioResult } from "@/types";

export default function Dashboard() {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredResults = mockReport.results.filter(
    (res) => filter === "ALL" || res.status === filter
  );

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
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contract Conformance</h1>
              <p className="text-gray-500 mt-1 text-lg">{mockReport.profile} Profile (Mocked Data)</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Overall Status</div>
              {getBadge(mockReport.status)}
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4 mt-8">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-semibold">{mockReport.summary.total}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-sm text-green-600">Passed</div>
              <div className="text-2xl font-semibold text-green-700">{mockReport.summary.passed}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-sm text-red-600">Failed</div>
              <div className="text-2xl font-semibold text-red-700">{mockReport.summary.failed}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-sm text-orange-600">Errors</div>
              <div className="text-2xl font-semibold text-orange-700">{mockReport.summary.errors}</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Skipped</div>
              <div className="text-2xl font-semibold text-gray-700">{mockReport.summary.skipped}</div>
            </div>
          </div>
        </header>

        {/* Results Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <div className="flex space-x-2">
              {(["ALL", "PASS", "FAIL", "ERROR", "SKIPPED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tests match the current filter.
              </div>
            ) : (
              filteredResults.map((result) => {
                const isExpanded = expandedRow === result.test_id;
                return (
                  <div key={result.test_id} className="transition-colors hover:bg-gray-50/50">
                    <div 
                      className="p-4 px-6 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : result.test_id)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-24 shrink-0">{getBadge(result.status)}</div>
                        <div className="font-mono text-sm text-gray-500 w-36 shrink-0">{result.test_id}</div>
                        <div className="font-medium text-gray-900">{result.description}</div>
                      </div>
                      <div className="text-gray-400">
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 bg-gray-50/50 border-t border-gray-50">
                        <div className="grid grid-cols-2 gap-6 ml-32">
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expected Behavior</h4>
                            <p className="text-sm text-gray-700 font-mono">{result.expected_behavior}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Observed Behavior</h4>
                            <p className="text-sm text-gray-700 font-mono break-words">{result.observed_behavior}</p>
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
