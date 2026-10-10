/* Complete architecture views beside the existing canonical AI lessons. */
(function(root){
  'use strict';
  var core=root.PREP_CORE;
  function lesson(topic,id){return core[topic].learn.find(function(c){return c.id===id;});}
  lesson('genai-platform','gp-f2').viz='genai-platform-controls';
  lesson('rag-and-agents','raa-agent-execution').viz='agent-effect-boundary';
  lesson('llm-inference-engineering','lie-f1').viz='inference-request-timeline';
  lesson('llm-inference-engineering','lie-f9').viz='inference-serving-path';
  var prompt=lesson('genai-platform','gp-f2b');
  prompt.body=prompt.body.replace(/<p>[\s\S]*?<\/p>/, '<p>Prompt engineering specifies instructions, context, examples and an output contract without updating model weights. <a href="#rag-and-agents/raa-f1">Retrieval</a> supplies external evidence; <a href="#llm-fine-tuning-and-alignment/lft-f1">fine-tuning</a> adapts trained behavior. Compare prompt changes on fixed task targets, including quality, cost, latency and regressions.</p>').replace('A production prompt can is built','A production prompt is built');
  var judgment=lesson('genai-platform','gp-f5');
  judgment.body=judgment.body.replace(/<p>[\s\S]*?<\/p>/, '<p>Choose whether a learned component helps the problem, define permitted behavior, and verify the result against an independent specification. Explain the mechanism in an interview and defend its measured trade-offs at work.</p>').replace('The rule: use a model when the mapping from input to output is genuinely too complex or too variable to write down, when you can measure whether the answer is good, and when a wrong answer is affordable or recoverable. If any of those three fails, do not.', 'Compare a deterministic baseline with a learned approach under declared quality, latency, cost and risk targets. Specify an evaluation method, decision owner and permitted failure behavior before release. Some tasks need an approved human review or a safe abstention rather than an automatic decision.');
  lesson('rag-and-agents','raa-f6').body += '<p>Before allowing a tool to change external state, follow the <a href="#rag-and-agents/raa-agent-execution">durable execution and protected-effect boundary</a>. A model proposing a tool call does not grant current authorization or exact consent.</p>';
}(window));
