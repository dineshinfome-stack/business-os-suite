/**
 * Gate 3.8 · Pass 3.8.1 — organization (company) summary DTO (v1).
 *
 * G38-POL-001: `organizations` IS the company entity. There is no separate
 * company DTO family.
 */
export interface OnboardingOrganizationDTO {
  organizationId: string;
  name: string;
  legalName: string | null;
  slug: string;
  isDefault: boolean;
  lifecycleState: string;
  region: string | null;
  timezone: string | null;
  defaultLocale: string | null;
  createdAt: string;
}
