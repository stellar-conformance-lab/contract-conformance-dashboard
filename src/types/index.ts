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
