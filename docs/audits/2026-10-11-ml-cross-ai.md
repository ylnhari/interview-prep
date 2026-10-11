# Independent ML reviewer cross-audit of AI chapters — 11 October 2026

Reviewed the effective current course at baseline abd4b97ad27c9b2c95a8409a49b018fd9a5311fe plus the uncommitted late AI override. This reviewer did not write the AI override. All 71 lessons/practices across seven topics were read, including bodies, continuations, prompts, rubrics, model answers, formulas and embedded code. This is an independent second technical/editorial review of the AI owner’s work, not independent verification of every statement.

## Findings sent to coordinator

- A1, lie-0: define prefill as processing prompt context before generation, potentially in chunks or with cached-prefix reuse; the glossary currently requires one pass while lie-f7 correctly teaches chunked prefill. [vLLM chunked prefill](https://docs.vllm.ai/en/latest/configuration/optimization/).
- A2, raa-f6: prefix caching avoids recomputing prefix keys/values; suffix and decode queries still attend those cached keys/values. Replace the suffix-only full-attention claim. [Transformers cache explanation](https://huggingface.co/docs/transformers/en/cache_explanation).
- A3, lft-0: PPO-Clip removes an incentive in the clipped surrogate objective, without a hard constraint on policy distance. Monitoring/early stopping may still be needed. [Official Spinning Up PPO](https://spinningup.openai.com/en/latest/algorithms/ppo.html) explicitly documents this limitation.
- A4, gp-a2: cross-tenant leakage is severe, but “everything else ... is recoverable” is an unsupported universal claim. Incorrect decisions or advice may also have lasting consequences. Qualify the prioritization using concrete impact rather than guaranteed recoverability.

## Preservation and limits

A local VM evaluation loaded library.js first and every other core module in filename order. Snapshot immediately before zzzzzzzz-review-ai.js versus the final effective catalog: all 71 section IDs/order and every quiz/check object were identical. Original options, answers and saved-state mapping are preserved. This reviewer did not edit AI source. Existing agent, retrieval, NDCG and experiment examples were inspected; node engine/test_ai_audit.cjs, test_ai_learning.cjs and test_decision_audit.cjs passed in the shared checkout. The last test executes displayed reference Python and changed-constraint cases. No provider model calls, GPU benchmarks, browser visual/keyboard QA, video playback or exhaustive external-link HTTP sweep was performed here. The link reviewer owns destination availability; release coordinator owns live publication. Pass below means no additional evidenced correction in that section, not proof of complete correctness.

## Coverage of every section

### genai-platform

| ID | Reviewed subject | Result |
| --- | --- | --- |
| gp-0 | Key terms | Pass: no additional evidenced correction. |
| gp-f1 | The cost and latency controls, in order of impact | Pass: no additional evidenced correction. |
| gp-f2 | The four parts of a GenAI platform: catalog, router, guardrails, evaluation | Pass: no additional evidenced correction. |
| gp-f2b | Prompt engineering: the parts of a prompt, the techniques, and how a prompt is run in production | Pass: no additional evidenced correction. |
| gp-f3 | RAG on financial data: the guardrail questions that actually matter | Pass: no additional evidenced correction. |
| gp-f4 | Explain and diagnose AI mechanisms | Pass: no additional evidenced correction. |
| gp-structured-validation | Structured answers: format, permissions and evidence are separate checks | Pass: no additional evidenced correction. |
| gp-f5 | When not to use AI, preventing misuse, and the live-tool exercise | Pass: no additional evidenced correction. |
| gp-a3 | Explain and apply: "When would you not use AI for a problem?" | Pass: no additional evidenced correction. |
| gp-a4 | Explain and apply: three AI mechanisms | Pass: no additional evidenced correction. |
| gp-a2 | Exercise: guardrails for RAG on customer tax documents | A4: blanket recoverability assertion unsupported. |
| gp-a1 | Exercise: make an LLM feature ten times cheaper | Pass: no additional evidenced correction. |
| gp-structured-output-drill | Practical drill: validate a cited answer | Pass: no additional evidenced correction. |

### llm-inference-engineering

| ID | Reviewed subject | Result |
| --- | --- | --- |
| lie-0 | Key terms | A1: prefill one-pass definition conflicts with chunked prefill. |
| lie-f0 | What a token actually is, and why two texts of the same length cost different amounts | Pass: no additional evidenced correction. |
| lie-f1 | How a token is generated: prefill versus decode | Pass: no additional evidenced correction. |
| lie-f2 | The KV cache: the memory formula | Pass: no additional evidenced correction. |
| lie-f3 | Continuous batching | Pass: no additional evidenced correction. |
| lie-f4 | PagedAttention | Pass: no additional evidenced correction. |
| lie-f5 | FlashAttention: why it is faster | Pass: no additional evidenced correction. |
| lie-f6 | Quantization | Pass: no additional evidenced correction. |
| lie-f7 | Speculative decoding, chunked prefill, prefix caching, and disaggregation | Pass: no additional evidenced correction. |
| lie-f8 | Parallelism, mixture-of-experts routing, and serving runtimes | Pass: no additional evidenced correction. |
| lie-f9 | Measuring, cost, and observability | Pass: no additional evidenced correction. |
| lie-a1 | Exercise: compute a KV cache size | Pass: no additional evidenced correction. |
| lie-a2 | Exercise: diagnose degraded latency under load | Pass: no additional evidenced correction. |
| lie-a3 | Exercise: explain throughput versus goodput | Pass: no additional evidenced correction. |

### llm-fine-tuning-and-alignment

| ID | Reviewed subject | Result |
| --- | --- | --- |
| lft-0 | Key terms | A3: PPO clipping does not guarantee bounded policy update. |
| lft-f1 | When to fine-tune, when to prompt, when to retrieve | Pass: no additional evidenced correction. |
| lft-f2 | Full fine-tuning versus LoRA and QLoRA | Pass: no additional evidenced correction. |
| lft-f3 | Preparing data for fine-tuning | Pass: no additional evidenced correction. |
| lft-f4 | Training settings that actually matter | Pass: no additional evidenced correction. |
| lft-f5 | Evaluating a fine-tuned model | Pass: no additional evidenced correction. |
| lft-f6 | Alignment methods, in plain words | Pass: no additional evidenced correction. |
| lft-f7 | Deployment: merging, serving many adapters, and versioning | Pass: no additional evidenced correction. |
| lft-a1 | Exercise: choose fine-tune, prompt, or retrieve | Pass: no additional evidenced correction. |
| lft-a2 | Exercise: compute a LoRA parameter count | Pass: no additional evidenced correction. |
| lft-a3 | Exercise: explain DPO to a teammate who only knows supervised fine-tuning | Pass: no additional evidenced correction. |

### rag-and-agents

| ID | Reviewed subject | Result |
| --- | --- | --- |
| raa-0 | Key terms | Pass: no additional evidenced correction. |
| raa-f1 | When to use retrieval versus fine-tuning versus a longer prompt | Pass: no additional evidenced correction. |
| raa-f1a | A production RAG system has an offline path and an online path | Pass: no additional evidenced correction. |
| raa-f2 | Chunking: cutting documents into retrievable pieces | Pass: no additional evidenced correction. |
| raa-f3 | Embeddings and vector search: dense, sparse, hybrid, and reranking | Pass: no additional evidenced correction. |
| raa-f4 | Approximate nearest neighbour search: HNSW and IVF | Pass: no additional evidenced correction. |
| raa-f5 | Evaluating RAG: recall, faithfulness, and a golden set | Pass: no additional evidenced correction. |
| raa-f6 | How a model's memory works in practice | A2: cached prefix remains part of attention, despite claimed suffix-only full attention. |
| raa-v2-safe-agent-stopping | Agents: tools, planning, and stopping rules | Pass: no additional evidenced correction. |
| raa-agent-execution | Agent execution: checkpoint, approval, effect, reconciliation | Pass: no additional evidenced correction. |
| raa-f8 | Model routing: picking a model per request | Pass: no additional evidenced correction. |
| raa-f9 | Guardrails and safety | Pass: no additional evidenced correction. |
| raa-a1 | Exercise: design a RAG pipeline for a changing knowledge base | Pass: no additional evidenced correction. |
| raa-a4 | Exercise: draw a production RAG system for controlled documents | Pass: no additional evidenced correction. |
| raa-a2 | Exercise: work out a model-routing cost saving | Pass: no additional evidenced correction. |
| raa-a3 | Exercise: defend an agent against prompt injection | Pass: no additional evidenced correction. |
| raa-agent-resume-case | Ten-minute scenario: resume an approved write after a timeout | Pass: no additional evidenced correction. |

### enterprise-feature-platform

| ID | Reviewed subject | Result |
| --- | --- | --- |
| efp-0 | Key terms | Pass: no additional evidenced correction. |
| efp-stages | Evolve the platform; keep the contract visible | Pass: no additional evidenced correction. |
| efp-time | Two clocks are necessary; five timestamps explain the trace | Pass: no additional evidenced correction. |
| efp-isolation | Tenant identity is authority, not a request field | Pass: no additional evidenced correction. |
| efp-replay | Inject failure; preserve what the decision actually saw | Pass: no additional evidenced correction. |
| efp-a1 | Handover a feature platform after an injected failure | Pass: no additional evidenced correction. |

### recommendation-systems

| ID | Reviewed subject | Result |
| --- | --- | --- |
| rec-0 | Key terms | Pass: no additional evidenced correction. |
| rec-candidates | Trace the missing recommendation | Pass: no additional evidenced correction. |
| rec-ranking | Hold the ideal ranking fixed | Pass: no additional evidenced correction. |
| rec-release | An offline gain is a hypothesis | Pass: no additional evidenced correction. |
| rec-evaluation-artifact | Build a ranking release gate | Pass: no additional evidenced correction. |

### experimentation-and-causal-measurement

| ID | Reviewed subject | Result |
| --- | --- | --- |
| exp-0 | Key terms | Pass: no additional evidenced correction. |
| exp-contract | Randomize the right entity | Pass: no additional evidenced correction. |
| exp-diagnosis | Inject a misleading success | Pass: no additional evidenced correction. |
| exp-stop | A release rule before results | Pass: no additional evidenced correction. |
| exp-plan-artifact | Write the experiment contract | Pass: no additional evidenced correction. |
