/* Lesson-specific teaching destinations; preserve substantive local explanations and demos. */
(function (root) {
  var topics = root.PREP_CORE;
  function lesson(id) { for (var topic of Object.values(topics)) { var found = topic.learn.find(function (s) { return s.id === id; }); if (found) return found; } throw new Error("Missing mapped lesson: " + id); }
  var links = {
  "raa-f1a": [
    [
      "Build a RAG pipeline in Python: Hugging Face walkthrough",
      "https://huggingface.co/learn/cookbook/en/advanced_rag"
    ]
  ],
  "raa-f2": [
    [
      "Contextualized chunks: worked retrieval example",
      "https://www.anthropic.com/engineering/contextual-retrieval"
    ]
  ],
  "raa-f3": [
    [
      "Reciprocal rank fusion: five-document worked example",
      "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion"
    ],
    [
      "Reranking a retrieved shortlist: contextual retrieval sequence",
      "https://www.anthropic.com/engineering/contextual-retrieval"
    ]
  ],
  "raa-f4": [
    [
      "HNSW: graph construction and search parameters",
      "https://www.pinecone.io/learn/series/faiss/hnsw/"
    ]
  ],
  "raa-f6": [
    [
      "Context windows and agent memory: context engineering",
      "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
    ]
  ],
  "raa-v2-safe-agent-stopping": [
    [
      "Agent workflows, autonomy and stopping: architecture teaching",
      "https://www.anthropic.com/engineering/building-effective-agents"
    ]
  ],
  "raa-f8": [
    [
      "Model routing: architecture and routing workflows",
      "https://www.anthropic.com/engineering/building-effective-agents"
    ]
  ],
  "raa-agent-execution": [
    [
      "Agent replay and side effects: Python Functional API examples",
      "https://docs.langchain.com/oss/python/langgraph/functional-api"
    ]
  ],
  "raa-f9": [
    [
      "Prompt injection: concrete attack scenarios and mitigations",
      "https://genai.owasp.org/llmrisk/llm01-prompt-injection/"
    ]
  ],
  "lie-f0": [
    [
      "Byte-pair encoding: worked training and Python tokenization",
      "https://huggingface.co/learn/llm-course/en/chapter6/5"
    ]
  ],
  "lie-f1": [
    [
      "Prefill, decoding and key-value caching",
      "https://huggingface.co/docs/transformers/en/llm_tutorial_optimization"
    ]
  ],
  "lie-f2": [
    [
      "Key-value cache: repeated decoding and memory",
      "https://huggingface.co/docs/transformers/en/llm_tutorial_optimization"
    ]
  ],
  "lie-f3": [
    [
      "Continuous batching: request scheduling",
      "https://www.anyscale.com/blog/continuous-batching-llm-inference"
    ]
  ],
  "lie-f4": [
    [
      "PagedAttention: KV block allocation",
      "https://vllm.ai/blog/2023-06-20-vllm"
    ]
  ],
  "lie-f5": [
    [
      "FlashAttention: attention implementation and optimization",
      "https://huggingface.co/docs/transformers/en/llm_tutorial_optimization"
    ]
  ],
  "lie-f6": [
    [
      "8-bit quantization: bitsandbytes integration",
      "https://huggingface.co/blog/hf-bitsandbytes-integration"
    ]
  ],
  "lie-f7": [
    [
      "Speculative decoding: draft and verify",
      "https://huggingface.co/blog/assisted-generation"
    ],
    [
      "Chunked prefill: vLLM tuning",
      "https://docs.vllm.ai/en/latest/configuration/optimization/"
    ]
  ],
  "lft-f2": [
    [
      "LoRA: low-rank adapters and frozen base weights",
      "https://huggingface.co/docs/peft/main/en/conceptual_guides/lora"
    ]
  ],
  "lft-f3": [
    [
      "Format conversations with chat templates",
      "https://huggingface.co/docs/transformers/en/chat_templating"
    ],
    [
      "Supervised fine-tuning: data formatting, masking and loss",
      "https://huggingface.co/docs/trl/en/sft_trainer"
    ]
  ],
  "lft-f4": [
    [
      "Supervised fine-tuning: trainer settings",
      "https://huggingface.co/docs/trl/en/sft_trainer"
    ]
  ],
  "lft-f5": [
    [
      "Evaluating a fine-tuned language model",
      "https://huggingface.co/learn/llm-course/en/chapter11/5"
    ]
  ],
  "lft-f6": [
    [
      "Reinforcement learning from generated responses",
      "https://huggingface.co/learn/llm-course/en/chapter12/2"
    ],
    [
      "Direct preference optimization: preferred and rejected responses",
      "https://huggingface.co/docs/trl/en/dpo_trainer"
    ]
  ],
  "lft-f7": [
    [
      "Serve LoRA adapters with vLLM",
      "https://docs.vllm.ai/en/latest/features/lora/"
    ]
  ],
  "dle-f7": [
    [
      "Attention in the original encoder-decoder Transformer: illustrated teaching",
      "https://jalammar.github.io/illustrated-transformer/"
    ]
  ],
  "dle-f8": [
    [
      "Original encoder-decoder Transformer: illustrated architecture",
      "https://jalammar.github.io/illustrated-transformer/"
    ]
  ]
};
  Object.keys(links).forEach(function (id) {
    var section = lesson(id);
    var primary = "<p>" + links[id].map(function (r) { return '<a href="' + r[1] + '">' + r[0] + "</a>"; }).join("; ") + ".</p>";
    if (id === "raa-f3") section.body = section.body.replace("<p><b>Dense retrieval</b>", primary + "<p><b>Dense retrieval</b>");
    else {
      links[id].forEach(function (r) {
        section.body = section.body.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, function (anchor, url, label) { return url === r[1] ? label : anchor; });
      });
      section.body = id === "raa-f2" ? section.body + primary : primary + section.body;
    }
  });
  var alignment = lesson("lft-f6");
  var rag = topics['rag-and-agents'];
  var reranking = {
    id: 'raa-reranking', part: 'field', title: 'Reranking: from retrieved candidates to generation context',
    body: `<p><a href="https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html">Retrieve &amp; Re-Rank: bi-encoder, cross-encoder and worked implementation</a> teaches the complete pipeline with a diagram and code.</p>
<p>First-stage retrieval cheaply finds a candidate set. A <b>cross-encoder reranker</b> reads the query and each candidate passage together, scores those pairs and reorders the candidates. The top selected passages then enter the generation context. Unlike separately computed query and document embeddings, each cross-encoder score depends on reading that pair jointly.</p>
<p><b>Synthetic ordering example.</b> For <code>reset password</code>, first-stage retrieval returns C1: password policy, C2: reset steps, C3: billing help. A reranker might reorder those same candidates as C2, C1, C3, putting the reset instructions first. This illustrates ordering, not a measured result or a guaranteed ranking.</p>
<p>Reranker scores are not automatically calibrated probabilities. Scoring more candidates or longer passages costs latency; measure the trade-off on actual queries. A reranker cannot recover evidence the first stage never retrieved. If reset instructions are missing from the candidate set, changing their order cannot supply them.</p>
<p><a href="https://www.anthropic.com/engineering/contextual-retrieval">Contextual Retrieval: reranking after combined retrieval</a> shows the broader retrieval pattern.</p>`,
    deeper: null, check: null
  };
  rag.learn.splice(rag.learn.findIndex(function (s) { return s.id === 'raa-f3'; }) + 1, 0, reranking);
  rag.learn.push({
    id: 'raa-production-cases', part: 'field', title: 'Production RAG case studies',
    body: `<p>Read these three engineering reports to compare how deployed systems ingest changes, select evidence and enforce source permissions. They describe actual deployments, not publicly reproducible implementations or proposed reference stacks.</p>
<h2>Notion: update text and permissions separately</h2>
<p><a href="https://www.notion.com/blog/two-years-of-vector-search-at-notion">Notion's February 2026 vector-search engineering report</a> names turbopuffer, Kafka, Spark, Airflow, DynamoDB and Ray on Anyscale. Batch ingestion onboards existing documents; Kafka edits keep active workspaces fresh. The report describes sub-minute indexing updates and a migration through index generations to independent namespaces, validating correctness before each cutover.</p>
<p>Text edits require new embeddings for changed spans; permission or metadata changes can update metadata without recomputing unchanged embeddings. Separate text and metadata hashes, recorded in DynamoDB span state, let the pipeline choose the work needed. Ray consolidates preprocessing and embedding inference and serves query embeddings. The operating lesson is to distinguish content changes from authorization changes and validate a re-index migration. The report does not establish deletion guarantees, fusion or reranking details.</p>
<h2>Dropbox Dash: retrieve, then chunk and rank</h2>
<p><a href="https://dropbox.tech/machine-learning/building-dash-rag-multi-step-ai-agents-business-users">Dropbox's Dash RAG and agent report</a> describes lexical retrieval, embedding-based ranking features, query-time chunking and ranking the resulting chunks. Periodic synchronization and webhooks keep connected content current. Retrieval relevance and the generated answer are evaluated separately, so a bad answer does not automatically identify which stage failed.</p>
<p>The operating lesson is to track freshness and evidence selection before measuring answer quality. The underlying search/vector database is not disclosed, and the embedding-ranking description does not identify a specific cross-encoder. <a href="https://dropbox.tech/machine-learning/llm-human-labeling-improving-search-relevance-dropbox-dash">The relevance-model follow-up</a> explains human-calibrated offline labels and efficient online relevance models.</p>
<h2>Slack: federate source search instead of copying every index</h2>
<p><a href="https://slack.engineering/how-we-built-enterprise-search-to-be-secure-and-private/">Slack's secure enterprise-search report</a> describes federating external providers' search APIs using user OAuth and source permissions, rather than building a copied external-data index. A production retrieval system therefore need not operate its own vector database for every connected source.</p>
<p>This preserves the source's permission boundary but depends on the provider's search availability and capabilities. Slack's client can cache results between reloads; federation does not mean zero caching. The report does not disclose current vector-database or reranking internals. Study the disclosed permission and dependency trade-off without filling those gaps with an older search stack.</p>`,
    deeper: null, check: null
  });
  lesson('raa-f3').body = lesson('raa-f3').body.replace('<b>reranking</b> scores a retrieved shortlist again.', '<a href="#rag-and-agents/raa-reranking"><b>Reranking</b></a> scores a retrieved shortlist again; follow the dedicated lesson for the stages and implementation.');
  rag.learn.push({
    id: 'raa-pgvector-operations', part: 'field', title: 'Production RAG study path: PostgreSQL and pgvector',
    body: `<p>This is an implementation study path, separate from the <a href="#rag-and-agents/raa-production-cases">deployed-system reports</a>. <a href="https://github.com/pgvector/pgvector">pgvector's implementation and operations guide</a> teaches SQL insertion, upsert and deletion, exact search, HNSW/IVFFlat indexes, filtering and query-plan inspection.</p>
<p>Follow a password-reset document through an edit: identify its current chunk rows, build the replacement version and retire chunks that no longer belong to that version after validating the replacement. If an old two-chunk document shrinks to one chunk, updating only the first row leaves the obsolete second chunk searchable. Use stable source and chunk identifiers plus content/index versions so an edit replaces the intended rows and a deletion removes obsolete chunks. Permission-only changes still need metadata propagation even when the text and embedding stay unchanged. Study recall comparison, vacuum and monitoring in the guide before choosing approximate search settings. A metadata predicate narrows retrieval; it is not a complete authorization system.</p>
<p><a href="https://www.postgresql.org/docs/current/ddl-rowsecurity.html">PostgreSQL row security</a> explains database-side access policies, including which roles and operations they cover. <a href="https://www.postgresql.org/docs/current/backup.html">PostgreSQL backup and restore</a> teaches recovery procedures. Authorization still belongs to the complete request, cache and source-version contract, and a backup is useful only with a working restore procedure.</p>`,
    deeper: null, check: null
  });
  rag.learn.push({
    id: 'raa-qdrant-operations', part: 'field', title: 'Production RAG study path: Qdrant and Python',
    body: `<p><a href="https://qdrant.tech/documentation/tutorials-basics/reranking-hybrid-search/">Build hybrid retrieval and reranking with Qdrant, Python and FastEmbed</a>. This is a reference implementation to study, not a claim that the <a href="#rag-and-agents/raa-production-cases">reported production systems</a> use this stack.</p>
<p><a href="https://qdrant.tech/documentation/tutorials-operations/embedding-model-migration/">Migrate an embedding model</a> follows a concrete sequence: create a new collection, dual-write changes, re-embed historical content, compare retrieval quality, then switch the collection alias together with the query embedding model. Preserve the previous path for rollback while observing the new one; switching only the query model can mix incompatible embeddings.</p>
<p><a href="https://qdrant.tech/documentation/search-evaluation/retrieval-relevance/">Measure retrieval relevance</a> explains how to compare the candidate configurations. <a href="https://qdrant.tech/documentation/tutorials-operations/incremental-embedding-updates/">Incremental embedding updates</a> addresses changed content without treating each edit as a full rebuild.</p>
<p><a href="https://qdrant.tech/documentation/tutorials-operations/create-snapshot/">Snapshots and recovery</a> covers the persistence procedure; <a href="https://qdrant.tech/documentation/tutorials-operations/secure-qdrant/">secure Qdrant</a> covers deployment protection. Database access controls and payload filtering do not replace authorization against the current source permissions.</p>`,
    deeper: null, check: null
  });
  rag.learn.push({
    id: 'raa-elasticsearch-operations', part: 'field', title: 'Production RAG study path: Elasticsearch hybrid search',
    body: `<p>For an existing lexical-search stack, <a href="https://www.elastic.co/docs/solutions/search/hybrid-semantic-text">Elasticsearch's hybrid semantic-text walkthrough</a> connects lexical and semantic retrieval. Compare BM25, semantic-only and hybrid configurations on representative queries, filters, quality and latency; combining methods does not automatically improve every workload.</p>
<p><a href="https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reindex-indices">Reindex into a new index</a> teaches rebuilding indexed data. <a href="https://www.elastic.co/docs/manage-data/data-store/aliases">Index aliases</a> teaches how applications can switch destinations without hard-coding the physical index name. Keep writes, source versions and permission updates consistent during migration, and retain an appropriate rollback path.</p>
<p>This is implementation learning, not a disclosed stack for Dropbox or Slack. Documentation is publicly readable; managed inference and some access-control capabilities may require a paid deployment. Study the actual deployment's authorization and recovery procedures before serving protected evidence.</p>`,
    deeper: null, check: null
  });
  lesson('raa-production-cases').body += '<p>For implementation and operations, follow the separate <a href="#rag-and-agents/raa-pgvector-operations">PostgreSQL/pgvector</a>, <a href="#rag-and-agents/raa-qdrant-operations">Qdrant/Python</a> or <a href="#rag-and-agents/raa-elasticsearch-operations">Elasticsearch</a> study path. These reference paths are not claims about the companies\' undisclosed systems.</p>';
  lesson('raa-f5').body = '<p><a href="https://docs.ragas.io/en/latest/getstarted/rag_eval/">Ragas: worked RAG evaluation</a> and <a href="https://arize.com/docs/phoenix/tracing">Phoenix: tracing a request</a> address different evidence. Measure retrieval relevance, answer support and latency separately; traces locate the stages consuming time. Human spot checks help calibrate model-judge results. Record the retrieved chunk IDs, source and index versions, embedding model and reranker version with the request trace. If an answer cites obsolete reset steps, those records distinguish a stale indexed chunk from a fresh chunk that was ranked poorly or ignored during generation.</p>' + lesson('raa-f5').body;
  alignment.body = "<p>Supervised fine-tuning learns from desired responses. Preference training compares preferred and rejected responses. Reinforcement learning updates a policy from scored generated responses. These are different training approaches; DPO is one preference method, and reward-guided training is not limited to PPO.</p>" + alignment.body;
  var evaluation = lesson("raa-f5"), execution = lesson("raa-agent-execution");
  var agentEvaluation = (evaluation.deeper || "").match(/<p><b>Agent outcomes[\s\S]*?<\/p>/);
  if (!agentEvaluation) throw new Error("Missing agent evaluation paragraph");
  evaluation.deeper = evaluation.deeper.replace(agentEvaluation[0], "");
  execution.deeper = (execution.deeper || "") + agentEvaluation[0];
  topics["rag-and-agents"].readings = (topics["rag-and-agents"].readings || []).filter(function (r) { return r.u !== "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"; });
}(window));
