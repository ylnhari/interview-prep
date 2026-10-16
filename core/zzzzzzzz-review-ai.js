/* Evidence-backed AI teaching corrections; retained routes and quiz mappings. */
(function(root){
  'use strict';
  var retrieval = root.PREP_CORE['rag-and-agents'];
  var sparseLesson = retrieval.learn.find(function (s) { return s.id === 'raa-f3'; });
  sparseLesson.body = `<p>Start with keyword search for <code>reset password</code>. An <b>inverted index</b> maps each indexed term to the documents containing it: <code>reset → documents 2, 7</code>, <code>password → documents 2, 5, 7</code>. Those lists identify candidates without rereading every document.</p>
<p><b>Sparse</b> describes a representation with mostly zero entries. For an illustrative vocabulary of 100,000 words and a document using 300 distinct terms, imagine one slot per vocabulary word: only 300 slots need a nonzero value. A real index stores the relevant terms and document lists, not a huge array of all those zero slots.</p>
<p><b>BM25</b> ranks lexical matches using how rare a term is across the collection, how often it occurs in the document with diminishing returns, and document length. See the <a href="#search-and-retrieval/sr-f2">worked BM25 formula</a>.</p>
<p>An <b>analyzer</b> processes text into terms. It splits text and may lowercase or stem it; configured rules determine whether <code>resetting</code> and <code>reset</code> match. <a href="https://www.elastic.co/docs/solutions/search/full-text/how-full-text-works">Elastic explains the index, BM25 and analyzer pipeline</a>.</p>
<p><b>Learned sparse models</b> learn term weights and may expand text with related terms, allowing matches beyond the original wording. Sparse does not mean lexical-only retrieval. <a href="https://www.elastic.co/search-labs/blog/lexical-and-semantic-search-with-elasticsearch">Elastic compares lexical search with learned sparse semantic search</a>.</p>
<p><b>Dense retrieval</b> compares learned embeddings. <b>Hybrid retrieval</b> combines sparse and dense rankings; <b>reranking</b> scores a retrieved shortlist again. Their failure sets can overlap. Compare these alternatives against simple baselines on actual query slices rather than assuming hybrid always wins.</p>`;
  var retrievalTerms = retrieval.learn.find(function (s) { return s.id === 'raa-0'; });
  retrievalTerms.body = retrievalTerms.body.replace(/<li><b>Sparse retrieval<\/b>[\s\S]*?<\/li>/, '<li><b>Sparse retrieval</b> - search using term representations with mostly zero entries. BM25 is a lexical sparse method; learned sparse models also exist. <a href="#rag-and-agents/raa-f3">Follow a keyword query through the index, ranking and analyzers</a>.</li>');
  var core=root.PREP_CORE;
  function lesson(topic,id){return core[topic].learn.find(function(s){return s.id===id;});}
  lesson('genai-platform','gp-0').body=lesson('genai-platform','gp-0').body.replace('<p>Enough to be precise, no more. Depth beyond this is not what this round is testing.</p>', '');
  core['genai-platform'].activities.find(function(a){return a.id==='gp-a4';}).title='Explain and apply: three AI mechanisms';
  lesson('rag-and-agents','raa-0').deeper='<p>Compare prompt-only, retrieval and adapted-model baselines on the same tasks. Include one-time preparation and training plus recurring retrieval, serving, token and maintenance costs under the same quality and latency targets. A longer prompt, an index or an adapter can each be the economical choice for a particular workload; there is no universal cost ordering.</p>';
  var chunks=lesson('rag-and-agents','raa-f2');
  var pdfContext = chunks.body.slice(chunks.body.indexOf("<p><b>What breaks with PDFs</b>"));
  chunks.body = `<p>A travel policy says: <b>Meals:</b> Dinner reimbursable up to $40. For overnight travel, the limit is $60. <b>Taxis:</b> Airport taxis require a receipt. The question is: <em>What is the dinner limit during overnight travel?</em> Cutting between the Meals sentences can return the $40 rule without its qualification, or the $60 sentence without its subject. Keeping the Meals heading and both sentences gives the answer evidence: $60 for overnight dinner. This is an illustrative example, not a measured retrieval ranking.</p>
<p><b>Chunking</b> cuts a document into retrievable pieces. Separate three choices: <b>where to cut</b> the text, <b>what to embed</b> into a searchable vector, and <b>what context to return</b> to the answer model. A heading can be stored as metadata yet absent from the embedded text or returned passage; explicitly construct both representations rather than assuming metadata is used.</p>
<p>The lab above runs every strategy below on one larger, five-section policy, in the same order and with the same numbers. Each strategy changes a different one of those three choices:</p>
<div class="tw"><table><thead><tr><th>Strategy</th><th>Where to cut</th><th>What is embedded</th><th>What the model reads</th><th>Main extra cost</th></tr></thead><tbody>
<tr><td>1. Fixed-token windows</td><td>Every N tokens</td><td>Chunk text</td><td>The chunk</td><td>None</td></tr>
<tr><td>2. Recursive splitting</td><td>Largest separator that fits</td><td>Chunk text</td><td>The chunk</td><td>None</td></tr>
<tr><td>3. Sentence or paragraph splitting</td><td>Each sentence or paragraph</td><td>Chunk text</td><td>The chunk</td><td>None</td></tr>
<tr><td>4. Structure-aware splitting</td><td>Headings, clauses, tables</td><td>Chunk text, optionally with its heading path</td><td>The chunk</td><td>A parser for the format</td></tr>
<tr><td>5. Semantic splitting</td><td>Where neighbouring sentences stop being similar</td><td>Chunk text</td><td>The chunk</td><td>One embedding per sentence</td></tr>
<tr><td>6. Parent-child retrieval</td><td>Small children inside larger parents</td><td>Child text</td><td>The whole parent</td><td>Storage and a longer prompt</td></tr>
<tr><td>7. Late chunking</td><td>Any boundaries</td><td>Chunk span, encoded with the whole document</td><td>The chunk</td><td>A long-context embedding model</td></tr>
<tr><td>8. Contextual retrieval</td><td>Any boundaries</td><td>A model-written note plus the chunk</td><td>The chunk</td><td>One model call per chunk</td></tr>
<tr><td>9. Proposition chunking</td><td>One fact per piece</td><td>A rewritten fact</td><td>The fact, linked to its source</td><td>Model rewriting and checking</td></tr>
</tbody></table></div>
<h2 class="cs-g">Choose boundaries for the document</h2>
<h3 class="cs-h">1. Fixed-token windows</h3>
<ul class="cs-facts">
<li><b>How it cuts:</b> count tokens and cut every N, wherever that lands. Fixed-character windows do not ensure a token budget. Count the final embedded text with the embedding model's tokenizer, including added headings and context.</li>
<li><b>In the lab:</b> red scissors mark cuts that land inside a sentence or a table row. The business-class rule and its approval sentence end up in different chunks.</li>
<li><b>Use it when:</b> you need a cheap, reproducible baseline for uniform text and strict input limits.</li>
<li><b>Watch for:</b> split sentences, split table rows, and pronouns cut off from what they refer to.</li>
<li><b>Tools:</b> <a href="https://docs.langchain.com/oss/python/integrations/splitters/split_by_token">LangChain's token splitting examples</a> show token-aware recursive splitting as well as direct token splitting; direct TokenTextSplitter can break some Unicode character boundaries.</li>
</ul>
<h3 class="cs-h">Overlap: an add-on, not a strategy</h3>
<ul class="cs-facts">
<li><b>How it works:</b> each window starts a few tokens before the previous one ended, so the text around a cut appears in both chunks. It is usually paired with fixed-size or recursive splitting.</li>
<li><b>In the lab:</b> hatched words are the repeated ones. Raise the overlap slider and watch a split sentence become whole in the next chunk.</li>
<li><b>Watch for:</b> overlap can reduce boundary loss, but longer ideas, tables or dependencies can still cross both boundaries. More overlap duplicates ingestion, storage and retrieved evidence and may crowd out different passages. Compare overlap with heading-aware or parent expansion on the same questions, not as a completeness guarantee.</li>
</ul>
<h3 class="cs-h">2. Recursive splitting</h3>
<ul class="cs-facts">
<li><b>How it cuts:</b> try paragraph boundaries first, then smaller separators until the pieces fit the limit; small neighbours can then be merged back up to the limit.</li>
<li><b>In the lab:</b> no cut lands inside a sentence, but at the default limit "That limit rises to 60 USD on overnight trips" still lands in a different chunk from the dinner rule it qualifies.</li>
<li><b>Use it when:</b> you need a sensible starting point for general prose.</li>
<li><b>Watch for:</b> LangChain's default splitter measures characters and tries separators; it is not a sentence parser. Configure token-aware sizing when needed. A merge can also join the end of one section to the start of the next.</li>
<li><b>Tools:</b> <a href="https://docs.langchain.com/oss/python/integrations/splitters/recursive_text_splitter">The worked recursive splitter</a> shows the separator and overlap settings.</li>
</ul>
<h3 class="cs-h">3. Sentence or paragraph splitting</h3>
<ul class="cs-facts">
<li><b>How it cuts:</b> one chunk per sentence or paragraph, so every chunk is a complete statement.</li>
<li><b>In the lab:</b> every chunk is a whole sentence, yet "It", "That" and "They" lose what they refer to, and the Mumbai table row loses its header row.</li>
<li><b>Use it when:</b> the text is prose with natural units, or as the small child level of parent-child retrieval.</li>
<li><b>Watch for:</b> a complete sentence can still depend on an earlier definition, pronoun or exception: the policy's second Meals sentence does not name dinner. Sentence-aware boundaries alone do not ensure self-contained evidence.</li>
<li><b>Tools:</b> <a href="https://developers.llamaindex.ai/python/framework/module_guides/loading/node_parsers/modules/">LlamaIndex's sentence and sentence-window parsers</a> show these units; returning neighboring sentences requires the corresponding retrieval/postprocessing step.</li>
</ul>
<h3 class="cs-h">4. Structure-aware splitting</h3>
<ul class="cs-facts">
<li><b>How it cuts:</b> follow headings, numbered policy clauses, tables or other meaningful sections. For the short policy at the top, start with one Meals chunk containing the heading and both rules, separate from Taxis.</li>
<li><b>In the lab:</b> the meal table always stays in one chunk, and each chunk carries its heading path, shown in green because it is text that was not in the chunk before. A long section is still split by sentence, so a pronoun can still be separated from what it refers to.</li>
<li><b>Use it when:</b> the document has real structure: Markdown, HTML, policies, contracts, code or parsed PDFs.</li>
<li><b>Watch for:</b> <a href="https://docs.langchain.com/oss/python/integrations/splitters/markdown_header_metadata_splitter">Markdown header splitting</a> retains the heading hierarchy in metadata; decide which headings to include in the actual text.</li>
<li><b>Tools for code:</b> functions and classes are useful units. <a href="https://docs.langchain.com/oss/python/integrations/splitters/code_splitter">LangChain's code splitter</a> uses language-specific separators, while <a href="https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/node_parser/text/code.py">LlamaIndex CodeSplitter</a> uses tree-sitter to parse syntax.</li>
<li><b>Tools for HTML, PDFs and tables:</b> <a href="https://docs.langchain.com/oss/python/integrations/splitters/split_html">HTML semantic-preserving splitting</a> can keep structures intact even when that exceeds the requested size; revalidate tokens. <a href="https://docs.unstructured.io/open-source/core-functionality/chunking">Unstructured combines partitioned document elements</a> and keeps tables separate from prose. Oversized tables can become TableChunks, and its size limits are characters. Preserve headers and row/column meaning, then test the questions the table must answer.</li>
</ul>
<h3 class="cs-h">5. Semantic splitting</h3>
<ul class="cs-facts">
<li><b>How it cuts:</b> embed each sentence, compare it with its neighbour, and start a new chunk where the similarity falls below a threshold.</li>
<li><b>In the lab:</b> the bar chart shows each similarity against the threshold line. At 0.50 the overnight sentence (0.46) is cut away from the dinner rule; lower the threshold to 0.45 and they join. The similarities are hand-written stand-ins for embedding output.</li>
<li><b>Use it when:</b> mixed-topic prose has no useful markup.</li>
<li><b>Watch for:</b> extra embedding cost and variable sizes; a qualification can still be separated from its rule. Thresholds need evaluation. It does not guarantee intact meaning or a universally best chunk size.</li>
<li><b>Tools:</b> <a href="https://developers.llamaindex.ai/python/framework/module_guides/loading/node_parsers/modules/">LlamaIndex's semantic splitter</a>; its default sentence regex primarily suits English.</li>
</ul>
<h2 class="cs-g">Retrieve a small piece, return enough context</h2>
<h3 class="cs-h">6. Parent-child retrieval</h3>
<ul class="cs-facts">
<li><b>How it works:</b> a context strategy combined with a splitter, not another boundary algorithm. Index small child pieces for matching, retain their parent IDs, then expand a retrieved child to the appropriate larger parent before generation.</li>
<li><b>In the lab:</b> each section is drawn as a parent box. A child containing the overnight sentence expands to the Meals parent, supplying both dinner and the 60 USD exception, so every lab question is answered.</li>
<li><b>Use it when:</b> small pieces match precisely but are too thin to answer from.</li>
<li><b>Watch for:</b> budget the returned parent text; do not indiscriminately expand every hit. <a href="https://developers.llamaindex.ai/python/framework/module_guides/loading/node_parsers/modules/">Hierarchical node parsing</a> creates linked sizes, but retrieval must actually follow those links.</li>
</ul>
<h2 class="cs-g">When a chunk loses its subject</h2>
<p>A piece such as "They must be recorded within 30 days" can be retrieved and still not say what "they" are. The next three indexing-time techniques address this, at increasing cost. Try them only when measured failures come from chunks that lost their subject.</p>
<h3 class="cs-h">7. Late chunking</h3>
<ul class="cs-facts">
<li><b>How it works:</b> run the whole document, up to the embedding model's own context limit, through a long-context embedding model, then average the per-token vectors inside each chunk's span, so the chunk vector reflects the surrounding text (<a href="https://arxiv.org/abs/2409.04701">Günther et al., 2024</a>).</li>
<li><b>In the lab:</b> the boundaries and text are the same as recursive splitting; only the blue "vector also reflects" box is new. The approval sentence's vector was computed while the model could see the business-class sentence.</li>
<li><b>Use it when:</b> chunks lose their subject and you can run a long-context embedding model that exposes per-token outputs.</li>
<li><b>Watch for:</b> the text returned to the model is unchanged, so the model may still not know what "It" means.</li>
</ul>
<h3 class="cs-h">8. Contextual retrieval</h3>
<ul class="cs-facts">
<li><b>How it works:</b> ask a language model, once per chunk, to write a short note placing the chunk in its document, and add it before both embedding and keyword indexing.</li>
<li><b>In the lab:</b> the green note in front of each chunk is new text that was never in the document; the notes are hand-written stand-ins for model output.</li>
<li><b>Evidence:</b> <a href="https://www.anthropic.com/engineering/contextual-retrieval">Anthropic's published version</a> produces notes of about 50 to 100 tokens and reported 49% fewer top-20 retrieval failures on its benchmarks, or 67% with reranking.</li>
<li><b>Watch for:</b> one model call per chunk, reduced by caching the document as a prompt prefix; notes must be regenerated when the document changes.</li>
</ul>
<h3 class="cs-h">9. Proposition chunking</h3>
<ul class="cs-facts">
<li><b>How it works:</b> rewrite text into short, self-contained facts with pronouns resolved (<a href="https://arxiv.org/abs/2312.06648">Chen et al., 2023</a>).</li>
<li><b>In the lab:</b> struck red words were removed and green words were inserted: "It needs written approval" becomes "Business class needs written approval", and each table row becomes a full sentence.</li>
<li><b>Use it when:</b> questions target single facts and precision matters more than ingestion cost.</li>
<li><b>Watch for:</b> retrieval becomes precise, but ingestion is expensive and every rewrite must be checked against its source.</li>
</ul>
<h2 class="cs-g">Keep evidence current and measure the choice</h2>
<p>Retain source/document, chunk, parent and version identifiers plus citation locations. When the Meals policy changes, rebuild the affected pieces and retire obsolete chunks after validating the replacement; a changed boundary can leave old chunk IDs searchable if an update only overwrites new rows. Permission changes must propagate even when text is unchanged. See the <a href="#rag-and-agents/raa-pgvector-operations">document-update example</a> and <a href="#rag-and-agents/raa-qdrant-operations">compatible embedding-model migration</a>.</p>
<p>Compare strategies on representative questions under comparable returned-context budgets. Measure whether the needed evidence was retrieved, whether the answer is correct and supported by accurate citations, and the latency and cost of ingestion and serving. A larger chunk may restore the Meals exception while adding irrelevant Taxis text; a smaller one may match narrowly yet omit the rule it qualifies. Choose from those observed trade-offs rather than a universal size.</p>` + pdfContext;
  var ann=lesson('rag-and-agents','raa-f4');
  ann.body=ann.body.replace('At query time, it compares the query only against the centroids nearest to it, then searches only inside those chosen groups, called probes, rather than the whole index.', 'At query time, a coarse quantizer finds nearby centroids. A flat coarse index typically compares the query against all centroids, then scans the stored vectors in the selected groups, or inverted lists. The nprobe setting chooses how many lists to visit. Other coarse indexes can approximate centroid selection; selecting lists and searching their vectors are separate steps.');
  ann.deeper += '<p><a href="https://github.com/facebookresearch/faiss/wiki/Faiss-indexes">Faiss index documentation</a> distinguishes the coarse quantizer from the selected inverted-list scan.</p>';
  var terms=lesson('llm-inference-engineering','lie-0');
  terms.body=terms.body.replace('the fixed table that maps pieces of text to the integer ids a model reads, and the set of pieces that table holds.', 'a tokenizer combines normalization, segmentation and encoding rules with a vocabulary mapping text pieces to the integer IDs a model reads. The vocabulary is the set of those pieces.');
  terms.body=terms.body.replace('generating output tokens one at a time, each one depending on every token that came before it. A 500-token answer needs 500 separate passes through the model.', 'ordinary autoregressive generation computes successive output tokens from retained context. Without speculative decoding, it generally needs a model step per generated token, with the first token available from prefill. Speculative verification can accept multiple proposed tokens in one target-model pass; the conditional dependence on the accepted prefix remains.');
  terms.body=terms.body.replace('processing every token of the input prompt in one pass, before the first output token is produced.', 'processing the input prompt and constructing retained state before the first output token is produced; chunked prefill can split this processing across multiple scheduled chunks.');
  var memory=lesson('rag-and-agents','raa-f6');
  memory.body=memory.body.replace('since only a small new suffix needs the model\'s full attention.', 'because cached prefix states need not be recomputed. New suffix and decode queries still attend to the retained prefix keys and values; prefix caching removes repeated prefix computation, not those dependencies.');
  var guardrails=core['genai-platform'].activities.find(function(a){return a.id==='gp-a2';});
  guardrails.model=guardrails.model.replace('Everything else on this list is recoverable; that one is not.', 'Other failures can also cause irreversible harm. I would define severity, stop criteria and remediation for each failure under the product risk contract rather than assume any category is recoverable.');
  terms.deeper='<p>Ordinary autoregressive generation extends a sequence using retained key/value state. Full-attention KV storage grows with retained length; sliding-window and other architectures can retain less. Continuous batching changes admission, PagedAttention changes allocation and sharing, quantization changes precision, and speculative decoding verifies draft tokens together. These address different costs; measure the resource and scheduler trace before choosing an optimization.</p>';
  var paged=lesson('llm-inference-engineering','lie-f4');
  paged.deeper='<p>The 2023 PagedAttention paper reports near-zero KV-cache waste and 2–4 times throughput at comparable latency against FasterTransformer and Orca on its tested workloads. This is a historical benchmark, not a promised multiplier for a current deployment. The design reduces allocation waste and supports cache sharing; measured gains depend on sequences, models, decoding, hardware and the comparison configuration. <a href="https://arxiv.org/abs/2309.06180">Original PagedAttention paper</a>.</p>';
  var techniques=lesson('llm-inference-engineering','lie-f7');
  techniques.body += '<p><b>Chunked prefill</b> splits a long input into scheduler-sized token chunks. The scheduler can interleave those chunks with decode work, reducing the uninterrupted interference of a long prompt on existing requests. Smaller chunks add scheduling overhead and may affect time to first token; benchmark the prompt-length mix and token budget rather than assuming one chunk size.</p><p><b>Prefix caching</b> reuses compatible key/value state for an identical already-processed token prefix. It saves repeated prefill work, not the work of generating every suffix. Cache identity must include the model and relevant adapter/configuration, and protected reuse must respect isolation policy. A miss, eviction or incompatible prefix requires computation; cache capacity and hit rate determine the benefit.</p><p><b>Prefill/decode disaggregation</b> assigns input processing and token generation to different workers or pools. This lets each phase use separate scheduling and capacity policies, but the retained state must move between them. KV transfer consumes bandwidth and adds latency; failures need a bounded recovery path. Compare transfer and queue costs with interference avoided under the same end-to-end latency targets.</p>';
  techniques.deeper += '<p><a href="https://docs.vllm.ai/en/latest/">vLLM documentation</a> describes supported caching and scheduling features; pin and test the chosen release, backend and model.</p>';
  var serving=lesson('llm-inference-engineering','lie-f8');
  serving.body += '<p><b>Tensor parallelism</b> splits a layer’s tensors and computation across devices. For example, devices compute different output-channel shards of a projection and combine results where the next operation requires them. Collective communication sits on the request path, so link bandwidth, topology, shard size and batch affect whether adding devices improves latency. It can fit a model that exceeds one device’s memory; it is not free speed.</p><p><b>Pipeline parallelism</b> assigns consecutive layer groups to stages on different devices. Activations flow between stages. Overlapping independent work can improve utilization, but a single sequence still depends on each preceding stage; empty or imbalanced stages create pipeline bubbles. Balance stages using measured work and communication, not merely equal layer counts.</p><p><b>Mixture of experts (MoE)</b> uses a learned gate to dispatch a token to a selected subset of expert networks, then combines their outputs. Only selected experts compute for that token, while total expert weights still consume storage or require loading. Expert parallelism distributes experts across devices and introduces token dispatch/combine traffic. Uneven routing creates load imbalance; capacity, overflow handling and placement are implementation choices that must be measured for quality and latency.</p>';
  function purpose(topic,url,text){(core[topic].readings||[]).filter(function(r){return r.u===url;}).forEach(function(r){r.w=r.purpose=text;});}
  purpose('llm-inference-engineering','https://arxiv.org/abs/2309.06180','Original PagedAttention allocation and sharing mechanism, with the paper’s explicitly scoped 2023 throughput comparison.');
  purpose('llm-inference-engineering','https://arxiv.org/abs/2205.14135','IO-aware exact attention: tiling, online normalization and avoiding the full intermediate attention matrix.');
  purpose('llm-inference-engineering','https://arxiv.org/abs/2211.17192','Exact speculative sampling acceptance and corrective distribution; compare speed under the paper’s assumptions.');
  purpose('llm-inference-engineering','https://arxiv.org/abs/2506.04645','Modeling inference cost and serial generation speed across arithmetic, memory, communication and latency constraints.');
  purpose('llm-fine-tuning-and-alignment','https://arxiv.org/abs/2106.09685','Original LoRA low-rank update and trainable-parameter/storage trade-offs; use the actual projection dimensions.');
  purpose('llm-fine-tuning-and-alignment','https://arxiv.org/abs/2305.14314','Frozen quantized base weights, higher-precision adapter training and measured memory/quality trade-offs.');
  var alignmentTerms=lesson('llm-fine-tuning-and-alignment','lft-0');
  alignmentTerms.body=alignmentTerms.body.replace('the reinforcement-learning algorithm RLHF usually runs, with limits built in so no single update can move the model too far at once.', 'a reinforcement-learning algorithm used in RLHF. PPO-Clip clips its surrogate objective to remove incentives for large probability-ratio changes; it does not impose a hard bound on policy distance. Implementations may also monitor KL divergence and stop updates early.');
  core['llm-fine-tuning-and-alignment'].glossary.forEach(function(group){group.rows.forEach(function(row){if(row[0]==='PPO') row[1]='A policy-optimization family: PPO-Clip clips a surrogate objective; PPO-Penalty penalizes divergence from the previous policy. RLHF may separately penalize divergence from a fixed reference policy. None of these objective penalties is a hard distance guarantee.';});});
  var goodputExercise=core['llm-inference-engineering'].activities.find(function(a){return a.id==='lie-a3';});
  goodputExercise.model=goodputExercise.model.replace("That's exactly why goodput exists as a separate metric: it's throughput counted only over the requests that actually met their latency target, so a change that helps the aggregate number while hurting individual requests shows up as throughput rising and goodput falling at the same time. I'd want to see TTFT and TPOT percentiles before and after the upgrade, and goodput or SLO attainment specifically, before calling this a win - if those got worse, the upgrade traded user experience for a bigger throughput number, which is the opposite of what we want.", "I would measure eligible requests meeting all declared SLOs per second, the SLO attainment fraction, and TTFT/TPOT distributions on comparable workloads. Worse attainment does not necessarily mean fewer good requests per second: 100 requests/s at 99% attainment gives 99 good requests/s and 1 miss/s; 200 requests/s at 90% gives 180 good requests/s and 20 misses/s. Goodput rose while the failure fraction and number of misses also rose. I would assess those outcomes against the product's capacity and user-experience targets before calling the upgrade a win.");
  goodputExercise.rubric=goodputExercise.rubric.replace('correctly defines goodput as throughput counted only over requests that met their latency target (SLO)', 'defines request goodput as eligible requests meeting every declared SLO per second, distinguishes this rate from the SLO attainment fraction, and states the unit if using an SLO-filtered token rate');
}(window));
