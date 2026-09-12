export interface Prediction {
  evaluation_id: string;
  prediction_probability: number;
  prediction: number;
  review_priority_score: number;
}

export interface Metrics {
  evaluation_size: number;
  review_budget: number;
  before_review_accuracy: number;
  after_review_accuracy: number;
  review_efficiency: number;
  brier_score: number;
  calibration_utility: number;
  original_model_errors: number;
  reviewed_model_errors: number;
}

export interface ReviewRecord {
  evaluation_id: string;
  ai_prediction: number;
  ai_probability: number;
  review_priority_score: number;
  human_decision: number;
  reviewer: string;
  timestamp: string;
  override_reason?: string | null;
}

export interface HealthResponse {
  status: string;
  model_trained: boolean;
}

export interface Explanation {
  evaluation_id: string;
  reason: string;
  contributions: Array<{ feature: string; contribution: number; direction: string }>;
}

export interface Fairness {
  sex: { groups: Array<Record<string, string | number | boolean>>; observed_review_benefit_gap: number };
  school: { groups: Array<Record<string, string | number | boolean>>; observed_review_benefit_gap: number };
}

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${AI_API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("The AI service is unavailable. Start the FastAPI service on port 8000.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.detail === "string" ? body.detail : `AI service request failed (${response.status})`);
  }
  return body as T;
}

export const aiApi = {
  health: () => request<HealthResponse>("/health"),
  train: () => request<{ status: string; metrics: Record<string, unknown> }>("/train", { method: "POST", body: "{}" }),
  queue: () => request<Prediction[]>("/review-queue"),
  metrics: () => request<Metrics>("/metrics"),
  performance: () => request<Record<string, number | string | string[]>>("/model-performance"),
  fairness: () => request<Fairness>("/fairness"),
  history: () => request<ReviewRecord[]>("/review-history"),
  explanation: (evaluationId: string) => request<Explanation>(`/student/${encodeURIComponent(evaluationId)}/explanation`),
  review: (record: {
    evaluation_id: string;
    human_decision: number;
    reviewer: string;
    override_reason?: string;
  }) => request<{ status: string; review: ReviewRecord }>("/review", {
    method: "POST",
    body: JSON.stringify(record),
  }),
};
