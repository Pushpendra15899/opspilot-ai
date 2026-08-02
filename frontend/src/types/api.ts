export type Severity = "P1" | "P2" | "P3" | "P4";

export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: Severity;
  service?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateIncidentRequest {
  title: string;
  service: string;
  severity: Severity;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
}

export interface IncidentTrendPoint {
  date: string;
  count: number;
}

export interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  trend: IncidentTrendPoint[];
}

export interface SystemStatus {
  application: string;
  status: string;
  environment: string;
  javaVersion: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export interface ActuatorHealthComponent {
  status: string;
  details?: Record<string, unknown>;
  components?: Record<string, ActuatorHealthComponent>;
}

export interface ActuatorHealth {
  status: string;
  groups?: string[];
  components?: Record<string, ActuatorHealthComponent>;
}

export interface ActuatorMetricSample {
  statistic: string;
  value: number;
}

export interface ActuatorMetric {
  name: string;
  description?: string;
  baseUnit?: string;
  measurements: ActuatorMetricSample[];
  availableTags: { tag: string; values: string[] }[];
}