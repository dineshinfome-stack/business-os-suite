/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Supabase binding for the data client.
 *
 * The ONLY module in the provisioning domain that talks to Supabase. The client
 * is injected — no env reads, no globals, no singletons. The orchestrator never
 * imports this file.
 *
 * INVARIANT (Risk D1): this binding never writes `tenants.provisioning_status`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { PROVISIONING_STATES, isTerminal } from "../lifecycle";
import type {
  JobUpdateCommand,
  ProvisioningDataClient,
  ProvisioningJobRow,
  ProvisioningStepRow,
  StepClaimCommand,
  StepOutcomeCommand,
} from "./data-client";

const JOBS_TABLE = "provisioning_jobs";
const STEPS_TABLE = "provisioning_steps";

const ACTIVE_STATES = PROVISIONING_STATES.filter((s) => !isTerminal(s));

/** Statuses a step may be claimed from — anything else is already owned. */
const CLAIMABLE_STATUSES = ["pending", "failed"] as const;

/** Structurally typed to any Supabase client; typing stays at the row layer. */
type AnySupabaseClient = SupabaseClient<any, any, any>;

export function createSupabaseDataClient(
  client: AnySupabaseClient,
): ProvisioningDataClient {
  const jobs = () => client.from(JOBS_TABLE);
  const steps = () => client.from(STEPS_TABLE);

  return {
    async selectJob(jobId) {
      const { data, error } = await jobs().select("*").eq("id", jobId).maybeSingle();
      if (error) throw error;
      return (data as ProvisioningJobRow | null) ?? null;
    },

    async selectSteps(jobId) {
      const { data, error } = await steps()
        .select("*")
        .eq("job_id", jobId)
        .order("sequence", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProvisioningStepRow[];
    },

    async countActiveJobs(tenantId) {
      const { count, error } = await jobs()
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .in("state", ACTIVE_STATES as unknown as string[]);
      if (error) throw error;
      return count ?? 0;
    },

    async updateJobIfState(command: JobUpdateCommand) {
      const { data, error } = await jobs()
        .update({ ...command.patch })
        .eq("id", command.jobId)
        .eq("state", command.expectedState)
        .select("id");
      if (error) throw error;
      return (data ?? []).length;
    },

    async claimStepIfUnclaimed(command: StepClaimCommand) {
      const { data: updated, error: updateError } = await steps()
        .update({
          status: "running",
          attempt_count: command.attempt,
          correlation_id: command.correlationId,
          started_at: command.at,
          completed_at: null,
          error: null,
        })
        .eq("job_id", command.jobId)
        .eq("step_key", command.stepKey)
        .in("status", CLAIMABLE_STATUSES as unknown as string[])
        .select("id");
      if (updateError) throw updateError;
      if ((updated ?? []).length > 0) return true;

      const { data: existing, error: existingError } = await steps()
        .select("id")
        .eq("job_id", command.jobId)
        .eq("step_key", command.stepKey)
        .maybeSingle();
      if (existingError) throw existingError;
      // The row exists but is running/succeeded/rolled_back — another runner owns it.
      if (existing) return false;

      const { error: insertError } = await steps().insert({
        job_id: command.jobId,
        step_key: command.stepKey,
        sequence: command.sequence,
        status: "running",
        attempt_count: command.attempt,
        correlation_id: command.correlationId,
        started_at: command.at,
      });
      // Unique violation => a concurrent runner inserted first; it wins.
      if (insertError) {
        if ((insertError as { code?: string }).code === "23505") return false;
        throw insertError;
      }
      return true;
    },

    async writeStepOutcome(command: StepOutcomeCommand) {
      const { data: updated, error: updateError } = await steps()
        .update({
          status: command.status,
          attempt_count: command.attempt,
          correlation_id: command.correlationId,
          completed_at: command.at,
          duration_ms: command.durationMs,
          error: command.error,
        })
        .eq("job_id", command.jobId)
        .eq("step_key", command.stepKey)
        .select("id");
      if (updateError) throw updateError;
      if ((updated ?? []).length > 0) return;

      const { error: insertError } = await steps().insert({
        job_id: command.jobId,
        step_key: command.stepKey,
        sequence: command.sequence,
        status: command.status,
        attempt_count: command.attempt,
        correlation_id: command.correlationId,
        completed_at: command.at,
        duration_ms: command.durationMs,
        error: command.error,
      });
      if (insertError) throw insertError;
    },
  };
}
