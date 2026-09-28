export interface BusinessRule {
  id: string;
  requirementId: string;
  code: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  createdAt: string;
}
