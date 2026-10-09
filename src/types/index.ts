export type Status = 'PASS' | 'FAIL' | 'ERROR' | 'SKIPPED';

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
}

export interface ScenarioResult {
  test_id: string;
  description: string;
  status: Status;
  expected_behavior: string;
  observed_behavior: string;
}

export interface ConformanceReport {
  profile: string;
  fixture: string;
  status: Status;
  summary: Summary;
  results: ScenarioResult[];
}

export interface HistoricalRun {
  id: string;
  commit: string;
  timestamp: string;
  profile: string;
  fixture: string;
  status: Status;
  summary: Summary;
  report: string;
}

export interface HistoryManifest {
  runs: HistoricalRun[];
}
