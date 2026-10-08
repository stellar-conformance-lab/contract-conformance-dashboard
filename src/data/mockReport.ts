import { ConformanceReport } from "@/types";

export const mockReport: ConformanceReport = {
  profile: "SEP-41",
  fixture: "valid",
  status: "FAIL", 
  summary: {
    total: 5,
    passed: 3,
    failed: 1,
    errors: 1,
    skipped: 0,
  },
  results: [
    {
      test_id: "SEP41-META-001",
      description: "Token returns correct name",
      status: "PASS",
      expected_behavior: "name() returns a valid String",
      observed_behavior: "name() returned 'Soroban Token'",
    },
    {
      test_id: "SEP41-META-002",
      description: "Token returns correct decimals",
      status: "PASS",
      expected_behavior: "decimals() returns a u32",
      observed_behavior: "decimals() returned 7",
    },
    {
      test_id: "SEP41-XFER-001",
      description: "Transfer subtracts and adds correctly",
      status: "PASS",
      expected_behavior: "transfer() deducts 10 from sender, adds 10 to receiver",
      observed_behavior: "balances updated accurately",
    },
    {
      test_id: "SEP41-XFER-002",
      description: "Transfer prevents negative amounts",
      status: "FAIL",
      expected_behavior: "transfer() panics on amount < 0",
      observed_behavior: "transfer() completed and corrupted balance",
    },
    {
      test_id: "SEP41-ALLOW-001",
      description: "Approve handles expiration",
      status: "ERROR",
      expected_behavior: "approve() updates allowance and expiration properly",
      observed_behavior: "HostError: Contract trapped during expiration calculation",
    },
  ]
};
