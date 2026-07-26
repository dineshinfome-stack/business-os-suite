import { describe, it } from "vitest";
import { VALID_TENANT, createIntegrationHarness } from "@/lib/provisioning/integration/__tests__/harness";
describe("dbg", () => { it("runs", async () => {
  const h = createIntegrationHarness();
  await h.service.startProvisioning({ tenant: VALID_TENANT });
  for (let i=0;i<10 && h.store.job.state!=="completed";i++){
    const r = await h.service.executeNextStep();
    console.log(i, h.store.job.state, JSON.stringify(r));
  }
  console.log("journal", h.journal);
});});
