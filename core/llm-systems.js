/* llm-systems: retrieval/agents and large-scale training chapters for the training and LLM track. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['rag-and-agents'] = {
    id: 'rag-and-agents',
    title: 'Retrieval-augmented generation and agents',
    level: 'danger',
    levelLabel: 'Asked in almost every interview for a role that builds LLM applications.',
    why: `Almost nobody ships a large language model on its own; they ship it wired to their own documents and to tools that can act. An interviewer wants to see that you reach for the cheapest fix first, that you understand why a search system built for keywords is not the same as one built for embeddings, and that you can say exactly how an agent decides to stop instead of running forever. The follow-up questions are specific and quick to fail if your understanding is vague: how would you chunk a set of PDFs with tables, why did your retrieval evaluation look fine while users complained, and what stops your agent from being talked into ignoring its instructions.`,
    learn: [
      {
        id: 'raa-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>Every word this chapter uses, defined once, in order.</p>
<ul>
<li><b>Retrieval-augmented generation (RAG)</b> - fetching relevant text at request time and placing it in the prompt, so the model answers from that text instead of only from what it memorised in training.</li>
<li><b>Chunk</b> - one small piece a source document is cut into before it is stored, sized so a search can return something small enough to fit in a prompt.</li>
<li><b>Embedding</b> - a list of numbers (a vector) produced by a trained model that represents the meaning of a piece of text.</li>
<li><b>Vector index</b> - storage built to find the vectors nearest to a query vector quickly, without comparing the query against every stored vector one by one.</li>
<li><b>Dense retrieval</b> - finding text by comparing embeddings, so two pieces of text can match on meaning even if they share no exact words.</li>
<li><b>Sparse retrieval</b> - finding text by comparing exact words, typically scored with <b>BM25</b>, a formula that rewards a document for matching rare words more than common ones.</li>
<li><b>Hybrid retrieval</b> - running dense and sparse retrieval together and combining their two rankings into one.</li>
<li><b>Reranking</b> - taking the shortlist a first search already returned and scoring it again with a slower, more accurate model, keeping only the best few.</li>
<li><b>Query rewriting</b> - changing or expanding a user's question before searching, to raise the chance the right chunk gets found.</li>
<li><b>Approximate nearest neighbour (ANN) search</b> - finding vectors that are very likely, though not certain, to be the closest matches, in exchange for being far faster than checking every vector.</li>
<li><b>HNSW</b> (hierarchical navigable small world) - an ANN index built as layered graphs, searched from a sparse top layer down to a dense bottom layer.</li>
<li><b>IVF</b> (inverted file index) - an ANN index that clusters vectors into groups first, then searches only inside the groups nearest the query.</li>
<li><b>Groundedness</b> (also <b>faithfulness</b>) - whether an answer's claims are actually supported by the text the model was given, rather than invented.</li>
<li><b>Hallucination</b> - a confident answer not supported by the model's training or by anything it was given, stated with no sign that it might be wrong.</li>
<li><b>Golden set</b> - a small, carefully checked set of questions with known correct answers and sources, used to measure a RAG system's real accuracy.</li>
<li><b>LLM-as-judge</b> - using a model to score or compare other models' answers at scale, instead of a person doing it by hand.</li>
<li><b>Agent</b> - a system in which a model decides, on its own, which steps and tools to use to complete a task, rather than following a fixed script.</li>
<li><b>Tool calling</b> (also <b>function calling</b>) - a model producing a structured request to run a specific function, which the surrounding program then actually executes.</li>
<li><b>Context window</b> - the maximum number of tokens a model can read and generate in one request; anything before it falls outside is simply not seen.</li>
<li><b>Prompt caching</b> - reusing the internal computation for a prompt's unchanged opening portion across requests, instead of recomputing it every time.</li>
<li><b>Guardrail</b> - a check placed before or after a model call that blocks or fixes an unsafe or unwanted input or output.</li>
<li><b>Prompt injection</b> - text, often hidden inside a document the model retrieves, written to make the model follow a new instruction instead of the one it was actually given.</li>
<li><b>Data leakage</b> (in this chapter) - private, internal, or another customer's information appearing somewhere it should not, such as in a model's answer.</li>
<li><b>Model router</b> - a component that picks which model answers a given request, usually to balance cost, speed, and quality.</li>
</ul>`,
        deeper: `<p>Most of this chapter is one repeated pattern: a cheap, simple option first, and a more capable, more expensive option only once the simple one is shown to fall short. Prompting is cheaper than retrieval; retrieval is cheaper than fine-tuning; a small model is cheaper than a large one. Nearly every question in this chapter is really asking whether you know where that line sits.</p>`,
        check: {
          question: 'What is the difference between dense retrieval and sparse retrieval?',
          options: [
            'Dense retrieval uses more storage, sparse retrieval uses less',
            'Dense retrieval compares embeddings for meaning; sparse retrieval compares exact words, typically with BM25',
            'They are two names for the same technique',
            'Sparse retrieval only works on short documents'
          ],
          answer: 1,
          explain: 'Dense retrieval can match on meaning with no shared words at all. Sparse retrieval matches on the words actually present, which is why the two catch different failures.'
        }
      },
      {
        id: 'raa-f1',
        part: 'field',
        title: 'When to use retrieval versus fine-tuning versus a longer prompt',
        viz: 'rag-pipeline',
        body: `<p>Work through the cheapest option first, and only move to the next one once the current one is shown to fail.</p>
<p><b>First, write a clearer prompt.</b> A surprising share of "the model does not know X" problems are actually "the instructions were not clear enough" problems, and a better system prompt fixes them for free, in seconds.</p>
<p><b>Second, put the information straight into the prompt.</b> If the material the model needs is small and known in advance, paste it directly into the prompt instead of building any retrieval system at all. This is the simplest possible design. It does not scale: a longer prompt costs more, runs slower, and resends the same tokens on every request, though prompt caching (covered later in this chapter) softens that cost when the same block of text repeats across requests.</p>
<p><b>Third, reach for retrieval</b> once the knowledge is larger than comfortably fits in a prompt, changes often, or needs to be traced back to a specific source. Retrieval's real advantage over baking facts into the model's weights is that it can point at exactly which document an answer came from, so the answer can be checked, and updating the knowledge means updating the index, not retraining anything.</p>
<p><b>Fine-tuning is not a knowledge tool at all.</b> It changes behaviour - format, tone, a narrow classification scheme, following a house style reliably - and it is a poor way to add fast-changing facts, since every update to the facts means retraining and re-evaluating the model.</p>
<p>A production system commonly uses more than one of these at once: retrieval for facts, a fine-tune for the output format that wraps around them, and a clear prompt tying the two together.</p>`,
        deeper: `<p>The context-window size of current models tempts teams to skip retrieval altogether and paste everything in. This works until it does not: cost and latency both grow with prompt length, and a model reading a huge unfiltered pile of text still has to find the relevant part itself, which it does less reliably than a retrieval step built to find exactly that.</p>`,
        check: {
          question: 'A team needs their support bot to answer questions about a product catalogue that changes every day. What is the best fit?',
          options: [
            'Fine-tune the model on the catalogue every day',
            'Retrieval-augmented generation over the catalogue, so answers stay current without retraining',
            'Write a longer system prompt containing the entire catalogue',
            'Use a larger base model and change nothing else'
          ],
          answer: 1,
          explain: 'A daily-changing catalogue is exactly the case retrieval is built for: update the index, not the model, and every answer can point back to the specific catalogue entry it used.'
        }
      },
      {
        id: 'raa-f2',
        part: 'field',
        title: 'Chunking: cutting documents into retrievable pieces',
        viz: 'chunk-overlap',
        body: `<p>A chunk has to be small enough to fit inside a prompt alongside the question and the model's answer, and large enough to still make sense on its own once it is pulled out of its document.</p>
<p><b>Fixed-size chunking</b> cuts every document into pieces of the same length, usually measured in tokens. It is simple and predictable, but it can cut straight through a sentence or a table row with no regard for meaning.</p>
<p><b>Sentence-based chunking</b> splits on sentence or paragraph boundaries instead, so a chunk never ends mid-thought, at the cost of chunks that vary in length.</p>
<p><b>Semantic chunking</b> groups sentences by how similar their embeddings are, so a chunk boundary falls where the topic actually shifts rather than at a fixed character count. It costs more to compute and is usually reserved for documents where topic shifts matter a lot.</p>
<p><b>Overlap</b> repeats a small amount of text between one chunk and the next, so an idea that falls near a boundary still appears whole in at least one chunk instead of being split across two incomplete pieces.</p>
<p><b>Document-structure-aware chunking</b> uses the document's own headings and sections as chunk boundaries, which keeps a chunk aligned with a unit the author intended to be read together.</p>
<p><b>What breaks with PDFs and tables.</b> A PDF has no real structure, only positioned text: a multi-column layout can be read left-to-right across two unrelated columns, headers and footers get interleaved into the body text, and a scanned page has no extractable text at all without OCR first. A table loses its row-and-column meaning the moment it is flattened into plain text, since "the value in this column, this row" becomes just another sequence of words with the structure gone; keeping a table as one chunk, or converting it to a structured format before chunking, avoids losing that structure.</p>`,
        deeper: `<p>Chunk size is a trade-off with retrieval precision, not a fixed setting: a smaller chunk lets a search match a narrow, specific question more precisely, while a larger chunk carries more surrounding context that a smaller chunk might have cut away. Many production systems retrieve a small chunk for matching accuracy, then expand it to include its immediate neighbours before it goes into the prompt.</p>`,
        check: {
          question: 'A document has a table with prices in one column and product names in another. What happens if it is chunked as plain fixed-size text with no other handling?',
          options: [
            'Nothing changes; tables chunk exactly like prose',
            'The row-and-column relationship is lost, so a price can no longer be reliably tied to the right product name',
            'The table becomes faster to search',
            'Overlap automatically preserves table structure'
          ],
          answer: 1,
          explain: 'Flattening a table into plain text keeps the words but throws away which value belonged to which row and column, which is exactly the information a table exists to carry.'
        }
      },
      {
        id: 'raa-f3',
        part: 'field',
        title: 'Embeddings and vector search: dense, sparse, hybrid, and reranking',
        viz: 'hybrid-retrieval',
        body: `<p><b>Dense retrieval</b> turns both the query and every chunk into an embedding, then finds the chunks whose embeddings are closest to the query's, usually by cosine similarity. It is good at matching meaning: a query about "cutting costs" can find a chunk about "reducing spend" with no shared words at all. It can also miss an exact term it was never trained to weigh heavily, such as a product code or an unusual name.</p>
<p><b>Sparse retrieval</b> compares exact words, most commonly scored with <b>BM25</b>, a formula built on top of the older TF-IDF idea that scores a document higher the more it contains a query's words, weighted so a rare word counts for more than a common one. It reliably finds an exact term, including ones a dense model was never trained on, but it cannot match a paraphrase with no shared words.</p>
<p><b>Hybrid retrieval</b> runs both searches and combines their two rankings into one, commonly with <b>reciprocal rank fusion</b>: each document gets a score based on where it ranked in each list, and documents that rank well in either list rise to the top of the combined result. This catches both meaning-based and exact-word matches, which is why most production RAG systems run some form of hybrid search rather than dense search alone.</p>
<p><b>Reranking</b> takes a hybrid search's shortlist, often the top 50 or so candidates, and scores each one again with a slower, more accurate cross-encoder model that reads the query and the chunk together rather than comparing two separate embeddings. It is too slow to run over an entire index but cheap enough to run over a short shortlist, and it usually improves ranking quality noticeably.</p>
<p><b>Query rewriting</b> changes the user's question before any of this runs: expanding an abbreviation, splitting a multi-part question into several searches, or rephrasing a vague question into one closer to the wording used in the source documents.</p>`,
        deeper: `<p>A common production pipeline runs all four steps in order: hybrid search returns a wide shortlist quickly and cheaply, a reranker narrows it to the handful of chunks that actually go in the prompt, and query rewriting happens earlier, before either search runs, to raise the odds the right chunks are even in the candidate pool to begin with.</p>`,
        check: {
          question: 'A user searches for a product by its exact model number, such as "XR-4400". Dense retrieval alone returns weak results. Why, and what is a direct fix?',
          options: [
            'The embedding model has too many dimensions; reduce them',
            'Dense retrieval matches on meaning and can miss an exact rare code it never learned to weigh; add sparse (BM25) retrieval alongside it',
            'The chunk size is too large; there is no other fix needed',
            'Dense retrieval cannot be combined with any other method'
          ],
          answer: 1,
          explain: 'An exact code has little "meaning" for an embedding model to lean on. Sparse retrieval scores exact word matches directly, which is exactly the case it is strong at.'
        }
      },
      {
        id: 'raa-f4',
        part: 'field',
        title: 'Approximate nearest neighbour search: HNSW and IVF',
        viz: 'hnsw-layers',
        body: `<p>Comparing a query embedding against every stored vector one by one, an exact nearest-neighbour search, is accurate but too slow once an index holds millions of vectors. Approximate nearest neighbour (ANN) search trades a small amount of accuracy for a large speed gain by not checking every vector.</p>
<p><b>HNSW</b> (hierarchical navigable small world) builds several layered graphs over the same set of vectors. The top layer has few nodes and long connections; each lower layer adds more nodes and shorter connections; the bottom layer holds every vector. A search starts at an entry point in the top layer, greedily moves to whichever connected node is closest to the query, and once it can no longer improve at that layer, drops down one layer at the same point and keeps narrowing, until the bottom layer gives the final answer. This reaches a good answer in a small number of hops instead of scanning everything.</p>
<p><b>IVF</b> (inverted file index) takes a different approach: it first clusters the vectors, typically with k-means, into a fixed number of groups, each represented by a centroid. At query time, it compares the query only against the centroids nearest to it, then searches only inside those chosen groups, called probes, rather than the whole index.</p>
<p><b>The recall versus latency trade-off.</b> Every ANN index has a knob that trades one for the other: HNSW's <b>ef</b> parameter controls how many candidates it keeps at each step of the search, and IVF's <b>nprobe</b> controls how many clusters it searches. Turning either one up finds more of the true nearest neighbours (higher recall) at the cost of checking more of the index (higher latency); turning it down speeds up the search but raises the chance of missing a neighbour that a full search would have found.</p>`,
        deeper: `<p>HNSW tends to give better recall at a given latency and is the default choice in most vector databases, at the cost of a larger memory footprint from storing the graph's connections. IVF uses noticeably less memory and often builds faster, which is why it is still common for very large indexes where the graph overhead of HNSW becomes expensive.</p>`,
        check: {
          question: 'Turning HNSW\'s ef parameter down improves query latency. What is the direct cost?',
          options: [
            'None; ef has no effect on result quality',
            'Lower recall: the search checks fewer candidates and is more likely to miss a true nearest neighbour',
            'The index must be rebuilt from scratch',
            'It only affects how the index is stored on disk'
          ],
          answer: 1,
          explain: 'ef controls how wide the search looks at each step. A narrower search is faster but has a higher chance of missing a neighbour a wider search would have found.'
        }
      },
      {
        id: 'raa-f5',
        part: 'field',
        title: 'Evaluating RAG: recall, faithfulness, and a golden set',
        body: `<p>A RAG system can fail in two independent places, and a single overall accuracy number does not tell you which one broke.</p>
<p><b>Retrieval recall</b> asks whether the right chunk was even found: out of the questions where a correct source chunk exists in the index, what fraction of the time does the retrieval step return it in its top results (commonly measured as recall@k, for some small k such as 5 or 10). If recall is low, no amount of prompting will fix the answer, because the model never saw the right text.</p>
<p><b>Answer faithfulness</b> (also groundedness) asks a separate question: given that the model did receive the right chunk, does its answer actually stick to what that chunk says, or does it add unsupported claims. A model can receive the correct chunk and still hallucinate on top of it.</p>
<p><b>LLM-as-judge</b> is the common way to score faithfulness at scale, using a model to check whether each claim in an answer is supported by the retrieved text. It has known failure modes worth naming directly: <b>position bias</b> (favouring whichever answer it reads first when comparing two), <b>verbosity bias</b> (favouring longer answers regardless of quality), and <b>self-preference</b> (favouring answers written in a style close to the judge's own). These are mitigated by giving the judge a specific rubric instead of an open-ended question, randomising the order of anything being compared, and checking the judge's scores against a sample of human judgments before trusting it at scale.</p>
<p><b>A golden set</b> is a small, carefully built set of real questions with a known correct answer and a known correct source chunk for each one. It is what turns "the demo looked good" into a number you can track release over release, and it is the one thing worth building before shipping any RAG system, however small.</p>`,
        deeper: `<p>Splitting the two failure modes apart changes what you fix. A low recall number sends you back to chunking, embeddings, or the retrieval method; a low faithfulness number with good recall sends you to the prompt, the model, or the reranker instead. Reporting one blended number, without separating the two, wastes an interviewer's follow-up question and would waste your own debugging time in the same way.</p>`,
        check: {
          question: 'A RAG system\'s answers are frequently wrong. Retrieval recall@5 measures 95 percent. What does this tell you about where the problem most likely is?',
          options: [
            'The retrieval step is almost certainly the problem',
            'Retrieval is finding the right chunk most of the time, so the problem more likely lies in how the model uses that chunk, not in finding it',
            'The embeddings must be retrained',
            'The golden set is too small to be useful'
          ],
          answer: 1,
          explain: 'High recall means the right chunk is usually there. If answers are still wrong, faithfulness - whether the model actually sticks to what it was given - is the more likely place to look next.'
        }
      },
      {
        id: 'raa-f6',
        part: 'field',
        title: 'How a model\'s memory works in practice',
        body: `<p>A language model has no memory between separate requests by default; everything it "remembers" during a conversation is text sitting inside its context window on this one request.</p>
<p><b>The context window</b> is the hard limit on how many tokens a request can contain, prompt plus generated answer combined. As a conversation grows, earlier turns take up more of that budget, and once the limit is reached, the oldest content simply falls out of what the model can see, with no message telling it that anything was lost.</p>
<p><b>Conversation summarisation</b> manages this by periodically replacing older turns with a shorter summary that carries the parts still needed, freeing up room in the context window for new turns while keeping the important facts from earlier in the conversation.</p>
<p><b>External memory stores</b> keep information outside the context window entirely - in a database, a vector index, or a plain key-value store - and pull specific pieces back in only when they are relevant to the current request, the same retrieval mechanism this chapter has already covered, aimed at a user's own history instead of a document collection.</p>
<p><b>Caching prefixes</b> addresses cost and speed rather than memory capacity. Many requests to the same model share a long, unchanging opening portion of the prompt - a system prompt, a set of tool definitions, a long retrieved document included in full. Prompt caching stores the model's internal computation for that fixed prefix once, and reuses it on every later request that starts with the same text, so only the new part at the end has to be processed fresh. This can cut both the cost and the latency of requests that share a large, stable prefix by a large margin, since only a small new suffix needs the model's full attention.</p>`,
        deeper: `<p>These four ideas solve different problems and are commonly used together: the context window is the hard ceiling, summarisation buys headroom under that ceiling for a long conversation, an external memory store keeps things that would never fit at all, and prefix caching makes repeatedly re-sending a large, unchanging block of context (a big system prompt, a tool catalogue) cheap enough to do on every single request.</p>`,
        check: {
          question: 'A chatbot\'s system prompt and tool definitions total 4,000 tokens and are identical on every request from every user. What is the most direct way to cut the cost of processing that fixed portion repeatedly?',
          options: [
            'Fine-tune a new model on the system prompt',
            'Use prompt caching, so the fixed prefix is computed once and reused instead of reprocessed on every request',
            'Shorten the context window',
            'Summarise the system prompt before every request'
          ],
          answer: 1,
          explain: 'A fixed, repeated prefix is exactly what prompt caching is built for: compute it once, reuse it, and only the new part at the end needs fresh processing.'
        }
      },
      {
        id: 'raa-f7',
        part: 'field',
        title: 'Agents: tools, planning, and stopping rules',
        viz: 'agent-tool-loop',
        body: `<p>An agent is a model given a set of tools and left to decide, on its own, which ones to call and in what order, rather than following a script a person wrote in advance.</p>
<p><b>Tool calling</b> works by giving the model a description of each available function - its name, its purpose, and what arguments it takes - and letting the model produce a structured request to call one. The surrounding program executes that call, and its result is fed back to the model as the next piece of input.</p>
<p><b>Planning loops.</b> A common pattern, often called ReAct (reason, then act), has the model alternate between explaining what it is trying to do next and actually calling a tool to do it, observing the result, and deciding on the next step from there. This lets an agent handle a task whose exact steps were not known in advance, at the cost of being slower and less predictable than a fixed script.</p>
<p><b>Retries and fallbacks.</b> A tool call can fail - a timeout, a bad argument, an empty result - and a reasonable agent retries a failed call a limited number of times, and falls back to a different tool or a plainer answer rather than getting stuck repeating the same failing call forever.</p>
<p><b>Permissions and approvals.</b> Any tool that changes something in the real world - sending an email, spending money, deleting a record - should sit behind an explicit permission, either an allowlist of actions the agent may take on its own, or a person's approval before a specific action runs.</p>
<p><b>Cost and latency budgets</b> cap how much a single task may spend, in tokens, tool calls, or wall-clock time, so one confused agent does not run away with an unbounded bill.</p>
<p><b>Stopping rules</b> are what actually end a task: the goal is checked and found complete, a maximum number of steps is reached, or the cost budget runs out. Without an explicit stopping rule, an agent can loop indefinitely on a task it cannot solve.</p>
<p><b>Observability and tracing</b> means logging every step an agent takes - which tool, which arguments, which result - so a bad outcome can be traced back to the specific decision that caused it instead of only being visible as a wrong final answer.</p>`,
        deeper: `<p>The gap between a workflow and an agent is exactly how much of this the model controls versus a person controls in advance. A fixed sequence of prompts and tool calls written by a person is a workflow: predictable, easy to test, and often the better choice. Handing the model the decision of which step comes next is an agent: more flexible, and exactly why it needs the stopping rules, budgets, and permissions above, since nobody wrote down in advance what it will do.</p>`,
        check: {
          question: 'An agent keeps calling the same search tool with slightly different arguments and never produces a final answer. Which control most directly addresses this?',
          options: [
            'A larger context window',
            'A stopping rule, such as a maximum number of steps, that forces the loop to end and return its best answer so far',
            'Giving the agent more tools to choose from',
            'Removing the retry logic entirely'
          ],
          answer: 1,
          explain: 'Without an explicit stopping rule, nothing tells the agent to give up and answer. A maximum step count or a cost budget is exactly the control built for this.'
        }
      },
      {
        id: 'raa-f8',
        part: 'field',
        title: 'Model routing: picking a model per request',
        body: `<p>Not every request needs the strongest, most expensive model. A model router looks at an incoming request and decides which model should actually answer it, trading off cost, the length of context the request needs, and the quality the task actually requires.</p>
<p>A router can be as simple as a set of rules (short factual questions go to a small model; anything mentioning a specific complex task goes to a larger one) or as involved as a small classifier trained to predict how difficult a request is likely to be. Some systems also route by <b>confidence after the fact</b>: answer with a cheap model first, and only escalate to a stronger one when the cheap model's own confidence, or a quick check of its answer, suggests it might be wrong.</p>
<p><b>A worked cost example.</b> Say a product handles 10 million requests a month, averaging 1,000 tokens per request, and routes 80 percent of them to a cheap model and 20 percent to a stronger one, using illustrative prices of $0.20 per million tokens for the cheap model and $3.00 per million tokens for the strong one.</p>
<p>Total volume: 10,000,000 x 1,000 = 10 billion tokens a month.</p>
<p>Routing everything through the strong model: 10,000,000,000 / 1,000,000 x $3.00 = <b>$30,000</b> a month.</p>
<p>Routing 80 percent to the cheap model and 20 percent to the strong one: (8,000,000,000 / 1,000,000 x $0.20) + (2,000,000,000 / 1,000,000 x $3.00) = $1,600 + $6,000 = <b>$7,600</b> a month - a reduction of roughly 75 percent, for a change that only affects the easy majority of requests.</p>
<p>These prices are illustrative, not a live catalogue; the arithmetic is what matters, and it is worth being able to redo with real, current numbers on request.</p>`,
        deeper: `<p>Routing has a failure mode worth naming: a router that is wrong in the expensive direction (sending a genuinely hard request to the cheap model) costs a wrong answer, while one that is wrong in the cheap direction (sending an easy request to the expensive model) only costs money. Most systems accept some amount of the second kind of mistake as the price of avoiding the first.</p>`,
        check: {
          question: 'In the worked example, what is the main factor that produced most of the cost saving?',
          options: [
            'Using a shorter context window',
            'Sending the large majority of requests, the easy 80 percent, to the much cheaper model, and reserving the expensive model for the smaller hard fraction',
            'Fine-tuning both models',
            'Caching every request'
          ],
          answer: 1,
          explain: 'The saving comes almost entirely from how much cheaper 80 percent of the volume became; the 20 percent still on the expensive model changes little on its own.'
        }
      },
      {
        id: 'raa-f9',
        part: 'field',
        title: 'Guardrails and safety',
        body: `<p>A guardrail is a check that runs before or after a model call, rather than trusting the model to always behave correctly on its own.</p>
<p><b>Input checks</b> run on what is about to be sent to the model: detecting personal data (PII) so it can be redacted or blocked, scanning for known prompt-injection patterns, and filtering content that violates a stated policy before it ever reaches the model.</p>
<p><b>Output checks</b> run on what the model produced: checking a RAG answer's claims against its retrieved sources (the faithfulness check from earlier in this chapter is one such output check), scanning for policy violations, and catching a tool call an agent should not be allowed to make unsupervised before it actually runs.</p>
<p><b>Prompt injection</b> comes in two kinds. Direct injection is a user typing an instruction straight into the chat, trying to make the model ignore its system prompt. Indirect injection is more dangerous in a RAG or agent system: an instruction hidden inside a document, web page, or email that the model retrieves and reads as part of doing its job, written by someone who knew the model would read it. A support agent that reads incoming emails and can send replies is a direct target: an attacker only needs to send it one email containing hidden instructions.</p>
<p><b>Data leakage</b> in this setting covers a system prompt or internal instructions appearing in a model's answer, one customer's retrieved documents appearing in another customer's answer when many customers share one deployment, and a model's training data resurfacing content it should not repeat. Each needs a different guard: strict separation of what gets retrieved per customer, explicit instructions not to repeat system content, and output checks that catch it when instructions are not enough on their own.</p>`,
        deeper: `<p>Guardrails work in layers because no single check catches everything: an input filter stops most direct attacks but cannot see an injection hidden inside a retrieved document until that document is actually fetched; an output check catches a leak regardless of which input path caused it, which is why relying on input checks alone leaves indirect injection largely unaddressed.</p>`,
        check: {
          question: 'A support agent reads incoming customer emails and can reply automatically. An email contains hidden text instructing the model to email a customer\'s private data to an outside address. What kind of attack is this?',
          options: [
            'Direct prompt injection, since it comes through a normal input channel',
            'Indirect prompt injection: instructions hidden in retrieved content the model reads while doing its job, not typed by the user',
            'Data leakage caused by fine-tuning',
            'A model routing failure'
          ],
          answer: 1,
          explain: 'The attacker never talks to the model directly. The instruction rides in on content the agent was already going to read as part of its normal task, which is exactly what makes indirect injection harder to catch with input checks alone.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'raa-a1',
        type: 'design',
        title: 'Exercise: design a RAG pipeline for a changing knowledge base',
        prompt: 'We run a support bot over an internal policy library of about 2,000 documents, including PDFs with tables, and the library gets new documents and edits every week. Design the retrieval pipeline: how you would chunk this, what retrieval method you would use, and how you would evaluate whether it actually works.',
        timeboxSec: 420,
        rubric: `Must-haves: (1) addresses the PDF and table problem specifically, not generically - names at least one concrete handling choice (structure-aware extraction, keeping tables as their own chunks, or converting tables to a structured format before chunking); (2) picks a chunking approach and gives a reason (for example document-structure-aware chunking with overlap, given policy documents have real headings) rather than an arbitrary fixed size with no justification; (3) chooses hybrid retrieval (dense plus sparse) rather than dense alone, or gives a specific reason for choosing only one; (4) addresses the weekly-update requirement directly - incremental re-indexing of changed documents rather than a full rebuild every time; (5) proposes a concrete evaluation plan with a golden set and separates retrieval recall from answer faithfulness rather than one blended accuracy number; (6) does not propose fine-tuning as the primary mechanism for keeping the bot current on a weekly-changing library. Bonus: mentions reranking on top of hybrid search; mentions chunk expansion to neighbouring chunks for context. Common mistakes: picking dense-only retrieval with no justification; ignoring the PDF/table problem entirely; proposing a full re-embed of the whole library on every edit; no evaluation plan at all. {{HONESTY}}`,
        model: `<p>"First, the PDFs. I would not trust a plain text extraction to preserve reading order across a multi-column layout, so I'd use a structure-aware extractor and treat tables specially - either keep each table as its own chunk with its structure intact, or convert it to a simple row-per-line format before chunking, so a price stays tied to the right product instead of turning into a loose bag of words.</p>
<p>For chunking the rest, policy documents usually have real headings, so I'd chunk along section boundaries with a modest overlap, rather than a blind fixed-size cut that could split a rule from its exception across two chunks.</p>
<p>For retrieval, I'd run hybrid search - dense for paraphrased questions, sparse for exact policy numbers or defined terms - and rerank the combined shortlist before it goes in the prompt, since policy answers being exactly right matters more here than in a casual chatbot.</p>
<p>For weekly updates, I'd re-index incrementally: only re-chunk and re-embed the documents that actually changed, tracked by a hash or a last-modified timestamp, rather than rebuilding the whole index every time.</p>
<p>For evaluation, I'd build a golden set of maybe 50 to 100 real policy questions with known correct answers and known source sections, and track retrieval recall and answer faithfulness separately, since a low recall number sends me back to chunking or retrieval, while a low faithfulness number with good recall sends me to the prompt or a reranker instead. I have not built this exact pipeline in production; this is the design I would follow, not a report of having shipped it."</p>`
      },
      {
        id: 'raa-a2',
        type: 'formulate',
        title: 'Exercise: work out a model-routing cost saving',
        viz: 'model-router',
        prompt: 'Your product handles 20 million requests a month, averaging 800 tokens per request. You are considering routing 70 percent of requests to a cheap model at $0.25 per million tokens, and the remaining 30 percent to a strong model at $4.00 per million tokens. Compute the monthly cost with routing, the cost if everything ran on the strong model, and the percentage saved.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) computes total monthly tokens correctly: 20,000,000 x 800 = 16,000,000,000; (2) computes the all-strong-model baseline correctly: 16,000,000,000 / 1,000,000 x $4.00 = $64,000; (3) splits volume correctly by percentage: 70 percent = 11,200,000,000 tokens, 30 percent = 4,800,000,000 tokens; (4) computes the routed cost correctly: (11,200,000,000/1,000,000 x $0.25) + (4,800,000,000/1,000,000 x $4.00) = $2,800 + $19,200 = $22,000; (5) computes the percentage saved correctly: ($64,000 - $22,000) / $64,000 ≈ 65.6 percent; (6) shows the working, not only a final number, and gets the right order of magnitude even with a small arithmetic slip. Bonus: notes that the saving is smaller than the earlier 80/20 example because a larger share (30 percent) is going to the expensive model this time. Common mistakes: forgetting to convert tokens to millions before multiplying by the per-million price; splitting the wrong quantity (splitting cost instead of tokens); dropping a zero in the token count. {{HONESTY}}`,
        model: `<p>"Total tokens: 20,000,000 requests x 800 tokens = 16,000,000,000 tokens a month, which is 16,000 million tokens.</p>
<p>All on the strong model: 16,000 x $4.00 = $64,000 a month.</p>
<p>With routing: 70 percent of 16,000,000,000 tokens is 11,200,000,000 (11,200 million), and 30 percent is 4,800,000,000 (4,800 million). Cheap-model cost: 11,200 x $0.25 = $2,800. Strong-model cost: 4,800 x $4.00 = $19,200. Total: $2,800 + $19,200 = $22,000 a month.</p>
<p>Saving: $64,000 minus $22,000 is $42,000, and $42,000 / $64,000 is about 0.656, so roughly 65.6 percent saved.</p>
<p>That is a smaller percentage saving than a case where only 20 percent goes to the expensive model, because here 30 percent of the volume, nearly a third, still runs on the model that costs sixteen times as much per token. The saving scales directly with how small a share actually needs the strong model, which is exactly why the router's accuracy at telling easy from hard requests apart matters as much as the price difference itself."</p>`
      },
      {
        id: 'raa-a3',
        type: 'explain',
        title: 'Exercise: defend an agent against prompt injection',
        viz: 'guardrails-io',
        prompt: 'We are building an agent that reads a customer\'s uploaded documents and can, on its own, decide to email a summary to whoever the customer specifies. A colleague asks: what stops an attacker from hiding an instruction inside one of those documents that makes the agent email its findings somewhere else? Walk me through the risk and your defence.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) correctly names this as indirect prompt injection - the attacker never talks to the model directly, the instruction rides in on content the agent was already going to read; (2) does not claim any input filter alone fully solves this, since the model has to read the document's content to do its job in the first place; (3) proposes at least one concrete layered defence: treating retrieved document content as data rather than as instructions in the prompt structure, an output check on the destination address before any email is sent, or a permission/approval step before an irreversible action like sending an email to an address not already on an allowlist; (4) specifically ties a defence to this scenario's actual risky action - sending email to an address - rather than only giving a general "add guardrails" answer; (5) does not claim the agent can be made perfectly safe, only that the risk is reduced and caught in more than one place. Common mistakes: claiming a single input filter fully prevents this; ignoring the specific dangerous action (sending email) and only discussing safety in the abstract; suggesting the fix is to stop the agent from reading documents at all, which defeats its purpose. {{HONESTY}}`,
        model: `<p>"This is indirect prompt injection. The attacker doesn't type anything into the chat - they hide an instruction inside a document, knowing the agent will read that document as part of its normal job. An input filter on what the user types does nothing here, because the user's own message might be completely innocent; the attack rides in through the document content itself.</p>
<p>I wouldn't try to solve this with one check. First, I'd structure the prompt so retrieved document content is clearly marked as data to summarise, not as instructions to follow, which reduces but doesn't eliminate the model treating text inside a document as a command. Second, and more importantly, I'd put a real control on the dangerous action itself: the agent can only send email to addresses the customer explicitly specified up front or that are already on an allowlist for that customer, never to an address that only appears inside a document the agent read. Third, I'd log every email the agent sends, with the document that triggered it, so an incident can be traced back to exactly which document caused it.</p>
<p>None of this makes the agent perfectly safe - a good enough injection might still shift its wording or its summary. But by putting the hard control on the actual risky action, sending mail to an arbitrary address, rather than trying to perfectly filter the model's reasoning, the worst outcome, data going somewhere the customer never approved, is the one thing I can actually rule out rather than just make less likely."</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'LlamaIndex: Understanding RAG', u: 'https://developers.llamaindex.ai/python/framework/understanding/rag/', w: 'The five-stage breakdown of a RAG pipeline - loading, indexing, storing, querying, evaluation - in the wording one of the most widely used RAG frameworks uses for it.', m: 15 },
      { l: 'Pinecone: Chunking Strategies for LLM Applications', u: 'https://www.pinecone.io/learn/chunking-strategies/', w: 'Fixed-size, content-aware, structure-based and semantic chunking side by side, with the PDF and table problems named directly.', m: 20 },
      { l: 'Elastic: What is hybrid search?', u: 'https://www.elastic.co/search-labs/blog/hybrid-search-elasticsearch', w: 'Dense and sparse retrieval combined with reciprocal rank fusion, explained by the team that ships BM25 and vector search in the same engine.', m: 15 },
      { l: 'Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs (Malkov and Yashunin, 2016)', u: 'https://arxiv.org/abs/1603.09320', w: 'The original HNSW paper. Read the introduction and the layered-graph construction for exactly why the search narrows one layer at a time.', m: 30 },
      { l: 'Pinecone: HNSW for Vector Search Explained', u: 'https://www.pinecone.io/learn/series/faiss/hnsw/', w: 'A slower, more visual walk through the same graph, including how the ef and M parameters trade recall against latency and memory in practice.', m: 20 },
      { l: 'Anthropic: Building effective agents', u: 'https://www.anthropic.com/research/building-effective-agents', w: 'The workflow-versus-agent distinction this chapter uses, plus the concrete point that a tool\'s description deserves as much care as the prompt itself.', m: 25 },
      { l: 'OpenAI: A practical guide to building agents', u: 'https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf', w: 'Orchestration patterns, guardrail design, and when a single agent is enough versus when a task needs more than one, from the team shipping tool-calling APIs.', m: 30 },
      { l: 'OWASP GenAI LLM Top 10 (2026)', u: 'https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/', w: 'The current community-maintained list of top LLM application risks, including prompt injection and sensitive information disclosure, with concrete mitigations for each.', m: 25 }
    ],
    glossary: [
      {
        g: 'Retrieval-augmented generation and agents',
        sub: '',
        rows: [
          ['Chunk', 'A small piece a document is cut into before being stored, sized to fit into a prompt.', 'Every RAG pipeline; how you cut a document decides what a search can ever return.'],
          ['Dense vs sparse retrieval', 'Comparing embeddings for meaning, against comparing exact words, usually scored with BM25.', 'Choosing why an exact-code or paraphrased query fails to match.'],
          ['Hybrid retrieval', 'Running dense and sparse search together and combining the two rankings, often by reciprocal rank fusion.', 'The default retrieval design for most production RAG systems.'],
          ['Reranking', 'Rescoring a shortlist with a slower, more accurate model before the final few chunks go in the prompt.', 'Improving ranking quality on top of a cheap first-pass search.'],
          ['HNSW', 'A layered-graph approximate nearest neighbour index, searched from a sparse top layer down to a dense bottom layer.', 'The default ANN index in most vector databases.'],
          ['IVF', 'An approximate nearest neighbour index that clusters vectors first and searches only the nearest clusters.', 'Very large indexes where HNSW\'s graph memory cost becomes expensive.'],
          ['Recall vs latency trade-off', 'Widening an ANN search (higher ef or nprobe) finds more true neighbours at the cost of speed.', 'Tuning any vector search for a specific latency budget.'],
          ['Retrieval recall', 'Whether the right chunk was found at all, independent of whether the model used it well.', 'The first place to look when a RAG answer is wrong.'],
          ['Faithfulness / groundedness', 'Whether an answer\'s claims are actually supported by the retrieved text.', 'The second place to look when retrieval recall is already high.'],
          ['Golden set', 'A small, checked set of questions with known correct answers and sources, used to measure RAG accuracy.', 'The one thing worth building before shipping any RAG system.'],
          ['Tool calling', 'A model producing a structured request to run a specific function, executed by the surrounding program.', 'How an agent actually does anything outside generating text.'],
          ['Stopping rule', 'The condition - goal met, step limit, or budget spent - that ends an agent\'s loop.', 'What stops an agent from running forever on a task it cannot solve.'],
          ['Prompt caching', 'Reusing the computed result for an unchanged prompt prefix across requests instead of recomputing it.', 'Cutting cost and latency for requests sharing a large, stable system prompt.'],
          ['Indirect prompt injection', 'An instruction hidden inside content a model retrieves and reads, rather than typed by the user.', 'The main injection risk in any RAG or document-reading agent.'],
          ['Model router', 'A component that picks which model answers a request, trading off cost, context needs, and quality.', 'Cutting serving cost without touching the requests that actually need a strong model.']
        ]
      }
    ]
  };

  root.PREP_CORE['training-at-scale'] = {
    id: 'training-at-scale',
    title: 'Training at scale and GPUs',
    level: 'warning',
    levelLabel: 'Common whenever a role touches model training, pretraining, or GPU infrastructure.',
    why: `Training a model that fits on one GPU and training one that needs a thousand of them are different engineering problems, and interviewers use this topic to check whether you actually understand what is being split across machines and why, rather than only knowing the names of the tools. The questions are concrete: what exactly does a GPU do faster than a CPU, why does a 7-billion-parameter model need over 100 GB of memory just to start training, and what is actually being communicated between GPUs in each parallelism strategy. A worked number, done correctly, is worth more here than a list of framework names.`,
    learn: [
      {
        id: 'tas-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>Every word this chapter uses, defined once, in order.</p>
<ul>
<li><b>GPU</b> (graphics processing unit) - a chip built from thousands of simple cores that all run the same instruction on different pieces of data at once, unlike a CPU's smaller number of cores built to run different instructions well.</li>
<li><b>FLOPs</b> - floating-point operations; a count of arithmetic operations, or, per second (FLOPs/s), a chip's raw compute speed.</li>
<li><b>Memory bandwidth</b> - how many bytes per second a chip can move between its memory and its compute cores.</li>
<li><b>Arithmetic intensity</b> - the number of FLOPs an operation performs for every byte it reads from and writes to memory; it decides whether an operation is limited by compute or by memory movement.</li>
<li><b>Compute-bound vs memory-bound</b> - an operation is compute-bound if its speed is capped by how fast the chip can do arithmetic, and memory-bound if its speed is instead capped by how fast data can be moved.</li>
<li><b>Roofline model</b> - a chart of the two limits above, used to read off which one caps a given operation.</li>
<li><b>Tensor</b> - the general name, in a deep learning framework, for an array of numbers of any number of dimensions - a scalar, a vector, and a matrix are all tensors of 0, 1, and 2 dimensions.</li>
<li><b>Autograd</b> - a framework's system for automatically computing gradients, by recording every operation performed on a tensor and reversing through them with the chain rule.</li>
<li><b>DataLoader</b> - the component that reads training examples from storage, batches and shuffles them, and hands them to the training loop, usually using several worker processes so this happens in parallel with the GPU's own work.</li>
<li><b>Mixed precision</b> - doing most training arithmetic in a lower-precision number format (commonly bf16) while keeping a small number of values in full precision (fp32) where precision actually matters.</li>
<li><b>Gradient accumulation</b> - running several small forward-and-backward passes and adding their gradients together before taking one optimiser step, to reach a larger effective batch size than fits in memory at once.</li>
<li><b>Activation checkpointing</b> - discarding some intermediate values from the forward pass and recomputing them during the backward pass instead of storing them, trading extra computation for less memory used.</li>
<li><b>Optimizer state</b> - the extra numbers an optimiser like Adam keeps per parameter, beyond the parameter and its gradient, to decide how to update it.</li>
<li><b>Data parallelism</b> - copying the whole model onto every GPU and giving each GPU a different slice of the batch to process.</li>
<li><b>All-reduce</b> - a communication step in which every participating GPU ends up holding the sum (or average) of a value that started out different on each of them.</li>
<li><b>ZeRO / FSDP</b> - techniques that shard a model's parameters, gradients, or optimiser state across GPUs instead of copying all of it onto every GPU.</li>
<li><b>Tensor parallelism</b> - splitting a single large matrix multiplication itself across GPUs, which then combine their partial results.</li>
<li><b>Pipeline parallelism</b> - splitting a model's layers into groups, with each group placed on a different GPU, so a batch flows through the GPUs in sequence.</li>
<li><b>Expert parallelism</b> - placing the different expert sub-networks of a mixture-of-experts model on different GPUs, and routing each token to the GPU holding the expert it needs.</li>
<li><b>Pipeline bubble</b> - the idle time a pipeline-parallel GPU spends waiting for work, before the pipeline is full or after it starts draining.</li>
<li><b>Kernel fusion</b> - combining several small GPU operations into a single one, cutting the number of separate reads and writes to memory.</li>
<li><b>NCCL</b> - NVIDIA's library implementing the communication primitives (all-reduce, all-gather, broadcast) that multi-GPU training runs on top of.</li>
<li><b>Interconnect</b> - the physical link GPUs use to talk to each other, far faster within one machine (such as NVLink) than between separate machines over a network.</li>
</ul>`,
        deeper: `<p>Nearly every technique in this chapter answers one of two questions: how do I make one GPU's compute go to waste less often, or how do I split a model across more than one GPU without making them spend all their time waiting on each other. Keeping that split in mind while reading is worth more than memorising any one section on its own.</p>`,
        check: {
          question: 'What decides whether an operation on a GPU is compute-bound or memory-bound?',
          options: [
            'How many parameters the model has in total',
            'Its arithmetic intensity: the number of FLOPs it performs per byte of memory it moves',
            'Whether it runs during training or inference',
            'The programming language the kernel is written in'
          ],
          answer: 1,
          explain: 'Arithmetic intensity is exactly the ratio that decides which of the chip\'s two ceilings, compute or memory bandwidth, an operation actually hits first.'
        }
      },
      {
        id: 'tas-f1',
        part: 'field',
        title: 'What a GPU is good at',
        viz: 'roofline',
        body: `<p>A GPU is built around a different bet than a CPU: instead of a small number of cores each optimised to run varied instructions quickly, a GPU packs thousands of simpler cores that all run the same instruction on different data at once. This is a poor fit for a program full of branches and dependent steps, and an excellent fit for the same arithmetic operation applied across a huge array of numbers, which is exactly what training a neural network is.</p>
<p>A GPU's raw compute speed is measured in FLOPs per second. An NVIDIA A100, for example, delivers up to 312 trillion floating-point operations per second (TFLOPs/s) in the bf16 format training commonly uses, and moves data between its memory and its compute cores at up to 2,039 gigabytes per second. Both numbers matter, and the ratio between them is what the roofline model is built on.</p>
<p><b>The roofline model, in plain words:</b> a chip has two ceilings. It cannot compute faster than its peak FLOPs/s, and it cannot move data faster than its peak memory bandwidth. Whether a particular operation hits the compute ceiling or the bandwidth ceiling depends on its <b>arithmetic intensity</b> - how many FLOPs it does for every byte it reads and writes. On an A100, dividing the two peak numbers gives a ridge point around 312,000 / 2,039 ≈ 153 FLOPs per byte: an operation with intensity below that is memory-bound, capped by bandwidth no matter how fast the chip can compute; above it, the operation is compute-bound, capped by FLOPs/s instead.</p>
<p><b>Why matrix multiplication dominates.</b> Multiplying two n x n matrices does roughly n³ FLOPs while reading only about n² numbers from memory, so each loaded value gets reused many times - arithmetic intensity that grows with matrix size, comfortably on the compute-bound side for the large matrices a transformer uses. A simple elementwise operation like an activation function, by contrast, reads one value, does one operation, and writes one value: arithmetic intensity close to one, permanently memory-bound regardless of the chip's FLOP count. GPUs, and the tensor cores built specifically to accelerate matrix multiplication, are built around the operation that can actually use all that raw compute.</p>`,
        deeper: `<p>This is also why attention, despite being central to a transformer, is not automatically compute-bound the way a large matrix multiplication is: the raw scores-and-softmax steps involve reading and writing a large intermediate matrix with comparatively little arithmetic per element, which is memory-bound - and is exactly the bottleneck FlashAttention, covered later in this chapter, was built to remove.</p>`,
        check: {
          question: 'An operation has an arithmetic intensity of 20 FLOPs per byte on an A100, whose ridge point is around 153 FLOPs per byte. What limits its speed?',
          options: [
            'Its peak compute (FLOPs/s), since it is compute-bound',
            'Memory bandwidth, since its intensity is well below the ridge point and it is memory-bound',
            'Neither; arithmetic intensity does not affect achievable speed',
            'The size of the model it belongs to'
          ],
          answer: 1,
          explain: 'Below the ridge point, an operation cannot get bytes to the compute cores fast enough to keep them busy, so memory bandwidth caps its actual speed regardless of the chip\'s FLOP count.'
        }
      },
      {
        id: 'tas-f2',
        part: 'field',
        title: 'PyTorch essentials an interviewer expects',
        body: `<p><b>Tensors</b> are PyTorch's array type - a scalar, a vector, a matrix, or an array of any higher number of dimensions - each one living on a specific device (CPU or a specific GPU) and tracking whether it needs a gradient computed for it.</p>
<p><b>Autograd</b> is what makes training possible without hand-writing derivatives: every operation performed on a tensor that requires a gradient is recorded into a graph as it runs, and calling <code>.backward()</code> on a final loss value walks that graph in reverse, applying the chain rule at each step to compute the gradient of the loss with respect to every parameter that fed into it.</p>
<p><b>The training loop</b> is the same handful of steps repeated every batch: run the model forward to get a prediction, compute a loss comparing it to the true label, clear old gradients (<code>zero_grad()</code>), call <code>backward()</code> to compute new gradients, and call the optimiser's <code>step()</code> to update the parameters using those gradients.</p>
<p><b>The DataLoader</b> reads examples from storage, groups them into batches, shuffles them each epoch, and typically uses several worker processes so the next batch is being prepared on the CPU while the GPU is still busy with the current one - without this overlap, the GPU sits idle between batches waiting on data.</p>
<p><b>Mixed precision</b> runs most arithmetic in bf16 (or fp16), which is faster and uses less memory than fp32, while keeping certain values, most importantly the optimiser's running statistics, in fp32 where the extra precision avoids numerical problems.</p>
<p><b>Gradient accumulation</b> lets a batch size larger than memory allows be simulated: run several smaller forward-and-backward passes, summing their gradients instead of stepping after each one, then take a single optimiser step once enough passes have accumulated to match the desired effective batch size.</p>
<p><b>Checkpointing</b> means two different things worth keeping separate: <i>activation checkpointing</i> discards some intermediate forward-pass values and recomputes them during the backward pass to save memory, while <i>model checkpointing</i> means periodically saving the model and optimiser's state to disk so training can resume after an interruption.</p>`,
        deeper: `<p>Effective batch size, once gradient accumulation and multiple GPUs are both in play, is per-device batch size times the number of accumulation steps times the number of devices. A per-device batch of 8, accumulated over 4 steps, across 8 GPUs, gives an effective batch of 8 x 4 x 8 = 256 - a number worth being able to compute on the spot, since it is exactly what an interviewer is checking when they ask "so what's your actual batch size."</p>`,
        check: {
          question: 'A GPU frequently sits idle for a moment between batches during training, with utilisation dropping to near zero at regular intervals. What is the most likely cause?',
          options: [
            'The learning rate is too high',
            'The DataLoader is not keeping up: the next batch is not ready in CPU memory when the GPU finishes the current one',
            'Mixed precision is enabled',
            'Autograd is recording too large a graph'
          ],
          answer: 1,
          explain: 'A GPU that periodically stalls waiting for the next batch, rather than running continuously, is the classic sign of a data-loading bottleneck, not a training-math problem.'
        }
      },
      {
        id: 'tas-f3',
        part: 'field',
        title: 'Fitting a model in memory',
        viz: 'memory-per-parameter',
        body: `<p>Training a model needs memory for four separate things, and only one of them is the model itself: the <b>parameters</b>, their <b>gradients</b>, the <b>optimizer state</b>, and the <b>activations</b> saved during the forward pass so the backward pass can use them.</p>
<p><b>The 16-bytes-per-parameter rule.</b> In mixed-precision training with the Adam optimiser, the standard accounting works out to 16 bytes of fixed memory per parameter, independent of batch size or sequence length: a 2-byte bf16 copy of the parameter used for the forward and backward pass, a 2-byte bf16 gradient, and three fp32 copies the optimiser keeps for numerical stability - a 4-byte fp32 master copy of the parameter that is actually updated, a 4-byte momentum term, and a 4-byte variance term. Two plus two plus four plus four plus four is sixteen.</p>
<p><b>A worked example.</b> A 7-billion-parameter model: 7,000,000,000 x 16 bytes = 112,000,000,000 bytes, or 112 GB - before a single activation has been stored, and before any input has even been processed. This is why full fine-tuning of a 7-billion-parameter model does not fit on a single 80 GB GPU, and why the parallelism strategies later in this chapter exist at all.</p>
<p><b>Sequence length versus batch size.</b> Activation memory is the piece that does depend on the batch and the input: it grows with batch size, sequence length, model depth, and hidden size, and the attention mechanism's own intermediate values grow with the <i>square</i> of sequence length specifically, since a full attention score matrix is sequence length by sequence length. On a GPU with a fixed memory budget, a longer sequence length forces a smaller batch size to keep total memory in bounds, and because of that squared term, doubling sequence length costs more activation memory than doubling batch size does.</p>`,
        deeper: `<p>Not every framework keeps the gradient in bf16: some keep it in fp32 for extra numerical stability, which raises the fixed cost from 16 to 18 bytes per parameter (2 bf16 param, 4 fp32 gradient, and the same 12 bytes of optimiser state). The 16-byte figure is the standard textbook number and the one worth quoting from memory; naming the fp32-gradient variant when asked shows you understand where the number actually comes from rather than having only memorised it.</p>`,
        check: {
          question: 'A 13-billion-parameter model is trained with full fine-tuning, mixed precision, and Adam. Using the 16-bytes-per-parameter rule, roughly how much fixed memory (params, gradients, optimizer state) does this need, before any activations?',
          options: [
            'About 26 GB',
            'About 208 GB',
            'About 13 GB',
            'About 52 GB'
          ],
          answer: 1,
          explain: '13,000,000,000 x 16 bytes = 208,000,000,000 bytes, or 208 GB. This is why a 13-billion-parameter model needs its memory split across several GPUs before activations even enter the picture.'
        }
      },
      {
        id: 'tas-f4',
        part: 'field',
        title: 'Data parallelism: DDP and gradient all-reduce',
        viz: 'data-parallel-allreduce',
        body: `<p>Data parallelism is the simplest way to use more than one GPU: copy the entire model onto every GPU, give each GPU a different slice of the current batch, and have each one compute its own forward pass, loss, and gradients independently.</p>
<p>The problem this creates is that each GPU now has a different gradient, computed from different data, and if each one updated its own copy of the model independently, the copies would drift apart and stop being the same model. <b>DDP</b> (distributed data parallel), PyTorch's standard implementation of this pattern, fixes this with an <b>all-reduce</b> step after the backward pass: every GPU's gradient for a given parameter is summed (and averaged) across all participating GPUs, so every GPU ends the step holding the exact same, correct gradient, and then every GPU takes the identical optimiser step, keeping every copy of the model in sync.</p>
<p>The standard implementation is a <b>ring all-reduce</b>: GPUs are arranged in a logical ring, and each one only ever sends data to its neighbour rather than to every other GPU at once. This is bandwidth-efficient - each GPU sends and receives roughly the same amount of data regardless of how many GPUs are in the ring - which is why it scales to a large number of GPUs without the communication cost exploding.</p>
<p>Data parallelism's limitation is memory, not communication: because the full model, its full gradients, and its full optimiser state are replicated on every single GPU, adding more GPUs does nothing to shrink how much memory any one of them needs to hold. It only helps you process more data at once, not fit a bigger model.</p>`,
        deeper: `<p>Because DDP's gradient synchronisation can overlap with the backward pass itself - a parameter's gradient can start being communicated as soon as it is computed, while later layers are still computing theirs - a well-implemented ring all-reduce adds very little wall-clock time on top of the backward pass, which is part of why data parallelism scales as well as it does up to a point.</p>`,
        check: {
          question: 'Why does adding more GPUs under plain data parallelism (DDP) not let you train a bigger model than fits on one GPU?',
          options: [
            'DDP does not support more than 8 GPUs',
            'The full model, gradients, and optimizer state are replicated on every GPU, so per-GPU memory does not shrink as GPUs are added',
            'All-reduce becomes slower than training itself past 2 GPUs',
            'DDP only works with small batch sizes'
          ],
          answer: 1,
          explain: 'Data parallelism splits the batch, not the model. Every GPU still needs to hold a full copy of everything the model needs, so the per-GPU memory requirement never shrinks no matter how many GPUs you add.'
        }
      },
      {
        id: 'tas-f5',
        part: 'field',
        title: 'ZeRO and FSDP',
        viz: 'zero-sharding',
        body: `<p>ZeRO (Zero Redundancy Optimizer) starts from the exact limitation data parallelism has: everything is replicated on every GPU, when much of it does not need to be, since a given GPU only needs its own shard at the moment it is actually computing with it.</p>
<p><b>ZeRO has three stages, each sharding one more category of memory across the GPUs:</b></p>
<p><b>Stage 1</b> shards only the optimizer state - the largest of the three categories at 12 of the 16 bytes per parameter - so each GPU holds only 1/N of it, where N is the number of GPUs, while still holding the full parameters and full gradients.</p>
<p><b>Stage 2</b> additionally shards the gradients, so each GPU holds only its own slice of those too, keeping only the full parameters replicated.</p>
<p><b>Stage 3</b> shards the parameters themselves as well, so no single GPU ever holds a complete copy of the model at rest. Just before a layer's forward or backward computation needs the full parameter, an <b>all-gather</b> step temporarily reconstructs it from every GPU's shard, the computation runs, and the full copy is freed again immediately afterward.</p>
<p><b>FSDP</b> (fully sharded data parallel) is PyTorch's own native implementation of essentially the same idea as ZeRO stage 3: parameters, gradients, and optimizer state are all sharded across GPUs by default, gathered just in time for each layer's computation, and released right after. The trade-off for all three ZeRO stages, and for FSDP, is the same: memory per GPU drops roughly in proportion to the number of GPUs, at the cost of extra communication to gather and release shards, so this only pays off once a model is too large to fit without it.</p>`,
        deeper: `<p>The progression from ZeRO stage 1 through stage 3 is a direct trade of communication for memory: stage 1 adds almost no extra communication over plain data parallelism, while stage 3 adds the most, since it has to gather the full parameters fresh for essentially every layer's forward and backward pass. Picking a stage in practice usually means finding the least aggressive one that actually lets the model fit, rather than defaulting straight to full sharding.</p>`,
        check: {
          question: 'What specifically does FSDP (or ZeRO stage 3) do differently from plain DDP?',
          options: [
            'It uses a different optimiser algorithm entirely',
            'It shards parameters, gradients, and optimizer state across GPUs, gathering the full parameters only briefly when a layer actually needs them',
            'It removes the need for gradient synchronisation altogether',
            'It only works with a single GPU'
          ],
          answer: 1,
          explain: 'DDP replicates everything on every GPU. FSDP keeps only a shard resident per GPU at rest, temporarily reconstructing the full parameters only for the brief window a layer is actually being computed.'
        }
      },
      {
        id: 'tas-f6',
        part: 'field',
        title: 'Tensor, pipeline, and expert parallelism',
        viz: 'pipeline-bubbles',
        body: `<p>Data parallelism, ZeRO, and FSDP all split the batch or the model's state across GPUs while every GPU still runs the same computation graph. The next three strategies instead split the actual computation itself.</p>
<p><b>Tensor parallelism</b> splits a single large matrix multiplication across GPUs - for example, splitting a weight matrix by columns so each GPU computes its own partial output, then combining the partial results with an all-reduce or all-gather before the next layer runs. Because this communication happens inside every single layer, tensor parallelism needs very fast GPU-to-GPU links and is normally kept within one machine, where GPUs share a fast interconnect.</p>
<p><b>Pipeline parallelism</b> instead splits the model's layers into groups, placing each group on a different GPU, so a batch of data flows through the GPUs in sequence like a factory line: GPU 0 runs its layers and passes its output to GPU 1, which runs its layers and passes on to GPU 2, and so on. Communication happens only at the boundary between groups, far less often than tensor parallelism's every-layer exchange, which is why pipeline parallelism tolerates a slower link and can cross between machines. Its cost is the <b>pipeline bubble</b>: with a single batch moving through the pipeline, most GPUs sit idle most of the time, either waiting for the batch to reach them or having already finished and waiting for the batch to finish everywhere else. Splitting a batch into several smaller <b>microbatches</b> and feeding them through the pipeline back to back keeps more GPUs busy at once, and reduces, though does not eliminate, the bubble.</p>
<p><b>Expert parallelism</b> is specific to a mixture-of-experts model: instead of one feed-forward network per layer, there are several "expert" sub-networks, and a learned router sends each token to only a small number of them. Different experts live on different GPUs, so a token has to be sent, via an <b>all-to-all</b> communication step, to whichever GPU holds the expert it was routed to, and the result sent back. This lets a model have a very large total parameter count while only a fraction of it actually computes on any given token.</p>`,
        deeper: `<p>What each strategy actually communicates is the cleanest way to keep them apart in an answer: tensor parallelism communicates activations, every layer, because the computation itself is split; pipeline parallelism communicates activations too, but only at the handful of boundaries between stages; expert parallelism communicates tokens themselves, routing them to wherever their assigned expert happens to live.</p>`,
        check: {
          question: 'Why is tensor parallelism normally kept within a single machine, while pipeline parallelism can more easily span multiple machines?',
          options: [
            'Tensor parallelism needs more GPU memory, which only fits within one machine',
            'Tensor parallelism communicates on every layer\'s forward and backward pass, so it needs the fastest possible link; pipeline parallelism only communicates at stage boundaries, so it tolerates a slower cross-machine link',
            'Pipeline parallelism does not require any communication at all',
            'Tensor parallelism only works with mixture-of-experts models'
          ],
          answer: 1,
          explain: 'How often a strategy communicates decides how fast a link it needs. Every-layer communication demands the fastest link available; occasional, stage-boundary communication tolerates a much slower one.'
        }
      },
      {
        id: 'tas-f7',
        part: 'field',
        title: 'Making training fast',
        body: `<p><b>Profile before optimising.</b> A tool like the PyTorch profiler or NVIDIA Nsight Systems shows exactly where time is actually going - GPU compute, waiting on data, or communication - which is the only reliable way to know which of the ideas below is worth applying, rather than guessing.</p>
<p><b>Data loading bottlenecks</b> show up as a GPU that periodically drops to low utilisation between batches, waiting on the CPU-side pipeline to prepare the next one. The usual fixes are more DataLoader worker processes, prefetching the next batch while the current one runs, pinning memory to speed up the CPU-to-GPU transfer, and doing expensive preprocessing once in advance rather than repeating it every epoch.</p>
<p><b>Kernel fusion</b> combines several small GPU operations into one, cutting the number of separate trips to and from memory: three separate elementwise operations each read their input from memory and write their output back, while one fused operation reads once, does all three computations while the data is still on-chip, and writes once - directly reducing memory traffic on operations that are memory-bound to begin with.</p>
<p><b>FlashAttention</b> applies exactly this idea to attention. It tiles the computation so each piece fits in the GPU's fast on-chip memory and the full attention score matrix is never written out to main memory at all, cutting memory traffic sharply without changing the mathematical result. The LLM inference engineering chapter goes through the mechanism in full.</p>
<p><b>torch.compile</b> is PyTorch's built-in just-in-time compiler: it traces a model's code, captures it as a graph, and generates fused, optimised kernels for it automatically, often with only a one-line change and no rewrite of the model itself.</p>
<p><b>CUDA</b> is NVIDIA's parallel-computing platform and programming model, the low-level layer most GPU code is ultimately built on. <b>Triton</b> is a Python-embedded language and compiler that lets an engineer write custom, efficient GPU kernels - including the fused kernels behind implementations of FlashAttention - without writing CUDA by hand.</p>`,
        deeper: `<p>The three-way split of "where did the time go" - compute, memory, or plain overhead from too many small Python-level operations - is a genuinely useful mental model on its own: an operation with low arithmetic intensity is a memory problem no faster GPU fixes; a training loop full of tiny unfused operations is an overhead problem torch.compile or manual fusion fixes; and only a true compute-bound operation actually benefits from a bigger, faster chip.</p>`,
        check: {
          question: 'Why does FlashAttention speed up attention without changing the actual numbers attention computes?',
          options: [
            'It approximates attention using fewer computations',
            'It tiles the computation to avoid ever writing the full attention score matrix to slow GPU memory, cutting memory traffic on an operation that was memory-bound',
            'It runs attention on the CPU instead of the GPU',
            'It reduces the model\'s sequence length automatically'
          ],
          answer: 1,
          explain: 'FlashAttention is exact, not approximate. The speedup comes entirely from avoiding unnecessary reads and writes to slow memory, which is where a memory-bound operation actually loses its time.'
        }
      },
      {
        id: 'tas-f8',
        part: 'field',
        title: 'Multi-node training',
        body: `<p>Once training spans more than one machine, two new problems appear that do not exist on a single box: communication has to cross a much slower link, and any one machine failing can stall or ruin the whole run.</p>
<p><b>NCCL</b> is NVIDIA's library implementing the collective communication operations - all-reduce, all-gather, broadcast - that data parallelism, ZeRO, FSDP, and the other parallelism strategies in this chapter all run on top of. It automatically detects the hardware topology available and picks an efficient communication pattern for it, whether GPUs are on the same machine or spread across many.</p>
<p><b>Interconnect</b> is the physical link GPUs use to talk to each other, and the gap in speed matters directly: links within one machine (such as NVLink) move data at several hundred gigabytes per second, while the network connecting separate machines (commonly InfiniBand) typically moves data an order of magnitude slower. This asymmetry is exactly why tensor parallelism, which communicates on every layer, is normally kept within one machine, while data parallelism and pipeline parallelism, which communicate far less often, are the strategies used to span multiple machines.</p>
<p><b>Checkpoint and restart.</b> A large training run can last days or weeks, and any interruption before the very end would be an unacceptable waste if it meant starting over. Training periodically saves its full state - model weights, optimizer state, the current step number, and enough random-number-generator state to resume deterministically - to durable storage, so a crash loses only the work done since the last checkpoint rather than the whole run.</p>
<p><b>Stragglers and failures.</b> A synchronous training step, using all-reduce, has every GPU wait for the slowest one before continuing, so a single underperforming or failing machine slows down or halts the entire job. Large training runs handle this with health checks that catch a failing machine quickly, and with elastic or fault-tolerant training setups that can drop a failed node and, in some cases, add a replacement back in without restarting the whole job from its last checkpoint.</p>`,
        deeper: `<p>The straggler problem is a direct consequence of synchronous training being exactly as fast as its slowest participant on every single step, which is why large training runs invest heavily in fast failure detection: catching and replacing one failing machine in seconds costs far less than the whole job idling while everyone waits on it, or than losing a checkpoint's worth of progress to a crash that went unnoticed.</p>`,
        check: {
          question: 'A synchronous multi-GPU training job uses all-reduce to sync gradients every step. One GPU is consistently 30 percent slower than the rest due to a hardware issue. What is the effect on the whole job?',
          options: [
            'No effect; other GPUs continue at full speed regardless',
            'Every step waits for the slowest GPU, so the whole job runs roughly 30 percent slower, not just that one GPU\'s share of work',
            'The slow GPU is automatically skipped for that step',
            'Only the final loss value is affected, not training speed'
          ],
          answer: 1,
          explain: 'Synchronous all-reduce cannot proceed until every participant has contributed. One straggler sets the pace for the entire job, on every single step.'
        }
      },
      {
        id: 'tas-f9',
        part: 'field',
        title: 'Experiment hygiene',
        body: `<p>None of the memory or communication techniques in this chapter matter if the results of a training run cannot be trusted or reproduced, which is what this last section is about.</p>
<p><b>Seeds.</b> Setting a fixed random seed for Python, NumPy, and the training framework's own random number generator makes an experiment's random choices - weight initialisation, data shuffling, dropout - repeatable rather than different on every run. On a GPU, this gets you close to reproducible but not perfectly deterministic by default, since some GPU operations run in a nondeterministic order for speed; frameworks provide a stricter deterministic mode for the cases where exact reproducibility matters more than raw speed.</p>
<p><b>Reproducibility</b> is broader than seeds alone: it means recording the exact code version, the exact data version, and the exact configuration that produced a given result, so that result can be regenerated later or explained when it cannot be. A result nobody can reproduce, including the person who first produced it, is not a result worth trusting.</p>
<p><b>Tracking</b> means logging every run's configuration, metrics over time, and resulting files to a shared system rather than to scattered notebooks or a person's memory, so results across many experiments can be compared later. The MLOps tooling chapter covers what a tracker such as MLflow records and how a model registry sits on top of it.</p>
<p><b>Ablations.</b> An ablation study changes exactly one factor at a time against a fixed baseline - one architecture choice, one hyperparameter, one piece of the training pipeline removed or swapped - and measures the effect of that one change in isolation. Changing several things between two runs and then comparing them tells you nothing about which change actually mattered; a real ablation is what turns "we tried a few things and it got better" into a specific, defensible claim about which change did the work.</p>`,
        deeper: `<p>The discipline behind seeds, tracking, and ablations is really one discipline: never let more than one explanation be possible for why a number moved. A change in the data, the code, and the hyperparameters all happening between two compared runs leaves no way to say which one caused the improvement, and an interviewer asking about experiment design is usually checking for exactly this instinct.</p>`,
        check: {
          question: 'A team changes the learning rate, the batch size, and the model architecture all at once between two training runs, and the second run scores higher. What can they correctly conclude?',
          options: [
            'The new learning rate caused the improvement',
            'The new architecture caused the improvement',
            'Very little on its own - with three factors changed at once, there is no way to attribute the improvement to any one of them without further ablations',
            'The improvement proves the new batch size was too small before'
          ],
          answer: 2,
          explain: 'Changing several factors between two runs confounds them completely. A proper ablation changes one factor at a time against a fixed baseline before any single factor can be credited.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'tas-a1',
        type: 'formulate',
        title: 'Exercise: work out whether a model fits on the hardware',
        prompt: 'You want to fully fine-tune a 3-billion-parameter model in mixed precision with Adam, on a single GPU with 48 GB of memory. Using the 16-bytes-per-parameter rule, work out whether the fixed memory (parameters, gradients, optimizer state) fits, and if it does not, name one concrete way to make it fit on that one GPU.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) computes the fixed memory correctly: 3,000,000,000 x 16 bytes = 48,000,000,000 bytes = 48 GB; (2) correctly concludes this does not fit, since 48 GB of fixed memory alone would consume the entire 48 GB GPU with nothing left for activations, let alone anything else running on the machine; (3) proposes at least one concrete, correct fix that keeps the job on one GPU: LoRA or another parameter-efficient method (only a small fraction of parameters need gradients and optimizer state), 8-bit or lower-precision optimizer states, or activation checkpointing (which addresses activation memory specifically, so it should be named alongside a fix for the fixed 48 GB, not instead of one); (4) does not claim ZeRO or FSDP as a single-GPU fix, since both are about sharding across multiple GPUs, not about single-GPU memory reduction. Bonus: notes that even a fix that solves the fixed-memory problem still leaves activation memory to budget for separately. Common mistakes: forgetting to account for activation memory needing room beyond the 48 GB fixed cost; proposing multi-GPU sharding as a fix for a single-GPU constraint; arithmetic errors in the base calculation. {{HONESTY}}`,
        model: `<p>"Fixed memory at 16 bytes per parameter: 3,000,000,000 x 16 = 48,000,000,000 bytes, which is 48 GB. That already equals the entire GPU's memory, with nothing left over for activations, so this does not fit as a full fine-tune, even before a single batch is processed.</p>
<p>Since this is a single-GPU constraint, sharding across multiple GPUs with ZeRO or FSDP isn't available here - that solves a different problem. The fix that actually helps on one GPU is to stop needing gradients and optimizer state for all 3 billion parameters in the first place: LoRA freezes the base weights and only trains a small low-rank adapter, so the 12 bytes of optimizer state and the gradient only apply to a tiny fraction of the parameters. What is left is mostly the frozen base weights themselves, about 6 GB in bf16 for a 3-billion-parameter model, instead of 48 GB.</p>
<p>That still leaves activation memory to account for separately - LoRA reduces the fixed cost, not the activation cost, so I'd also expect to need activation checkpointing or a smaller batch size and sequence length to make the whole thing fit comfortably rather than exactly at the limit."</p>`
      },
      {
        id: 'tas-a2',
        type: 'design',
        title: 'Exercise: choose a parallelism strategy for 8 GPUs on one machine',
        prompt: 'You have 8 GPUs in a single machine, connected by a fast NVLink interconnect, and a model too large to fit on one GPU even with activation checkpointing. Walk me through how you would combine the parallelism strategies from this chapter to train it, and why.',
        timeboxSec: 420,
        rubric: `Must-haves: (1) recognises that since all 8 GPUs are within one machine with fast NVLink, tensor parallelism is a reasonable choice for at least part of the split, given its every-layer communication needs a fast link; (2) proposes combining more than one strategy rather than only one (for example tensor parallelism within the machine plus ZeRO/FSDP sharding of optimizer state and gradients, or data parallelism if the batch also needs splitting) rather than treating them as mutually exclusive; (3) does not propose pipeline parallelism as clearly superior here for its low communication need, since that benefit specifically matters when GPUs are spread across separate machines with a slow link, which is not the case in this single-machine scenario, though pipeline parallelism is not wrong to mention as one option among several; (4) explains what is actually communicated in whichever strategy is chosen, not just the strategy's name; (5) does not claim this makes the model fit for free - correctly notes there is still a communication cost being traded for the memory savings. Bonus: mentions that FSDP/ZeRO-3 combined with the fast intra-node interconnect is often a simpler starting point in practice than hand-tuning tensor and pipeline parallelism together. Common mistakes: proposing only data parallelism, which does nothing to shrink per-GPU memory; ignoring the fast-interconnect detail entirely; claiming any of these techniques comes with no cost. {{HONESTY}}`,
        model: `<p>"With all 8 GPUs on one machine and a fast NVLink interconnect between them, I have real flexibility, since the punishing every-layer communication cost of tensor parallelism is exactly what a fast intra-node link is built to absorb.</p>
<p>My starting point would actually be FSDP - ZeRO-3-style sharding of parameters, gradients, and optimizer state across all 8 GPUs. That alone can shrink per-GPU memory close to 1/8th of the unsharded cost, and since the interconnect is fast, the extra all-gather communication FSDP needs to reconstruct parameters just before each layer's computation is well tolerated here.</p>
<p>If FSDP alone still doesn't fit, or if I specifically want to keep more of the model's actual computation graph split for other reasons, I'd add tensor parallelism on top: split, say, the attention and feed-forward matrices across a subset of the 8 GPUs, taking advantage of NVLink for the every-layer all-reduce that requires. I probably wouldn't reach for pipeline parallelism as my first move here specifically - its main advantage is tolerating a slow link between machines, which isn't the constraint I'm under with everything on one box and NVLink between them, though it's not wrong to combine it in if the model is large enough to need every strategy at once.</p>
<p>None of this is free: FSDP trades memory for extra gather-and-release communication every layer, and tensor parallelism trades memory for even more frequent communication. The goal isn't to eliminate the trade-off, it's to spend it on the interconnect that can actually absorb it cheaply, which here is the fast link inside the machine."</p>`
      },
      {
        id: 'tas-a3',
        type: 'explain',
        title: 'Exercise: explain DDP, FSDP, and tensor parallelism to a new team member',
        prompt: 'A new engineer on the team understands basic PyTorch training but has never worked with multi-GPU training. Explain the difference between DDP, FSDP, and tensor parallelism - what each one actually splits, and when you would reach for each.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) correctly states DDP splits the batch, replicating the full model, gradients, and optimizer state on every GPU; (2) correctly states FSDP splits the model's own state - parameters, gradients, and optimizer state - across GPUs, gathering pieces temporarily only when needed; (3) correctly states tensor parallelism splits an individual matrix multiplication itself across GPUs, which then combine partial results; (4) gives a correct condition for reaching for each: DDP when the model fits on one GPU and you want to process more data at once; FSDP when the model itself does not fit on one GPU; tensor parallelism when a fast interconnect is available and communication needs to happen every layer; (5) does not conflate FSDP with tensor parallelism, since sharding a model's stored state and splitting a specific computation are different mechanisms even though both let you train a bigger model. Common mistakes: describing FSDP as only a faster version of DDP rather than explaining what it actually shards differently; claiming tensor parallelism and FSDP solve the same problem in the same way; omitting when you would actually pick one over another. {{HONESTY}}`,
        model: `<p>"All three let you use more than one GPU, but they split a different thing. DDP is the simplest: every GPU holds a complete copy of the model, its gradients, and its optimizer state, and each GPU just processes a different slice of the batch. After the backward pass, an all-reduce step syncs the gradients so every copy stays identical. You reach for DDP when the model itself comfortably fits on one GPU and you mainly want to process more data at once, faster.</p>
<p>FSDP is for when the model itself doesn't fit on one GPU. Instead of every GPU holding the full parameters, gradients, and optimizer state, each one holds only its own shard of each. Right before a layer actually needs the full parameters to compute, FSDP gathers them from all the shards temporarily, runs the computation, and releases them again. So FSDP doesn't change what gets computed, it changes how much of the model's own state any single GPU has to store at rest.</p>
<p>Tensor parallelism is different again: it splits an individual matrix multiplication itself, so two GPUs might each compute half of one weight matrix's output and then combine their partial results before moving to the next layer. That happens on every single layer, so it needs a very fast connection between the GPUs involved, which is why it's normally used within one machine rather than across a slower network. You'd reach for it specifically when even FSDP's memory savings aren't enough and you have the fast interconnect to support splitting the computation itself."</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Horace He: Making Deep Learning Go Brrrr From First Principles', u: 'https://horace.io/brrr_intro.html', w: 'The compute/memory/overhead framework this chapter\'s "making training fast" section is built on, from the engineer who wrote it.', m: 25 },
      { l: 'ZeRO: Memory Optimizations Toward Training Trillion Parameter Models (Rajbhandari et al., 2019)', u: 'https://arxiv.org/abs/1910.02054', w: 'The original ZeRO paper. Read section 3 for the exact memory accounting behind the three sharding stages and the 16-bytes-per-parameter figure.', m: 30 },
      { l: 'PyTorch: Getting Started with Fully Sharded Data Parallel (FSDP2)', u: 'https://docs.pytorch.org/tutorials/intermediate/FSDP_tutorial.html', w: 'What FSDP actually shards and when it gathers and releases each shard, from PyTorch\'s own tutorial.', m: 25 },
      { l: 'PyTorch: Getting Started with Distributed Data Parallel', u: 'https://docs.pytorch.org/tutorials/intermediate/ddp_tutorial.html', w: 'How DDP\'s gradient synchronisation actually overlaps with the backward pass, in the framework\'s own words.', m: 20 },
      { l: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al., 2022)', u: 'https://arxiv.org/abs/2205.14135', w: 'The original paper. Read the introduction for exactly why attention is memory-bound and how tiling avoids materialising the full score matrix.', m: 25 },
      { l: 'Andrej Karpathy: Let\'s reproduce GPT-2 (124M)', u: 'https://www.youtube.com/watch?v=l8pRSuU81PU', w: 'Builds and trains a GPT-2-scale model from scratch on real GPUs, live, including mixed precision and the data-loading pipeline this chapter describes in the abstract.', m: 240 },
      { l: 'GPU MODE: LLM Inference Lecture - Roofline Analysis for GPU', u: 'https://www.youtube.com/watch?v=7EJjdDLK4cg', w: 'A worked walkthrough of arithmetic intensity and the compute-bound versus memory-bound split this chapter opens with.', m: 45 },
      { l: 'NVIDIA: NCCL (NVIDIA Collective Communications Library)', u: 'https://developer.nvidia.com/nccl', w: 'What NCCL actually implements - all-reduce, all-gather, broadcast - underneath every multi-GPU training strategy in this chapter.', m: 10 }
    ],
    glossary: [
      {
        g: 'Training at scale and GPUs',
        sub: '',
        rows: [
          ['Arithmetic intensity', 'FLOPs performed per byte of memory moved; decides whether an operation is compute- or memory-bound.', 'The roofline model, and explaining why matmul dominates GPU workloads.'],
          ['Roofline model', 'A chart of a chip\'s two ceilings, peak compute and peak memory bandwidth, used to read off what limits an operation.', 'Reasoning about GPU performance from first principles.'],
          ['Mixed precision', 'Doing most arithmetic in bf16 while keeping optimiser-critical values in fp32.', 'The default setting for essentially all modern large-scale training.'],
          ['16 bytes per parameter', 'The fixed memory cost of mixed-precision Adam training: 2 (bf16 param) + 2 (bf16 grad) + 4+4+4 (fp32 master, momentum, variance).', 'Estimating whether a model fits on given hardware before training starts.'],
          ['Activation checkpointing', 'Discarding forward-pass activations and recomputing them in the backward pass, trading compute for memory.', 'Fitting a longer sequence length or larger batch on fixed hardware.'],
          ['Gradient accumulation', 'Summing gradients over several small passes before one optimiser step, to reach a larger effective batch.', 'Simulating a large batch size that does not fit in memory at once.'],
          ['DDP / all-reduce', 'Replicating the model on every GPU, splitting the batch, and syncing gradients with an all-reduce after backward.', 'The default first step for using more than one GPU.'],
          ['ZeRO / FSDP', 'Sharding optimizer state, then gradients, then parameters themselves across GPUs instead of replicating them.', 'Training a model too large to fit replicated on every GPU.'],
          ['Tensor parallelism', 'Splitting a single matrix multiplication across GPUs, which combine partial results every layer.', 'Fitting a model when even sharding is not enough, given a fast interconnect.'],
          ['Pipeline parallelism / bubble', 'Splitting layers across GPUs in sequence; the bubble is the idle time before the pipeline is full or after it drains.', 'Spanning multiple machines with a slower link between them.'],
          ['Expert parallelism', 'Placing a mixture-of-experts model\'s different experts on different GPUs, routing tokens to their assigned expert.', 'Training a very large model where only a fraction of it computes per token.'],
          ['NCCL', 'NVIDIA\'s library implementing the all-reduce, all-gather, and broadcast operations multi-GPU training runs on.', 'What actually executes the communication behind every parallelism strategy.'],
          ['Straggler', 'A single slow or failing GPU that sets the pace for an entire synchronous training job.', 'Diagnosing why a multi-GPU job runs slower than expected.'],
          ['Ablation', 'Changing exactly one factor at a time against a fixed baseline to isolate its effect.', 'The only way to correctly attribute an improvement to a specific change.']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
