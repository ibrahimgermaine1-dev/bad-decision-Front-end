"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Zap,
  Upload,
  LogOut,
  Coins,
  Download,
} from "lucide-react";

interface VerifyResult {
  email: string;
  status: "valid" | "invalid" | "risky" | "unknown";
  score: number;
  reason?: string;
}

export function Dashboard() {
  const { user, coins, logout } = useAuthStore();
  const [emails, setEmails] = useState("");
  const [results, setResults] = useState<VerifyResult[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!user) return null;

  const handleVerify = async () => {
    const emailList = emails.split("\n").filter((e) => e.trim());
    if (emailList.length === 0) return;

    setVerifying(true);
    setProgress(0);
    setResults([]);

    for (let i = 0; i < emailList.length; i++) {
      await new Promise((r) => setTimeout(r, 300));
      const statuses: VerifyResult["status"][] = [
        "valid",
        "invalid",
        "risky",
        "unknown",
      ];
      setResults((prev) => [
        ...prev,
        {
          email: emailList[i].trim(),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          score: Math.floor(Math.random() * 100),
          reason: "Simulated result",
        },
      ]);
      setProgress(Math.round(((i + 1) / emailList.length) * 100));
    }

    setVerifying(false);
  };

  const handleCSVUpload = () => {
    alert("CSV upload will be available in Phase 2.");
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const csv =
      "Email,Status,Score,Reason\n" +
      results
        .map((r) => `${r.email},${r.status},${r.score},${r.reason || ""}`)
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bad-decision-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="dashboard" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              Verify emails and get instant intelligence
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{coins} coins</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Email Verification</h3>
                <Button variant="outline" size="sm" onClick={handleCSVUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </div>
              <Textarea
                placeholder="Enter emails to verify (one per line)..."
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex items-center gap-3 mt-4">
                <Button onClick={handleVerify} disabled={verifying}>
                  {verifying ? (
                    "Verifying..."
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Verify Emails
                    </>
                  )}
                </Button>
                {results.length > 0 && (
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>
              {verifying && (
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {progress}% complete
                  </p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-4">Results</h3>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm font-mono">{r.email}</span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            r.status === "valid"
                              ? "bg-green-500/10 text-green-500"
                              : r.status === "invalid"
                              ? "bg-red-500/10 text-red-500"
                              : r.status === "risky"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Score: {r.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valid</span>
                  <span className="font-semibold text-green-500">
                    {results.filter((r) => r.status === "valid").length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Invalid</span>
                  <span className="font-semibold text-red-500">
                    {results.filter((r) => r.status === "invalid").length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risky</span>
                  <span className="font-semibold text-yellow-500">
                    {results.filter((r) => r.status === "risky").length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unknown</span>
                  <span className="font-semibold text-gray-500">
                    {results.filter((r) => r.status === "unknown").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Your Plan</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan</span>
                  <span className="text-sm font-semibold">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Credits</span>
                  <span className="text-sm font-semibold">{coins} / 100</span>
                </div>
                <Progress value={coins} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
