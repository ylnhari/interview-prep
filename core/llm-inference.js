/* llm-inference: fine-tuning/alignment and inference-engineering chapters for the training and LLM track. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['llm-fine-tuning-and-alignment'] = {
    id: 'llm-fine-tuning-and-alignment',
    title: 'Fine-tuning and alignment',
    level: 'warning',
    levelLabel: 'Common whenever a role touches model customisation, not universal',
    why: 'Any team that adapts a pretrained model to its own product needs this vocabulary: what fine-tuning actually changes in a model, why LoRA became the default way to do it cheaply, and what the alignment stage before a model ships is actually doing to its behaviour. Interviewers use these questions to check you understand what training changes and what it does not, since that distinction is what stops a team from reaching for fine-tuning when a better prompt or a lookup would have worked.',
    learn: [
      {
        id: 'lft-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Fine-tuning</b> - continuing to train a pretrained model on new, usually smaller, task-specific data so its weights shift toward that task. Example: training a base model on a company's support tickets so it answers in that voice.</li>
<li><b>Prompt engineering</b> - getting a model to behave the way you want purely through how you phrase the request, with no training at all. Example: adding "answer in three bullet points" to the instruction text.</li>
<li><b>Retrieval-augmented generation (RAG)</b> - looking up relevant documents at request time and putting them in the prompt, so the model answers from that supplied text instead of only from what it memorised during training.</li>
<li><b>Pretraining</b> - the original, very large training run on broad text that gives a model its general language ability, before anyone fine-tunes it for a task.</li>
<li><b>Instruction tuning</b> - fine-tuning on examples that pair an instruction with the response wanted, so the model learns to follow instructions in general rather than one narrow task.</li>
<li><b>Full fine-tuning</b> - updating every weight in the model. Correct, but memory-heavy, since gradients and optimiser state must be kept for every parameter.</li>
<li><b>LoRA (low-rank adaptation)</b> - freezing the base weights and training only a small pair of added matrices per layer, cutting the number of trainable parameters by orders of magnitude.</li>
<li><b>QLoRA</b> - LoRA, plus running the frozen base model itself in 4-bit precision, so memory is saved on both the frozen weights and the training state.</li>
<li><b>Adapter</b> - the small set of extra weights, such as LoRA's A and B matrices, added to a frozen model and trained in place of the base weights.</li>
<li><b>Rank (r)</b> - the size of the bottleneck dimension inside a LoRA adapter; a small chosen number, typically 4 to 64, that sets how many trainable parameters the adapter has.</li>
<li><b>Catastrophic forgetting</b> - a model losing general ability it had before fine-tuning, because the fine-tuning pulled its weights too far in one narrow direction.</li>
<li><b>Reward model</b> - a separate model trained to score how good a response is, usually learned from humans picking their preferred response out of a pair.</li>
<li><b>RLHF (reinforcement learning from human feedback)</b> - using a reward model's score, inside a reinforcement-learning (RL) training loop, to push a language model toward the responses people prefer.</li>
<li><b>KL (Kullback-Leibler) divergence</b> - a number measuring how far one probability distribution has moved from another. Used here as a penalty term that keeps a model being tuned from drifting far from the model it started as.</li>
<li><b>PPO (proximal policy optimisation)</b> - the reinforcement-learning algorithm RLHF usually runs, with limits built in so no single update can move the model too far at once.</li>
<li><b>DPO (direct preference optimisation)</b> - training directly on pairs of preferred and dispreferred responses with a single loss, reaching a similar result to RLHF without a reward model or a reinforcement-learning loop.</li>
<li><b>GRPO (group relative policy optimisation)</b> - a reinforcement-learning method that scores each response against the average of several responses to the same prompt, instead of needing a separately trained value model.</li>
<li><b>Held-out set</b> - data set aside and never used for training, so evaluating on it tells you how the model does on examples it has not seen.</li>
<li><b>Benchmark</b> - a fixed, public test set used to compare models on a general capability, such as reasoning or knowledge.</li>
<li><b>LLM-as-judge</b> (LLM is short for large language model) - using a strong model to read and score another model's outputs, so a human does not have to score every single one.</li>
<li><b>Merging adapters</b> - folding a trained LoRA adapter's weights back into the base model, producing one ordinary checkpoint with no extra inference-time cost.</li>
</ul>`,
        deeper: `<p>Two different vocabularies meet in this chapter, and interviewers move between them freely: the mechanics of adapting weights (fine-tuning, LoRA, rank) and the mechanics of shaping behaviour after that (reward models, RLHF, DPO). It helps to keep the boundary straight: fine-tuning methods are about <i>how</i> weights change; alignment methods are about <i>what objective</i> decides which way they should change. A model can be fine-tuned without ever going through an alignment stage, and an alignment stage is itself usually built on top of an ordinary fine-tune.</p>`,
        check: {
          question: 'Which one of these, done on its own, changes no weights at all?',
          options: ['Full fine-tuning', 'LoRA', 'Prompt engineering', 'RLHF'],
          answer: 2,
          explain: 'Prompt engineering changes only the text sent to a fixed model. Every other option updates some set of weights, whether all of them, a small adapter, or the policy in a reinforcement-learning loop.'
        }
      },
      {
        id: 'lft-f1',
        part: 'field',
        title: 'When to fine-tune, when to prompt, when to retrieve',
        viz: 'rag-pipeline',
        body: `<p>Start with the cheapest option: a better prompt costs nothing to try and can be changed in seconds, so it is the first thing to test for a problem about the model's <i>behaviour</i> - its format, tone, or how carefully it follows an instruction.</p>
<p>If the problem is that the model does not know something - a fact, a recent event, an internal document - fine-tuning is usually the wrong tool. Fine-tuning teaches a model how to respond far more reliably than it teaches new facts, and a fine-tuned fact cannot be updated the moment the source document changes; every update needs a new training run. <b>Retrieval-augmented generation</b> fixes this directly: look the fact up at request time and hand it to the model in the prompt, so the answer is grounded in a specific, current, and citable source instead of whatever the model happened to memorise.</p>
<p>Fine-tune when the problem really is about behaviour and prompting and retrieval have both been tried and still fall short: a specific output format that has to be followed exactly every time, a persona or tone that must stay consistent under load, following a large and stable set of domain rules more reliably than prompting alone achieves, or moving the same behaviour onto a smaller and cheaper model once a larger model has shown it works.</p>
<p>A practical ladder: prompt first; add retrieval once the answer depends on information outside the model's training data or the prompt itself; fine-tune once repeated prompting and retrieval still cannot make the model behave the way the task needs, or once cost and latency require a smaller, specialised model. The strongest production systems usually use all three together: a model fine-tuned on the task's format and voice, given a well-written prompt, and handed retrieved context for anything that can change.</p>`,
        deeper: `<p>Fine-tuning on a narrow set of facts can still shift the model's answers toward those facts, but it does so unreliably: it cannot tell the model when it does not know something, so it tends to produce a confident, wrong answer instead of admitting the gap. Retrieval fails more gracefully - when nothing relevant is found, the honest answer is to say so - which is usually the behaviour a knowledge problem actually needs.</p>`,
        check: {
          question: "A team wants their assistant to always cite this week's internal pricing, which changes weekly, and someone proposes fine-tuning it in. What is the strongest objection?",
          options: [
            'A language model cannot represent numbers accurately at all',
            'Fine-tuning would bake the price into the weights, which would need a new training run every time it changes, while retrieval can serve the current price at request time',
            'Fine-tuning is always slower to run at inference than retrieval',
            'Fine-tuning requires a reward model before it can be used'
          ],
          answer: 1,
          explain: 'The problem is freshness, not behaviour. Retrieval looks the current value up every time; a fine-tuned fact is frozen at training time and goes stale the moment the price changes again.'
        }
      },
      {
        id: 'lft-f2',
        part: 'field',
        title: 'Full fine-tuning versus LoRA and QLoRA',
        viz: 'lora-adapter',
        body: `<p>Full fine-tuning updates every weight, so training must hold not just the weights but their gradients and the optimiser's own per-parameter bookkeeping. With the common Adam optimiser in mixed precision, the standard accounting is 16 bytes of state per parameter: 2 bytes for fp16 weights, 2 for fp16 gradients, and 4 bytes each for a full-precision copy of the weights and Adam's two running averages. That memory bill, more than the model's usefulness, is usually what rules full fine-tuning out for anything past a few billion parameters on ordinary hardware.</p>
<p><b>LoRA</b> (low-rank adaptation) freezes every original weight matrix <b>W</b> and adds a small trainable path beside it: two matrices <b>A</b> and <b>B</b> whose product is added to W's output. If W has shape d_out by d_in, A has shape r by d_in and B has shape d_out by r, where the <b>rank</b> r is a small chosen number, typically 4 to 64. Only A and B train; W keeps no gradient and no optimiser state at all. Adapters usually attach to the attention projection matrices first - query and value at minimum, with key, output, and the feed-forward layers added for better quality at a still-small extra cost - and a scaling factor, written alpha divided by r, controls how strongly the adapter's correction is added back in.</p>
<p><b>QLoRA</b> goes one step further: it keeps the frozen base weights themselves in 4-bit precision, not just skips training them, so the base model's own memory footprint shrinks as well as the training state. The LoRA adapters still train in higher precision on top of that quantised base.</p>`,
        deeper: `<p>The trainable parameter count for one LoRA matrix is r times (d_in plus d_out). Take a 7-billion-parameter model with hidden size 4,096: applying rank-8 LoRA to just the query and value projections across all 32 layers gives 8 times (4,096 plus 4,096) = 65,536 trainable parameters per matrix, times 64 matrices (2 per layer times 32 layers), for about 4.2 million trainable parameters - roughly 0.06 percent of the full model. At a larger scale, the original LoRA paper reports cutting GPT-3's trainable parameters by 10,000 times and its GPU memory need by 3 times compared with full fine-tuning, with no added inference latency once the adapter is merged back in.</p>
<p>QLoRA's 4-bit base shrinks a 7B model's own weights from about 14GB to roughly 3.5GB, which is what let its authors fine-tune a 65-billion-parameter model on a single 48GB GPU while matching the task performance of full 16-bit fine-tuning.</p>`,
        check: {
          question: 'A team applies LoRA at rank 8 to the query and value projection matrices of a 4,096-hidden-size, 32-layer, 7-billion-parameter model. Roughly how many trainable parameters does that add?',
          options: ['About 4.2 million', 'About 420 million', 'About 65,536', 'About 7 billion'],
          answer: 0,
          explain: 'Per matrix: 8 x (4,096 + 4,096) = 65,536. There are 2 matrices per layer x 32 layers = 64 matrices, so 64 x 65,536 is about 4.2 million.'
        }
      },
      {
        id: 'lft-f3',
        part: 'field',
        title: 'Preparing data for fine-tuning',
        body: `<p><b>Instruction format.</b> Fine-tuning data is usually a set of examples in the same template the base model already expects: a system message, a user turn, and the assistant's response, or a simpler instruction-and-response pair. Using a different template from the one the base model was itself trained or instruction-tuned with confuses it - it has learned where an instruction starts and where a response should start, and breaking that pattern spends the fine-tune fighting the format instead of learning the task.</p>
<p><b>Quality over quantity.</b> A small set of carefully written, correct, and diverse examples beats a much larger set collected or generated with less care. The clearest demonstration of this is the LIMA study (LIMA is the name of the research paper, not an acronym), which fine-tuned a model on only 1,000 hand-curated prompts and responses, with no reinforcement learning or reward model at all, and found its answers were rated as good as or better than much more heavily aligned models in a large share of head-to-head comparisons. The lesson is not "always use 1,000 examples" - it is that the ceiling on fine-tuning quality is usually set by how careful the data is, not by how much of it there is.</p>
<p><b>Deduplication.</b> Near-duplicate examples waste training compute on repetition, skew the model toward whatever pattern happens to be duplicated, and inflate the apparent size of a dataset without adding real information. Exact-match deduplication catches copies; near-duplicate deduplication, by embedding similarity or a hashing scheme, catches the more common case of the same example rephrased.</p>
<p><b>Contamination.</b> Check that fine-tuning data does not overlap with the benchmarks or held-out set used to evaluate it - the same leakage problem as training on the test set anywhere else in machine learning - and that it carries no information, such as another customer's data, that should never end up inside a model's weights.</p>`,
        deeper: `<p>Diversity matters as much as correctness: a data set built from only one instruction type teaches the model that one pattern and nothing else, so it should cover the range of instructions, lengths, and edge cases the model will meet in production, including examples where the right answer is a refusal or "I don't know." For contamination, a simple n-gram overlap check between the fine-tuning set and every evaluation set catches most accidental leakage cheaply, and it is worth running before every fine-tuning run, not only once when the pipeline is first built.</p>`,
        check: {
          question: 'Why does the LIMA result matter for how a fine-tuning data set gets planned?',
          options: [
            'It proves that more training data always produces a better model',
            'It shows that careful curation of a small set can matter more than raw volume',
            'It shows that reinforcement learning is never worth doing',
            'It shows that deduplication is unnecessary'
          ],
          answer: 1,
          explain: "LIMA reached strong results from 1,000 carefully chosen examples and no RLHF at all. That is evidence for curation quality mattering more than scale, not a claim that RLHF is pointless or that data size doesn't matter at all."
        }
      },
      {
        id: 'lft-f4',
        part: 'field',
        title: 'Training settings that actually matter',
        body: `<p><b>Learning rate.</b> Fine-tuning starts from a model that already works, so its learning rate is usually far smaller than pretraining's: roughly 1e-5 to 5e-5 for full fine-tuning of a well-pretrained model. A rate that is too high can undo the pretraining in a few steps; LoRA typically tolerates a higher rate, often 1e-4 to 3e-4, because only a small, freshly initialised set of parameters is being learned and the frozen base bounds how far the model's behaviour can move.</p>
<p><b>Epochs.</b> Instruction data sets are usually tiny next to pretraining data, so one to three passes over the data is normal; more than that risks the model memorising the fine-tuning examples rather than generalising the pattern behind them.</p>
<p><b>Sequence length versus batch size and memory.</b> Activation memory grows with sequence length and batch size together, and attention's own memory use grows faster still with sequence length unless a memory-efficient attention implementation is used. A longer maximum sequence length therefore forces a smaller batch size to fit the same GPU memory, and the two have to be tuned as one setting, not two.</p>
<p><b>Gradient accumulation.</b> When the batch size that fits in memory is smaller than the batch size that trains well, accumulate gradients over several forward-and-backward passes before taking one optimiser step. That simulates a larger batch at no extra memory cost beyond a little more time.</p>
<p><b>Mixed precision.</b> Running the forward and backward pass in a lower-precision format such as bf16, while keeping a full-precision copy of the weights for the optimiser step, cuts memory and speeds up computation on hardware built for it, with little to no loss in training quality.</p>
<p><b>Catastrophic forgetting.</b> Fine-tuning on a narrow task can quietly erase general ability the base model had before, because nothing in a narrow data set tells it to keep that ability. Lower learning rates, fewer epochs, mixing some general instruction data back in, and LoRA's naturally limited update all reduce how much is forgotten.</p>`,
        deeper: `<p>One practical trick worth knowing: packing several short training examples into one training sequence, separated by an end-of-example marker, uses the GPU far more efficiently than padding each example out to a common length. It only works correctly, though, if the attention mask - or a position reset at each boundary - stops one packed example from attending to another one sitting next to it.</p>`,
        check: {
          question: 'Why can LoRA typically use a higher learning rate than full fine-tuning of the same model?',
          options: [
            'Because it trains a small set of freshly initialised parameters while the frozen base bounds how far the model can shift',
            'Because low-rank matrices are mathematically insensitive to the learning rate',
            'Because LoRA does not use gradient descent',
            'Because a higher learning rate always trains faster, regardless of method'
          ],
          answer: 0,
          explain: 'The frozen base weights limit how far the overall behaviour can move, so a larger step on the small adapter is safer than the same step applied to every weight in the model.'
        }
      },
      {
        id: 'lft-f5',
        part: 'field',
        title: 'Evaluating a fine-tuned model',
        body: `<p><b>Held-out sets.</b> Never evaluate on the same examples used for training or for choosing hyperparameters; keep a slice of data the model has not seen, drawn from the same distribution as the real task, and treat performance on that slice as the primary signal of whether the fine-tune worked.</p>
<p><b>Benchmarks.</b> Public benchmarks are useful for checking that general ability has not regressed, but a general benchmark rarely measures the specific behaviour a fine-tune was built for - a model fine-tuned to write in a company's support voice will not show that in a general knowledge test - so a task-specific evaluation set usually matters more than a general one for a targeted fine-tune.</p>
<p><b>LLM-as-judge.</b> Using a strong model to score or compare outputs against a rubric is far cheaper than paying humans to read every response, and it scales to thousands of comparisons overnight. It comes with real pitfalls: judges tend to favour whichever answer is shown first (<b>position bias</b>), tend to prefer longer or more elaborately formatted answers regardless of correctness (<b>verbosity bias</b>), and can return a different score if asked to score the same pair twice. None of that makes LLM-as-judge useless - it means every judge has to be checked against human ratings on a sample before it is trusted, and its scoring order should be randomised.</p>
<p><b>Human review.</b> For anything shipping to real users, a human review pass on a sample large enough to catch real problems - focused on safety, correctness, and tone - remains the check nothing else fully replaces, especially for the cases a written rubric cannot anticipate.</p>`,
        deeper: `<p>Before trusting an LLM-as-judge at scale, compute its agreement rate against a human-labelled sample of the same comparisons; a judge that disagrees with humans as often as it agrees is not saving time, it is adding noise. A judge from the same model family as the model it is scoring also tends to favour that model's own style - a form of self-preference bias - so using a different model family as the judge lowers that particular risk.</p>`,
        check: {
          question: 'An LLM-as-judge is asked to score the same two candidate answers a second time, with their order reversed, and it returns a different result. What does this most likely reveal?',
          options: ['The judge has position bias', 'The reward model is miscalibrated', 'The held-out set is contaminated', 'The base model has been quantised incorrectly'],
          answer: 0,
          explain: 'A score that flips when only the order of the two answers changes is the signature of position bias, not a property of the reward model, the data, or quantisation.'
        }
      },
      {
        id: 'lft-f6',
        part: 'field',
        title: 'Alignment methods, in plain words',
        viz: 'rlhf-pipeline',
        body: `<p><b>Supervised fine-tuning (SFT)</b> is the first stage of almost every alignment pipeline: fine-tune the pretrained model on curated instruction-response pairs, exactly as in any instruction fine-tune, to give it a reasonable starting policy before preferences enter the picture at all.</p>
<p><b>Reward model.</b> Next, collect pairs of responses to the same prompt and have humans pick the better one. Train a separate model - usually initialised from the SFT model - to score a response, with a loss that pushes the preferred response's score above the dispreferred one's. This reward model is not the final product; it is a stand-in for human judgement that can be queried automatically, millions of times, during the next stage.</p>
<p><b>RLHF with PPO.</b> Treat the language model as a policy: generate a response, score it with the reward model, and update the policy with proximal policy optimisation (PPO) to make higher-scoring responses more likely. A KL-divergence penalty against the original SFT model is added to the reward, so the policy cannot drift arbitrarily far from sensible language just to find a way of fooling the reward model - a failure mode called <b>reward hacking</b>. PPO's own machinery needs the policy model, the reward model, and usually a separate value model all in memory and running together, which makes RLHF the most expensive of these methods to run.</p>
<p><b>DPO (direct preference optimisation)</b> skips the reward model and the RL loop entirely. It trains directly on the same preferred-versus-dispreferred pairs with one classification-style loss, derived so that the resulting policy targets the same outcome RLHF would reach on the same preference data, without ever sampling from the model during training or running PPO's harder-to-stabilise optimisation. It has become the default starting point for most preference-alignment work since 2023, since it needs one model instead of three and is far less finicky to get working.</p>
<p><b>GRPO (group relative policy optimisation)</b>, introduced in DeepSeek's DeepSeekMath work, removes PPO's separate value model a different way: instead of learning a value function to estimate how good a state is, it samples a group of responses to the same prompt and scores each one against the group's own average reward as its advantage, cutting the memory PPO needs for a critic model.</p>`,
        deeper: `<p>GRPO's group-based advantage needs several sampled responses per prompt at every training step, which raises generation cost, in exchange for removing the critic model's memory - a trade that pays off most when generation is cheap relative to the size of the policy itself, which is common for very large models. Across all three RL-flavoured methods, the KL-penalty coefficient is the knob that trades off gains against safety: too small and the model can learn to game the reward; too large and it stays too close to the SFT model to actually improve.</p>`,
        check: {
          question: 'What is the main practical difference between DPO and RLHF with PPO?',
          options: [
            'DPO needs a much larger preference dataset than RLHF',
            'DPO trains directly on preference pairs with one loss, with no separate reward model or RL rollouts',
            'DPO cannot use human preference data at all',
            'DPO only works after a reward model has already been trained with PPO'
          ],
          answer: 1,
          explain: 'DPO replaces the reward-model-plus-PPO pipeline with a single loss computed directly on preference pairs. It uses the same kind of data RLHF uses, just without the reward model or the RL loop.'
        }
      },
      {
        id: 'lft-f7',
        part: 'field',
        title: 'Deployment: merging, serving many adapters, and versioning',
        body: `<p><b>Merging adapters.</b> Once training is done, a LoRA adapter can be folded back into the base weights: the new weight is the old weight plus (alpha divided by r) times B times A, producing one ordinary dense checkpoint. A merged model has no extra inference-time cost at all - it runs exactly like a normally fine-tuned model - at the price of losing the ability to swap the adapter out cheaply, since the base and the adapter are now one file.</p>
<p><b>Serving many adapters.</b> The opposite choice is to keep the base model loaded once and keep many small adapters ready to attach per request, so one GPU can serve dozens of fine-tuned variants - one per customer, or one per task - without loading a full separate model for each. Because an adapter is a tiny fraction of the base model's size, the memory cost of adding another one is small, and a serving system built for this can batch requests that use different adapters together, since the shared base computation dominates the work.</p>
<p><b>Versioning.</b> A checkpoint is only meaningful as the combination of a base model version, an adapter (or full fine-tune) version, and the data version it was trained on. Evaluation results are valid for that exact combination, not for the adapter on its own: moving an adapter trained against one base model onto a newer base model is not guaranteed to work, since the base's weights - and therefore what the adapter's small correction is actually correcting - have changed underneath it. Track and pin all three together, and re-evaluate after any one of them changes.</p>`,
        deeper: `<p>Serving many small adapters on a shared base is what makes per-customer or per-task fine-tuning affordable at all: without it, "one fine-tuned model per customer" would mean one full copy of the base model's weights per customer, which does not scale past a handful of customers on any reasonable amount of hardware.</p>`,
        check: {
          question: 'A team retrains its base model and reuses an old LoRA adapter on top of it without re-evaluating. What is the risk?',
          options: [
            'None - adapters are independent of the base model they were trained against',
            "The adapter was trained against the old base model's weights, so its correction may no longer fit and needs re-evaluation",
            'Merging will fail with an error in this situation',
            'The adapter will automatically retrain itself against the new base'
          ],
          answer: 1,
          explain: "An adapter's correction is only meaningful relative to the specific base weights it was trained against. A new base model is a different starting point, so the old correction is not guaranteed to still help."
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'lft-a1',
        type: 'design',
        title: 'Exercise: choose fine-tune, prompt, or retrieve',
        viz: 'rag-pipeline',
        prompt: "We want our support assistant to always mention this week's outage status, which changes daily, and to always format its answer as three bullet points ending with a link to the status page. Someone on the team wants to fine-tune a model to do both. Walk me through what you would actually do.",
        timeboxSec: 480,
        rubric: 'Must-haves: (1) correctly separates the two problems - the outage status is a knowledge-freshness problem and the format is a behaviour problem; (2) states plainly that fine-tuning is the wrong tool for the changing status, since it would bake a fact into weights that goes stale the moment it changes, and proposes retrieval instead so the answer is looked up at request time; (3) proposes trying a well-written prompt for the three-bullet format first, since it costs nothing to test; (4) only reaches for fine-tuning if prompting the format reliably fails after real testing, not by default; (5) names a concrete way to check the format is actually being followed, such as a held-out set of test prompts scored for compliance; (6) names what breaks if the retrieval index is stale or has duplicate entries. Common mistakes: fine-tuning the outage status directly; skipping the prompt-first step; no concrete evaluation of format compliance. {{HONESTY}}',
        model: "I'd treat this as two separate problems rather than one. The outage status changes daily, so that's a freshness problem, not a behaviour problem - fine-tuning it in would mean the model states whatever was true when it was last trained, and it would need a new training run every single day to stay correct. I'd fix that with retrieval: look up the current status at request time and hand it to the model in the prompt, so it's always answering from the live source.\n\nThe three-bullet format with a trailing link is a behaviour problem, and I'd start by just asking for it clearly in the system prompt, with an example of the exact format I want. That costs nothing to try and I'd test it against a batch of real questions to see how often it's actually followed. If it holds up close to 100% of the time, I'm done - no training needed.\n\nOnly if the format kept slipping under real load, after trying a few prompt variations, would I consider a light fine-tune specifically to make the format more reliable, since that's a stable, well-defined behaviour rather than a changing fact. I would not fine-tune the outage status itself under any circumstance, since that's exactly the kind of information retrieval is built for. I'd also keep an eye on what happens if the retrieval index itself goes stale or picks up a duplicate entry, since that would produce a confidently wrong status even with the right architecture. I haven't built this exact assistant, but this is the framework I'd apply."
      },
      {
        id: 'lft-a2',
        type: 'formulate',
        title: 'Exercise: compute a LoRA parameter count',
        prompt: 'Say you apply LoRA at rank 16 to the query, key, value, and output projection matrices of a 13-billion-parameter model with hidden size 5,120 and 40 layers. Walk me through how many trainable parameters that adds, and what share of the full model that is.',
        timeboxSec: 360,
        rubric: 'Must-haves: (1) states the formula, trainable parameters per matrix = r x (d_in + d_out); (2) correctly computes per-matrix count: 16 x (5,120 + 5,120) = 163,840; (3) correctly counts 4 matrices per layer (query, key, value, output) x 40 layers = 160 matrices; (4) correctly multiplies to about 26.2 million trainable parameters; (5) correctly expresses that as a share of 13 billion, about 0.2 percent; (6) shows the arithmetic step by step rather than only stating a final number. Common mistakes: forgetting one of the four matrix types; using d_in or d_out alone instead of their sum; misplacing a factor of 1,000 in the final share. {{HONESTY}}',
        model: "The formula for one LoRA matrix is r times the sum of its input and output dimensions, so with rank 16 and hidden size 5,120, one matrix adds 16 times (5,120 plus 5,120), which is 16 times 10,240, or 163,840 trainable parameters.\n\nThe question asks for LoRA on query, key, value, and output projections, so that's 4 matrices per layer, and with 40 layers that's 160 matrices in total. Multiplying 160 by 163,840 gives 26,214,400, so about 26.2 million trainable parameters.\n\nAgainst a 13-billion-parameter model, that's 26.2 million divided by 13 billion, which works out to roughly 0.2 percent of the full model's parameters. That's the number I'd quote in an interview - a couple of tens of millions of trainable parameters is a very different training job from 13 billion, both in the GPU memory it needs and in how quickly it can be iterated on. I'd also flag that this only counts the four attention projections; adding the feed-forward layers would raise the count further, since those matrices are usually larger."
      },
      {
        id: 'lft-a3',
        type: 'explain',
        title: 'Exercise: explain DPO to a teammate who only knows supervised fine-tuning',
        prompt: 'A teammate who understands supervised fine-tuning but has never touched reinforcement learning asks why everyone moved from RLHF with PPO to DPO. Explain it to them.',
        timeboxSec: 420,
        rubric: "Must-haves: (1) correctly describes the RLHF pipeline being replaced - a reward model trained on human preference pairs, then a PPO reinforcement-learning loop with a KL penalty back to the SFT model; (2) correctly describes DPO as training directly on the same preference pairs with a single loss, no separate reward model, no RL sampling; (3) states the practical reasons for the shift: fewer moving parts, one model to train instead of three, more stable to get working, no reward-hacking risk from an imperfect reward model; (4) does not claim DPO is a rough approximation - it should note DPO is derived to target the outcome RLHF would reach on the same data, not just a cheaper guess; (5) does not claim more than is true by saying DPO always beats RLHF or GRPO in every setting. Common mistakes: describing DPO as skipping human feedback entirely; claiming DPO changed what data is collected rather than how it's used; treating DPO as strictly better in every case. {{HONESTY}}",
        model: "Supervised fine-tuning trains on examples of the response you want. RLHF adds a second step on top of that: collect pairs of responses to the same prompt, have humans say which one is better, and train a separate reward model to predict that preference. Then you run reinforcement learning - specifically PPO - where the language model generates a response, the reward model scores it, and the weights get nudged to make higher-scoring responses more likely, with a penalty that keeps the model from drifting too far from where it started so it can't just find a weird way to trick the reward model.\n\nThat pipeline needs three models running together - the policy, the reward model, and usually a value model - and PPO itself is finicky to tune. DPO noticed that you can skip the middle step: instead of training a reward model and then optimizing against it, you can write down a loss that works directly on the same preferred-versus-dispreferred pairs, and it's derived so the model you get out is aiming at the same target RLHF would have converged to on that data. So you get a similar result with one model, one training run, and a plain classification-style loss instead of an RL loop.\n\nThat's why most teams reach for DPO first now - it's simpler and more stable. I wouldn't claim it always wins; PPO and newer methods like GRPO are still used, especially at very large scale."
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)', u: 'https://arxiv.org/abs/2106.09685', w: 'The original paper: the low-rank formula this chapter uses, and the headline numbers for GPT-3 (10,000x fewer trainable parameters, 3x less GPU memory).', m: 25 },
      { l: 'Umar Jamil: LoRA explained visually, with PyTorch code from scratch', u: 'https://www.youtube.com/watch?v=PXWYUTMt-AU', w: 'Walks through the low-rank idea and codes the adapter matrices from scratch, which makes the shape of A and B concrete.', m: 45 },
      { l: 'QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al., 2023)', u: 'https://arxiv.org/abs/2305.14314', w: 'The source for the 4-bit-base and single-48GB-GPU claim this chapter quotes for a 65B model.', m: 25 },
      { l: 'LIMA: Less Is More for Alignment (Zhou et al., 2023)', u: 'https://arxiv.org/abs/2305.11206', w: 'The 1,000-example data-quality result cited in the data-preparation section, in the authors\' own words.', m: 20 },
      { l: 'Training language models to follow instructions with human feedback (Ouyang et al., 2022)', u: 'https://arxiv.org/abs/2203.02155', w: 'The InstructGPT paper: the SFT-then-reward-model-then-RL pipeline this chapter describes as RLHF.', m: 35 },
      { l: 'Umar Jamil: Reinforcement Learning from Human Feedback, explained with math derivations', u: 'https://www.youtube.com/watch?v=qGyFrqc34yc', w: 'Derives the RLHF objective and the KL penalty term rather than only describing them in words.', m: 60 },
      { l: 'Direct Preference Optimization (Rafailov et al., 2023)', u: 'https://arxiv.org/abs/2305.18290', w: "The paper that reframes preference learning as one loss, dropping the reward model and the RL loop.", m: 30 },
      { l: 'DeepSeekMath (Shao et al., 2024) - source of GRPO', u: 'https://arxiv.org/abs/2402.03300', w: 'Where group relative policy optimisation comes from, and why it drops PPO\'s separate value model.', m: 30 }
    ],
    glossary: [
      {
        g: 'Fine-tuning and alignment',
        sub: 'The words an interviewer expects when asking how a model was adapted or aligned before it shipped.',
        rows: [
          ['LoRA', 'Freeze the base weights, train a small pair of low-rank matrices added beside them.', 'Any question about adapting a large model cheaply.'],
          ['QLoRA', 'LoRA on top of a base model quantised to 4-bit, so both the base and the training state take less memory.', 'Fine-tuning a large model on limited GPU memory.'],
          ['Rank (r)', 'The bottleneck dimension of a LoRA adapter; sets its trainable parameter count.', 'Sizing or estimating a LoRA fine-tune.'],
          ['Catastrophic forgetting', 'General ability lost because fine-tuning pulled the weights too far toward one narrow task.', 'Explaining why a fine-tuned model got worse at things it used to do.'],
          ['Reward model', 'A model trained to score outputs, usually from human pairwise preferences.', 'The step before RLHF or as a stand-alone evaluation tool.'],
          ['RLHF', 'Reinforcement learning that optimises a language model against a reward model\'s score.', 'Describing how a model was aligned after supervised fine-tuning.'],
          ['PPO', 'The reinforcement-learning algorithm RLHF usually runs, with a KL penalty limiting each update.', 'Naming the RL algorithm behind RLHF.'],
          ['DPO', 'One loss trained directly on preference pairs, no reward model or RL loop.', 'The common alternative to RLHF since 2023.'],
          ['GRPO', 'Scores each sampled response against the average of a group, removing PPO\'s value model.', 'Explaining DeepSeek-style RL fine-tuning.'],
          ['Held-out set', 'Data never used in training, kept to measure real performance.', 'Any claim that a fine-tune "worked."'],
          ['LLM-as-judge', 'A strong model grades another model\'s outputs against a rubric.', 'Scaling evaluation without a human reading every response.'],
          ['Merging adapters', 'Folding a LoRA adapter back into the base weights into one checkpoint.', 'Preparing a fine-tuned model for simple, single-model deployment.']
        ]
      }
    ]
  };

  root.PREP_CORE['llm-inference-engineering'] = {
    id: 'llm-inference-engineering',
    title: 'LLM inference engineering',
    level: 'warning',
    levelLabel: 'Common in any round that touches serving a language model at scale',
    why: 'Serving a large language model is a different engineering problem from serving a small model, because one request can occupy gigabytes of memory for its whole lifetime and the two halves of generating a response - reading the prompt and producing tokens - are bottlenecked by completely different parts of the hardware. Interviewers use this ground to check whether you can reason about where the time and memory actually go, rather than just naming tools.',
    learn: [
      {
        id: 'lie-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Token</b> - the unit a language model reads and writes, roughly a word fragment. Cost, latency, and memory are all usually measured per token.</li>
<li><b>Prefill</b> - processing every token of the input prompt in one pass, before the first output token is produced.</li>
<li><b>Decode</b> - generating output tokens one at a time, each one depending on every token that came before it.</li>
<li><b>KV cache</b> (KV is short for key/value) - the stored key and value tensors from every previous token, kept so decode does not have to reprocess the whole prompt from scratch on every step.</li>
<li><b>Time to first token (TTFT)</b> - how long a user waits before anything appears, dominated by prefill and by queueing.</li>
<li><b>Time per output token (TPOT)</b> - the gap between each token after the first, dominated by the memory-bound decode step.</li>
<li><b>Throughput</b> - total tokens produced per second across every request a server is handling.</li>
<li><b>Goodput</b> - throughput counting only the requests that actually met their latency target, rather than every token produced.</li>
<li><b>Continuous batching</b> - adding and removing sequences from a running batch as they arrive and finish, instead of waiting for a whole fixed batch to complete together.</li>
<li><b>PagedAttention</b> - storing the KV cache in fixed-size blocks that can sit anywhere in memory, rather than one contiguous region per sequence.</li>
<li><b>FlashAttention</b> - an attention implementation that avoids writing the full attention matrix to slow GPU memory, computing the same result faster.</li>
<li><b>Quantization</b> - representing weights or activations with fewer bits, trading some precision for less memory and, often, more speed.</li>
<li><b>Speculative decoding</b> - a small draft model proposes several tokens, which the large target model verifies in one pass, keeping the ones it agrees with.</li>
<li><b>Prefix caching</b> - reusing an already-computed KV cache for a prompt prefix shared by more than one request, instead of recomputing it each time.</li>
<li><b>Tensor parallelism</b> - splitting one weight matrix's computation across several GPUs that work on it at the same time.</li>
<li><b>Pipeline parallelism</b> - giving each GPU a slice of the model's layers, so a request passes through them in sequence.</li>
<li><b>Mixture of experts (MoE)</b> - a model with many separate sub-networks (experts), where a gating network sends each token to only a small number of them.</li>
<li><b>Roofline model</b> - a way of reasoning about whether a workload is limited by how fast the chip can compute or by how fast it can move data.</li>
<li><b>Service level objective (SLO)</b> - a target for a metric, such as "95 percent of requests get their first token within 500 milliseconds," used to judge whether a server is keeping up.</li>
<li><b>Serving runtime</b> - the software that turns a trained model into a server that accepts requests and streams tokens back, such as vLLM or TensorRT-LLM (LLM is short for large language model).</li>
</ul>`,
        deeper: `<p>Almost every later section in this chapter is really one fact applied in a different place: a language model produces one token at a time, each token depends on all the ones before it, and that dependency is stored in a KV cache that grows for as long as the request lives. Continuous batching, PagedAttention, quantization, speculative decoding, and disaggregated serving are all, in one way or another, answers to the cost of keeping that cache around and reading it on every single step.</p>`,
        check: {
          question: 'In an LLM server, what usually determines how many requests can run at the same time?',
          options: ['Raw GPU compute (FLOPs)', 'How much memory the KV cache needs per sequence', 'The network bandwidth to the client', 'The size of the tokenizer\'s vocabulary'],
          answer: 1,
          explain: 'Concurrency is bounded by memory, not compute: every live sequence holds a KV cache for as long as it runs, and once that memory is full, no more sequences fit, regardless of spare compute.'
        }
      },
      {
        id: 'lie-f1',
        part: 'field',
        title: 'How a token is generated: prefill versus decode',
        viz: 'prefill-vs-decode',
        body: `<p>Producing a response happens in two phases that behave completely differently. <b>Prefill</b> processes every token of the prompt at once: the model can compute all of their representations in parallel, as one large matrix multiplication. That keeps the GPU's arithmetic units busy the whole time, so prefill is <b>compute-bound</b> - its speed is set by how many floating-point operations per second the chip can do.</p>
<p><b>Decode</b> produces the response one token at a time, and each step depends on the one before it, so steps cannot be parallelised across time. On every single step, the GPU must read the entire model's weights and the entire KV cache built up so far, just to produce one new token's worth of output - a tiny amount of arithmetic relative to the amount of data moved. That makes decode <b>memory-bandwidth-bound</b>: its speed is set by how fast data can move from GPU memory to the compute units, and the compute units sit mostly idle waiting for it.</p>
<p>The <b>roofline model</b> is the standard way to reason about which of the two limits applies. Plot achievable performance against <b>arithmetic intensity</b> - how many operations are done per byte moved - and a chip has two ceilings: its peak compute rate, and its memory bandwidth times the arithmetic intensity. Low arithmetic intensity, as in decode, means the memory-bandwidth ceiling is hit first, and no amount of extra compute power helps. High arithmetic intensity, as in prefill's big matrix multiplications, means the compute ceiling matters instead.</p>`,
        deeper: `<p>This is why the same GPU can look almost fully loaded during prefill and mostly idle, in compute terms, during decode, even while it is working at its memory-bandwidth limit the whole time. It also explains why adding more compute power to a GPU generation, without a matching increase in memory bandwidth, does little to speed up decode - decode was never waiting on compute in the first place.</p>`,
        check: {
          question: 'Why is decode described as memory-bandwidth-bound rather than compute-bound?',
          options: [
            'Because each decode step does very little arithmetic relative to the weights and KV cache it must read for one token',
            'Because decode always runs on an older GPU generation',
            'Because decode cannot use the GPU\'s tensor cores',
            'Because prefill contains no matrix multiplications at all'
          ],
          answer: 0,
          explain: "One decode step produces one token's worth of computation but must still move the whole model and the whole KV cache through memory, so the data movement, not the arithmetic, sets the pace."
        }
      },
      {
        id: 'lie-f2',
        part: 'field',
        title: 'The KV cache: the memory formula',
        viz: 'kv-cache-growth',
        body: `<p>Attention needs the key and value vectors for every previous token to produce the next one. Without a cache, decode would have to recompute those vectors for the whole prefix on every single step; with a cache, each step reuses what was already computed and only adds the new token's own key and value. That is the entire reason a KV cache exists: it turns decode into a sequence of cheap, linear steps instead of an increasingly expensive recomputation.</p>
<p>The memory it costs, per token, is: <b>2 x layers x heads x head_dim x bytes per value</b>. The leading 2 accounts for storing both a key and a value; the rest is the size of one layer's key (or value) vector, repeated across every layer and every attention head, in whatever number format the cache is stored in.</p>
<p>Some models shrink this deliberately with <b>grouped-query attention</b> (or its extreme, multi-query attention): several query heads share one smaller set of key/value heads, so the "heads" term in the formula is smaller than the number of query heads the model actually uses for attention itself.</p>`,
        deeper: `<p>Worked example, a 7B-parameter model with 32 layers, 32 attention heads, head dimension 128, stored in fp16 (2 bytes): bytes per token = 2 x 32 x 32 x 128 x 2 = 524,288 bytes, exactly 512 KiB per token. (A KiB is 1,024 bytes and a GiB is 1,024 times 1,024 times 1,024 bytes, the powers-of-two units memory is actually measured in, as opposed to the powers-of-ten KB (kilobyte, 1,000 bytes) and GB used for storage and network sizes.) At a 4,096-token context, one sequence's cache is 512 KiB x 4,096 = 2,097,152 KiB, which is 2 GiB. Sixteen such sequences held concurrently need 16 x 2 GiB = 32 GiB of cache alone - more than the roughly 14GB the model's own fp16 weights take up. That is why the KV cache, not the weights, is usually the thing that runs out first.</p>`,
        check: {
          question: 'A model doubles its maximum context length from 4,000 to 8,000 tokens for every request it serves. What happens to KV cache memory per sequence, all else equal?',
          options: ['It stays the same, since attention itself is unaffected', 'It roughly doubles, since the formula is linear in sequence length', 'It roughly quadruples, since attention cost is quadratic in sequence length', 'It depends only on the batch size, not the context length'],
          answer: 1,
          explain: 'The KV cache formula is linear in the number of tokens cached: twice the tokens means twice the cache, even though the compute cost of full attention itself scales quadratically.'
        }
      },
      {
        id: 'lie-f3',
        part: 'field',
        title: 'Continuous batching',
        viz: 'continuous-batching',
        body: `<p>The simplest way to batch requests is to group a fixed set of them and run decode until every sequence in that group is finished - <b>static batching</b>. The problem is that requests in a batch rarely finish at the same time: a short response is done in a few steps, but the batch cannot return early, because the batch runs as one unit, so the finished sequence's slot sits doing nothing useful, or generating padding, until the slowest sequence in the batch is done.</p>
<p><b>Continuous batching</b> - also called in-flight batching - schedules decode at the level of one token step rather than one whole batch: at every step, a server can drop a sequence that just finished and add a newly arrived one into the same slot. GPU capacity is never held idle waiting for the slowest request in an arbitrary group, since there is no fixed group at all - just a pool of slots that is kept full. This is the single change that gives modern serving engines most of their throughput advantage over naive batching.</p>`,
        deeper: `<p>Continuous batching does not remove the KV-cache memory limit from the earlier section - it only stops wasting the capacity that limit allows. A server can still run out of cache memory and have to queue a new request; continuous batching just means that whatever capacity exists is used efficiently rather than blocked behind whichever sequence in the batch happens to be the longest.</p>`,
        check: {
          question: 'Under static batching, why can a fast-finishing request still slow the whole batch down?',
          options: [
            'It cannot; static batching is always at least as fast as continuous batching',
            'The batch does not return until every sequence in it finishes, so a finished sequence still occupies a slot doing nothing useful until the slowest one completes',
            'Static batching always uses more GPU memory than continuous batching',
            'GPUs cannot process sequences of different lengths at all'
          ],
          answer: 1,
          explain: 'A static batch is one unit: it only returns once its slowest member finishes, so any slot that finished early is wasted rather than freed for new work.'
        }
      },
      {
        id: 'lie-f4',
        part: 'field',
        title: 'PagedAttention',
        viz: 'paged-attention-blocks',
        body: `<p>A naive KV cache allocates one contiguous block of memory per sequence, sized for the longest response that sequence might produce. That wastes memory two ways: <b>internal fragmentation</b>, when a sequence finishes far short of the length it was allocated for, and <b>external fragmentation</b>, when the total free memory is enough for a new sequence but no single contiguous piece of it is, because the free space is scattered between other sequences' reservations. Contiguous allocation also makes it expensive to share a cache between sequences that have an identical prefix, since sharing would mean copying.</p>
<p><b>PagedAttention</b> borrows the fix operating systems use for the same problem in virtual memory: split the KV cache into small, fixed-size blocks, and let each sequence's logical positions map to physical blocks anywhere in a shared pool, through a block table. An attention kernel written to gather across those scattered blocks makes the mapping invisible to the rest of the model. Because any free block can serve any sequence, external fragmentation stops being possible, and two sequences that share a prefix can point at the very same physical blocks instead of duplicating them.</p>`,
        deeper: `<p>The paper that introduced this, behind the vLLM serving engine, reports the resulting design achieves near-zero KV-cache memory waste and, at the same latency, 2 to 4 times the throughput of the serving systems that came before it - almost entirely from using the memory a naive allocator was wasting.</p>`,
        check: {
          question: 'What existing idea does PagedAttention borrow to fix KV-cache fragmentation?',
          options: [
            'Garbage collection from managed programming languages',
            "Virtual memory paging from operating systems: fixed-size blocks mapped through a table, placed anywhere in a shared pool",
            'Database indexing',
            'Branch prediction from CPU architecture'
          ],
          answer: 1,
          explain: "PagedAttention is named for exactly this borrowing: pages/blocks of fixed size, a table mapping logical positions to physical ones, and allocation from a shared free pool rather than one contiguous reservation per sequence."
        }
      },
      {
        id: 'lie-f5',
        part: 'field',
        title: 'FlashAttention: why it is faster',
        body: `<p>Standard attention computes a full matrix of scores between every pair of tokens, and the ordinary way to implement it writes that entire matrix out to the GPU's main memory (its high-bandwidth memory, HBM) before reading it back to compute the weighted sum of values. For long sequences that matrix is large, and for an operation this simple - mostly reads and writes with comparatively little arithmetic per element - the round trips to HBM, not the arithmetic, are what take the time.</p>
<p><b>FlashAttention</b> restructures the same computation to be <b>IO-aware</b>: it splits the sequence into blocks small enough to fit in the GPU's much faster on-chip memory (SRAM), and computes attention block by block, updating a running, numerically stable version of the softmax as it goes, so the full attention matrix is never written out to HBM at all. The result is mathematically identical to standard attention - not an approximation - just computed with far fewer memory round trips, and as a side effect it needs memory that grows linearly rather than quadratically with sequence length.</p>`,
        deeper: `<p>The original paper reports about 3 times faster GPT-2 training and roughly 2.4 times on long-sequence benchmarks from this change alone, with an exact, not approximate, result. That combination - exact, faster, and using less memory for longer sequences - is why it became close to a default rather than an optional optimisation, and why long-context models became practical sooner than the raw compute growth alone would suggest.</p>`,
        check: {
          question: 'Why is FlashAttention faster than the standard attention implementation, for the exact same mathematical result?',
          options: [
            'It uses a smaller, approximate attention matrix',
            'It tiles the computation in blocks so the full attention matrix is never written to slow GPU memory, cutting memory traffic without changing the math',
            'It skips computing attention for most of the tokens in the sequence',
            'It moves the computation from the GPU to the CPU'
          ],
          answer: 1,
          explain: 'FlashAttention is exact. The speedup comes entirely from reorganising the computation so the large intermediate matrix stays in fast on-chip memory instead of round-tripping through slower GPU memory.'
        }
      },
      {
        id: 'lie-f6',
        part: 'field',
        title: 'Quantization',
        viz: 'quantization-bits',
        body: `<p>Every halving of the bits used to store a number roughly halves the memory it takes and, for a memory-bound step, roughly halves the time needed to read it. <b>INT8</b> stores weights or activations as 8-bit integers; <b>FP8</b> (8-bit floating point) stores them as an 8-bit float instead, which keeps a wider dynamic range than INT8 at the same bit width and is supported natively on recent GPU generations. <b>AWQ</b> and <b>GPTQ</b> are two widely used post-training methods for pushing weights down to around 4 bits without a large accuracy loss: AWQ identifies the small share of weights most important to preserve by looking at activation magnitudes, and protects those from the quantization error; GPTQ quantizes a layer's weights one at a time, correcting the remaining weights after each step using approximate second-order information, so the layer's overall output stays close to the unquantized version.</p>
<p>The notation <b>W8A8</b> versus <b>W4A16</b> says which parts get quantized: W8A8 quantizes both weights and activations to 8 bits, which mainly helps a compute-bound workload like large-batch prefill, since it speeds up the arithmetic itself. W4A16 quantizes only the weights to 4 bits and leaves activations at 16 bits, which mainly helps a memory-bound workload like decode, since decode's cost is dominated by reading the weights, not computing with them. <b>KV-cache quantization</b> applies the same idea directly to the cache - storing keys and values at 8 or fewer bits - which increases how many sequences or how much context fit in a given amount of memory, since the cache is read on every decode step.</p>`,
        deeper: `<p>Quantization can slow a system down rather than speed it up when the hardware or kernel does not support the chosen format efficiently: an extra dequantization step before every matrix multiplication can cost more than the memory savings return, especially at very small batch sizes where there was little memory pressure to relieve in the first place. Aggressive quantization can also measurably hurt output quality on tasks sensitive to precision, such as arithmetic or code, so the choice of format and bit width is usually validated against a task-specific evaluation, not assumed to be free.</p>`,
        check: {
          question: 'A team quantizes only the weights to 4-bit while keeping activations at 16-bit (W4A16), specifically to speed up decode. Why does this make sense for decode but not necessarily for a large-batch prefill?',
          options: [
            'Decode is memory-bandwidth-bound, so shrinking the weights that must be read each step helps directly; prefill is compute-bound and gains more from also quantizing activations (W8A8)',
            'Decode cannot use quantized weights under any circumstances',
            'Prefill never reads the model\'s weights',
            'Activations cannot be represented at reduced precision during decode'
          ],
          answer: 0,
          explain: 'The right quantization format follows the bottleneck: decode\'s cost is moving weights, so W4A16 attacks that directly; prefill\'s cost is arithmetic, so it benefits more from also speeding up the arithmetic with quantized activations.'
        }
      },
      {
        id: 'lie-f7',
        part: 'field',
        title: 'Speculative decoding, chunked prefill, prefix caching, and disaggregation',
        viz: 'speculative-decoding',
        body: `<p><b>Speculative decoding</b> uses a small, fast draft model to propose several candidate next tokens, then checks all of them with the large target model in a single forward pass - verification is as parallelisable as prefill, since it does not depend on generating one token before the next. Every candidate that matches what the target model would have produced is accepted for free; generation resumes ordinary one-token decoding from the first token the target model disagrees with, resampled from the target's own distribution. This changes nothing about the output: it is provably the same distribution as decoding from the target model alone, and the original paper reports 2 to 3 times faster generation with identical outputs.</p>
<p><b>Chunked prefill</b> splits a long prompt's prefill into smaller pieces interleaved with other requests' decode steps, rather than running the whole prefill in one go, which would otherwise stall every other request's decode for however long that prefill takes.</p>
<p><b>Prefix caching</b> reuses the already-computed KV cache for a prompt prefix shared by more than one request - the same system prompt, or the same long document several users are asking about - so only the new, non-shared part of a prompt needs a fresh prefill.</p>
<p><b>Disaggregated prefill and decode</b> runs the two phases on separate pools of GPUs, since one is compute-bound and the other memory-bandwidth-bound and they compete for the same resources when forced onto one GPU; the computed KV cache is transferred to the decode pool once prefill finishes, letting each pool be sized and tuned for its own bottleneck instead of a single compromise configuration.</p>`,
        deeper: `<p>All four of these exist because prefill and decode fight over the same GPU in different ways: speculative decoding turns decode's idle compute into extra useful verification work; chunked prefill stops a big prefill from starving other requests' decode steps; prefix caching removes redundant prefill entirely for shared context; and disaggregation gives up sharing the same GPU at all once the interference between the two phases outweighs the convenience of one pool.</p>`,
        check: {
          question: 'What guarantee does speculative decoding give about its output, compared with ordinary decoding from the same target model?',
          options: [
            'It produces an approximation that is usually close but occasionally different',
            'It produces the exact same output distribution, since a proposed token is only kept if the target model would have produced it',
            'It always produces a shorter response',
            'It only works when the draft and target models are the same size'
          ],
          answer: 1,
          explain: "Speculative decoding is a lossless speedup: every accepted token is one the target model would have chosen anyway, and any rejected token is resampled from the target model's own distribution, so the result is statistically identical to plain decoding."
        }
      },
      {
        id: 'lie-f8',
        part: 'field',
        title: 'Parallelism, mixture-of-experts routing, and serving runtimes',
        viz: 'tensor-vs-pipeline-parallel',
        body: `<p>A model too large for one GPU has to be split across several. <b>Tensor parallelism</b> splits an individual weight matrix's computation across GPUs, combining their partial results with an all-reduce on every layer, so it needs very high-bandwidth links and is usually kept within one server. <b>Pipeline parallelism</b> instead gives each GPU a consecutive slice of the model's layers, communicating only at the boundary between stages, which tolerates slower links and can span multiple machines, at the cost of idle stages unless the batch is split into smaller micro-batches. The training at scale chapter covers both in more detail; what matters for serving is that the choice follows the interconnect you have.</p>
<p><b>Expert parallelism</b> applies to a <b>mixture-of-experts (MoE)</b> model: place different experts on different GPUs, and route each token's hidden state to whichever device holds its assigned expert (and back) with an all-to-all communication step. A small <b>gating network</b> scores every token against all the experts and sends it to only the top few - often just one or two - so the model can hold a very large total parameter count while only a small, fixed share of it runs for any given token, at the cost of the routing communication and the risk of a few popular experts receiving most of the tokens.</p>
<p><b>Serving runtimes</b> package all of this into a server: <b>vLLM</b> originated PagedAttention and pairs it with continuous batching, chunked prefill, and prefix caching; <b>TensorRT-LLM</b> compiles kernels tuned for NVIDIA hardware, often the fastest available for a fixed, supported model at the cost of being slower to add new ones; <b>SGLang</b> adds a structured-generation programming model on top of a fast runtime with strong prefix-caching support; and <b>TGI</b>, Hugging Face's own runtime, integrates closely with the Hugging Face model ecosystem, which matters when supporting a wide range of models counts for more than the last few percent of throughput. What to actually compare between them: measured throughput and latency on your own model, hardware, and traffic pattern rather than published numbers; which quantization formats and KV-cache optimisations each supports; how easily a new or custom model can be added; and multi-GPU parallelism support.</p>`,
        deeper: `<p>Expert imbalance is worth naming explicitly in an interview: if the gating network consistently favours a handful of experts, those GPUs become the bottleneck for the whole batch while the rest sit under-used, so production MoE systems usually add a load-balancing term to the training objective specifically to spread tokens more evenly across experts.</p>`,
        check: {
          question: 'Why does tensor parallelism usually stay within one server node, while pipeline parallelism can span multiple nodes more easily?',
          options: [
            'Tensor parallelism needs no communication between GPUs at all',
            'Tensor parallelism communicates on every layer and needs very high-bandwidth links, while pipeline parallelism only communicates at stage boundaries and tolerates slower links',
            'Pipeline parallelism cannot run on GPUs',
            'Tensor parallelism only works on CPUs'
          ],
          answer: 1,
          explain: 'The communication pattern is the whole difference: an all-reduce on every layer needs the fastest links available, while a hand-off only at each stage boundary is far more tolerant of a slower connection between machines.'
        }
      },
      {
        id: 'lie-f9',
        part: 'field',
        title: 'Measuring, cost, and observability',
        viz: 'ttft-tpot-timeline',
        body: `<p><b>Time to first token (TTFT)</b> is dominated by prefill and by any time spent queueing for a free slot; it is what a user perceives as "did this start responding." <b>Time per output token (TPOT)</b> is dominated by the memory-bound decode step; it is what a user perceives as "how fast is this typing." <b>Throughput</b> is the total tokens produced per second across every concurrent request, and it is the number that determines how many users one GPU can support. <b>Goodput</b> is stricter: throughput counted only over the requests that actually met their latency target, such as a TTFT under 500 milliseconds and a TPOT under 50 milliseconds. A server can raise raw throughput by packing in far more concurrent requests while making each individual one slower, so goodput and <b>SLO attainment</b> - the share of requests that met their target - are the numbers that should decide capacity, not throughput on its own.</p>
<p><b>Observability</b> for an LLM service should track, beyond ordinary service metrics: TTFT and TPOT percentiles per model and route; GPU memory and KV-cache occupancy specifically, since that is usually the real capacity constraint rather than raw GPU utilisation; queue depth and time spent waiting before a request even starts; the batch size and composition over time; request and response token-length distributions, since both cost and latency scale with length; error rates, including timeouts and out-of-memory evictions; goodput and SLO attainment rather than throughput alone; and cost per request or per thousand tokens, broken out by model and route, so a cost regression is caught the same way a latency regression would be.</p>`,
        deeper: `<p>A simple worked cost comparison, with round numbers chosen only to show the method rather than to state a current market price: self-hosted cost per token is (GPU rental cost per hour) divided by (tokens generated per hour at realistic, not peak, utilisation). A GPU renting at $2 per hour sustaining 40 output tokens per second at typical load produces 40 x 3,600 = 144,000 tokens per hour, for a cost of $2 / 144,000, about $0.014 per 1,000 tokens, before counting the GPU's idle time between bursts of traffic, the engineering time to run it, and capacity held for peak rather than average load. Compare that per-token cost, at realistic utilisation, against a provider's published price per token to find the volume at which self-hosting starts to win - and treat utilisation and peak-provisioning losses as the two things most likely to move that break-even point against self-hosting in practice.</p>`,
        check: {
          question: "A service's raw throughput (tokens per second) goes up after a change, but more users report slow responses. What is the most likely explanation?",
          options: [
            'Throughput and user experience are unrelated, so this is a coincidence',
            'The change let the server pack in more concurrent requests, raising total throughput while individual requests\' TTFT or TPOT got worse, so goodput fell even as throughput rose',
            'The GPUs are defective',
            'TTFT cannot be affected by how many requests run concurrently'
          ],
          answer: 1,
          explain: 'Throughput is an aggregate number; it can rise exactly because more requests are being served worse, each getting a smaller share of memory bandwidth and compute. Goodput and per-request percentiles catch what throughput alone hides.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'lie-a1',
        type: 'formulate',
        title: 'Exercise: compute a KV cache size',
        prompt: "We're serving a 13-billion-parameter model with 40 layers, 40 attention heads, head dimension 128, at 8,000 tokens of context, in fp16. Walk me through how much KV cache memory one sequence needs, and how many concurrent sequences fit in an 80GB GPU alongside the model weights.",
        timeboxSec: 420,
        rubric: 'Must-haves: (1) states the formula, bytes per token = 2 x layers x heads x head_dim x bytes per value; (2) correctly computes bytes per token: 2 x 40 x 40 x 128 x 2 = 819,200 bytes, 800 KiB; (3) correctly scales to context length: 800 KiB x 8,000 = 6,400,000 KiB, about 6.1 GB per sequence; (4) correctly computes model weight memory at fp16: 13 billion x 2 bytes = 26 GB; (5) correctly subtracts to find memory left for cache: 80 - 26 = 54 GB, and divides by the per-sequence cache size to get roughly 8 concurrent sequences; (6) notes this ignores activation memory and other overhead, so the real number is somewhat lower; bonus: notes that grouped-query attention, using fewer KV heads than query heads, would shrink this directly. Common mistakes: forgetting the factor of 2 for key and value; using total attention heads when the model uses grouped-query attention with fewer KV heads; forgetting to subtract the weight memory before dividing. {{HONESTY}}',
        model: "Using the standard formula, bytes per token equals 2 times layers times heads times head dimension times bytes per value. Here that's 2 x 40 x 40 x 128 x 2, which comes out to 819,200 bytes, or exactly 800 KiB per token.\n\nAt 8,000 tokens of context, one sequence's cache is 800 KiB times 8,000, which is 6,400,000 KiB - dividing by 1024 twice gets to about 6.1 GB per sequence.\n\nThe model's own weights at fp16 are 13 billion parameters times 2 bytes, so 26 GB. On an 80GB GPU, that leaves 80 minus 26, or 54 GB, for the KV cache. Dividing 54 GB by roughly 6.1 GB per sequence gives about 8.8, so I'd plan for 8 concurrent sequences at that context length, not 8.8, and I'd leave some of that remaining margin for activation memory and other overhead rather than filling it exactly. If this model used grouped-query attention with, say, 8 KV heads instead of 40, the cache size would shrink by that same factor, and I'd want to check the actual config rather than assume 40 KV heads."
      },
      {
        id: 'lie-a2',
        type: 'design',
        title: 'Exercise: diagnose degraded latency under load',
        prompt: "Your LLM API's median time-per-token was fine last week. This week, as concurrent users doubled, p99 time-per-token tripled, and users say generation feels like it stalls partway through. Walk me through how you would diagnose this and what you would change.",
        timeboxSec: 480,
        rubric: 'Must-haves: (1) separates TTFT from TPOT as the first diagnostic step, to tell whether the problem is queueing/prefill or the decode step itself; (2) considers KV-cache exhaustion and queueing as a leading cause, since concurrency is usually memory-bound rather than compute-bound; (3) considers whether the server is running static rather than continuous batching, since that would produce exactly this "stalls partway through" symptom when a batch waits on its slowest member; (4) proposes checking GPU memory / KV-cache occupancy and queue-depth metrics directly, not just CPU or generic GPU utilisation; (5) proposes at least one concrete mitigation: enabling or checking continuous batching, quantizing weights or KV cache to fit more concurrency, adding replicas, or disaggregating prefill from decode if long prompts are blocking others; (6) does not jump straight to "just add more GPUs" without first identifying which resource is actually saturated. Common mistakes: treating this as a pure compute-scaling problem; not distinguishing TTFT from TPOT; proposing a fix with no stated diagnostic step that would justify it. {{HONESTY}}',
        model: "First I'd split TTFT from TPOT rather than looking at one blended latency number, since they're bound by different things - TTFT by prefill and queueing, TPOT by the decode step - and the fix is different depending on which one moved. The complaint is specifically about stalls partway through generation, which points more at TPOT and at what's happening mid-request rather than at startup.\n\nMy first suspicion would be the KV cache. Concurrency in an LLM server is usually bounded by cache memory, not raw compute, so doubling concurrent users could simply be pushing the server past the point where every request's cache fits, forcing queueing or eviction that shows up as a much worse tail latency while the median barely moves. I'd check GPU memory and, specifically, KV-cache occupancy and queue depth, not just overall GPU utilisation, since utilisation can look fine while the cache itself is the actual constraint.\n\nI'd also check whether the server is running continuous batching or something closer to static batching, because static batching produces exactly this symptom: a fast request sits waiting on the slowest one in its batch, which reads as a stall.\n\nDepending on what I find, the fix is different: if it's cache pressure, quantizing the KV cache or the weights buys more concurrent capacity on the same hardware; if it's a batching issue, that's a serving-engine configuration fix; if long prompts from some users are blocking others' decode steps, chunked prefill or separating prefill and decode onto different pools would help. I wouldn't reach for more replicas until I know which of these it actually is."
      },
      {
        id: 'lie-a3',
        type: 'explain',
        title: 'Exercise: explain throughput versus goodput',
        prompt: "A teammate says: 'we doubled throughput last quarter, so the upgrade worked.' Your dashboards show more complaints about slow responses. Explain to them why those two facts are not a contradiction.",
        timeboxSec: 360,
        rubric: "Must-haves: (1) correctly defines throughput as total tokens per second across all requests; (2) correctly defines goodput as throughput counted only over requests that met their latency target (SLO); (3) explains the mechanism: a server can raise aggregate throughput by admitting far more concurrent requests, each getting a smaller share of memory bandwidth and compute, which can worsen individual TTFT or TPOT even as the aggregate number rises; (4) recommends goodput or SLO attainment, not raw throughput, as the metric that decides whether the upgrade actually helped; (5) proposes checking TTFT/TPOT percentiles as the concrete next diagnostic. Common mistakes: treating throughput and goodput as the same thing; concluding the upgrade definitely failed rather than saying the two metrics answer different questions; no concrete next step proposed. {{HONESTY}}",
        model: "Those two facts aren't a contradiction because throughput and the experience of one user are answering different questions. Throughput is the total number of tokens the whole server produces per second, added up across every request running at once. It says nothing about how any single request felt.\n\nWhat matters to a user is their own request's TTFT and TPOT, and it's entirely possible to raise total throughput by admitting more concurrent requests onto the same hardware, where each one now gets a smaller share of memory bandwidth and compute. The aggregate number goes up because there's more total work happening, even though every individual request is now slower than before.\n\nThat's exactly why goodput exists as a separate metric: it's throughput counted only over the requests that actually met their latency target, so a change that helps the aggregate number while hurting individual requests shows up as throughput rising and goodput falling at the same time. I'd want to see TTFT and TPOT percentiles before and after the upgrade, and goodput or SLO attainment specifically, before calling this a win - if those got worse, the upgrade traded user experience for a bigger throughput number, which is the opposite of what we want."
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'Efficient Memory Management for Large Language Model Serving with PagedAttention (Kwon et al., 2023)', u: 'https://arxiv.org/abs/2309.06180', w: 'The vLLM paper: PagedAttention itself, and the near-zero-waste and 2-4x throughput claims this chapter quotes.', m: 30 },
      { l: 'vLLM documentation', u: 'https://docs.vllm.ai/en/latest/', w: 'Confirms which of these techniques - continuous batching, chunked prefill, prefix caching - are real, shipped features rather than research ideas.', m: 20 },
      { l: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (Dao et al., 2022)', u: 'https://arxiv.org/abs/2205.14135', w: 'The IO-aware tiling idea in the authors\' own words, with the reported speedups this chapter cites.', m: 25 },
      { l: 'Umar Jamil: Flash Attention derived and coded from first principles', u: 'https://www.youtube.com/watch?v=zy8ChVd_oTM', w: 'Works through why the naive implementation is slow and derives the tiled, online-softmax version.', m: 70 },
      { l: 'Fast Inference from Transformers via Speculative Decoding (Leviathan et al., 2023)', u: 'https://arxiv.org/abs/2211.17192', w: 'The source of the exact-distribution guarantee and the 2-3x speedup number this chapter quotes.', m: 20 },
      { l: 'AWQ: Activation-aware Weight Quantization (Lin et al., 2023)', u: 'https://arxiv.org/abs/2306.00978', w: 'Why activation magnitude, not weight magnitude, is what decides which weights to protect from quantization error.', m: 20 },
      { l: 'GPTQ: Accurate Post-Training Quantization for Generative Pretrained Transformers (Frantar et al., 2022)', u: 'https://arxiv.org/abs/2210.17323', w: 'The layer-by-layer, second-order-corrected quantization method this chapter names alongside AWQ.', m: 20 },
      { l: 'Inference economics of language models (Erdil, 2025)', u: 'https://arxiv.org/abs/2506.04645', w: 'A rigorous treatment of the cost-per-token and speed trade-offs behind the worked example in this chapter.', m: 30 }
    ],
    glossary: [
      {
        g: 'LLM inference engineering',
        sub: 'The words that come up whenever the conversation turns to serving a language model rather than training one.',
        rows: [
          ['Prefill', 'Processing every prompt token at once, in parallel; compute-bound.', 'The first phase of any generated response.'],
          ['Decode', 'Producing one output token per step, dependent on all prior tokens; memory-bandwidth-bound.', 'Why generation speed does not scale with GPU compute alone.'],
          ['KV cache', 'Stored key/value tensors for every prior token, reused so decode need not recompute the prefix.', 'Usually the true limit on how many requests run at once.'],
          ['Continuous batching', 'Adding and removing sequences from a running batch per step, not per whole batch.', 'The main reason modern serving engines beat naive batching.'],
          ['PagedAttention', 'KV cache stored in fixed-size blocks placed anywhere in a shared pool, mapped through a table.', 'Fixing memory fragmentation and enabling prefix sharing.'],
          ['FlashAttention', 'An exact attention algorithm that avoids writing the full score matrix to slow GPU memory.', 'Why long-context attention is faster than the naive implementation.'],
          ['Speculative decoding', 'A draft model proposes tokens; the target model verifies them all in one pass.', 'A lossless way to speed up decode.'],
          ['Tensor parallelism', 'Splitting one matrix\'s computation across GPUs that communicate every layer.', 'Scaling a model too large for one GPU, within one node.'],
          ['Pipeline parallelism', 'Giving each GPU a slice of the model\'s layers, in sequence.', 'Scaling a model across nodes with less frequent communication.'],
          ['Mixture of experts', 'A gating network routes each token to a small subset of many expert sub-networks.', 'Large total parameter count without proportional compute per token.'],
          ['TTFT / TPOT', 'Time to first token and time per output token, the two user-facing latency numbers.', 'Any latency conversation about an LLM service.'],
          ['Goodput', 'Throughput counted only over requests that met their latency target.', 'The metric that should gate a capacity or scaling decision.']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
