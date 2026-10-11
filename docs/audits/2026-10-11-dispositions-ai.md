# AI findings dispositions, 2026-10-11

Effective content loaded in build order, including the late AI correction module. No section IDs, quiz questions, options or answer indices changed by this module. `node engine/test_review_ai.cjs` passes and compares all retained route and complete quiz objects before and after it.

| Finding | Disposition | Effective anchor and evidence |
| --- | --- | --- |
| PT09 | Accepted and fixed | `llm-inference-engineering/lie-a3` model and rubric now separate good requests per second from attainment fraction and latency distributions. The worked counterexample is 100 requests/s at 99% = 99 good/s and 1 miss/s versus 200 at 90% = 180 good/s and 20 misses/s. The regression test independently checks that goodput rises while attainment falls and misses rise, and checks the model/rubric wording. `lie-f9` quiz is owned by the parent quiz reviewer. |
| PT11 | Accepted and fixed | `llm-fine-tuning-and-alignment` topic glossary PPO row now distinguishes PPO-Clip, PPO-Penalty divergence from the previous policy, and a separate RLHF penalty from a fixed reference policy; objective penalties do not guarantee a hard distance bound. `lft-0` retains its corrected PPO-Clip definition and optional KL monitoring/early stopping. Regression assertions check both effective surfaces. |
| Cross-review: prefill | Accepted and fixed, reverified | `llm-inference-engineering/lie-0` defines prompt processing without promising one pass; explicitly permits multiple scheduled chunks. Existing regression excludes the original one-pass promise. |
| Cross-review: prefix caching | Accepted and fixed, reverified | `rag-and-agents/raa-f6` explicitly retains attention from new suffix/decode queries to cached prefix keys and values. Existing regression checks this dependency. |
| Cross-review: recoverability | Accepted and fixed, reverified | `genai-platform/gp-a2` no longer declares every other guardrail failure recoverable; defines per-failure severity, stop criteria and remediation. Existing regression excludes the blanket claim. |

PT09 follows directly from the declared counting units and arithmetic; reduced attainment alone cannot determine an absolute successful-request rate. Compare equivalent eligibility and SLO contracts when reporting the rate. PT11 is supported by [OpenAI Spinning Up PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html), which explains the separate variants and the absence of a hard constraint in PPO-Clip; the distinction between policy-update clipping and fixed-reference RLHF regularization also follows [InstructGPT](https://arxiv.org/abs/2203.02155).

No findings above were rejected or deferred. This disposition verifies content and regression behavior, not browser pixels, production inference benchmarks or deployment. No commit or publication was performed by this reviewer.
