/* sd-information: three system design chapters - search and retrieval, counting at scale, realtime delivery and feeds. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['search-and-retrieval'] = {
    id: 'search-and-retrieval',
    title: 'Search and retrieval systems',
    level: 'warning',
    levelLabel: 'Common in system design interviews for any product with a search box.',
    why: `Almost any product with more than a shelf of items ends up needing a search box, and an interviewer uses it to see whether you know what happens between a user typing three letters and a ranked list appearing. This is one of the few system design topics with real mathematics behind it - a scoring formula, a fusion rule, a ranking metric - so it is also used to check whether you can go one level below a box-and-arrow diagram. The strongest answers show the mechanism (tokens, a posting list, a scoring formula) and then the trade-offs a real search team argues about: freshness against load, and precision against recall.`,
    learn: [
      {
        id: 'sr-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Term.</b> One unit of text a search engine matches on, usually a word after it has been cleaned up - "running" and "run" might become the same term.</li>
<li><b>Token / tokenisation.</b> A token is one piece produced by splitting raw text; tokenisation is that splitting step, deciding where one word ends and the next begins.</li>
<li><b>Stop word.</b> A very common word ("the," "a," "is") that is often dropped before indexing because it carries little meaning and would otherwise appear in almost every posting list.</li>
<li><b>Stemming / lemmatisation.</b> Reducing a word to a shared root ("running," "runs," "ran" all become "run") so different forms of a word match the same postings.</li>
<li><b>Inverted index.</b> A map from each term to the list of documents that contain it - the opposite of a forward index, which maps each document to the terms inside it.</li>
<li><b>Posting list.</b> The list stored for one term in an inverted index: which documents contain it, and often how many times and at which positions.</li>
<li><b>Positional posting.</b> A posting that also records where in the document a term appears, which lets the engine check whether two terms sit next to each other for a phrase query.</li>
<li><b>Document frequency (df).</b> The number of documents that contain a given term at least once.</li>
<li><b>Term frequency (tf).</b> The number of times a given term appears inside one specific document.</li>
<li><b>Inverse document frequency (IDF).</b> A weight that grows as a term gets rarer across the whole collection, so a rare word like "arthroscopy" counts for more than a common one like "good."</li>
<li><b>TF-IDF.</b> A scoring scheme that multiplies a term's frequency in a document by its inverse document frequency, an older ancestor of BM25.</li>
<li><b>BM25.</b> The standard relevance formula used by most text search engines today; it behaves like TF-IDF but caps how much repeating a word helps and adjusts for document length.</li>
<li><b>Boolean retrieval.</b> Answering a query by set operations on posting lists - AND intersects them, OR unions them, NOT subtracts one from another.</li>
<li><b>Tiered index.</b> An index split into layers of decreasing quality (for example, "term in the title" versus "term anywhere"), so a search can answer from a small, high-quality tier first.</li>
<li><b>Query understanding.</b> The set of steps a search engine applies to a typed query before running it - fixing spelling, adding synonyms, guessing intent.</li>
<li><b>Learning to rank.</b> Training a model to order search results, using features like BM25 score, click history and freshness, instead of hand-writing the ranking formula.</li>
<li><b>Click-through rate (CTR).</b> The fraction of times a result was shown that it was also clicked, one of the strongest and noisiest inputs to ranking.</li>
<li><b>Precision at k.</b> Of the top k results shown, the fraction that are actually relevant.</li>
<li><b>Recall.</b> Of all the relevant documents that exist, the fraction the search actually returned somewhere in its results.</li>
<li><b>NDCG (normalised discounted cumulative gain).</b> A ranking quality score that rewards a highly relevant result for appearing near the top of the list, not just for appearing at all.</li>
<li><b>MRR (mean reciprocal rank).</b> The average, across many queries, of one divided by the rank of the first relevant result.</li>
<li><b>Relevance judgment.</b> A human or automated label saying how relevant a specific document is to a specific query, used to score ranking quality offline.</li>
<li><b>Interleaving.</b> An online evaluation method that mixes results from two ranking algorithms into one list and watches which algorithm's results get clicked more.</li>
<li><b>Near-real-time indexing.</b> Indexing where a written document becomes searchable within a short delay (often around a second), rather than instantly or only after a large batch job.</li>
<li><b>Refresh interval.</b> How often a search engine opens a new, searchable view of its index; a document written between refreshes is not yet searchable.</li>
<li><b>Sharding (document vs term partitioning).</b> Splitting an index across machines either by document (each shard holds a full index for a subset of documents) or by term (each shard holds full posting lists for a subset of terms).</li>
<li><b>Embedding.</b> A vector of numbers that represents a piece of text (or an image, or anything else) such that similar meanings end up as nearby vectors.</li>
<li><b>Vector search / ANN (approximate nearest neighbour).</b> Finding the stored vectors closest to a query vector, approximately rather than exactly, because exact search over millions of vectors is too slow.</li>
<li><b>HNSW / IVF.</b> Two common approximate nearest neighbour index types: HNSW is a layered graph you descend greedily; IVF clusters vectors and searches only the nearest clusters.</li>
<li><b>Hybrid retrieval.</b> Combining a keyword-based ranking (like BM25) with a vector-based ranking into one result list.</li>
<li><b>Reciprocal rank fusion (RRF).</b> A formula for combining two or more ranked lists into one, by summing a score based on each document's rank in each list.</li>
<li><b>Trie.</b> A tree in which every path from the root spells out a prefix, letting you look up everything that starts with a given string in time proportional to the string's length.</li>
<li><b>Autocomplete / typeahead.</b> Suggestions shown while a user is still typing, usually the most popular completions of what they have typed so far.</li>
<li><b>Crawler.</b> A program that fetches pages from the web (or from an internal content store), follows the links it finds, and hands the pages to an indexing pipeline.</li>
<li><b>Crawl frontier.</b> The queue of URLs a crawler has discovered but has not yet fetched.</li>
</ul>`,
        deeper: `<p>Notice how many of these terms come in a "raw measurement, then engineered fix" pair: term frequency alone over-rewards repetition, so BM25 caps it; a plain crawl would hammer one server, so a frontier enforces politeness; an exact nearest-neighbour search does not scale, so HNSW and IVF trade a little accuracy for a lot of speed. Reading the rest of this chapter is mostly about learning what problem each fix is actually solving.</p>`,
        check: {
          question: 'A colleague says "we don\'t need an inverted index, we can just scan every document for the query terms." What is the sharpest reason this breaks down at scale?',
          options: [
            'Scanning documents is illegal under most data protection law',
            'A scan reads every document on every query, so cost grows with the size of the whole collection; an inverted index instead reads only the (much shorter) posting lists for the query\'s terms',
            'Inverted indexes are only needed for phrase queries, not single-word queries',
            'A scan and an inverted index have exactly the same cost, so it does not matter'
          ],
          answer: 1,
          explain: 'A full scan reads every document on every query, so its cost scales with the size of the whole collection. An inverted index shifts the cost to the one-time job of building posting lists, so a query only has to read the (much shorter) posting lists for its own terms.'
        }
      },
      {
        id: 'sr-f1',
        part: 'field',
        title: 'The inverted index and posting lists',
        viz: 'inverted-index',
        body: `<p>Building an inverted index starts with turning raw text into terms. <b>Tokenisation</b> splits a document into candidate words - by whitespace and punctuation, with real complications like "don't" or languages with no spaces between words. Every token is usually lowercased, common <b>stop words</b> like "the" and "is" are often dropped, and <b>stemming</b> reduces remaining words to a shared root so "running," "runs" and "ran" all point at the same posting list.</p>
<p>The result is an <b>inverted index</b>: a map from each term to a <b>posting list</b> of the documents that contain it. A posting can carry more than just a document id - it usually stores the <b>term frequency</b> in that document, and often the exact positions where the term appears. Positions matter for phrase queries: to answer "system design" as an exact phrase, the engine checks whether "system" and "design" have adjacent positions in the same document, not just whether both words appear somewhere in it.</p>
<p><b>Boolean retrieval</b> answers a query with set operations on posting lists: AND intersects two lists, OR unions them, NOT subtracts one from another. Because posting lists are stored sorted by document id, intersecting two of them is a simple merge, and skip pointers let the engine jump ahead in a long list instead of reading every entry.</p>
<p>A <b>tiered index</b> splits each term's postings into layers of decreasing quality - for example, documents where the term appears in the title in tier one, documents where it appears anywhere in tier two. A search can answer from tier one first, which is smaller and usually more relevant, and only fall through to tier two if it does not find enough results, trading a small amount of completeness for a large amount of speed under load.</p>`,
        deeper: `<p>A numeric feel for the saving: the term "database" might appear in two million documents out of five hundred million, and "sharding" in three hundred thousand. Intersecting those two posting lists costs work proportional to their length, not to five hundred million - and with skip pointers, an engine can jump through the much shorter list and only check the longer one at those specific positions.</p>`,
        check: {
          question: 'Why does a posting often store the positions where a term appears, not just which documents contain it?',
          options: [
            'Positions are required to compute term frequency',
            'Positions let the engine answer phrase queries, by checking whether two query terms appear at adjacent positions in the same document',
            'Positions are only used for spell correction',
            'Storing positions makes the index smaller'
          ],
          answer: 1,
          explain: 'Term frequency only needs a count, not positions. Positions are what let the engine confirm that two terms sit next to each other, which is exactly what an exact phrase query needs to check.'
        }
      },
      {
        id: 'sr-f2',
        part: 'field',
        title: 'Scoring with TF-IDF and BM25',
        viz: 'bm25-scoring',
        body: `<p><b>TF-IDF</b> scores a term in a document by multiplying its term frequency by its inverse document frequency: a term that appears often in this document, but rarely across the whole collection, scores high. Its weakness is that term frequency is used directly, so a document that repeats a word fifty times scores far higher than one that uses it five times, even though the fiftieth repeat adds little real relevance.</p>
<p><b>BM25</b> fixes this with a formula that lets term frequency's contribution saturate:</p>
<p><code>score(D,Q) = sum over t in Q of IDF(t) * f(t,D)*(k1+1) / ( f(t,D) + k1*(1 - b + b*|D|/avgdl) )</code></p>
<p>Here <b>t</b> is one query term, <b>f(t,D)</b> is how many times t appears in document D, <b>|D|</b> is the length of D in tokens, <b>avgdl</b> is the average document length across the collection, and <b>IDF(t) = ln( (N - n(t) + 0.5) / (n(t) + 0.5) + 1 )</b> where <b>N</b> is the total number of documents and <b>n(t)</b> is how many of them contain t. <b>k1</b> (commonly 1.2) controls how quickly repeating a term stops helping, and <b>b</b> (commonly 0.75) controls how much a long document is penalised relative to the average length.</p>
<p><b>Worked example.</b> Take N = 10,000 documents, with the term "python" appearing in n(t) = 100 of them: IDF = ln(9900.5/100.5 + 1) = ln(99.51) ≈ 4.60. In one document, "python" appears f = 3 times, the document is 200 tokens long against an average of 250, with k1 = 1.2 and b = 0.75: the denominator is 3 + 1.2*(0.25 + 0.75*0.8) = 4.02, the numerator is 3*2.2 = 6.6, so this term's contribution is 4.60 * 6.6/4.02 ≈ 7.55. BM25 sums this across every term the query and document share.</p>`,
        deeper: `<p>Two edge cases worth being able to say out loud: as f(t,D) grows very large, the ratio f*(k1+1)/(f+k1*...) approaches (k1+1), a hard ceiling - repeating a word cannot inflate a score without bound. And when b = 0, length normalisation is switched off entirely, so a 5,000-word document is not penalised at all for being longer than average; most engines default to b = 0.75 rather than 0 or 1.</p>`,
        check: {
          question: 'A document repeats the query term 200 times instead of 3, with everything else unchanged. What does BM25 do that plain TF-IDF would not?',
          options: [
            'BM25 ignores the term entirely once it appears more than 50 times',
            'BM25 lets the term\'s contribution keep growing linearly, same as TF-IDF',
            'BM25 lets the contribution grow toward a ceiling around IDF(t)*(k1+1), so 200 repeats scores only slightly higher than a much smaller count, unlike TF-IDF\'s unbounded growth',
            'BM25 and TF-IDF produce exactly the same score in this case'
          ],
          answer: 2,
          explain: 'BM25\'s term-frequency ratio saturates toward (k1+1) as f(t,D) grows, so extreme repetition adds only a small amount more score. Plain term frequency in TF-IDF has no such cap.'
        }
      },
      {
        id: 'sr-f3',
        part: 'field',
        title: 'The query understanding pipeline',
        viz: 'query-pipeline',
        body: `<p>A typed query rarely goes straight to retrieval unchanged. <b>Spell correction</b> compares the query against a language model or a dictionary built from past queries and content, and offers a "did you mean" suggestion, or silently corrects and searches the corrected form when confidence is high enough. <b>Synonym expansion</b> adds related terms - a search for "sneakers" might also match documents containing "trainers" or "running shoes" - using a hand-built thesaurus, or synonyms learned from which queries lead to clicks on the same documents.</p>
<p><b>Intent classification</b> guesses what kind of answer the user actually wants: an informational query ("how does BM25 work") wants an article; a navigational query ("facebook login") wants one specific page; a transactional query ("buy running shoes size 9") wants a product page a user can act on. Intent changes which parts of the system run at all - a transactional query might skip straight to a product index rather than a general content index.</p>
<p><b>Query rewriting</b> is the step that turns the corrected, expanded, intent-tagged query into the actual query sent to retrieval - which might add filters, drop a rare term that is unlikely to be a typo but is hurting recall, or restructure the query into the form a particular retrieval system expects. Each step in this pipeline can fail open: if spell correction is not confident, it is usually safer to search the original text than to guess wrong and silently change what the user typed.</p>`,
        deeper: `<p>Query understanding is itself measured, not just built once: a team tracks how often a spelling correction is accepted (the user does not immediately retype), how often a synonym expansion actually leads to a click on the added documents, and how often an intent classification lines up with what the user eventually clicked - because a wrong intent guess can send an entire query down the wrong retrieval path.</p>`,
        check: {
          question: 'Why does a query pipeline usually search the user\'s original text when spell correction is not confident, rather than always applying its best guess correction?',
          options: [
            'Spell correction is too slow to run on every query',
            'A wrong correction can silently change what the user meant to search for, so failing open to the original text is safer than guessing',
            'Search engines are not allowed to modify user input',
            'Original text always produces better results than corrected text'
          ],
          answer: 1,
          explain: 'A confident correction usually helps, but a low-confidence guess risks silently searching for something the user did not type. Falling back to the original text avoids that failure mode.'
        }
      },
      {
        id: 'sr-f4',
        part: 'field',
        title: 'Ranking beyond text',
        body: `<p>BM25 and vector similarity give a text-relevance score, but a production search engine usually ranks on more than text. <b>Learning to rank</b> trains a model - often gradient-boosted trees or a neural network - to combine many features (BM25 score, vector similarity, how new the document is, how popular it has been, category match) into one ranking, instead of hand-tuning weights for each feature.</p>
<p>The most common training signal for that model is <b>click feedback</b>: which result a user clicked, given what was shown. Click data is not neutral, though - a result shown in position one gets clicked more often just for being first, a bias that must be corrected for (for example by randomising position slightly, or by modelling position bias explicitly) before treating a click as evidence of relevance rather than evidence of position.</p>
<p><b>Personalisation</b> adds signals specific to the person searching: their past searches and clicks, their location, their stated preferences. It usually enters as extra features into the same ranking model rather than as a completely separate ranking system, so a personalised result still has to earn its place against text relevance and popularity, not simply override them.</p>
<p>Once a ranking ships, it is watched over time the same way any other production system is watched: a drop in click-through rate, a rise in "no results clicked" sessions, or a change in the distribution of a ranking feature can all be an early warning that something upstream broke - a data pipeline feeding a feature went stale, or a new content type is being scored on features it was never designed for.</p>`,
        deeper: `<p>Pointwise, pairwise and listwise are the three usual ways to train a ranker: pointwise predicts a relevance score for one document at a time; pairwise trains the model to get the order right for a pair of documents; listwise optimises a ranking metric like NDCG directly over a whole result list. Pairwise and listwise usually rank better in practice, because ranking is fundamentally about relative order, which a pointwise score only captures indirectly.</p>`,
        check: {
          question: 'A team notices that the top search result gets clicked far more than the second result, even in an A/B test where both results are equally relevant by human judgment. What does this illustrate?',
          options: [
            'Position bias: users click higher-ranked results more just because of where they appear, so raw click rate is not the same as relevance',
            'The top result is always more relevant, by definition',
            'A/B tests cannot be used to evaluate search ranking',
            'This proves the ranking model is broken and must be retrained immediately'
          ],
          answer: 0,
          explain: 'This is position bias. It means click-through rate alone conflates position with relevance, which is why systems that train on clicks need to correct for position before treating a click as pure relevance evidence.'
        }
      },
      {
        id: 'sr-f5',
        part: 'field',
        title: 'Evaluating search',
        body: `<p><b>Precision at k</b> asks: of the top k results shown, what fraction are actually relevant? <b>Recall</b> asks the opposite question: of all the relevant documents that exist, what fraction did the search return anywhere? A search can have perfect precision at 1 by returning a single, certainly-relevant result while missing hundreds of other relevant documents entirely - which is why the two are usually reported together.</p>
<p><b>NDCG</b> improves on precision by caring about order, not just membership in the top k: a highly relevant document at rank 1 contributes more than the same document at rank 10, because NDCG discounts a result's contribution by a function of its rank, then normalises against the best possible ordering of the same results. <b>MRR</b> is simpler and suits queries with one clear right answer: for each query, take one divided by the rank of the first relevant result, then average that across many queries - a query whose first relevant result is rank 1 contributes 1.0, rank 2 contributes 0.5, and so on.</p>
<p>All of these need <b>relevance judgments</b> - a label saying how relevant a document is to a query - which come from either human raters working through a set of query-document pairs, or from a judgment inferred from behaviour (a long click, a purchase). This is <b>offline evaluation</b>: it can be run on old queries without touching real traffic.</p>
<p><b>Online interleaving</b> tests two ranking algorithms against real users at the same time: it mixes results from both algorithms into a single list a user sees, then counts which algorithm's results got clicked more. Because both rankings are shown to the same user in the same session, interleaving needs far less traffic than a traditional A/B test to detect a real difference, since it removes user-to-user variance from the comparison.</p>`,
        deeper: `<p>DCG, discounted cumulative gain, is the unnormalised half of NDCG:  sum over each result at rank i of (2^relevance - 1) / log2(i + 1). The (2^relevance - 1) term makes a highly relevant result worth disproportionately more than a marginally relevant one, and the log2(i+1) discount shrinks a result's contribution the further down the list it sits. NDCG is just this DCG divided by the DCG of the best possible ordering of the same set of results, so a perfect ranking always scores 1.0.</p>`,
        check: {
          question: 'A search engine returns only one result for a query, and that result is highly relevant. Which metric is most likely to look artificially good here, in a way that hides a real problem?',
          options: [
            'Recall, since returning only one document usually means missing most of the other relevant documents that exist',
            'NDCG, because it is undefined for a single result',
            'MRR, because it always equals zero for a single result',
            'Precision at k, because it always penalises short result lists'
          ],
          answer: 0,
          explain: 'Precision at 1 and MRR can both look perfect here, but recall exposes what they hide: if many other relevant documents exist and were not returned at all, recall will be low even though the one result shown is excellent.'
        }
      },
      {
        id: 'sr-f6',
        part: 'field',
        title: 'Keeping the index in sync and sharding it',
        body: `<p>Splitting an index across many machines can be done two ways. <b>Document partitioning</b> gives each shard a complete index for its own subset of documents; a query fans out to every shard, and each shard's top results are merged. <b>Term partitioning</b> instead gives each shard the complete posting lists for a subset of terms across all documents; a query only has to visit the shards holding its query terms, but building and rebalancing those posting lists is harder, and a query with terms split across many shards still has to talk to many of them. Document partitioning is far more common in practice - it is what Elasticsearch and OpenSearch use - because it is simpler to rebalance and keeps each shard self-contained.</p>
<p>A write does not become searchable the instant it is accepted. In Elasticsearch and OpenSearch, a new or changed document is first written to an in-memory buffer and a transaction log for durability; it only becomes visible to search after a <b>refresh</b>, which opens a new, searchable view of the index. The default refresh interval is about one second, which is why this is called <b>near-real-time</b> indexing rather than real-time: a refresh has a real cost (it opens new file handles and segments the search must now scan), so refreshing after every single write would waste far more work than batching writes for a second and refreshing once.</p>
<p>A team can trade this delay directly: shortening the refresh interval makes writes searchable sooner but increases CPU and I/O load from more frequent, smaller segments; lengthening it reduces that load but means a user can search for something that was just written and not find it yet.</p>`,
        deeper: `<p>Underneath a refresh, search engines built on a Lucene-style storage engine write immutable segments and periodically merge smaller segments into larger ones in the background - the same segment-and-compaction idea used by log-structured storage engines elsewhere, applied here to posting lists instead of key-value rows.</p>`,
        check: {
          question: 'A search index uses document partitioning across 10 shards. What has to happen for a single query, compared to term partitioning?',
          options: [
            'The query only needs to reach the one shard that owns its query terms',
            'The query is rejected, because document partitioning does not support multi-term queries',
            'The query typically fans out to all 10 shards, and the top results from each are merged into one final ranked list',
            'The query is answered entirely from a single, randomly chosen shard'
          ],
          answer: 2,
          explain: 'With document partitioning, any document matching the query could be on any shard, so a query normally goes to every shard and the coordinating node merges each shard\'s top results into the final ranking.'
        }
      },
      {
        id: 'sr-f7',
        part: 'field',
        title: 'Vector search and hybrid retrieval',
        viz: 'hybrid-rank-fusion',
        body: `<p>An <b>embedding</b> represents a piece of text as a vector of numbers, positioned so that texts with similar meaning end up as nearby vectors - even when they share no words at all, which is exactly what BM25 cannot do. Finding the closest stored vectors to a query vector exactly would mean comparing against every stored vector, which is too slow at scale, so systems use <b>approximate nearest neighbour (ANN)</b> search instead.</p>
<p><b>HNSW</b> builds a layered graph: the top layer has few nodes and long-range links, lower layers have more nodes and short-range links, and a search greedily descends from the top layer to the bottom, getting closer to the target vector at each layer before doing a fine-grained search at the bottom. <b>IVF</b> instead clusters all vectors ahead of time around a set of centroids, and a query only searches the handful of clusters whose centroids are closest to it, skipping the rest entirely. Both trade a small, tunable amount of recall for a large speedup over an exact search.</p>
<p>Vector search alone is weaker than BM25 at exact matches - a product SKU, a part number, an exact phrase - so most production systems use <b>hybrid retrieval</b>: run both a BM25 ranking and a vector ranking, then combine them with <b>reciprocal rank fusion (RRF)</b>: <code>RRF(d) = sum over each ranking r of 1 / (k + rank_r(d))</code>, where <code>rank_r(d)</code> is document d's rank in ranking r (or omitted if d does not appear in that ranking) and k is a constant, commonly 60.</p>
<p><b>Worked example.</b> Document D is ranked 3rd by BM25 and 8th by vector search: RRF(D) = 1/(60+3) + 1/(60+8) = 1/63 + 1/68 ≈ 0.0306. Document E is ranked 1st by BM25 but does not appear in the vector ranking at all: RRF(E) = 1/(60+1) + 0 ≈ 0.0164. D outranks E in the fused list, because it ranked well by both methods rather than brilliantly by only one.</p>`,
        deeper: `<p>RRF needs no score normalisation between the two rankers, which is its main practical advantage: BM25 scores and cosine similarities live on completely different scales, so combining them by rank rather than by raw score sidesteps having to calibrate one against the other.</p>`,
        check: {
          question: 'Why does hybrid retrieval usually combine BM25 and vector search by rank (RRF), rather than by adding their raw scores together?',
          options: [
            'Raw scores from BM25 and a vector similarity live on different, uncomparable scales, so adding them directly is not meaningful without extra calibration; combining by rank avoids that problem',
            'BM25 does not produce a numeric score at all',
            'Adding scores together is computationally impossible',
            'Vector search scores are always higher than BM25 scores, so adding them would ignore BM25 entirely'
          ],
          answer: 0,
          explain: 'A BM25 score and a cosine similarity are not on comparable scales, so summing them directly requires calibration that is easy to get wrong. Reciprocal rank fusion sidesteps this by combining rank position instead of raw score.'
        }
      },
      {
        id: 'sr-f8',
        part: 'field',
        title: 'Autocomplete and typeahead',
        viz: 'trie-autocomplete',
        body: `<p>Autocomplete has a much tighter latency budget than full search, since it has to respond after every keystroke. A <b>trie</b> makes this fast: every path from the root spells out a prefix, so looking up everything that starts with "sea" is a single walk down three nodes - one per character - regardless of how many total queries the system knows about.</p>
<p>Walking the trie alone is not enough, though, because a popular prefix like "sea" could match millions of completions. Each node along the frequent paths caches its own precomputed <b>top-k</b> list - the k most popular completions of that prefix - built ahead of time from historical query volume, so a lookup returns a small, ready-made list instead of ranking millions of candidates on every keystroke.</p>
<p><b>Freshness</b> is the recurring tension: query popularity changes constantly (a trending topic can go from rare to top-3 within hours), so the cached top-k lists have to be recomputed on a schedule - often every few minutes from a rolling window of recent query counts - rather than once and left static. Some systems blend this global popularity with a user's own recent queries, so autocomplete can show something the user personally searched for recently even if it is not popular overall.</p>`,
        deeper: `<p>A full trie over every possible query prefix can be large, so production systems often only materialise nodes and cached lists for prefixes that have actually been typed often enough to matter, falling back to a smaller, slower path (or no suggestion at all) for a prefix nobody has typed before.</p>`,
        check: {
          question: 'Why does a typeahead system precompute a top-k completions list at each trie node, instead of ranking all matching queries live on every keystroke?',
          options: [
            'Live ranking would be too accurate and confuse users',
            'A popular prefix can match millions of completions, and ranking that many candidates on every keystroke would be far too slow for a per-character latency budget; a precomputed short list is fast to return instead',
            'Tries cannot store more than one completion per node',
            'Precomputing removes the need for a trie entirely'
          ],
          answer: 1,
          explain: 'Autocomplete has to respond after every keystroke, and a popular prefix can have millions of matches. Precomputing a small top-k list per node makes the actual lookup fast regardless of how many total completions exist.'
        }
      },
      {
        id: 'sr-f9',
        part: 'field',
        title: 'A crawler and indexing pipeline',
        body: `<p>A crawler starts from a set of seed URLs and keeps a <b>crawl frontier</b> - a queue of URLs it has discovered but not yet fetched, growing as it extracts new links from every page it visits. A well-behaved crawler is polite: it respects a site's stated crawl rules, spaces out requests to the same host so it does not overload it, and spends more of its limited <b>crawl budget</b> on pages that change often or matter more, rather than treating every URL equally.</p>
<p>Each fetched page goes through <b>canonicalisation</b> - deciding that several different URLs (with and without a trailing slash, with different tracking parameters) refer to the same underlying page - and <b>deduplication</b>, usually by hashing page content (or a similarity hash that tolerates small differences) so near-identical pages do not each consume separate index entries. The crawler then extracts the page's text and outgoing links: the links feed back into the frontier, and the text is handed to the indexing pipeline described earlier in this chapter - tokenised, stemmed, and merged into the inverted index's posting lists.</p>
<p>Recrawl scheduling ties the crawler directly to freshness: a page that changes daily is refetched far more often than one that has not changed in years, usually estimated from how often that specific page has changed in the past, so crawl capacity is spent where it actually improves what users see as current.</p>`,
        deeper: `<p>Politeness and crawl budget interact directly with the near-real-time indexing tension from earlier in this chapter: even a perfectly fast indexing pipeline is only as fresh as the crawler feeding it, so a page that the crawler has not revisited in a month will show stale content in search no matter how short the refresh interval is downstream.</p>`,
        check: {
          question: 'A crawler discovers the same underlying article at three different URLs, differing only by a tracking parameter. What should it do before indexing?',
          options: [
            'Index all three URLs separately, since each is technically a distinct address',
            'Canonicalise them to one URL and deduplicate the content, so the article does not consume three separate posting-list entries for identical text',
            'Discard all three, since duplicate content is not allowed on the web',
            'Only crawl the shortest of the three URLs, ignoring the other two entirely'
          ],
          answer: 1,
          explain: 'Canonicalisation recognises that the three URLs point at the same page, and deduplication collapses near-identical content, so the index stores one entry for the article rather than three redundant ones.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'sr-a1',
        type: 'design',
        title: 'Design search for an online marketplace',
        viz: 'inverted-index',
        prompt: `An online marketplace has 50 million active listings and expects 20,000 searches per second at peak. Sellers update prices and availability constantly. Walk me through how you would design the search feature.`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) proposes an inverted index (naming a real system like Elasticsearch/OpenSearch is fine but not required) as the core retrieval structure, with document partitioning across shards to handle 50 million listings and fan the 20,000 QPS out across replicas; (2) proposes BM25 (or an equivalent term-based relevance score) as a baseline ranking signal, and at least mentions layering a learned or feature-based ranking on top rather than relying on raw text score alone; (3) explicitly addresses freshness for price/availability changes - near-real-time indexing with a short refresh interval, or a targeted fast path for high-value fields like price and in-stock status, rather than ignoring the staleness problem; (4) addresses autocomplete as a related but separate concern (its own tighter latency budget, likely its own precomputed structure) rather than assuming the main search index also serves typeahead; (5) says something about evaluation - offline relevance judgments, online metrics like click-through and interleaving, or precision/recall - rather than treating "the search works" as unverifiable. Common mistakes: describing only a database LIKE query with no mention of an inverted index or ranking; ignoring the update-freshness problem entirely; conflating autocomplete's constraints with full search's constraints; no mention of how the design would be evaluated or checked. {{HONESTY}}`,
        model: `"I'd build this around an inverted index rather than scanning listings directly - something like Elasticsearch or OpenSearch, sharded by document, so each shard holds a full index for its own slice of the 50 million listings and a query fans out to all shards and merges the top results. I'd size shard and replica counts around the 20,000 QPS peak, since replicas are what let read traffic scale horizontally.

For ranking, I'd start with BM25 as a baseline text-relevance score, then add a learned ranking layer that also weighs listing popularity, seller rating, and price competitiveness - text relevance alone doesn't capture what makes a listing a good result here.

Freshness is what I'd think hardest about, since sellers constantly update price and availability. I'd rely on near-real-time indexing with a short refresh interval for most fields, but for price and stock status specifically - where a stale value actively misleads a buyer - I'd consider a faster, targeted path, maybe serving those two fields from a live lookup at render time instead of trusting the last-refreshed index value.

I'd keep autocomplete as a separate system with its own precomputed, trie-based structure, since it has a much tighter per-keystroke latency budget and doesn't need the same ranking sophistication.

Finally, I'd want ongoing evaluation - offline relevance judgments on sampled queries to catch regressions before shipping a ranking change, and online metrics like click-through and zero-result sessions to catch what a static test set would miss."`
      },
      {
        id: 'sr-a2',
        type: 'formulate',
        title: 'When to add vector search on top of BM25',
        viz: 'hybrid-rank-fusion',
        prompt: `Your product search currently uses BM25 only. An interviewer asks: when would you add vector search on top of it, and how would you combine the two rankings?`,
        timeboxSec: 300,
        rubric: `Must-haves: (1) correctly identifies what vector search adds - matching by meaning rather than exact words, catching synonyms and paraphrases BM25 misses entirely because it requires shared terms; (2) correctly identifies a real weakness of vector search alone - weaker on exact matches like SKUs, part numbers, or exact phrases, and the added cost/complexity of generating and indexing embeddings; (3) proposes combining rather than replacing: running both rankings and fusing them, naming reciprocal rank fusion or an equivalent rank-based combination rather than naively summing incomparable raw scores; (4) gives a concrete trigger for when this is worth doing - for example, a measured rate of zero-result or low-engagement queries that use different words than the content uses. Common mistakes: claiming vector search should simply replace BM25; summing raw BM25 and cosine scores with no acknowledgement that they are on different scales; describing vector search without naming any weakness. {{HONESTY}}`,
        model: `"I'd add vector search once I had evidence that queries fail for a reason BM25 can't fix: the searcher and the listing describe the same thing in different words. BM25 needs shared terms to match at all, so a search for 'warm winter jacket' won't match a listing that only says 'insulated parka.' That's the gap an embedding-based search closes, since it matches on meaning rather than vocabulary.

I wouldn't replace BM25 with it, though. Vector search tends to be weaker on exact matches - a SKU, a part number, an exact phrase - and it adds real cost, since every listing needs an embedding generated and indexed in something like HNSW or IVF, on top of the existing text index.

So I'd run both retrieval paths and combine the two ranked lists rather than pick one, using reciprocal rank fusion specifically. BM25 scores and cosine similarities live on different scales, so summing them directly would need calibration I'd rather avoid; RRF scores each document from its rank in each list instead, so a document ranking reasonably well in both beats one ranking extremely well in only one.

The trigger I'd look for before investing in this is a persistently high rate of zero-result or low-engagement queries, ideally with evidence the query text and matching listing text just don't share vocabulary."`
      },
      {
        id: 'sr-a3',
        type: 'followup',
        title: 'Interview question: the index is 90 seconds behind',
        prompt: `Interviewer: "Your search index update pipeline for listing changes is currently 90 seconds behind. A seller says buyers still see the old price. What do you check, and what would you change?"`,
        timeboxSec: 180,
        rubric: `Must-haves: (1) treats "90 seconds behind" as a pipeline/refresh problem, not a bug in the ranking or scoring logic; (2) proposes checking where the delay actually is - the crawl/ingestion step, a batch indexing job, or the search engine's own refresh interval - rather than guessing at one cause; (3) proposes a concrete fix appropriate to the likely cause: shortening the refresh interval (naming the cost trade-off of doing so globally), or building a faster, targeted path specifically for high-value fields like price rather than lowering the refresh interval for the whole index; (4) acknowledges the trade-off of a shorter refresh interval (more frequent segment creation costs CPU/IO) rather than presenting it as a free fix. Common mistakes: assuming the fix must be "make search faster" (a query-latency problem, not a freshness problem); proposing a full re-index as the fix; ignoring cost trade-offs entirely. {{HONESTY}}`,
        model: `"First I'd want to know where the 90 seconds is actually going, because 'the index is stale' can mean a few different things. Is the update pipeline itself slow to even receive the seller's price change and hand it to the indexer, or is the price change reaching the indexer quickly but sitting unindexed until the next refresh?

If it's the refresh interval, the fix is either lowering that interval globally, which I'd be honest is not free - a shorter interval means more frequent segment creation, which costs more CPU and I/O across the whole cluster, so I wouldn't drop it from one second to near-zero without checking the cluster can absorb that. Or, since price is specifically the field that actively misleads a buyer when stale, I'd consider a separate, faster path just for high-value fields like price and stock status - for example, serving those two fields from a live lookup at render time layered on top of the search result, rather than trusting whatever value was baked into the document at last index refresh.

If instead the delay is upstream of indexing entirely - a slow ingestion or batch job - then tightening the refresh interval wouldn't help at all, and I'd be looking at that pipeline's own batching window instead. So my first concrete step would be measuring each stage separately rather than assuming which one is the 90 seconds."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: Tokenization (Introduction to Information Retrieval)', u: 'https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html', w: 'The standard textbook explanation of how raw text becomes the terms an inverted index actually stores.', m: 10 },
      { l: 'Practical BM25 - Part 2: The BM25 Algorithm and its Variables', u: 'https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables', w: 'Walks through every term in the BM25 formula with worked numbers, from the team that ships it in Elasticsearch.', m: 15 },
      { l: 'BM25Similarity (Lucene Javadoc)', u: 'https://lucene.apache.org/core/9_11_1/core/org/apache/lucene/search/similarities/BM25Similarity.html', w: 'The primary source for the exact formula and default k1/b values used by Elasticsearch and Solr.', m: 8 },
      { l: 'Near real-time search (Elasticsearch Guide)', u: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html', w: 'Explains why a write is not searchable until the next refresh, straight from the product that made refresh intervals a household term.', m: 6 },
      { l: 'Reciprocal rank fusion (Elasticsearch docs)', u: 'https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion', w: 'The primary source for the RRF formula used to combine a BM25 ranking with a vector ranking.', m: 10 },
      { l: 'HNSW for vector search (Pinecone learning series)', u: 'https://www.pinecone.io/learn/series/faiss/hnsw/', w: 'The clearest walkthrough of why a layered graph makes approximate nearest neighbour search fast.', m: 18 },
      { l: 'How Search Works: crawling, indexing, serving (Google Search Central)', u: 'https://developers.google.com/search/docs/fundamentals/how-search-works', w: 'The primary source on the three stages a web-scale crawler and indexer actually run.', m: 12 },
      { l: 'Video: Design Search Autocomplete System - System Design Interview', u: 'https://www.youtube.com/watch?v=TZ_LSourdUc', w: 'Works through a trie-based typeahead design end to end, which is easier to follow as a video than as text.', m: 20 }
    ],
    glossary: [
      {
        g: 'Search and retrieval',
        sub: '',
        rows: [
          ['Inverted index', 'Maps each term to the list of documents containing it, the opposite of a forward index', 'indexing'],
          ['Posting list', 'The list of document ids (and often positions) stored for one term', 'indexing'],
          ['Stemming', 'Reducing a word to a shared root so "running" and "runs" match the same postings', 'tokenisation'],
          ['BM25', 'The standard ranking formula scoring term frequency against document length and term rarity', 'scoring'],
          ['TF-IDF', 'An older scoring scheme multiplying term frequency by inverse document frequency', 'scoring'],
          ['Reciprocal rank fusion', 'Combines two ranked lists by summing 1/(k+rank) from each list', 'hybrid retrieval'],
          ['HNSW', 'A layered graph index that finds approximate nearest neighbours by greedy search', 'vector search'],
          ['IVF', 'Clusters vectors ahead of time and searches only the nearest clusters at query time', 'vector search'],
          ['NDCG', 'A ranking quality metric that rewards highly relevant results near the top of the list', 'evaluation'],
          ['MRR', 'The average of 1/rank of the first relevant result, across many queries', 'evaluation'],
          ['Near-real-time indexing', 'A short delay between a write and that document becoming searchable', 'indexing'],
          ['Document partitioning', 'Sharding an index by document, each shard holding a full index for its subset', 'sharding'],
          ['Trie', 'A tree where each path from the root spells a prefix, used for fast prefix lookups', 'autocomplete'],
          ['Crawl frontier', 'The queue of URLs a crawler has discovered but not yet fetched', 'crawling']
        ]
      }
    ]
  };

  root.PREP_CORE['counting-and-sketches'] = {
    id: 'counting-and-sketches',
    title: 'Counting at scale and probabilistic data structures',
    level: 'good',
    levelLabel: 'Comes up occasionally, often as a follow-up in an analytics, ads, or infrastructure interview.',
    why: `Any system that reports a view count, a unique-visitor number, or a p99 latency is quietly running into the fact that exact counting does not scale the way a single database row does. Interviewers ask about this to see whether you know when approximate is not just acceptable but the only workable answer, and whether you can back that judgment with real numbers rather than a vague "use a sketch." The mathematics here is small and checkable - a standard error formula, an error bound - so it is also one of the few places in a system design interview where you can show precise, quantitative reasoning instead of only architecture.`,
    learn: [
      {
        id: 'cs-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Cardinality.</b> The number of distinct values in a set or column - for example, the number of distinct user ids who visited a page.</li>
<li><b>Raw event.</b> One individual occurrence as it happened - one view, one click, one reaction - usually with a timestamp and an identifier.</li>
<li><b>Derived aggregate.</b> A summary computed from raw events, such as a running total or a distinct count, kept up to date so a read does not have to recompute it from scratch.</li>
<li><b>Sketch (probabilistic data structure).</b> A data structure that answers a question about a large stream of data approximately, using far less memory than storing the data would need, in exchange for a known, bounded error.</li>
<li><b>Mergeable.</b> A property of a sketch: two sketches built separately (say, on two different servers) can be combined into one sketch that is as accurate as if all the original data had gone into a single sketch from the start.</li>
<li><b>Tumbling window.</b> A fixed-length time window that does not overlap with the window before or after it - "every 1-minute bucket."</li>
<li><b>Hopping window.</b> A fixed-length window that advances by a step smaller than its own length, so consecutive windows overlap.</li>
<li><b>Sliding window.</b> A fixed-length window evaluated continuously as time moves forward, rather than at fixed steps - "the last 5 minutes, right now."</li>
<li><b>Event time vs processing time.</b> Event time is when something actually happened; processing time is when the system observed or processed it. The two can differ by seconds or by days.</li>
<li><b>Late event.</b> An event whose event-time timestamp falls inside a window that the system has already treated as complete and emitted a result for.</li>
<li><b>Watermark.</b> A stream processor's own declared belief about how complete its view of event time is so far - "I believe I have now seen every event with event time before T."</li>
<li><b>HyperLogLog (HLL).</b> A sketch that estimates the number of distinct items in a stream using a small, fixed amount of memory regardless of how many distinct items there actually are.</li>
<li><b>Count-Min Sketch (CMS).</b> A sketch that estimates how many times each item has occurred in a stream, also using fixed memory, by hashing each item into several small counter arrays.</li>
<li><b>Heavy hitter / Top-K.</b> An item whose frequency is among the highest in a stream; a Top-K structure tracks the (approximate) most frequent items without tracking every item.</li>
<li><b>Reservoir sampling.</b> An algorithm for keeping a uniformly random sample of a fixed size from a stream whose total length is not known in advance.</li>
<li><b>Quantile / percentile.</b> A value below which a given fraction of the data falls - the 99th percentile (p99) is the value below which 99% of observations sit.</li>
<li><b>Quantile sketch.</b> A sketch that estimates percentiles of a large or streaming dataset without storing every value.</li>
<li><b>t-digest.</b> A quantile sketch that clusters data into centroids, with smaller and more numerous centroids near the extremes for extra accuracy there.</li>
<li><b>DDSketch.</b> A quantile sketch that guarantees the same relative error at every point in its range, including small values, unlike t-digest's uneven accuracy.</li>
<li><b>Relative error.</b> An error expressed as a fraction of the true value (being off by 1% of the true value), as opposed to a fixed absolute error.</li>
<li><b>Drift (in monitoring).</b> A change over time in the distribution of a feature, a prediction, or a metric, often detected by comparing quantiles or a cardinality count across time windows.</li>
</ul>`,
        deeper: `<p>Almost every term in this list exists to answer one question cheaply: "roughly how many, or roughly how much, without storing everything?" Keep that question in mind and the specific sketches below stop looking like unrelated tricks and start looking like the same idea - trade a small, known error for a fixed, small amount of memory - applied to counting, to frequency, and to percentiles in turn.</p>`,
        check: {
          question: 'A dashboard shows "1.3M unique visitors today," updated every few seconds. What does the word "unique" imply about why this cannot just be a simple incrementing counter?',
          options: [
            'It implies nothing special; any counter works for this',
            'Counting unique visitors requires knowing whether each visitor has been seen before, which naively means remembering every visitor id seen so far - a very different, much more memory-hungry problem than incrementing a number',
            'Unique visitor counts are always computed once a day, never in real time',
            '"Unique" just means the number should never decrease'
          ],
          answer: 1,
          explain: 'A plain counter has no memory of who it already counted, so it cannot deduplicate. Getting a distinct count exactly requires remembering every id seen, which is why this problem specifically motivates a cardinality sketch like HyperLogLog.'
        }
      },
      {
        id: 'cs-f1',
        part: 'field',
        title: 'Why exact counting breaks at scale',
        body: `<p>A single database row holding a view counter looks simple until millions of view events a second try to increment it: every increment needs to read the current value, add one, and write it back (or rely on an atomic increment), and all of that traffic is now serialised through one row. That row becomes a bottleneck no amount of application-server scaling fixes, because the constraint is not compute - it is contention on one piece of state.</p>
<p>The usual escape is to stop trying to keep one exact number. Options include sharding the counter into many cells and summing them on read (works for a simple total, but a distinct count still needs to see every id somewhere to deduplicate), batching increments locally and flushing a delta periodically instead of writing on every event, or accepting an approximate answer outright when the number is shown to people rather than used to move money - nobody notices or cares whether "1.3M views" is off by a few thousand.</p>
<p>A closely related decision is what to actually keep as the source of truth. Keeping the full stream of <b>raw events</b> (every view, with a timestamp and an id) lets you reprocess history later - fix a bug in how a metric was computed, or build a new metric nobody thought of yet. Serving live reads from a continuously updated <b>derived aggregate</b> - a rolled-up counter, or a sketch - means a dashboard is reading a small, cheap, already-computed number instead of scanning raw events on every page load. Most large systems keep both: the raw log as the record of truth, and one or more derived aggregates computed from it for fast reads.</p>`,
        deeper: `<p>This is the same append-only-log-plus-materialised-view pattern used elsewhere in event-driven systems, applied specifically to counting: the log is replayable and correct by construction, and the aggregate is fast but only as correct as the code that built it - which is exactly why keeping the raw log around to recompute from is worth the storage cost.</p>`,
        check: {
          question: 'A single row in a database is being incremented by millions of view events per second and has become a bottleneck. What is the most direct explanation for why adding more application servers does not fix this?',
          options: [
            'The database itself is too slow at everything and needs replacing entirely',
            'All the increments are serialised through contention on that one row, so the bottleneck is on shared state, not on compute capacity that more servers would add',
            'View counting inherently cannot be made fast',
            'More application servers would fix this; the row is not actually the bottleneck'
          ],
          answer: 1,
          explain: 'The constraint is contention on one piece of shared state, not a lack of compute. More application servers just means more concurrent attempts to update the same row, which does not relieve the bottleneck.'
        }
      },
      {
        id: 'cs-f2',
        part: 'field',
        title: 'Bucketed time-window aggregation',
        viz: 'time-windows',
        body: `<p>Most metrics are reported per time bucket rather than as one running total: "views per minute," "errors per 10 seconds." A <b>tumbling window</b> is the simplest case - fixed length, no overlap, so each event falls into exactly one bucket. A <b>hopping window</b> generalises this: still fixed length, but it advances by a step smaller than its length, so windows overlap (a 5-minute window that advances every 1 minute); a tumbling window is just the special case where the step equals the window length. A <b>sliding window</b> takes this to its limit, evaluated continuously - "the last 5 minutes, right now" - rather than at fixed steps.</p>
<p>All of this assumes events arrive in a tidy order, which they do not. <b>Event time</b> (when something actually happened) and <b>processing time</b> (when the system saw it) can differ by seconds because of network delay, or by hours because a mobile client was offline and is now syncing a backlog. A <b>late event</b> is one that arrives with an event-time timestamp inside a window the system has already closed and reported on.</p>
<p>A <b>watermark</b> is how a stream processor decides when it is safe to finalise a window despite this: it is the system's own declared belief that it has now seen everything with event time before some point T, based on how far behind its slowest known source tends to run. Once the watermark passes a window's end, the system emits that window's result. A late event that still arrives after that either gets dropped, triggers a correction to the already-emitted result, or is routed to a separate late-data path - a real trade-off between latency (how soon you emit a result) and completeness (how sure you are it is final) that every streaming system has to choose explicitly.</p>`,
        deeper: `<p>A wider watermark delay makes results more complete but slower to appear; a narrower one makes them faster but more likely to need a correction later. There is no watermark setting that is simultaneously fast and always final - the choice is a direct trade against a real, unavoidable amount of network and client delay in the data itself.</p>`,
        check: {
          question: 'A mobile app logs an event at 2:00pm, but the phone is offline until 6:00pm, when it syncs. The stream processor already emitted its 2:00-2:05pm window result at 2:06pm. What is the most accurate description of this event?',
          options: [
            'It is not a real event, since it was logged that late',
            'It is a late event: its event time (2:00pm) falls inside a window the processor already closed and emitted, well before its processing time (6:00pm)',
            'It should be counted in the 6:00-6:05pm window instead, since that is when it was processed',
            'This situation cannot happen if the system uses tumbling windows'
          ],
          answer: 1,
          explain: 'The event\'s event time places it in the 2:00-2:05pm window, which was already emitted by the time it arrived - the definition of a late event. Counting it in the 6pm window based on processing time would misrepresent when it actually happened.'
        }
      },
      {
        id: 'cs-f3',
        part: 'field',
        title: 'HyperLogLog',
        viz: 'hyperloglog-buckets',
        body: `<p>HyperLogLog estimates how many distinct items a stream has contained, using a fixed, tiny amount of memory no matter whether the true count is a thousand or a billion. The intuition: hash every incoming item to a long, effectively random binary string, and split that hash into two parts. The first few bits pick one of <b>m</b> buckets; the remaining bits are scanned for their run of leading zeros. Each bucket remembers only the longest run of leading zeros it has ever seen. A long run is rare - a run of k leading zeros should only turn up about once every 2^k hashes - so if a bucket has seen a long run, that bucket has probably processed many distinct items. Combining the longest runs across all m buckets (using a specific averaging formula, not a plain mean) gives an estimate of the total distinct count.</p>
<p>The accuracy of this estimate follows a known formula: standard error ≈ 1.04 / √m. With m = 16,384 buckets (2^14, what Redis uses for its HyperLogLog, at about 12 KB total), the standard error is 1.04 / √16384 = 1.04 / 128 ≈ 0.81% - which is exactly the error Redis states for its own implementation.</p>
<p>HyperLogLog is <b>mergeable</b>: combining two HLLs built on different servers just means taking, bucket by bucket, whichever of the two had the longer run of leading zeros - no need to see the original data again. This is what lets a distinct-count metric be computed independently per server and combined later into one accurate global estimate.</p>`,
        deeper: `<p>The error falls as 1/√m, not 1/m, which makes accuracy expensive: halving the standard error means quadrupling the number of buckets. Going from about 0.81% error to about 0.4% means going from 16,384 buckets to roughly 65,536, and paying four times the memory for it.</p>`,
        check: {
          question: 'Redis states its HyperLogLog uses 16,384 registers and has a standard error of about 0.81%. Using standard error ≈ 1.04/√m, what would happen to the error if m were reduced to 4,096 (one quarter)?',
          options: [
            'The error would also shrink to one quarter, since error and m are proportional',
            'The error would roughly double, to about 1.6%, since error falls as 1/√m, not 1/m',
            'The error would stay exactly the same regardless of m',
            'HyperLogLog cannot function with fewer than 16,384 registers'
          ],
          answer: 1,
          explain: 'Error scales as 1/√m, so quartering m multiplies the error by √4 = 2, roughly doubling it to about 1.6%. This square-root relationship is why doubling accuracy costs roughly 4x the memory, not 2x.'
        }
      },
      {
        id: 'cs-f4',
        part: 'field',
        title: 'Count-Min Sketch',
        viz: 'count-min-sketch',
        body: `<p>A Count-Min Sketch estimates how many times each item has occurred in a stream, using a fixed grid of counters instead of one counter per distinct item. The structure is a grid with <b>d</b> rows (depth) and <b>w</b> counters per row (width), each row paired with its own hash function. To record an item, hash it once per row and increment the counter at that row's resulting position - so one item touches exactly d counters, one per row. To query an item's estimated count, hash it the same way and take the <b>minimum</b> of the d counters it maps to, since any single counter can only be inflated by collisions with other items, never deflated.</p>
<p>Given a target error <b>ε</b> (as a fraction of the total count processed, N) and a target failure probability <b>δ</b>, the standard sizing is <code>w = ceil(e/ε)</code> and <code>d = ceil(ln(1/δ))</code>, where e ≈ 2.71828 is Euler's number. <b>Worked example:</b> to guarantee an error no larger than 0.1% of the total count (ε = 0.001) with 99% confidence (δ = 0.01): w = ceil(2.71828/0.001) = 2,719, and d = ceil(ln(100)) = 5, for 13,595 counters total - a fixed, small grid no matter whether the stream has processed a million or a trillion events.</p>
<p>The estimate a Count-Min Sketch returns is never below the true count, only ever equal to or above it, because collisions can only add extra weight to a counter, never remove it. This means low counts near the noise floor should be distrusted, but the frequency of genuinely common items - the ones a system usually cares about - stays accurate.</p>`,
        deeper: `<p>Real implementations, like RedisBloom's Count-Min Sketch, size w and d slightly differently from the textbook formula above and expose the choice directly as an error rate and a probability rather than asking a caller to compute w and d by hand - but the underlying trade is the same one: more rows and columns cost more memory and buy a tighter, more confident error bound.</p>`,
        check: {
          question: 'Why does a Count-Min Sketch take the minimum across its d counters when answering a frequency query, rather than the average or the maximum?',
          options: [
            'The average would be simpler to compute',
            'Every counter for an item can only be inflated by hash collisions with other items, never reduced below the true count, so the smallest of the d values is the closest one to the truth',
            'Taking the minimum makes the sketch use less memory',
            'It does not matter; minimum, maximum and average all give the same answer'
          ],
          answer: 1,
          explain: 'Collisions can only add extra count to a counter from other items, never subtract from it, so every one of the d counters is greater than or equal to the true count. The minimum of them is therefore the tightest, least-inflated estimate available.'
        }
      },
      {
        id: 'cs-f5',
        part: 'field',
        title: 'Top-K heavy hitters',
        body: `<p>Sometimes the question is not "how many total" or "how many of this specific item," but "which items are the most frequent" - the top searched terms, the trending hashtags. <b>Misra-Gries</b> is the simplest algorithm for this: keep at most k counters. On a new item, if it already has a counter, increment it; if fewer than k counters are in use, give the new item its own counter starting at 1; otherwise (all k slots full and this item is not among them) decrement every existing counter by one, removing any that hit zero. This guarantees that any item whose true frequency exceeds N/(k+1) (where N is the total number of items processed) will survive and appear among the final counters, though a surviving counter's value can undercount the item's true frequency.</p>
<p><b>Space-Saving</b> is a common refinement: it always keeps exactly k counters, and when a new, unseen item arrives with all k slots full, it evicts whichever counter currently has the smallest count and assigns the new item that slot's count plus one, rather than decrementing everyone. This tracks the actual top-k more tightly in practice and pairs naturally with a small min-heap to keep the current smallest counter available in constant time. Structures like this power features such as "trending now" or "top searched today," where an approximate but fast-updating ranked list matters far more than an exact frequency count for every possible item.</p>`,
        deeper: `<p>Misra-Gries's decrement-everyone step is doing real work: it is what prevents an attacker (or just an unlucky stream) from flooding the counters with many different low-frequency items and pushing out a genuine heavy hitter, since every non-matching item costs every current counter equally rather than costing only the counters it happens to collide with.</p>`,
        check: {
          question: 'Misra-Gries is run with k = 10 counters over a stream of 1,000 total items. What is the guarantee about which items will survive in the final counters?',
          options: [
            'Every item that appeared at least once is guaranteed to survive',
            'Any item whose true frequency exceeds N/(k+1) = 1000/11 ≈ 91 is guaranteed to be among the surviving counters',
            'Exactly the 10 most frequent items are guaranteed to survive, with no exceptions',
            'The algorithm gives no guarantee at all about which items survive'
          ],
          answer: 1,
          explain: 'Misra-Gries guarantees that any item with true frequency above N/(k+1) survives the decrement process. With N=1000 and k=10, that threshold is about 91 - it does not promise the exact top 10 survive, only that sufficiently frequent items cannot be squeezed out.'
        }
      },
      {
        id: 'cs-f6',
        part: 'field',
        title: 'Reservoir sampling',
        body: `<p>Sometimes what is needed is not a count or a frequency but a fair, random sample of a stream - useful for logging a representative subset of events instead of every event, or for pulling a training sample from a firehose without knowing in advance how large the firehose will be. <b>Reservoir sampling</b> (specifically, Algorithm R) solves this in a single pass, using only O(k) memory for a sample of size k, with no need to know the stream's total length ahead of time.</p>
<p>The algorithm keeps the first k items unconditionally as the initial reservoir. For every item after that - the i-th item, where i > k - it generates a random integer j between 1 and i inclusive; if j falls between 1 and k, it replaces the j-th slot in the reservoir with the new item, otherwise it discards the new item. This simple rule guarantees that every item processed so far ends up with exactly the same probability, k/i at step i, of being in the final sample - a property that is not obvious from the algorithm's simplicity, but follows directly from induction on that replacement probability.</p>
<p><b>Worked example:</b> with a reservoir of size k = 3, when the 5th item arrives, the probability it replaces something in the reservoir is 3/5, and if it is chosen to replace, each of the 3 existing slots is equally likely (1/3 each) to be the one it replaces.</p>`,
        deeper: `<p>Reservoir sampling's guarantee is about uniformity, not recency: an item from very early in the stream has exactly the same chance of surviving to the end as one from late in the stream, which is precisely why it is the wrong tool if what is actually wanted is "a sample biased toward recent events" - that calls for a different, time-decayed sampling scheme instead.</p>`,
        check: {
          question: 'A reservoir sampler with k = 5 has processed 100 items so far. What is the probability that the 100th item ends up in the final reservoir at this step?',
          options: [
            '100%, since the most recent item is always kept',
            '5/100, since Algorithm R gives the i-th item (here i=100) a k/i probability of being chosen for a reservoir slot',
            '0%, since the reservoir is already full',
            '1/100, since only one slot could be replaced'
          ],
          answer: 1,
          explain: 'Algorithm R gives the i-th item a k/i chance of being selected to enter the reservoir, replacing a uniformly random existing slot if selected. Here that is 5/100 = 5%.'
        }
      },
      {
        id: 'cs-f7',
        part: 'field',
        title: 'Quantile sketches',
        viz: 'tdigest-merge',
        body: `<p>A percentile is not a quantity you can average across machines and get a correct answer: if one region reports a p99 latency of 50ms and another reports 500ms, the true combined p99 across both regions' traffic is neither the average of those two numbers nor necessarily even between them - it depends on the full distribution of requests on each side, including how many requests each region actually served. The only mathematically correct way to combine them is to combine the underlying data, or a sketch of it, and compute the percentile once on the combined result.</p>
<p><b>t-digest</b> does this by clustering observed values into centroids, with a specific design choice: centroids are kept small (representing few points) and numerous near the extremes of the distribution (the very low and very high end), and larger and fewer near the median - because most percentile questions that matter in practice (p95, p99, p999) live in the tails, where extra accuracy is worth the most. Two t-digests can be merged by combining their centroids and re-clustering, without ever needing to see the original raw values again.</p>
<p><b>DDSketch</b> takes a different approach: it buckets values on a logarithmic scale so that the sketch's relative error is the same everywhere in its range - including for small values, where t-digest can be comparatively less accurate. DDSketch merges even more simply, by adding matching buckets together, which is why it is used in monitoring systems that need a provable worst-case error bound, not just good performance on typical data.</p>`,
        deeper: `<p>Choosing between the two often comes down to what "accurate" needs to mean for the use case: t-digest gives excellent tail accuracy with less code and memory but its error is not uniform across the range, while DDSketch trades a bit of that peak tail sharpness for a guarantee that holds everywhere, which matters more when small values are also being monitored for correctness, not just large ones.</p>`,
        check: {
          question: 'Two application servers each report their own p99 latency: 40ms and 400ms. Why is neither the average (220ms) nor simply picking the higher value (400ms) guaranteed to be the true combined p99 across both servers\' traffic?',
          options: [
            'Because p99 is only ever an approximation and has no true value',
            'Because the true combined p99 depends on the full distribution of requests from both servers, including how many requests each served - a percentile is not a linear statistic, so it cannot be correctly combined by averaging or comparing two already-summarised numbers',
            'Because 400ms is always the correct combined answer when combining two p99 values',
            'Because p99 latency cannot be measured on more than one server at a time'
          ],
          answer: 1,
          explain: 'A percentile summarises an entire distribution into one number, and that summarising step is not linear or reversible. Getting the correct combined p99 requires combining the underlying data or a sketch of it and recomputing the percentile, not combining two already-computed percentile numbers.'
        }
      },
      {
        id: 'cs-f8',
        part: 'field',
        title: 'Mergeable sketches in analytics systems',
        body: `<p>Analytics systems like Druid and ClickHouse store pre-aggregated sketches - HyperLogLogs, quantile sketches, sometimes Bloom filters - directly as columns in their storage, so a query spanning many time segments or shards can merge those sketches together at query time instead of re-scanning the original rows. Redis exposes the same idea directly as commands: <code>PFMERGE</code> combines HyperLogLogs, <code>CMS.MERGE</code> combines Count-Min Sketches, and a t-digest implementation offers its own merge command - all without ever touching the raw events that built them.</p>
<p><b>Worked example: live reaction counts on a livestream.</b> Millions of concurrent viewers can each tap a reaction button several times a second, and none of that should funnel through one shared counter. Instead, each application server handling a slice of viewers keeps its own local, approximate count of the reactions it has processed - perhaps a small tumbling window's worth, "reactions in the last second" - and periodically publishes just that number. A lightweight aggregation layer sums those per-server numbers together (a plain sum is enough if only a total is wanted; a merged HyperLogLog is used instead if the question is "how many distinct people reacted") and pushes the combined number out to viewers every second or two, over the same connections already used to deliver the stream's other realtime updates.</p>
<p>Viewers see a number that is approximate and a second or two old, rather than exact and instantaneous - a trade almost nobody notices, and one that turns an operation that would otherwise contend on a single row into one that scales with the number of application servers instead of the number of viewers.</p>
<p>The same sketches show up again in ML monitoring, on data that never reaches a viewer. A HyperLogLog tracks the cardinality of a categorical feature (how many distinct user ids, SKU ids, or IP addresses a pipeline run actually saw) cheaply enough to run on every batch, so a sudden, unexplained jump in that count can flag an upstream join fanning out unexpectedly, well before it shows up as a broken model. A t-digest or DDSketch kept per time window tracks how a feature's or a prediction's distribution is moving - has the p95 confidence score drifted, has a feature's typical value shifted - without ever shipping every raw value to a central monitoring pipeline; only the small, mergeable sketch travels.</p>`,
        deeper: `<p>This pattern - local approximate state, merged periodically - is the same idea as gossip-based cluster membership or eventually consistent replica counters elsewhere in distributed systems: give up strict, instant global agreement in exchange for a design that has no single point of contention at all.</p>`,
        check: {
          question: 'Why does the livestream reaction-count design have each server publish its own count periodically, rather than every server incrementing one shared counter directly?',
          options: [
            'A shared counter incremented directly by millions of viewers would become exactly the kind of single-row contention bottleneck this chapter opened with; publishing and merging local counts avoids that contention entirely',
            'Shared counters are not supported by any database',
            'This design is only needed because reactions are unimportant data',
            'Publishing periodically is slower than a shared counter and is only used to save money'
          ],
          answer: 0,
          explain: 'This is a direct application of the earlier lesson: a single shared counter under extreme concurrent write load becomes a bottleneck. Keeping counts local and merging periodically removes that single point of contention at the cost of a small, usually unnoticed delay.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'cs-a1',
        type: 'design',
        title: 'Design "watching now" and total reactions for a livestream',
        viz: 'hyperloglog-buckets',
        prompt: `Design a system that shows "2.3M people are watching this stream right now" and a live total reaction count, for a stream with 5 million concurrent viewers who can react constantly.`,
        timeboxSec: 360,
        rubric: `Must-haves: (1) explicitly rejects an exact, single-counter approach for either number and explains why (contention on shared state at this scale); (2) proposes a workable mechanism for the reaction total - local buffering/batching per server merged periodically, described as an approximate, refreshed-every-second-or-two number rather than an instantaneous exact one; (3) recognises that "people watching now" is a distinct-count problem (deduplicating viewer sessions), not a simple sum, and proposes HyperLogLog or an equivalent cardinality sketch, ideally naming that a small standard error (roughly 1%) is fine for a number displayed to users; (4) addresses how per-server state gets combined into one global number - mentioning mergeability (PFMERGE-style merging, or summing local aggregates) rather than routing everything through one aggregator with no scaling story. Common mistakes: proposing an exact atomic counter for either number with no acknowledgement of contention at this scale; treating "watching now" as the same problem as "total reactions" (a count vs a distinct count); no mention of how per-server numbers get merged. {{HONESTY}}`,
        model: `"Neither of these numbers can be an exact, single counter at 5 million concurrent viewers, so I'd design both around approximation from the start rather than trying to make an exact approach fast enough.

For the reaction total, each application server would keep a small local count of the reactions it has processed - say, in 1-second tumbling windows - and publish just that rolling number rather than writing every tap through a shared counter. A lightweight aggregation layer sums the per-server numbers and pushes the total to viewers every second or two. That's approximate and slightly delayed, but nobody watching a reaction count expects instant, exact precision, and this avoids contending on one shared row.

For 'people watching now,' I'd treat this differently, since it's a distinct-count problem, not a simple sum - a reconnecting viewer shouldn't be counted twice. Each server would maintain a HyperLogLog of the viewer session ids it currently holds, merged (PFMERGE-style) into one global estimate. HyperLogLog's standard error is around 1% at a reasonable register count, which is fine for a number shown to users - 2.28M instead of 2.3M changes nothing.

The common thread is: local, cheap, approximate state per server, merged periodically into one global number, rather than any design that routes millions of events a second through one place."`
      },
      {
        id: 'cs-a2',
        type: 'formulate',
        title: 'Count-Min Sketch vs a plain hash map of counts',
        viz: 'count-min-sketch',
        prompt: `An interviewer asks: when would you reach for a Count-Min Sketch instead of just keeping a hash map from item to count, and what do you give up by doing that?`,
        timeboxSec: 240,
        rubric: `Must-haves: (1) correctly identifies the trigger - a hash map's memory grows with the number of distinct keys seen, which becomes a problem when the key space is huge or effectively unbounded (e.g. distinct search queries, distinct IP addresses), whereas a Count-Min Sketch's memory is fixed regardless of distinct key count; (2) names the actual cost given up - the sketch can overestimate a count due to hash collisions (a hash map is always exact), and a sketch cannot enumerate which keys exist at all, only answer a frequency query for a key you already know to ask about; (3) does not claim a Count-Min Sketch is simply "better" or "worse" in general - frames it as a memory-versus-exactness trade tied to a specific scale problem. Common mistakes: describing the sketch's mechanism without ever stating the actual trade-off; claiming CMS gives an exact answer; claiming a hash map has bounded memory. {{HONESTY}}`,
        model: `"I'd reach for a Count-Min Sketch specifically when the number of distinct keys is huge or effectively unbounded and I can't afford memory that grows with it - something like counting occurrences of every distinct search query or every distinct IP address hitting a service. A hash map's memory grows linearly with the number of distinct keys it has ever seen, and at high enough cardinality that just becomes too much memory to hold, especially if I need this to run per-server rather than centrally.

A Count-Min Sketch fixes that by using a fixed-size grid of counters no matter how many distinct keys show up - but I'd be upfront about what that costs. First, its answers can be overestimates, never underestimates, because collisions in the hash grid inflate other items' counts; a hash map is always exact. Second, and I think this is the one people forget: a Count-Min Sketch can only answer 'how many times has this specific key occurred,' for a key I already know to ask about - it can't tell me what keys exist at all. A hash map can be iterated to list every key it has seen; a sketch fundamentally cannot.

So it's not that one is better - it's a genuine trade of memory for exactness and enumerability, and I'd only make that trade once the key space is actually too large for a hash map to be practical, not as a default choice."`
      },
      {
        id: 'cs-a3',
        type: 'followup',
        title: 'Interview question: is the fleet-wide p99 really 120ms?',
        prompt: `Interviewer: "Two of your regional services each report a p99 latency of 120ms. Is your fleet-wide p99 also 120ms?"`,
        timeboxSec: 150,
        rubric: `Must-haves: (1) answers no, and explains why - a percentile is a summary of a full distribution, and cannot be correctly combined by averaging, maxing, or otherwise arithmetically combining two already-summarised percentile numbers; (2) explains what would actually be needed to answer correctly - the underlying distributions (or sketches of them) from both regions, merged, then the percentile recomputed once on the merged result; (3) names a specific mechanism for doing this in practice - a mergeable quantile sketch like t-digest or DDSketch computed per region and merged centrally, rather than shipping raw latency values. Common mistakes: answering "yes" without justification; suggesting averaging or maxing the two p99 values as if that were correct; describing the problem without naming a concrete mechanism to solve it. {{HONESTY}}`,
        model: `"No, and I wouldn't be able to tell you the fleet-wide p99 just from those two regional numbers alone. A percentile summarises an entire distribution into a single number, and that summarising step isn't something you can undo or combine arithmetically - the true combined p99 depends on both regions' full latency distributions and on how much traffic each region actually served, not just on their two already-computed p99 values. It could genuinely fall above, below, or between 120ms depending on those details.

To get a real answer, I'd need the underlying distributions from both regions, or a good sketch of them, merged together, and then compute the percentile once on that merged result. In practice I wouldn't ship raw per-request latencies centrally just to do this - I'd have each region maintain a mergeable quantile sketch, something like a t-digest or a DDSketch, computed continuously from its own request latencies. Those sketches can be sent to a central aggregator and merged cheaply, and only then would I compute the p99 on the merged sketch to get a number I can actually trust as the fleet-wide figure."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Streaming 101: The World Beyond Batch', u: 'https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/', w: 'Defines event time versus processing time and the fixed/sliding/session window vocabulary this chapter uses.', m: 20 },
      { l: 'Streaming 102: The World Beyond Batch', u: 'https://www.oreilly.com/radar/the-world-beyond-batch-streaming-102/', w: 'The primary source for watermarks and triggers, the mechanism that decides when a late event still counts.', m: 25 },
      { l: 'HyperLogLog (Redis docs)', u: 'https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/', w: 'The primary source for PFADD/PFCOUNT/PFMERGE and the exact 0.81% error figure used in this chapter\'s worked example.', m: 10 },
      { l: 'Redis new data structure: the HyperLogLog', u: 'http://antirez.com/news/75', w: 'The algorithm\'s own implementer explains the coin-flip intuition behind counting leading zeroes, in plain words.', m: 12 },
      { l: 'Count-min sketch (Redis docs)', u: 'https://redis.io/docs/latest/develop/data-types/probabilistic/count-min-sketch/', w: 'The primary source for CMS.INITBYPROB sizing, a worked width/depth example, and the rule for deciding when a sketch\'s answer can be trusted.', m: 10 },
      { l: 'Video: Turning the database inside out with Apache Samza (Martin Kleppmann)', u: 'https://www.youtube.com/watch?v=fU9hR3kiOK0', w: 'Kleppmann\'s own case for treating a raw event stream as the source of truth and a fast aggregate as a disposable, rebuildable view - the idea behind this chapter\'s raw-events-vs-derived-aggregates split.', m: 30 },
      { l: 't-digest (Ted Dunning)', u: 'https://github.com/tdunning/t-digest', w: 'The algorithm\'s own author on why clustering more finely near the tails gives an accurate, mergeable quantile sketch.', m: 15 },
      { l: 'Computing Accurate Percentiles with DDSketch', u: 'https://www.datadoghq.com/blog/engineering/computing-accurate-percentiles-with-ddsketch/', w: 'The relative-error alternative to t-digest, from the team that built it to merge percentiles across thousands of hosts.', m: 12 }
    ],
    glossary: [
      {
        g: 'Counting and sketches',
        sub: '',
        rows: [
          ['HyperLogLog', 'A sketch that estimates the number of distinct items using tiny, fixed memory', 'cardinality'],
          ['Count-Min Sketch', 'A sketch that estimates how often an item occurred using a small counter grid', 'frequency'],
          ['t-digest', 'A mergeable sketch of a distribution that is most accurate near the tails', 'quantiles'],
          ['DDSketch', 'A mergeable sketch that guarantees the same relative error across its full range', 'quantiles'],
          ['Watermark', 'A stream processor\'s declared belief about how complete its view of event time is', 'windowing'],
          ['Tumbling window', 'A fixed-size, non-overlapping time window', 'windowing'],
          ['Hopping window', 'A fixed-size window that advances by a step smaller than its length', 'windowing'],
          ['Sliding window', 'A fixed-length window evaluated continuously as time moves forward', 'windowing'],
          ['Reservoir sampling', 'Keeping a uniform random sample of fixed size from a stream of unknown length', 'sampling'],
          ['Misra-Gries', 'An algorithm that finds candidate heavy hitters using at most k counters', 'heavy hitters'],
          ['Mergeable sketch', 'A sketch that can be combined with another of the same kind without rereading raw data', 'aggregation'],
          ['Cardinality', 'The number of distinct values in a set or column', 'counting']
        ]
      }
    ]
  };

  root.PREP_CORE['realtime-and-feeds'] = {
    id: 'realtime-and-feeds',
    title: 'Realtime delivery, feeds and notifications',
    level: 'danger',
    levelLabel: 'Asked in most system design interviews in some form - a chat feature, a feed, or a notification system.',
    why: `A chat app, a live feed and a notification system all sit on top of the same small set of ideas: how a server pushes something to a client without being asked again and again, and how a system decides what to show one user out of everything happening across everyone they follow. Interviewers reach for this because it rewards knowing the actual mechanism - a persistent connection, a fan-out strategy, a graph model - rather than a general "add a cache and a queue" answer. It also has a genuinely hard case built in, the celebrity problem, that separates someone who has only memorised "fan-out on write" from someone who understands why that alone breaks.`,
    learn: [
      {
        id: 'rf-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the words freely.</p>
<ul>
<li><b>Polling.</b> A client repeatedly asking the server "is there anything new?" on a fixed interval, whether or not the server actually has new data.</li>
<li><b>Long polling.</b> A client asks the server for new data, and the server holds that request open until new data exists or a timeout passes, instead of answering immediately with "nothing yet."</li>
<li><b>Server-Sent Events (SSE).</b> A single, long-lived HTTP connection over which the server streams events to the client as plain text, flowing in one direction only, server to client.</li>
<li><b>WebSocket.</b> A single connection, upgraded from an initial HTTP request, over which both the client and the server can send messages at any time in either direction.</li>
<li><b>Sticky session.</b> Routing every request or message from one client to the same backend server for the life of a connection, instead of load-balancing each one independently.</li>
<li><b>Connection registry.</b> A lookup, often a shared cache like Redis, mapping a user or connection id to the specific server currently holding that connection open.</li>
<li><b>Pub/sub.</b> A messaging pattern where a publisher sends a message to a named channel, and every subscriber currently listening to that channel receives a copy, without the publisher needing to know who is subscribed.</li>
<li><b>Heartbeat.</b> A small message sent periodically over a connection just to prove it is still alive, so a silently dead connection can be detected and cleaned up.</li>
<li><b>Reconnect with backoff and jitter.</b> A client whose connection drops waits an increasing, slightly randomised amount of time before retrying, so a mass disconnect (a deploy, a network blip) does not cause every client to reconnect at the exact same instant.</li>
<li><b>Presence.</b> Whether a given user is currently online, and often on which device, usually inferred from an active connection rather than an explicit status message.</li>
<li><b>Fan-out on write (push model).</b> Delivering a new post into every follower's feed at the moment it is created.</li>
<li><b>Fan-out on read (pull model).</b> Building a feed at the moment it is requested, by merging recent posts from everyone the requester follows.</li>
<li><b>Celebrity problem.</b> The cost spike caused by a single account with an enormous number of followers, where fanning out one post on write means writing to millions of feeds at once.</li>
<li><b>Social graph.</b> The set of relationships (follows, blocks, friendships) between accounts, modelled as a directed graph of edges between nodes.</li>
<li><b>Adjacency list.</b> The stored list of edges attached to one node - for a social graph, "everyone this account follows" or "everyone who follows this account."</li>
<li><b>Notification channel.</b> One way of reaching a user - push notification, SMS, email, or an in-app/in-product notification - each with different cost, latency and reliability.</li>
<li><b>Deduplication (notifications).</b> Preventing the same underlying event from firing more than one notification, for example by batching several likes into one summary notification.</li>
<li><b>Rate limiting per user.</b> A cap on how many notifications one user can receive in a period, usually split into separate budgets per category so one noisy source cannot crowd out an important one.</li>
<li><b>Delivery receipt.</b> Confirmation, usually from the client, that a message was received, distinct from confirmation that the server merely sent it or that the user has read it.</li>
<li><b>Unread indicator / read cursor.</b> A stored position (a timestamp or an id) marking the last item a user has seen, used to mark everything after it as unread without re-reading the whole feed.</li>
</ul>`,
        deeper: `<p>A theme worth noticing across this whole chapter: almost every mechanism here exists to answer "who currently holds this, and how do I reach them" cheaply, at a scale where "ask a central database every time" would be too slow or too much load - a connection registry, a social graph's adjacency list, and a feed's precomputed fan-out are all the same kind of answer to that same underlying question, applied to a socket, a follower list, and a set of recent posts respectively.</p>`,
        check: {
          question: 'A chat feature needs the server to push a new message to a client the instant it arrives, in both directions, with minimal overhead per message. Which transport best fits this, and why not Server-Sent Events?',
          options: [
            'Long polling, because it is simpler to implement than a persistent connection',
            'A WebSocket, because it is bidirectional - a client can also send on the same connection - while SSE only allows the server to push to the client, not the reverse',
            'Server-Sent Events, because it requires no connection at all',
            'Short polling, because it guarantees the lowest possible latency'
          ],
          answer: 1,
          explain: 'A chat feature needs both sides to send messages on the same connection. SSE is explicitly one-directional (server to client only), so a WebSocket, which is bidirectional, is the better fit here.'
        }
      },
      {
        id: 'rf-f1',
        part: 'field',
        title: 'Short polling vs long polling vs SSE vs WebSockets',
        viz: 'polling-vs-websocket',
        body: `<p><b>Short polling</b> has the client ask on a fixed interval, regardless of whether anything is new - simple to build, but most requests come back with "nothing changed," wasting requests, and real updates can wait up to a full interval before the client asks again.</p>
<p><b>Long polling</b> improves the wasted-request problem: the client asks, and the server holds that request open, only responding once new data actually exists (or a timeout passes), at which point the client immediately reissues the request. This cuts down on empty responses considerably, but each held-open request still consumes a server thread or connection slot, and every "new data" event still requires a fresh HTTP request right after the last one closed.</p>
<p><b>Server-Sent Events</b> keep one HTTP connection open and let the server stream events down it as they happen, with no new request needed per event - but the flow is one-directional; the client cannot send data back over that same connection.</p>
<p>A <b>WebSocket</b> upgrades an initial HTTP request into a single persistent connection that either side can send on, at any time, with very little per-message overhead once the connection is open - the right fit whenever the client also needs to send data, not just receive it, as in a chat feature or a multiplayer game.</p>
<p>As a rough guide: reach for short polling only when updates are infrequent and a real-time feel does not matter; long polling when true push infrastructure is not available but wasted requests matter; SSE when the server only ever needs to push to the client (a live score feed, a notification stream); and WebSockets when both sides need to send messages on one connection.</p>`,
        deeper: `<p>SSE has a quiet advantage worth naming: because it is just a long-lived HTTP response, it works over plain HTTP/1.1 infrastructure (proxies, load balancers) that was never built with WebSockets in mind, and a browser's built-in EventSource API handles reconnection automatically - which is part of why it remains a common choice for one-directional feeds even though WebSockets are more powerful.</p>`,
        check: {
          question: 'A live sports score feed only ever needs to push updates from server to client - the client never sends anything back over that connection. Which transport fits with the least unnecessary capability?',
          options: [
            'WebSocket, because it is the newest technology',
            'Short polling, because it is the simplest to implement',
            'Server-Sent Events, because the requirement is purely one-directional server-to-client push, which is exactly what SSE is built for',
            'Long polling, because it guarantees delivery order'
          ],
          answer: 2,
          explain: 'The requirement is one-directional push, which is exactly SSE\'s design. A WebSocket would work too but adds bidirectional capability that is not needed here.'
        }
      },
      {
        id: 'rf-f2',
        part: 'field',
        title: 'Scaling WebSocket servers',
        viz: 'websocket-fanout',
        body: `<p>A single WebSocket connection stays pinned to whichever server accepted it - two servers cannot share one open socket. A load balancer therefore uses a <b>sticky session</b>, routing the initial HTTP upgrade request and keeping that client's connection on the same backend for as long as it stays open.</p>
<p>Sticky sessions solve routing for one client's own connection, but not the harder problem: if server A needs to deliver a message to a user who happens to be connected to server B, server A has no direct way to reach that socket. A <b>connection registry</b> - commonly a shared store like Redis mapping user id to server id - lets any server look up where a given user is currently connected. The actual delivery then goes through <b>pub/sub</b>: every server subscribes to relevant channels (per user, per room, or similar), and when any server needs to deliver a message, it publishes to the right channel; whichever server is actually holding that connection receives the message and forwards it down its own open socket.</p>
<p><b>Heartbeats</b> - small ping/pong messages sent periodically - catch a connection that has gone silently dead (the TCP session looks alive, but the other end is gone) so the server can free that slot rather than holding a phantom connection forever. On the client side, <b>reconnecting with backoff and jitter</b> - waiting a growing, slightly randomised amount of time between retries - prevents a mass event like a deploy or a brief network blip from causing every client to reconnect at the exact same instant and overwhelming the fleet right when it is most fragile.</p>`,
        deeper: `<p>The connection registry and pub/sub layer together are what actually let a WebSocket fleet scale horizontally: without them, adding more servers would just mean more places a given user might be connected to, with no way for the rest of the system to find them - the registry and pub/sub are the mechanism that makes "which server has this user" a fast lookup instead of a broadcast to every server.</p>`,
        check: {
          question: 'Server A needs to deliver a chat message to a user who is currently connected to server B, in a fleet of 20 WebSocket servers. What actually makes this delivery possible?',
          options: [
            'Sticky sessions alone, since they keep every client on one server',
            'A connection registry to find that the user is on server B, combined with pub/sub so server A can publish the message and server B (subscribed) receives and forwards it down that specific socket',
            'Server A opens a new direct connection to the user, bypassing server B entirely',
            'This is not possible in a multi-server WebSocket fleet'
          ],
          answer: 1,
          explain: 'Sticky sessions only keep an existing connection pinned to its server; they do not help another server find or reach it. The connection registry answers "which server," and pub/sub is the mechanism that actually moves the message to that server for delivery.'
        }
      },
      {
        id: 'rf-f3',
        part: 'field',
        title: 'A realtime database or presence system in brief',
        body: `<p>A realtime database - the pattern popularised by Firebase - keeps a persistent connection per client and pushes any change to data that client has subscribed to, instead of the client polling for changes. Internally, this is the same pub/sub fan-out pattern from the previous section: a write to some piece of data triggers a change event, and that event is pushed to every currently-subscribed client holding an open connection, through whichever server happens to hold each of those connections.</p>
<p><b>Presence</b> - whether a user is online right now, and sometimes on which device - is usually implemented as a short-lived key with a time-to-live (TTL), refreshed by the same heartbeat that keeps the connection alive. As long as heartbeats keep arriving, the presence key's TTL keeps getting extended and the user shows as online; if the connection dies (a crash, a dropped network, a phone going out of signal), the heartbeats simply stop, the TTL expires on its own, and the user is shown as offline automatically - without ever needing an explicit "I am now offline" message that a crashed client could never actually send.</p>
<p>This TTL-based design is a deliberate choice: it treats "online" as something proven by a recent heartbeat, not something declared once and trusted forever, which is exactly the property needed given that clients can disappear without any chance to say goodbye.</p>`,
        deeper: `<p>The same TTL idea shows up anywhere a system needs to detect the absence of something it cannot directly observe - a worker that stops sending progress heartbeats, a lock that must expire if its holder crashes - because in every one of these cases, waiting for an explicit "I'm done" or "I'm gone" message is not an option once you assume failures happen without warning.</p>`,
        check: {
          question: 'A user\'s phone loses signal without any chance to notify the server. How does a TTL-based presence system correctly show them as offline?',
          options: [
            'It cannot; presence systems require an explicit offline message',
            'The heartbeat that was refreshing the presence key\'s TTL simply stops arriving, so the TTL expires on its own and the user is shown offline without needing any explicit message from the crashed client',
            'The server pings the phone directly to check its status',
            'The user stays marked online forever until they manually log out'
          ],
          answer: 1,
          explain: 'The design assumes silent failure is the normal case, not the exception. Presence is proven by a live heartbeat continually refreshing a TTL; when the heartbeat stops for any reason, the TTL simply runs out with no explicit action required.'
        }
      },
      {
        id: 'rf-f4',
        part: 'field',
        title: 'Feed generation',
        viz: 'fanout-write-vs-read',
        body: `<p><b>Fan-out on write</b> pushes a new post into every follower's precomputed feed the instant it is created, so reading a feed later is cheap - just read an already-built list. The cost falls on the write instead: one post from an account with a million followers means writing that post's id into a million feeds at once.</p>
<p><b>Fan-out on read</b> avoids that write cost by building a feed only when it is requested, merging the most recent posts from everyone the requester follows at read time. Writes stay cheap and small regardless of follower count, but reads get more expensive, and they get slower specifically for the accounts that follow the most people, since each read has to merge more sources.</p>
<p>This is the <b>celebrity problem</b>: pure fan-out on write breaks down for an account with tens of millions of followers, because a single post would require tens of millions of feed writes at nearly the same instant. Most real feeds use a hybrid: ordinary accounts (the overwhelming majority of posts and follower counts) use fan-out on write for fast reads, while celebrity accounts' posts are fetched with fan-out on read and merged into each follower's feed only at request time.</p>
<p>Once candidate posts are gathered, by either method, they are usually reordered by a ranking step rather than shown in strict reverse-chronological order - weighing recency against predicted interest and past engagement with the poster. Feeds are paginated with a cursor tied to a stable position, such as a timestamp or a monotonically increasing id, rather than a numeric offset, since new posts constantly arrive above the top and an offset would skip or repeat items as the underlying list shifts under it. The unread indicator itself is cheap: a client or lightweight counter service just compares the last position a user has seen against the newest available position, rather than reading the whole feed to figure out what is new.</p>`,
        deeper: `<p>The hybrid split does not have to be a hard follower-count cutoff decided once: some systems continuously re-evaluate which accounts are expensive enough to warrant the read-time path, since an account's follower count and posting frequency both change, and a fixed threshold set once can drift out of date as a platform grows.</p>`,
        check: {
          question: 'A platform uses pure fan-out on write for every account, including celebrities. What specifically breaks first as a celebrity account\'s follower count grows into the tens of millions?',
          options: [
            'Nothing breaks; fan-out on write scales the same regardless of follower count',
            'Reads become slow, because the feed has to be recomputed from scratch on every request',
            'Writes become the bottleneck: a single post now requires writing into tens of millions of individual feeds at nearly the same moment',
            'The social graph becomes too large to store'
          ],
          answer: 2,
          explain: 'Fan-out on write pushes a post into every follower\'s feed at write time, so its cost is proportional to follower count. A celebrity account\'s follower count is exactly what makes that write cost explode - this is the celebrity problem.'
        }
      },
      {
        id: 'rf-f5',
        part: 'field',
        title: 'The social graph model',
        body: `<p>A social graph is modelled as a directed graph: one edge per <b>follow</b> (A follows B) or <b>block</b> (A blocks B), with each edge usually carrying a state - active, or archived rather than hard-deleted - since a system often needs the history of a relationship, not just its current value.</p>
<p>Rather than a general-purpose graph database, a system like Twitter's FlockDB stores two <b>adjacency lists</b> per edge type: a forward list (everyone a given account follows) and a backward list (everyone who follows a given account), each stored as sharded, indexed rows keyed by the source node of that particular list. This matters because the two queries a feed and a notification system actually need constantly - "who does A follow" and "who follows B" - become single indexed lookups this way, instead of a general graph traversal. Sharding by the source node id (or a hash of it) means one very popular account's enormous follower list still ends up on a predictable shard, even if that shard ends up carrying more data than most.</p>
<p>The trade this design makes is deliberate: it gives up efficient support for general multi-hop graph queries ("friends of friends," shortest path between two accounts) in exchange for very fast, very high-throughput single-hop lookups - which is almost all a feed, a notification system, or a "who to follow" suggestion actually needs day to day.</p>`,
        deeper: `<p>Storing both a forward and a backward adjacency list for the same relationship is a deliberate duplication: it costs extra storage and an extra write on every follow/unfollow (both lists need updating), but it is what turns "who follows B" from a query nobody could answer quickly at scale into a single indexed lookup.</p>`,
        check: {
          question: 'Why does an adjacency-list graph store like FlockDB keep both a forward list (who A follows) and a separate backward list (who follows B), rather than just one list and deriving the other by search?',
          options: [
            'To save storage space, since one list can always be derived instantly from the other',
            'So that both of the two queries a feed system actually needs - "who does A follow" and "who follows B" - are each a single indexed lookup, at the cost of extra storage and a second write per edge change',
            'Backward lists are required by law for social graphs',
            'A forward list and a backward list always contain identical data'
          ],
          answer: 1,
          explain: 'Deriving one list from the other would require scanning, which defeats the purpose of a fast lookup. Storing both directly, at the cost of extra storage and a duplicated write, is what makes both common queries equally fast.'
        }
      },
      {
        id: 'rf-f6',
        part: 'field',
        title: 'A notification system',
        viz: 'notification-pipeline',
        body: `<p>A notification system routes one underlying event out to a user across several possible <b>channels</b> - push notification, SMS, email, in-app - each with its own cost, latency and reliability, chosen based on the event's urgency and the user's own preferences. <b>Priority</b> matters as much as channel: a security alert ("new device login") should not sit behind a queue of promotional emails, so a real system typically uses separate queues or priority levels per category rather than one shared FIFO queue for every kind of notification.</p>
<p><b>Deduplication</b> prevents the same underlying activity from producing several separate notifications - three likes on a post within a short window should usually become one "3 people liked your post" notification, not three separate pushes. <b>Rate limiting per user</b> caps how many notifications a person receives in a period, usually with a separate budget per category, so a burst of low-priority social activity cannot use up a budget that would otherwise let an important alert through.</p>
<p>Sending itself has to assume it can fail: a push provider or SMS gateway can be transiently unavailable, so a send goes through the same backoff-and-retry pattern as any external call, bounded, and protected by an idempotency key so a retried send does not double-fire the same notification. A <b>delivery receipt</b> - typically a client-side acknowledgement - lets the system distinguish "sent" from "actually delivered" from "read," both for product measurement and for deciding whether to fall back to a different channel after a delivery failure. Finally, every send checks the user's own <b>preferences</b> - a per-category, per-channel opt-in table - since even a technically correct, on-time notification is the wrong thing to send if the user has turned that category off.</p>`,
        deeper: `<p>Priority queues and rate limits interact in a way worth stating explicitly in an interview: a per-category rate limit budget should be sized and enforced independently per category specifically so that a noisy, high-volume category (social activity) cannot silently consume the budget that a rare, high-importance category (security alerts) needs to stay usable.</p>`,
        check: {
          question: 'A user receives three separate push notifications within one minute, each saying "someone liked your post," for three different likes on the same post. What is this most likely missing?',
          options: [
            'Rate limiting, since three notifications in a minute is always too many regardless of content',
            'Deduplication/batching: these three related events should likely have been combined into one "3 people liked your post" notification instead of firing separately',
            'A delivery receipt, since the notifications were clearly not delivered correctly',
            'Nothing; sending one notification per like is the expected, correct behaviour'
          ],
          answer: 1,
          explain: 'This is exactly the deduplication problem: several closely related events on the same object, in a short window, are good candidates for batching into a single summary notification rather than firing one per event.'
        }
      },
      {
        id: 'rf-f7',
        part: 'field',
        title: 'Reactions and counters at scale',
        body: `<p>A like or reaction count on a popular post is the exact problem from the counting chapter, showing up again in a feed and notification context: a viral post can receive reaction taps far faster than any single database row can safely absorb as individual writes. The same fix applies directly - buffer and batch reaction increments locally rather than writing each one through to a shared row, and merge those local counts into the number shown to users on a short refresh cycle rather than instantly and exactly.</p>
<p>The same approximation is usually acceptable here for the same reason it was acceptable for a livestream's reaction count: a user looking at "14.2K reactions" gets exactly the same impression whether the true number is 14,203 or 14,187, so there is little product cost to trading a small amount of precision for a design that has no single point of write contention. Where an exact number does matter - billing, a payout tied to engagement, an audit trail - the underlying raw event log (kept as the source of truth, as described in the counting chapter) is what gets used, not the fast, approximate counter shown in the feed.</p>`,
        deeper: `<p>This is a useful thing to say explicitly in an interview: the decision of whether a given count needs to be exact is a product and business decision, not a purely technical one, and naming which numbers in a system fall on which side of that line is often more valuable to an interviewer than describing the sketch mechanics themselves.</p>`,
        check: {
          question: 'A product manager insists the reaction count on posts must always be exactly correct, down to the last tap, updated instantly, even under extreme viral load. What is the most accurate response to this requirement?',
          options: [
            'This is easy to satisfy with a single atomic counter per post, no matter the load',
            'This combination of exact, instant, and extremely high write volume is in tension - achieving true exactness under that load requires accepting the write contention this chapter\'s counting techniques exist to avoid, so the actual conversation needed is which of "exact," "instant," or "cheap at extreme scale" can be relaxed',
            'This requirement is impossible to discuss without knowing the programming language used',
            'Approximate counts are always technically inferior and should never be used for user-facing numbers'
          ],
          answer: 1,
          explain: 'Exact, instant, and cheap under extreme concurrent write load are in real tension with each other. The useful answer names that trade-off directly rather than promising all three are simultaneously free.'
        }
      },
      {
        id: 'rf-f8',
        part: 'field',
        title: 'Live commentary or live scores as a worked example',
        body: `<p>A live sports score or match-commentary feed combines several ideas from this chapter into one system. Viewers connect over WebSockets or SSE rather than polling, because a goal has to reach potentially a million viewers in well under a second, not on the next multi-second polling interval; SSE is enough here since updates only flow from server to client. The connection registry and pub/sub pattern from earlier delivers one published event - "goal scored" - to every server currently holding a viewer connection for that specific match, and each of those servers forwards it down its own open connections.</p>
<p>Because every viewer of one match needs to see events in the same order - a red card reported before the goal it led to would be confusing - updates for a given match are published on one ordered channel or partition, rather than risking several independent services racing to deliver events for the same match in whatever order they happen to finish.</p>
<p>A viewer who reconnects after a dropped network needs to catch up correctly, not just start receiving new events from the moment they reconnect. The server keeps a short replay buffer of the most recent events for that match, keyed by a sequence number, so a reconnecting client can say "I last saw sequence 41" and receive everything from 42 onward, rather than silently missing whatever happened while it was disconnected.</p>
<p>The live viewer count itself is exactly the reaction-style approximate counter from earlier in this chapter: refreshed every second or two from merged per-server counts, not recomputed and pushed on every single join or leave.</p>`,
        deeper: `<p>The ordering requirement here is worth being precise about: it does not require a single global order across every match happening simultaneously, only a consistent order within each individual match's own event stream - which is exactly why partitioning by match (rather than needing one global ordered log for the entire platform) is enough.</p>`,
        check: {
          question: 'A viewer\'s connection drops for 8 seconds during a live match and then reconnects. Why does the server need a short replay buffer rather than just resuming live updates from the moment of reconnection?',
          options: [
            'To reduce server memory usage',
            'So the reconnecting client can specify the last sequence number it saw and receive everything it missed during the 8-second gap, instead of silently missing any events that happened while disconnected',
            'Replay buffers are required for legal compliance in sports broadcasting',
            'This is unnecessary; resuming from the moment of reconnection is always sufficient'
          ],
          answer: 1,
          explain: 'Without a replay buffer, events that occurred during the disconnection window would simply never reach that client. Keeping recent events keyed by sequence number lets a reconnecting client catch up on exactly what it missed.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'rf-a1',
        type: 'design',
        title: 'Design notifications for a food delivery app',
        viz: 'notification-pipeline',
        prompt: `Design the notification system for a food delivery app: order status updates ("your food is on the way"), promotional offers, and a security alert for a new device login.`,
        timeboxSec: 420,
        rubric: `Must-haves: (1) assigns different channels and urgency to each notification type with reasoning - order status as time-critical (push, possibly over an existing realtime connection), promotions as lower priority and rate-limited, security alerts as high priority and not subject to the same rate limit; (2) proposes separate priority handling (queues or priority levels) so promotions cannot delay or crowd out order status or security notifications; (3) addresses per-user rate limiting specifically for promotions, and explicitly notes that a security alert should bypass or have its own separate budget from the promotional rate limit; (4) addresses reliability for order status specifically - retries with an idempotency key so a retried send does not double-notify, and a delivery receipt to know the update actually reached the user; (5) mentions user preferences/opt-out at least for the promotional category. Common mistakes: treating all three notification types identically; putting everything through one shared queue with one rate limit; no mention of idempotency/retries for the time-critical order status path. {{HONESTY}}`,
        model: `"I'd treat these three very differently rather than building one identical pipeline for all of them. Order status updates are time-critical and low-volume per user, so I'd push them immediately - ideally over a connection the app already has open - with retries protected by an idempotency key tied to that status transition, so a retry after a timeout doesn't notify the user twice. I'd also want a delivery receipt, since knowing whether 'your food is on the way' actually reached the user matters for support.

Promotions are the opposite: high volume, low urgency, and exactly the category I'd put a real per-user rate limit on - a cap per day or week, plus a category opt-out, since an unwanted promotion costs goodwill for free.

The security alert needs to be high priority and, importantly, not share a budget with promotions - if someone has hit their daily cap from promotional messages, that should never delay a real security alert. I'd put it on a separate, effectively unlimited priority path.

Structurally, I'd route all three through a shared service that checks preferences and applies deduplication, then fan out into separate priority queues per category - security, order status, promotional - each with its own workers, so a backlog in one queue can never delay the others."`
      },
      {
        id: 'rf-a2',
        type: 'formulate',
        title: 'Scaling a chat app from 10,000 to 2 million connections',
        viz: 'websocket-fanout',
        prompt: `An interviewer asks: your chat app's WebSocket servers need to scale from 10,000 to 2 million concurrent connections. What changes, and what stays the same?`,
        timeboxSec: 300,
        rubric: `Must-haves: (1) recognises a single server has a hard ceiling on concurrent connections (file descriptor and memory limits) so horizontal scale-out across many servers is required, not just a bigger single server; (2) explicitly names the problem that horizontal scale-out creates - a message from a user on one server to a user on a different server - and proposes a connection registry to solve "which server holds this user"; (3) names pub/sub as the delivery mechanism once the target server is known; (4) mentions sticky sessions at the load balancer as still necessary; (5) mentions heartbeats for detecting dead connections at this scale, where a leaked phantom connection now has real cost multiplied by 2 million. Common mistakes: proposing only "add more servers" with no mention of cross-server delivery; forgetting sticky sessions; describing a message queue consumer group as a complete substitute for a connection registry without addressing that it does not by itself answer "which server holds this specific user's socket." {{HONESTY}}`,
        model: `"The first thing that changes is that this can no longer be one server, or even a few - there's a hard ceiling on how many concurrent connections a single server can hold, bounded by file descriptors and memory per connection, so getting to 2 million means running many WebSocket servers.

That creates a problem 10,000 connections on one server never had: a message from a user on server A now often needs to reach a user connected to a different server, B. So I'd add a connection registry - a shared store like Redis mapping user id to the server holding their connection - so any server can look up where a target user actually is. Delivery would go through pub/sub: server A publishes to a channel for that user, every server is subscribed, and whichever one holds that connection forwards the message down its own socket.

Some things stay the same in spirit: I'd still want sticky sessions at the load balancer so a connection stays pinned to one server, and I'd still want heartbeats - if anything more disciplined ones, since a leaked phantom connection that was a minor annoyance at 10,000 connections becomes a real problem multiplied across 2 million.

I'd also note a message queue with consumer groups is not a substitute for the registry - it distributes work reliably, but doesn't answer 'which server holds this user's open socket,' the actual question that needs answering before delivery."`
      },
      {
        id: 'rf-a3',
        type: 'followup',
        title: 'Interview question: fan-out on write vs read, and the celebrity problem',
        prompt: `Interviewer: "Explain fan-out on write versus fan-out on read for a news feed, and how you'd handle an account with 50 million followers, in about 90 seconds."`,
        timeboxSec: 120,
        rubric: `Must-haves: (1) correctly defines both fan-out on write (push at post time) and fan-out on read (merge at read time), stating what each optimises for (fast reads vs cheap writes); (2) correctly identifies the celebrity problem as the write cost of fan-out on write becoming unmanageable at very high follower counts; (3) proposes the hybrid solution - fan-out on write for ordinary accounts, fan-out on read for celebrity accounts, merged at request time - rather than picking one strategy globally; (4) stays within the time-boxed, spoken-answer format rather than turning into an exhaustive design document. Common mistakes: describing only one of the two strategies; failing to explain why the celebrity problem happens specifically (not just naming it); proposing to simply ban celebrity accounts or cap follower counts as the "solution." {{HONESTY}}`,
        model: `"Fan-out on write means that the moment someone posts, the system immediately writes that post into every one of their followers' feeds, so reading a feed later is just reading an already-built list - fast reads, at the cost of a write that's proportional to follower count.

Fan-out on read flips that: nothing gets written to followers at post time, and instead a feed is built when it's actually requested, by merging the most recent posts from everyone that person follows. Writes stay cheap no matter how popular the poster is, but reads get more expensive, especially for someone who follows a lot of accounts.

The celebrity problem is what happens with pure fan-out on write on an account that has 50 million followers: one post now means 50 million near-simultaneous feed writes, which is exactly the kind of write spike a real system can't absorb cleanly.

So in practice I wouldn't pick one strategy for the whole platform - I'd use fan-out on write for the vast majority of accounts, since most people have modest follower counts and this keeps their followers' reads fast. For a small number of very high-follower accounts, I'd skip the write-time fan-out entirely and instead fetch their recent posts at read time, merging them into each follower's feed on request - accepting a slightly more expensive read specifically for people who follow celebrities, in exchange for never having to survive a 50-million-write spike."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'PRIMER: Server-Sent Events (MDN)', u: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events', w: 'The standard reference for the one-directional push model this chapter compares against WebSockets.', m: 8 },
      { l: 'PRIMER: WebSocket API (MDN)', u: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API', w: 'The standard reference for the WebSocket handshake and connection lifecycle.', m: 8 },
      { l: 'Long Polling vs WebSockets: What\'s best for realtime at scale?', u: 'https://ably.com/blog/websockets-vs-long-polling', w: 'Lays out the resource cost difference between polling and a persistent connection at real scale.', m: 12 },
      { l: 'Video: Scaling Websockets with Redis, HAProxy and Node JS', u: 'https://www.youtube.com/watch?v=gzIcGhJC8hA', w: 'Shows the connection-registry and pub/sub pattern that lets a message reach a user connected to a different server.', m: 25 },
      { l: 'Video: Load balancing WebSockets streams efficiently', u: 'https://www.youtube.com/watch?v=ugAZsDdmwJQ', w: 'Covers sticky sessions and why a plain round-robin load balancer breaks a long-lived connection.', m: 15 },
      { l: 'FlockDB (Twitter, GitHub)', u: 'https://github.com/twitter-archive/flockdb', w: 'Twitter\'s own open-sourced graph store, the primary source for the adjacency-list model this chapter describes.', m: 10 },
      { l: 'Video: Designing Instagram - System Design of News Feed', u: 'https://www.youtube.com/watch?v=QmX2NPkJTKg', w: 'Works through fan-out on write versus read and the celebrity problem end to end.', m: 37 },
      { l: 'Video: Design Notifications System Design', u: 'https://www.youtube.com/watch?v=e8cX9pQdu7Y', w: 'Covers channels, retries, and per-user rate limiting for a notification system in one worked design.', m: 20 }
    ],
    glossary: [
      {
        g: 'Realtime, feeds and notifications',
        sub: '',
        rows: [
          ['Server-Sent Events', 'A one-way HTTP stream the server uses to push events to a client', 'transport'],
          ['Sticky session', 'Routing a client\'s requests to the same backend for the life of a connection', 'load balancing'],
          ['Connection registry', 'A lookup mapping a user or connection id to the server currently holding it', 'realtime infrastructure'],
          ['Fan-out on write', 'Pushing a new post into every follower\'s feed at write time', 'feed generation'],
          ['Fan-out on read', 'Building a feed by merging followed accounts\' posts at read time', 'feed generation'],
          ['Celebrity problem', 'The cost spike when one account has too many followers to fan out to on every write', 'feed generation'],
          ['Adjacency list', 'A stored list of the edges attached to one node, for fast one-hop lookups', 'social graph'],
          ['Presence', 'Whether a user is currently online, usually tracked with a short-lived heartbeat key', 'realtime infrastructure'],
          ['Heartbeat', 'A small periodic message that proves a connection is still alive', 'realtime infrastructure'],
          ['Delivery receipt', 'Client confirmation that a message was received, distinct from it being read', 'notifications'],
          ['Rate limiting per user', 'A per-account cap on how many notifications go out in a period', 'notifications']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
