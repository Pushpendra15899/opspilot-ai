export interface OpenApiParameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: { type?: string };
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: { required?: boolean; description?: string };
  responses?: Record<string, { description?: string }>;
}

export type OpenApiMethod = "get" | "post" | "put" | "patch" | "delete";

export type OpenApiPathItem = Partial<Record<OpenApiMethod, OpenApiOperation>>;

export interface OpenApiSpec {
  openapi: string;
  info: { title: string; description?: string; version: string };
  tags?: { name: string; description?: string }[];
  paths: Record<string, OpenApiPathItem>;
}

export interface OpenApiEndpoint {
  path: string;
  method: OpenApiMethod;
  operation: OpenApiOperation;
}
