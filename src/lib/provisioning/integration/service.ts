/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Provisioning application service.
 *
 * Owns orchestration STARTUP. The orchestrator owns orchestration EXECUTION.
 * This service adds no lifecycle, retry or rollback logic of its own — it
 * resolves inputs the orchestrator requires and propagates correlation.
 */
import type { RollbackPlan } from "../types";
import type { TenantFacts } from "../validators";
import type { Orchestrator } from "../orchestrator/orchestrator";
import type {
  JobRepository,
  OrchestrationSnapshot,
  OrchestratorLogger,
  OrchestratorResult,
} from "../orchestrator/types";

export interface ProvisioningIdentity {
  jobId: string;
  tenantId: string;
  correlationId: string;
  actorId: string;
}

export interface StartProvisioningInput {
  tenant: TenantFacts;
  /** Optional override; resolved from the repository when omitted. */
  activeJobCount?: number;
  providerConfig?: Parameters<Orchestrator["start"]>[0]["providerConfig"];
}

export interface ProvisioningService {
  readonly identity: ProvisioningIdentity;
  startProvisioning(
    input: StartProvisioningInput,
  ): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  resumeProvisioning(): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  executeNextStep(): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  cancelProvisioning(reason: string): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  rollbackProvisioning(): Promise<OrchestratorResult<RollbackPlan>>;
}

export interface ProvisioningServiceDeps {
  identity: ProvisioningIdentity;
  orchestrator: Orchestrator;
  repository: JobRepository;
  logger: OrchestratorLogger;
}

export function createService(deps: ProvisioningServiceDeps): ProvisioningService {
  const { identity, orchestrator, repository, logger } = deps;

  const logFields = (operation: string) => ({
    correlationId: identity.correlationId,
    tenantId: identity.tenantId,
    jobId: identity.jobId,
    currentStep: null,
    operation,
  });

  return {
    identity,

    async startProvisioning(input) {
      logger.info("service startProvisioning", logFields("startProvisioning"));
      const activeJobCount =
        input.activeJobCount ?? (await repository.countActiveJobs(identity.tenantId));
      return orchestrator.start({
        tenant: input.tenant,
        activeJobCount,
        providerConfig: input.providerConfig,
      });
    },

    async resumeProvisioning() {
      logger.info("service resumeProvisioning", logFields("resumeProvisioning"));
      return orchestrator.resume();
    },

    async executeNextStep() {
      logger.info("service executeNextStep", logFields("executeNextStep"));
      return orchestrator.executeNextStep();
    },

    async cancelProvisioning(reason: string) {
      logger.info("service cancelProvisioning", logFields("cancelProvisioning"));
      return orchestrator.cancel(reason);
    },

    async rollbackProvisioning() {
      logger.info("service rollbackProvisioning", logFields("rollbackProvisioning"));
      return orchestrator.rollback();
    },
  };
}
