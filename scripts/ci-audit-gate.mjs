import { execFile } from "node:child_process";

const run = (cmd, args) =>
  new Promise((resolve) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      resolve({
        code: error?.code ?? 0,
        stdout: String(stdout ?? ""),
        stderr: String(stderr ?? ""),
      });
    });
  });

const countBySeverity = (report) => {
  const totals = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
  const meta = report?.metadata?.vulnerabilities;
  if (meta && typeof meta === "object") {
    for (const key of Object.keys(totals)) {
      if (typeof meta[key] === "number") totals[key] = meta[key];
    }
    return totals;
  }

  const vulns = report?.vulnerabilities ?? {};
  for (const entry of Object.values(vulns)) {
    const sev = entry?.severity;
    if (sev && typeof totals[sev] === "number") totals[sev] += 1;
    totals.total += 1;
  }
  return totals;
};

const main = async () => {
  const { stdout, stderr } = await run("npm", ["audit", "--json"]);

  const combined = `${stdout}\n${stderr}`.trim();
  const firstBrace = combined.indexOf("{");
  if (firstBrace === -1) {
    console.error("audit-gate: could not parse npm audit json output");
    console.error(combined);
    process.exit(2);
  }

  let report;
  try {
    report = JSON.parse(combined.slice(firstBrace));
  } catch (e) {
    console.error("audit-gate: invalid JSON from npm audit");
    console.error(combined);
    process.exit(2);
  }

  const counts = countBySeverity(report);
  console.log(
    `audit-gate: vulnerabilities info=${counts.info} low=${counts.low} moderate=${counts.moderate} high=${counts.high} critical=${counts.critical}`,
  );

  if (counts.high > 0 || counts.critical > 0) {
    console.error("audit-gate: failing build due to high/critical vulnerabilities");
    process.exit(1);
  }

  process.exit(0);
};

main().catch((err) => {
  console.error("audit-gate: unexpected error");
  console.error(err);
  process.exit(2);
});

