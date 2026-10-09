# Course accuracy review follow-up

Reviewed baseline: `7e04c28a2d53012523b61e8eaae1c3b31366b754` (PR 12).
The independent reviewer checked effective final-loaded `PREP_CORE`, not only raw source definitions. This release addresses its eleven concrete residual findings.

| Finding | Resolution target | Evidence |
|---|---|---|
| `lie-f2`: configured context versus occupied KV cache | Quiz specifies actual retained tokens, fixed full-attention architecture/precision/batch assumptions and allocation behavior. Raising a configured limit alone does not imply doubled occupied cache. | Effective-content regression on question, options and explanation. |
| `lie-f5`: FlashAttention memory explanation | Feedback names tiles and running statistics in fast memory; the full attention matrix is not materialized or kept wholly in SRAM. | Effective-content feedback assertion. |
| `rl-1`: unsupported industrial prevalence | Scenario-based choice between one-step contextual bandits and methods for delayed action-dependent outcomes. No hiring or industry-frequency claim. | Effective-content question/feedback assertions. |
| `cdr-a3`: standalone Python imports | Learner-visible snippet imports its own `exp` and `Random`; tests execute extracted source without adding imports. | Displayed sigmoid and training function execution. |
| `sq-1`: containment delayed until investigation | Assess observed/credible harm and choose compatible authorized containment in parallel with point-in-time reconstruction and evaluation. | Effective-content quiz/feedback assertions. |
| Inference glossary and Q4/Q7: unconditional bottlenecks | Workload-dependent prefill/decode wording in definitions, TPOT orientation and question prompts as well as answers. | Effective-loaded glossary/question assertions. |
| `tas-0`: GPU-wide instruction claim | SIMD/SIMT execution described in thread groups/warps. | Effective-loaded definition assertion. |
| `raa-0`: all sparse retrieval equated with exact words | Distinguish lexical BM25/analyzers from learned sparse representations; errors may overlap with dense retrieval. | Effective-loaded definition and assessment checks. |
| `tas-f7`: bitwise-equivalent optimization claim | Mathematically equivalent computation subject to floating-point reduction effects and validated numerical tolerances. | Effective-loaded quiz and feedback assertions. |
| `raa-f8`: detached 80/20 calculation | Self-contained illustrative one-shot routing calculation; escalation also pays for the first attempt. | Effective-loaded question/feedback arithmetic assertion. |

The six added consistency locations include two independent inference prompt copies (grouped in one row). They remain in the same bounded review batch.

Six semantic quiz changes (`lie-f2`, `raa-0`, `tas-f7`, `raa-f8`, `rl-1`, `sq-1`) receive the fresh `audit-review-2026-10-09` answer version and exact deployed-baseline/candidate hashes. Historical choices and completion remain recorded; explanation-only corrections do not reinterpret numeric answer choices. No private packs, credentials, Space content or progress are included.

Resource links are retained. The three Cloudflare links returned 403 to the cookie-free HTTP checker on 2026-10-09; separate public-web access succeeded in the parent review. The stored response statuses describe that checker result, not a claim that the URLs are dead. Playback, every linked login requirement and external compute remain outside the reachability check.

## Test scope

The displayed attention reference is a small two-dimensional CPU implementation. Its mask tests and synthetic packed-sequence perturbation demonstrate the reference's mathematical behavior. They do not validate Hugging Face trainer boundaries, attention backends or GPU kernels. Hardware-dependent memory, numerical tolerance, throughput and adapter-quality conclusions still require experiments on the selected implementation. No GPU or kernel verification is claimed by the fixture suite.

Rendered follow-up QA in Codex/IAB opened the corrected KV assessment and confirmed its actual-retained-token assumptions and shuffled displayed options. Browser session IDs changed after the initial release; the current inventory was used to recover the supported IAB surface. No private Space retry was made.
