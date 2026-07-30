export type DependencyStatus = "up" | "down";

export type HealthStatus = "ok" | "degraded";

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  dependencies: {
    database: DependencyStatus;
  };
}
