import { useEffect, useState } from "react";
import { AlertCircle, BrainCircuit, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { aiApi, Explanation, Fairness, Metrics, Prediction, ReviewRecord } from "@/services/ai-api";

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const AIInsights = () => {
  const [health, setHealth] = useState<{ model_trained: boolean } | null>(null);
  const [queue, setQueue] = useState<Prediction[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [performance, setPerformance] = useState<Record<string, number | string | string[]> | null>(null);
  const [fairness, setFairness] = useState<Fairness | null>(null);
  const [history, setHistory] = useState<ReviewRecord[]>([]);
  const reviewedIds = new Set(history.map((record) => record.evaluation_id));
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [decision, setDecision] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const serviceHealth = await aiApi.health();
      setHealth(serviceHealth);
      if (!serviceHealth.model_trained) {
        setQueue([]);
        setMetrics(null);
        return;
      }
      const [nextQueue, nextMetrics, nextPerformance, nextFairness, nextHistory] = await Promise.all([
        aiApi.queue(), aiApi.metrics(), aiApi.performance(), aiApi.fairness(), aiApi.history(),
      ]);
      setQueue(nextQueue);
      setMetrics(nextMetrics);
      setPerformance(nextPerformance);
      setFairness(nextFairness);
      setHistory(nextHistory);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load AI insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInsights();
  }, []);

  const trainModel = async () => {
    setTraining(true);
    setError("");
    setMessage("");
    try {
      await aiApi.train();
      setMessage("Model trained successfully. Refreshing the review workspace.");
      await loadInsights();
    } catch (trainError) {
      setError(trainError instanceof Error ? trainError.message : "Model training failed.");
    } finally {
      setTraining(false);
    }
  };

  const submitReview = async () => {
    if (!selected || decision === null) return;
    setError("");
    try {
      await aiApi.review({
        evaluation_id: selected.evaluation_id,
        human_decision: decision,
        reviewer,
        override_reason: reason || undefined,
      });
      setSelected(null);
      setDecision(null);
      setReason("");
      setMessage("Human review recorded.");
      await loadInsights();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Review could not be recorded.");
    }
  };

  const openReview = async (row: Prediction) => {
    setSelected(row);
    try {
      setExplanation(await aiApi.explanation(row.evaluation_id));
    } catch (explanationError) {
      setError(explanationError instanceof Error ? explanationError.message : "Explanation unavailable.");
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">AI Insights</h2>
          </div>
          <p className="text-muted-foreground mt-1">Human review for uncertain student-support predictions</p>
        </div>
        <Button variant="outline" onClick={() => void loadInsights()} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Human oversight required</AlertTitle>
        <AlertDescription>AI predictions are decision-support signals, not final decisions. Selected cases are routed to human review.</AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI service unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && <Alert><CheckCircle2 className="h-4 w-4" /><AlertDescription>{message}</AlertDescription></Alert>}

      {health && !health.model_trained && !error && (
        <Card>
          <CardHeader><CardTitle>Model setup required</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">The AI service is connected, but no trained model is available. Add the permitted development dataset and train the model to create a real review queue.</p>
            <Button onClick={() => void trainModel()} disabled={training}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              {training ? "Training..." : "Train model"}
            </Button>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Students evaluated", metrics.evaluation_size],
            ["Review budget", `${metrics.review_budget} (20%)`],
            ["Before review", percent(metrics.before_review_accuracy)],
            ["After review", percent(metrics.after_review_accuracy)],
            ["Review efficiency", percent(metrics.review_efficiency)],
            ["Brier score", metrics.brier_score.toFixed(3)],
            ["Calibration utility", percent(metrics.calibration_utility)],
            ["Original errors", metrics.original_model_errors],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
            </Card>
          ))}
        </div>
      )}

      {health?.model_trained && (
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="queue">Review Queue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="fairness">Fairness</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="limitations">Limitations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card><CardHeader><CardTitle>Review allocation</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">The queue prioritizes predictions nearest the decision boundary so limited teacher attention is directed toward uncertain cases.</CardContent></Card>
          </TabsContent>
          <TabsContent value="queue" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Priority review queue <Badge variant="secondary" className="ml-2">Exactly 20%</Badge></CardTitle></CardHeader>
              <CardContent>
                {queue.length === 0 ? <p className="text-sm text-muted-foreground">No review rows are available.</p> : (
                  <div className="space-y-3">
                    {queue.map((row) => (
                      <div key={row.evaluation_id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                        <div><p className="font-medium">{row.evaluation_id}</p><p className="text-sm text-muted-foreground">AI prediction: {row.prediction ? "Support needed" : "No support signal"}</p></div>
                        <div className="flex items-center gap-3 text-sm"><span>Probability {percent(row.prediction_probability)}</span><Badge>Priority {percent(row.review_priority_score)}</Badge>{reviewedIds.has(row.evaluation_id) ? <Badge variant="secondary">Reviewed</Badge> : <Button size="sm" onClick={() => void openReview(row)}>Review</Button>}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="mt-4">
            <Card><CardHeader><CardTitle>Model performance</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              {performance && [["Validation accuracy", performance.validation_accuracy], ["Before review", performance.before_review_accuracy], ["After review", performance.after_review_accuracy], ["Brier score", performance.brier_score], ["Calibration utility", performance.calibration_utility], ["Evaluation size", performance.evaluation_size], ["Review budget", performance.review_budget], ["Review efficiency", performance.review_efficiency]].map(([label, value]) => <div key={label}><p className="text-muted-foreground">{label}</p><p className="font-semibold">{typeof value === "number" && String(label).toLowerCase().includes("accuracy") || typeof value === "number" && String(label).toLowerCase().includes("utility") || typeof value === "number" && String(label).toLowerCase().includes("efficiency") ? percent(value) : value}</p></div>)}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="fairness" className="mt-4 space-y-4">
            {fairness && (["sex", "school"] as const).map((attribute) => <Card key={attribute}><CardHeader><CardTitle className="capitalize">{attribute}</CardTitle></CardHeader><CardContent><div className="space-y-2 text-sm">{fairness[attribute].groups.map((group) => <div key={String(group.group)} className="flex justify-between border-b pb-2"><span>{String(group.group)} ({group.rows} rows)</span><span>{group.reviewed_errors} / {group.original_errors} errors reviewed</span><span>Recall {percent(Number(group.error_capture_recall))}</span></div>)}</div><p className="mt-3 text-sm text-muted-foreground">Observed review-benefit gap: {percent(fairness[attribute].observed_review_benefit_gap)}</p></CardContent></Card>)}
          </TabsContent>
          <TabsContent value="history" className="mt-4"><Card><CardHeader><CardTitle>Review history</CardTitle></CardHeader><CardContent>{history.length === 0 ? <p className="text-sm text-muted-foreground">No human reviews recorded yet.</p> : <div className="space-y-2 text-sm">{history.map((record) => <div key={record.evaluation_id} className="flex flex-wrap justify-between gap-2 border-b pb-2"><span>{record.evaluation_id}</span><span>{record.human_decision ? "Support needed" : "No support signal"}</span><span>{record.reviewer}</span><span>{new Date(record.timestamp).toLocaleString()}</span></div>)}</div>}</CardContent></Card></TabsContent>
          <TabsContent value="limitations" className="mt-4">
            <Card><CardHeader><CardTitle>Responsible use</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>Predictions may be uncertain and development data may not represent every student population.</p><p>Fairness metrics depend on eligible evaluation groups and human review is required for selected cases.</p><p>This research demonstration must not be used for punitive automated decisions.</p></CardContent></Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review {selected?.evaluation_id}</DialogTitle><DialogDescription>This interface does not expose benchmark ground truth. Make the final human decision from the available evidence.</DialogDescription></DialogHeader>
          {selected && <div className="space-y-4"><div className="grid grid-cols-3 gap-3 text-sm"><div><Label>AI prediction</Label><p className="font-medium">{selected.prediction ? "Support needed" : "No support signal"}</p></div><div><Label>Probability</Label><p className="font-medium">{percent(selected.prediction_probability)}</p></div><div><Label>Priority</Label><p className="font-medium">{percent(selected.review_priority_score)}</p></div></div><div className="rounded-md bg-muted/50 p-3 text-sm"><p className="font-medium">Why review?</p><p className="text-muted-foreground">{explanation?.reason || "Loading model explanation..."}</p>{explanation && <div className="mt-2 space-y-1">{explanation.contributions.map((item) => <div key={item.feature} className="flex justify-between"><span>{item.feature}</span><span className={item.contribution > 0 ? "text-destructive" : "text-primary"}>{item.contribution > 0 ? "+" : ""}{item.contribution.toFixed(3)}</span></div>)}</div>}</div><div className="space-y-2"><Label>Human decision</Label><div className="flex gap-2"><Button variant={decision === selected.prediction ? "default" : "outline"} onClick={() => setDecision(selected.prediction)}>Confirm AI prediction</Button><Button variant={decision !== null && decision !== selected.prediction ? "default" : "outline"} onClick={() => setDecision(selected.prediction ? 0 : 1)}>Override prediction</Button></div></div><div className="space-y-2"><Label htmlFor="reviewer">Reviewer</Label><Input id="reviewer" value={reviewer} onChange={(event) => setReviewer(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="reason">Override reason (optional)</Label><Textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} /></div></div>}
          <DialogFooter><Button onClick={() => void submitReview()} disabled={decision === null || !reviewer.trim()}>Submit review</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
