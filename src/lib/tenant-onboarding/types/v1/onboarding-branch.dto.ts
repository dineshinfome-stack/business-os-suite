/**
 * Gate 3.8 · Pass 3.8.1 — branch summary DTO (v1).
 */
export interface OnboardingBranchDTO {
  branchId: string;
  organizationId: string;
  name: string;
  code: string;
  isDefault: boolean;
  lifecycleState: string;
  timezone: string | null;
  createdAt: string;
}
