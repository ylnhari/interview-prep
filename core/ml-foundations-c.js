/* ml-foundations-c: deep learning mechanics, and the hands-on MLOps tooling that ships a model. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['deep-learning-essentials'] = {
    id: 'deep-learning-essentials',
    title: 'Deep learning essentials',
    level: 'danger',
    levelLabel: 'Asked in almost every machine learning or AI engineering interview.',
    why: `Before anyone asks about drift, feature stores, or GPUs, they want to know whether you understand how a neural network actually learns: what a forward pass computes, why backpropagation works, why training a deep network used to fail before initialisation and normalisation fixed it, and why the transformer displaced RNNs almost overnight. Asked to explain attention or backpropagation with actual numbers rather than just the name of the mechanism, a vague answer falls apart fast. Being able to write the formula, name every symbol, and reason about what changes it is what separates someone who has trained a model from someone who has only imported one.`,
    learn: [
      {
        id: 'dle-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the words this chapter uses. Read it once, then use the rest of the chapter to see the words in action.</p>
<ul>
<li><b>Neuron</b> - the smallest unit of a network: it multiplies each input by a learned weight, adds up the results plus a bias, and passes that sum through an activation function.</li>
<li><b>Weight, bias</b> - a weight scales one input's contribution; a bias shifts the sum before the activation function is applied, so a neuron can fire even when every input is zero.</li>
<li><b>Activation function</b> - the non-linear function applied to a neuron's weighted sum. Without it, stacking layers still only computes a straight line.</li>
<li><b>ReLU, GELU, sigmoid, tanh, SwiGLU</b> - the common activation functions. <b>ReLU</b> outputs the input if positive, else zero. <b>GELU</b> is a smoother version of ReLU used in most transformers. <b>Sigmoid</b> squashes a value into (0, 1), useful for a probability. <b>Tanh</b> squashes into (-1, 1), centred on zero. <b>SwiGLU</b> multiplies two learned projections of the input together, one of them gated by a smooth activation, and is the default inside most current large language models.</li>
<li><b>Forward pass</b> - computing a network's output for a given input, layer by layer, from input to output.</li>
<li><b>Loss function</b> - the single number a training run tries to make small, measuring how wrong the forward pass's output was.</li>
<li><b>Gradient</b> - how much the loss would change if one weight moved slightly; one number per weight, pointing toward the direction that increases the loss fastest.</li>
<li><b>Backpropagation</b> - the chain rule applied backward through the network, computing every weight's gradient in one pass by reusing values from the forward pass.</li>
<li><b>Epoch, batch</b> - one epoch is one full pass through the training data; a batch (or mini-batch) is the small slice of examples used to compute one gradient and take one step.</li>
<li><b>Learning rate</b> - how big a step each weight takes in the direction opposite its gradient.</li>
<li><b>Xavier (Glorot) and He initialisation</b> - two rules for picking a network's starting weights so signal neither shrinks nor grows as it passes through many layers; Xavier suits sigmoid and tanh, He suits ReLU.</li>
<li><b>Vanishing / exploding gradient</b> - a gradient that shrinks toward zero, or grows without bound, as it is multiplied backward through many layers, stalling or destabilising training.</li>
<li><b>BatchNorm, LayerNorm, RMSNorm</b> - three ways of rescaling a layer's values mid-network so training stays stable. They differ in which axis they normalise over and where each is used.</li>
<li><b>SGD, momentum</b> - stochastic gradient descent takes a step using one batch's gradient; momentum adds a running average of past gradients so the step keeps moving in a consistent direction instead of zig-zagging.</li>
<li><b>Adam, AdamW</b> - optimisers that give every weight its own adapted step size, based on the recent size and variance of that weight's gradient. AdamW applies weight decay separately from that adaptive step.</li>
<li><b>Warm-up, cosine decay</b> - a learning-rate schedule: ramp the learning rate up slowly at the start of training, then bring it back down along a cosine curve.</li>
<li><b>Weight decay</b> - shrinking every weight slightly on every step, independent of the gradient, to discourage very large weights.</li>
<li><b>Gradient clipping</b> - capping how large a gradient step is allowed to be, so one bad batch cannot blow up the weights.</li>
<li><b>Dropout</b> - randomly zeroing out a fraction of a layer's outputs during training, so the network cannot rely on any one unit.</li>
<li><b>Early stopping</b> - stopping training once performance on held-out data stops improving, even if training loss is still falling.</li>
<li><b>Data augmentation</b> - creating new, label-preserving training examples by transforming existing ones, such as flipping or cropping an image.</li>
<li><b>Label smoothing</b> - training on a slightly softened target instead of an exact 0 or 1, so the model is not pushed toward total certainty.</li>
<li><b>Convolution, kernel</b> - sliding a small grid of learned weights (the kernel, or filter) across an input and computing a dot product at every position, producing a feature map.</li>
<li><b>Padding, stride</b> - padding adds border pixels so a convolution's output can stay the same size as its input; stride is how many pixels the kernel moves between positions.</li>
<li><b>Pooling</b> - shrinking a feature map by keeping only the maximum or the average value in each small region.</li>
<li><b>Receptive field</b> - the region of the original input that can influence one particular output unit, which grows as layers stack.</li>
<li><b>Transfer learning, fine-tuning</b> - reusing a model already trained on a large dataset as the starting point for a new, related task, then continuing to train (fine-tuning) some or all of its weights on the new, usually smaller, dataset.</li>
<li><b>RNN, LSTM, GRU</b> - three network designs for a sequence, each carrying a hidden state forward from one step to the next; LSTM and GRU add gates that decide what to keep or forget, to fight the vanishing-gradient problem RNNs have over long sequences.</li>
<li><b>Attention, query, key, value</b> - a mechanism that lets each position in a sequence look at every other position and decide how much to weight it, comparing a query vector against every position's key vector to produce weights over that position's value vector.</li>
<li><b>Multi-head attention</b> - running several attention computations in parallel, each with its own learned projections, so different heads can capture different relationships.</li>
<li><b>Positional encoding, RoPE</b> - a way of injecting word order into attention, which otherwise has no notion of position. RoPE (rotary position embedding) does this by rotating each query and key vector by an angle proportional to its position.</li>
<li><b>Encoder-decoder, decoder-only</b> - two transformer layouts. An encoder-decoder has a bidirectional encoder feeding a generating decoder; a decoder-only model is a single stack where every position can only see the ones before it.</li>
<li><b>Embedding</b> - a dense vector representing a word, sentence, image or other object, learned so similar things end up close together in the vector space.</li>
<li><b>Contrastive learning</b> - training an encoder by pulling the embeddings of a known matching pair together and pushing unrelated examples apart.</li>
<li><b>Autoencoder</b> - a network trained to reconstruct its own input after squeezing it through a smaller bottleneck layer, which forces it to learn a compressed representation.</li>
<li><b>GAN, VAE, diffusion model</b> - three families of generative model that learn to produce new examples resembling the training data, each optimising a different objective.</li>
<li><b>Model card</b> - a short, standard document describing a model's intended use, training data, evaluation results, and known limitations.</li>
</ul>`,
        deeper: `<p>Almost everything in this chapter is one of two ideas repeated at different scales. The first: a linear operation - a weighted sum, a convolution, an attention-weighted average - followed by a non-linearity, stacked many times. The second: whatever you stack, keep the gradient able to flow backward through it without shrinking to zero or blowing up. Initialisation, normalisation and careful optimisers are all answers to that second problem. Every architecture in this chapter is a different answer to those same two questions.</p>`,
        check: {
          question: 'Why does a network need a non-linear activation function at all?',
          options: [
            'It makes the network run faster on a GPU',
            'Without it, stacking any number of layers only ever computes one linear function of the input, no matter how deep the network is',
            'It is only needed for classification tasks, not regression',
            'It prevents the network from overfitting'
          ],
          answer: 1,
          explain: 'Composing linear functions produces another linear function; the composed weight matrices collapse into one. Non-linearity is what lets depth add real expressive power.'
        }
      },
      {
        id: 'dle-f1',
        part: 'field',
        title: 'A neuron, a layer, a network',
        viz: 'neuron-layer',
        body: `<p>A single neuron computes one number: multiply every input by its own weight, add them up, add a bias, and pass the result through an activation function. Written out: <code>z = w1*x1 + w2*x2 + ... + b</code>, then <code>a = f(z)</code>. That equation is the entire unit; everything else in deep learning is this equation, repeated and connected.</p>
<p>A <b>layer</b> runs many neurons on the same input at once, each with its own weights and bias. As vectors, one layer is one matrix multiply plus a bias vector, followed by an activation function applied entrywise: <code>a = f(Wx + b)</code>. A <b>network</b> feeds one layer's output as the next layer's input, so the whole thing is a chain of these steps.</p>
<p>The activation function is what makes stacking layers worth doing. <b>ReLU</b> (<code>max(0, z)</code>) is the default for most hidden layers: cheap, and it does not saturate for positive inputs. <b>GELU</b>, a smoother curve that lets small negative values through, is standard inside transformers. <b>Sigmoid</b> (<code>1/(1+e^-z)</code>) and <b>tanh</b> squash their output into a fixed range and are now mostly used where that range is the point, such as a gate or a final probability. <b>SwiGLU</b> is different in kind: it multiplies two separate linear projections of the input together, gating one with a smooth activation, and it is what most current large language models use in place of a plain activation.</p>
<p>Without any non-linearity, none of this matters: a matrix multiply followed by another matrix multiply is still just one matrix multiply. A ten-layer linear network computes exactly the same family of functions as a one-layer linear network. The non-linearity is the only thing that lets depth add real computing power.</p>`,
        deeper: `<p>The classic illustration is XOR: four points where (0,0) and (1,1) are one class and (0,1) and (1,0) are the other. No straight line separates them, so a single linear neuron cannot solve it, however its weights are set. Two ReLU neurons in a hidden layer can: each one carves out a different linear boundary, and combining them bends the overall decision region into the shape XOR needs. This exact limitation of a single linear layer, and the fact that adding one hidden layer with a non-linearity fixes it, is a large part of why multi-layer networks with non-linear activations replaced the single-layer perceptron.</p>`,
        check: {
          question: 'A network stacks 10 linear layers with no activation function between them. What can it compute that a single linear layer cannot?',
          options: [
            'Nothing - the whole stack is equivalent to one linear function',
            'Anything a 10-layer ReLU network of the same size can compute',
            'Non-linear decision boundaries, but only for classification problems',
            'The same functions, using fewer parameters than the single layer'
          ],
          answer: 0,
          explain: 'Stacking linear operations without a non-linearity produces another linear operation - the composition of the ten weight matrices is just one bigger matrix.'
        }
      },
      {
        id: 'dle-f2',
        part: 'field',
        title: 'The forward pass, the loss, and backpropagation with real numbers',
        viz: 'backprop-two-layer',
        body: `<p>The <b>forward pass</b> is repeatedly applying the neuron equation, layer after layer, until the input has become the network's output. For classification, the final layer usually applies <b>softmax</b>, turning raw scores into probabilities that add to one; for regression, the final layer is usually left as raw numbers.</p>
<p>The <b>loss function</b> turns the output into a single number: how wrong was this prediction. For regression, the standard choice is <b>mean squared error</b>: <code>L = (y_hat - y)^2</code>, averaged over a batch. For classification, the standard choice is <b>cross-entropy</b>: <code>L = -log(y_hat_c)</code>, where <code>y_hat_c</code> is the probability the model assigned to the correct class. A confident, correct prediction gives a loss near zero; a confident, wrong prediction gives a large loss, because <code>-log</code> grows without bound as its argument approaches zero.</p>
<p>Training repeats three steps: run the forward pass, compute the loss against the true label, and adjust every weight a small amount toward reducing that loss. The third step is backpropagation, and it rests on one detail worth having ready: for a sigmoid output with cross-entropy loss, the gradient of the loss with respect to the pre-activation score simplifies to exactly <code>y_hat - y</code>. That clean form is why sigmoid is paired with cross-entropy rather than mean squared error for classification: it is both the right loss for a probability and unusually easy to differentiate.</p>`,
        deeper: `<p>Numbers make backpropagation concrete. Take a network with one hidden layer of two ReLU neurons and one sigmoid output, trained with cross-entropy loss. Input <code>x = [1.0, 2.0]</code>, target <code>y = 1</code>.</p>
<p><b>Forward.</b> Hidden neuron A: weights <code>[0.1, -0.2]</code>, bias <code>0.1</code>: <code>z_A = 0.1*1.0 - 0.2*2.0 + 0.1 = -0.2</code>, so ReLU gives <code>a_A = 0</code>. Hidden neuron B: weights <code>[0.4, 0.3]</code>, bias <code>-0.1</code>: <code>z_B = 0.4*1.0 + 0.3*2.0 - 0.1 = 0.9</code>, so <code>a_B = 0.9</code>. Output: weights <code>[0.5, -0.3]</code> on <code>[a_A, a_B]</code>, bias <code>0.2</code>: <code>z_out = 0.5*0 - 0.3*0.9 + 0.2 = -0.07</code>. Sigmoid gives <code>y_hat ~ 0.48</code>, and the loss is <code>-log(0.48) ~ 0.73</code>.</p>
<p><b>Backward.</b> The seed gradient is <code>y_hat - y = 0.48 - 1 = -0.52</code>. The gradient on the output weight connected to B is that seed times B's activation: <code>-0.52 * 0.9 ~ -0.47</code>; for A it is <code>-0.52 * 0 = 0</code>, because A's activation was already zero. Pushing the gradient into the hidden layer: the signal reaching A is <code>-0.52 * 0.5 = -0.26</code>, and the signal reaching B is <code>-0.52 * (-0.3) ~ 0.16</code>. Here is the detail worth remembering: ReLU's derivative is exactly 0 for any input below zero, so the gradient reaching neuron A gets multiplied by 0 and stops dead - none of A's weights update this step. Neuron B's derivative is 1, so its gradient of <code>0.16</code> passes straight through, giving gradients on B's own weights of roughly <code>[0.16, 0.31]</code> (0.16 times each input). With a small learning rate, B's weights and the output weight for B shift toward reducing the loss; A's weights do not move at all, because for this example, that unit never fired.</p>`,
        check: {
          question: "In the worked example, why do neuron A's weights not update on this step?",
          options: [
            "Because A's weights were already optimal",
            "Because A's pre-activation was negative, so ReLU's derivative there is 0 and no gradient reaches A's weights",
            'Because the learning rate was too small for A specifically',
            'Because cross-entropy loss ignores any neuron that outputs zero'
          ],
          answer: 1,
          explain: "ReLU has zero derivative for any negative input, so whenever a unit's pre-activation is negative, no gradient flows back to that unit's weights on that step - the mechanism behind a \"dead ReLU.\""
        }
      },
      {
        id: 'dle-f3',
        part: 'field',
        title: 'Initialisation and normalisation',
        viz: 'norm-layers',
        body: `<p>Before training starts, every weight needs a starting value, and the choice matters more than it looks. If weights start too small, the signal shrinks toward zero as it passes through many layers - a <b>vanishing gradient</b>. If they start too large, the signal grows without bound - an <b>exploding gradient</b>. Either way, training stalls or blows up before it gets anywhere.</p>
<p><b>Xavier (Glorot) initialisation</b> draws each weight from a distribution with variance <code>2 / (fan_in + fan_out)</code>, where fan-in and fan-out are a layer's number of inputs and outputs. It is derived to keep activation variance roughly constant across layers when the activation function is symmetric, like tanh or sigmoid. <b>He initialisation</b> uses variance <code>2 / fan_in</code> instead, accounting for the fact that ReLU zeroes out roughly half its inputs, so it needs a bigger starting variance to preserve the same amount of signal; it is the standard choice whenever the network uses ReLU or a close relative.</p>
<p>Normalisation is the same problem solved mid-network instead of only at the start. <b>BatchNorm</b> takes one feature at a time and rescales it to zero mean and unit variance <i>across the examples in a batch</i>, then lets the network learn a new scale and shift. It works well for convolutional networks with reasonably large batches, but its statistics get noisy at a batch size of one, and it needs different behaviour at training time (using the batch's own statistics) versus inference time (using a running average collected during training). <b>LayerNorm</b> normalises the other way: for one example, across its own features, independent of batch size entirely - which is why it is the default inside transformers and RNNs, where batch size varies and sequences of different lengths are processed. <b>RMSNorm</b> is LayerNorm with the mean-centring step dropped: it only rescales by the root-mean-square of the values, cheaper to compute, and is what most current large language models use.</p>`,
        deeper: `<p>Normalisation controls the scale of activations, but it does not by itself solve vanishing gradients through hundreds of layers. The other half of that fix is the residual (skip) connection, which adds a layer's input directly onto its output, giving the gradient a direct additive path back to earlier layers so it does not have to survive being multiplied through every single one. Almost every deep architecture in this chapter - ResNets, transformers - relies on residual connections for exactly this reason, alongside whichever normaliser it uses.</p>`,
        check: {
          question: 'Why does BatchNorm behave differently at training time versus inference time?',
          options: [
            "It doesn't; the behaviour is identical",
            "At training time it normalises using the current batch's mean and variance; at inference a single example (or a differently sized batch) would give unreliable statistics, so it uses a running average collected during training instead",
            'At inference time it is turned off entirely and replaced with dropout',
            'At inference time it uses He initialisation instead of the batch statistics'
          ],
          answer: 1,
          explain: 'BatchNorm needs a batch of examples to compute meaningful statistics; at inference you might see one example at a time, so it substitutes the running mean and variance tracked during training.'
        }
      },
      {
        id: 'dle-f4',
        part: 'field',
        title: 'Optimisers and learning-rate schedules',
        viz: 'lr-schedule',
        body: `<p><b>Plain gradient descent</b> (SGD) steps by the learning rate in the direction opposite the gradient: <code>w = w - lr * grad</code>, computed on one small batch at a time. <b>Momentum</b> keeps a running average of past gradients and steps in that direction instead of the latest gradient alone, damping the zig-zag that happens on a loss surface shaped like a narrow valley.</p>
<p><b>Adam</b> goes further: it tracks a running average of the gradient (the first moment) and of the squared gradient (the second moment), then divides the step by the square root of that second moment. A weight whose gradient has been small and stable gets a relatively bigger step; one whose gradient has been large or noisy gets a relatively smaller one - every weight gets its own adapted step size. <b>AdamW</b> fixes a subtle interaction between plain Adam and L2 regularisation: instead of folding weight decay into the gradient before Adam's adaptive scaling shrinks it unevenly, AdamW applies weight decay directly to the weights, so every weight decays by the same fraction regardless of its own gradient history. AdamW is now the default optimiser for training almost any deep network of consequence.</p>
<p>The learning rate itself usually follows a schedule. <b>Warm-up</b> ramps it up from near zero over the first steps, because Adam's moment estimates are unreliable when they have only seen a handful of gradients, and a large step on bad estimates can permanently damage the weights. After warm-up, <b>cosine decay</b> brings the learning rate back down smoothly along a cosine curve toward a small floor, so training makes large, fast progress early and small, careful adjustments late. <b>Weight decay</b> shrinks every weight a little on every step regardless of its gradient, discouraging weights from growing large purely because that reduces training loss without generalising. <b>Gradient clipping</b> caps the size of the gradient before it is applied, so one unusually bad batch cannot take a step large enough to destabilise the whole run.</p>`,
        deeper: null,
        check: {
          question: 'Why does Adam typically use a warm-up phase, when plain SGD usually does not need one?',
          options: [
            'Adam is always slower than SGD, so warm-up is required to catch up',
            "Adam's adaptive step size is estimated from a running average of squared gradients, which is unreliable in the first few steps; a large step taken on a bad early estimate can damage the weights before the estimate settles down",
            'Warm-up is only a convention with no real effect on training',
            'Adam requires warm-up because it does not use a learning rate at all'
          ],
          answer: 1,
          explain: "The instability warm-up fixes comes specifically from Adam's noisy second-moment estimate over the first handful of steps, not from something SGD shares."
        }
      },
      {
        id: 'dle-f5',
        part: 'field',
        title: 'Regularisation for networks',
        body: `<p><b>Dropout</b> randomly zeroes each hidden unit's output with probability <i>p</i> during training, then rescales the surviving units by <code>1/(1-p)</code> so the expected total signal stays the same; at test time every unit is used, with no rescaling needed because it was already baked in during training. No single unit can be relied on every time, which pushes the network toward representations that do not depend on any one path.</p>
<p><b>Early stopping</b> watches the loss on a held-out validation set during training and stops - keeping whichever checkpoint scored best - once that number stops improving, even while training loss keeps falling. The gap that opens between a still-falling training loss and a flat or rising validation loss is the network starting to memorise the training set rather than learn from it.</p>
<p><b>Data augmentation</b> manufactures new training examples by transforming existing ones in ways that should not change the label: flipping, cropping and colour jitter for images; back-translation or synonym swaps for text; small time shifts or added noise for a time series. It works because it attacks the actual problem - not enough varied data - rather than only constraining the model after the fact.</p>
<p><b>Label smoothing</b> replaces a hard target of exactly 1 for the correct class and 0 for every other class with a softened version: the correct class gets <code>1 - epsilon</code> and each incorrect class gets a small share of the remaining <code>epsilon</code>. A network trained on hard targets is pushed to make its correct-class logit as large as possible without limit, which tends toward overconfidence and poor calibration; label smoothing removes that incentive, usually at a small cost in raw accuracy and a real gain in how trustworthy the model's probabilities are.</p>`,
        deeper: null,
        check: {
          question: "A network's training loss keeps falling but its validation loss has been rising for several epochs. Which two techniques from this section most directly address that specific symptom?",
          options: [
            'Label smoothing and gradient clipping',
            'Dropout and early stopping',
            'Weight decay and warm-up',
            'BatchNorm and RMSNorm'
          ],
          answer: 1,
          explain: 'A shrinking training loss with a rising validation loss is the classic overfitting signature; dropout reduces reliance on memorised detail, and early stopping simply stops before the validation loss gets worse.'
        }
      },
      {
        id: 'dle-f6',
        part: 'field',
        title: 'Convolutional networks and transfer learning',
        viz: 'conv-receptive-field',
        body: `<p>A <b>convolution</b> slides a small grid of learned weights - a <b>kernel</b>, typically 3x3 or 5x5 - across an input, computing one dot product per position and producing a feature map. The same kernel is reused at every position: a pattern it has learned to detect is detected wherever it appears in the image, using far fewer parameters than a fully connected layer would need for the same input size.</p>
<p><b>Padding</b> adds a border of zeros around the input so the output can stay the same size as the input ("same" padding) instead of shrinking a little at every layer ("valid" padding, no border). <b>Stride</b> is how many positions the kernel moves between computations; a stride of 2 roughly halves the output's height and width, trading spatial resolution for a bigger receptive field and less computation. <b>Pooling</b> - usually taking the maximum value in each small region - shrinks the feature map further and gives the network some tolerance to a feature shifting by a pixel or two.</p>
<p>The <b>receptive field</b> of a unit is the region of the original input that can affect its value, and it grows as layers stack: two stacked 3x3 convolutions already give a unit a 5x5 view of the input, for a fraction of the parameters one 5x5 convolution would cost. Convolutional networks suit images because images have exactly the structure this design assumes: nearby pixels are related, and a useful pattern looks the same wherever it appears.</p>
<p><b>Transfer learning</b> reuses a network already trained on a large, general dataset as the starting point for a new, usually smaller, task. Early convolutional layers tend to learn general features - edges, textures, simple shapes - that transfer well across almost any image task, while later layers learn features specific to the original task's classes. <b>Fine-tuning</b> means continuing to train some or all of the pretrained weights on the new dataset, usually after replacing the final classification layer with one sized for the new classes; a common recipe is to freeze the early layers, train only the new final layer for a while, then unfreeze more of the network and continue training everything at a much lower learning rate.</p>`,
        deeper: null,
        check: {
          question: 'Why do two stacked 3x3 convolutions give almost the same receptive field as one 5x5 convolution, using fewer parameters?',
          options: [
            "They don't; a 5x5 convolution always sees more of the input",
            "Each 3x3 layer only looks at its immediate input, so stacking two of them lets the second layer's 3x3 window cover a 5x5 region of the original input, needing only 2*(3*3) weights per channel instead of 5*5",
            'Stride automatically doubles between stacked layers',
            'Pooling is required between the two convolutions for this to work'
          ],
          answer: 1,
          explain: 'Receptive field compounds through depth: a 3x3 window on top of another 3x3 layer already spans 5x5 of the original input, at 18 versus 25 weights per channel, with a non-linearity between the two layers as a bonus.'
        }
      },
      {
        id: 'dle-f7',
        part: 'field',
        title: 'Sequence models and attention',
        viz: 'attention-heads',
        body: `<p>A <b>recurrent neural network (RNN)</b> processes a sequence one step at a time, carrying a hidden state forward: at each step it combines the current input with the previous hidden state to produce a new one. That lets it use information from earlier in the sequence, but backpropagating through many time steps multiplies the same weight matrix over and over - exactly the setup that causes vanishing or exploding gradients. A plain RNN struggles to learn a dependency spanning more than a handful of steps.</p>
<p>The <b>LSTM</b> fixes this with a separate <b>cell state</b> information can flow along mostly untouched, controlled by three learned gates: an input gate deciding what new information to add, a forget gate deciding what to drop, and an output gate deciding what to expose as the hidden state. That additive pathway lets gradients survive far more steps than a plain RNN's repeated multiplication allows. The <b>GRU</b> simplifies this to two gates and no separate cell state, usually close to an LSTM in accuracy for less computation.</p>
<p>All three process a sequence strictly in order, which costs two things: training cannot be parallelised across the sequence length, and information from far away still has to pass through every intervening step. <b>Attention</b> removes both limits by letting every position look directly at every other position in one step, regardless of distance: <code>Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V</code>. <code>Q</code> is a matrix of query vectors, one per position, representing what that position is looking for; <code>K</code> is a matrix of key vectors representing what each position offers; <code>V</code> is a matrix of value vectors, the actual content being retrieved; <code>d_k</code> is the dimension of the query and key vectors. Dividing by <code>sqrt(d_k)</code> keeps the dot products from growing large as the dimension grows, which would otherwise push softmax into a region with almost no gradient. <b>Multi-head attention</b> runs several of these computations in parallel, each with its own learned Q, K and V projections, so different heads can specialise in different relationships; their outputs are concatenated and passed through one more learned projection.</p>`,
        deeper: null,
        check: {
          question: 'Why can attention capture a dependency between two words 500 positions apart more easily than an LSTM can?',
          options: [
            'Attention has a larger hidden state than an LSTM',
            "Attention computes a direct connection between any two positions in one step, while an LSTM's information has to pass through every intervening step, even with gating to help it survive the trip",
            'LSTMs cannot process sequences longer than 100 tokens',
            'Attention only works for positions that are far apart'
          ],
          answer: 1,
          explain: "Attention's query-key comparison is computed directly between every pair of positions; an LSTM's hidden state still has to be carried, step by step, across every position in between."
        }
      },
      {
        id: 'dle-f8',
        part: 'field',
        title: 'The transformer: position, layout, and why it scales',
        viz: 'encoder-decoder-vs-decoder',
        body: `<p>Attention on its own has no idea of order: swap the positions of two words and every query-key dot product stays exactly the same, so order has to be injected some other way. The original transformer added a fixed <b>positional encoding</b> - a pattern built from sine and cosine waves of different frequencies - onto each position's input embedding. <b>RoPE</b> (rotary position embedding), used in most current open language models, does this differently: it rotates each query and key vector by an angle proportional to its position, in pairs of dimensions at a time. The useful property is that the dot product between a rotated query and a rotated key ends up depending only on the <i>difference</i> in their positions, not on their absolute positions, which helps the mechanism generalise more gracefully to sequences longer than any seen during training.</p>
<p>The original transformer used an <b>encoder-decoder</b> layout: the encoder applies self-attention where every position can see every other position (useful when the whole input is available at once, such as a sentence to translate), and the decoder generates one token at a time, using <b>masked</b> self-attention over what it has generated so far plus <b>cross-attention</b> over the encoder's output. Most current large language models instead use a <b>decoder-only</b> layout: a single stack where every position attends only to itself and the positions before it, using a causal mask. Treating generation, translation, summarisation and question answering all as "predict the next token" works remarkably well with this one simpler layout, which is why it now dominates.</p>
<p>The transformer scaled past RNNs for two connected reasons. First, because every position is processed against every other position through matrix multiplications rather than one step at a time, training is almost entirely parallelisable across the sequence length on a GPU, which an RNN's step-by-step dependency cannot be. Second, because a direct connection exists between any two positions, doubling the amount of data and compute keeps paying off in a way sequential models plateau earlier - the predictable relationship between more compute, more data and lower loss that people call transformer scaling laws.</p>`,
        deeper: null,
        check: {
          question: 'What problem does RoPE solve better than a fixed sinusoidal positional encoding?',
          options: [
            'It removes the need for any positional information at all',
            'By rotating queries and keys instead of adding a fixed vector, the resulting attention score depends only on the relative distance between two positions, which generalises better to sequence lengths not seen during training',
            'It makes attention computation faster on a GPU',
            'It only works for decoder-only models'
          ],
          answer: 1,
          explain: 'RoPE\'s rotation makes the query-key dot product a function of relative position by construction, which is what helps it extrapolate more gracefully to longer sequences than training saw.'
        }
      },
      {
        id: 'dle-f9',
        part: 'field',
        title: 'Embeddings, generative models, and choosing an architecture',
        body: `<p>An <b>embedding</b> is a dense vector representing something - a word, a sentence, an image - learned so similar things end up close together in the vector space. A <b>word embedding</b> represents one word; a <b>sentence embedding</b> represents a whole passage, usually built by pooling a model's token-level representations or by training a model specifically to produce one good vector per input. <b>Contrastive learning</b> trains an encoder directly for this property: given a known matching pair, pull their embeddings together while pushing embeddings of unrelated examples in the same batch apart. An <b>autoencoder</b> learns a compressed representation a different way, by squeezing the input through a narrow bottleneck layer and training the network to reconstruct its own input from that bottleneck.</p>
<p>Three families of generative model come up often enough to know at a glance. A <b>GAN</b> pairs a generator, which tries to produce convincing fake examples, against a discriminator, which tries to tell real from fake; the generator only gets better by fooling an opponent that is also getting better. A <b>VAE</b> is an autoencoder with a probabilistic twist: the encoder outputs the parameters of a distribution rather than one fixed point, and training balances reconstruction accuracy against keeping that distribution close to a simple one it can later sample from. A <b>diffusion model</b> learns to reverse a process that gradually adds noise to data until nothing recognisable is left, by training a network to predict and remove a small amount of that noise at every step; generating something new means starting from pure noise and running that denoising step repeatedly. Diffusion models power most of today's strongest image, audio and video generators.</p>
<p>A <b>model card</b> is a short, standard document alongside a released model: its intended use, the data it was trained on, its evaluation results, ideally broken out by relevant subgroup rather than one aggregate number, and its known limitations.</p>
<p>Choosing an architecture usually comes down to the data. For <b>tabular data</b>, gradient-boosted trees still beat a neural network on most problems unless the dataset is very large or has structure - raw text or images inside a column - a network can exploit that trees cannot. For <b>images</b>, start from a pretrained convolutional network (or a vision transformer if the dataset is large enough) and fine-tune, rather than training from a random start. For <b>text</b>, start from a pretrained transformer and either fine-tune it or use it through a prompt. For <b>time series</b>, the right choice depends on the horizon and the data: classical statistical methods or gradient-boosted trees on engineered lag features often win for shorter, more tabular problems, while recurrent or transformer-based sequence models earn their extra complexity when there are many related series, long horizons, or useful signal in other time-varying inputs.</p>`,
        deeper: null,
        check: {
          question: 'A GAN and a VAE both learn to generate new, realistic examples. What is the key difference in how they are trained?',
          options: [
            'A GAN trains a generator against a discriminator in an adversarial game; a VAE trains a single encoder-decoder pair to reconstruct its input while keeping its latent distribution close to a simple prior it can sample from',
            'A VAE uses two competing networks; a GAN uses one',
            'They are trained identically, and differ only in the data they are applied to',
            'A GAN requires labelled data; a VAE does not'
          ],
          answer: 0,
          explain: 'The adversarial two-network game is specific to GANs; a VAE is a single network trained with a reconstruction loss plus a term pulling its latent distribution toward a prior.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'dle-a1',
        type: 'explain',
        title: 'Exercise: explain why a ReLU unit can die, and what stops it',
        prompt: 'A teammate finds that after a few thousand training steps, a large fraction of the ReLU units in one layer always output zero, for every example in the dataset. Explain what is happening and how you would prevent it.',
        timeboxSec: 240,
        rubric: `Must-haves: (1) correctly diagnoses this as the "dying ReLU" problem: once a ReLU unit's pre-activation is negative for every input it will see, its gradient is exactly zero and its weights never update again, so it cannot recover; (2) explains why a whole set of units can end up like this together - typically too high a learning rate, or an unlucky initialisation, pushing many pre-activations sharply and permanently negative in one large step; (3) proposes at least one concrete fix from the chapter: He initialisation, a lower learning rate (especially with warm-up), or switching that layer to a non-zero-gradient activation such as GELU; (4) does not propose dropout or label smoothing as the fix, since neither addresses this mechanism. Common mistakes: describing this only as "vanishing gradient" without naming the ReLU-specific mechanism; proposing to simply retrain from scratch with no structural change; confusing this with ordinary overfitting. {{HONESTY}}`,
        model: `<p>This is the dying ReLU problem. Once a ReLU unit's pre-activation is below zero for essentially every input in the dataset, ReLU's derivative there is exactly zero, so no gradient ever reaches that unit's weights again - it is stuck outputting zero regardless of how much more training happens. A large fraction of a layer dying together usually means one bad step, from too high a learning rate or an unlucky initialisation, pushed many of those pre-activations sharply negative all at once.</p>
<p>The fixes are all about preventing that bad step or giving the unit a way back: He initialisation, which is specifically designed to keep ReLU's pre-activation variance in a useful range from the start; a lower learning rate, especially during warm-up, before the optimiser's estimates have settled; or, if it keeps happening, switching that layer to an activation like GELU that has a small, non-zero gradient for negative inputs, so a unit drifting negative can still recover instead of getting permanently stuck.</p>`
      },
      {
        id: 'dle-a2',
        type: 'design',
        title: 'Exercise: choose an architecture and defend it',
        prompt: 'You get four unrelated problems on the same day: predicting loan default from a spreadsheet of 40 applicant fields, classifying defect photos from a factory camera, summarising customer support tickets, and forecasting next week\'s demand for 2,000 store-SKU combinations. For each, name the architecture you would start with and the one reason that makes it the right starting point.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) tabular loan data - gradient-boosted trees, reasoning: a fixed, moderate number of engineered or raw fields with no spatial or sequential structure, where trees usually beat a network unless the dataset is huge; (2) defect photos - a pretrained convolutional network fine-tuned on the factory's own images, reasoning: transfer learning saves an enormous amount of labelled data versus training a CNN from scratch, and factory defect datasets are usually small; (3) support ticket summarisation - a pretrained transformer used through fine-tuning or prompting rather than training from scratch, reasoning: text generation is exactly what modern pretrained language models are built for; (4) demand forecasting across 2,000 series - names the real trade-off (a single sequence model trained across all series so they can share patterns, versus per-series classical or gradient-boosted models) and does not claim one is unconditionally correct; (5) does not default to "use a neural network" for every case. Common mistakes: proposing a deep network for the tabular problem with no justification; recommending training a transformer or CNN from scratch instead of starting from a pretrained one; giving the same architecture for all four problems. {{HONESTY}}`,
        model: `<p>For the loan default spreadsheet, I'd start with gradient-boosted trees, not a network. Forty applicant fields with no spatial or sequence structure is exactly the setting where trees usually win, and they need far less tuning to get a strong result. For the defect photos, I'd start from a convolutional network already pretrained on a large image dataset and fine-tune it on our factory's own labelled images, because factory defect datasets are almost always small, and the early layers of a pretrained CNN already know how to see edges and textures without us teaching that from zero.</p>
<p>For ticket summarisation, I'd start from a pretrained transformer and either fine-tune it on examples of good summaries or use it through a well-designed prompt - training a language model from scratch for a summarisation task would throw away a huge amount of existing capability. Demand forecasting across 2,000 store-SKU series is the one where I'd want more information before committing. If the series behave similarly and share patterns - the same day-of-week effect, similar seasonality - I'd lean toward a single sequence model trained across all of them so it can share what it learns; if they are mostly independent and short, per-series classical or tree-based forecasting on lag features is simpler, cheaper, and often just as accurate. I would not assume the deep option is automatically better before checking that.</p>`
      },
      {
        id: 'dle-a3',
        type: 'code',
        title: 'Exercise: implement scaled dot-product attention',
        prompt: 'Write out, step by step, how you would implement scaled dot-product attention for a single head, given matrices Q, K and V. Say what shape each intermediate result has, and exactly where the scaling by sqrt(d_k) has to happen relative to the softmax.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) computes the raw attention scores as Q multiplied by K transposed, shape (sequence length, sequence length); (2) divides those scores by sqrt(d_k) before applying softmax, not after, and states why: unscaled dot products grow with d_k, pushing softmax into a region where its gradient is nearly flat; (3) applies softmax along the correct axis, over the key dimension, so each query's weights sum to 1 across all keys; (4) multiplies the resulting attention weights by V to produce the output, with the same last dimension as V; (5) mentions a causal mask as an optional step before softmax for decoder-only generation, setting disallowed positions to a large negative number so they become zero after softmax. Common mistakes: applying softmax before scaling; softmaxing over the wrong axis; claiming the output has the same shape as Q or K rather than V; describing multi-head attention instead of a single head. {{HONESTY}}`,
        model: `<p>I'd do it in four steps. First, compute the raw scores: <code>scores = Q @ K^T</code>, giving one number per query-key pair, so with n positions and head dimension d_k, scores has shape (n, n). Second, scale before anything else: <code>scores = scores / sqrt(d_k)</code>. That has to happen before softmax, because as d_k grows, the dot products in <code>Q @ K^T</code> grow with it, and without scaling, softmax's input would end up in a region where its gradient is nearly zero - scaling keeps the logits somewhere softmax can still learn from.</p>
<p>Third, if this is a causal, decoder-only setup, I'd mask any position a query is not allowed to see by setting those entries in scores to a very large negative number, before softmax, large enough that softmax turns it into essentially zero. Fourth, apply softmax along the key axis, so each query's row of weights sums to 1 across the keys it's allowed to attend to, and multiply by V: <code>output = softmax(scores) @ V</code>. The output ends up with the same shape as V, not Q or K, because it is a weighted average of the value vectors - the queries and keys only ever decide the weights.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: '3Blue1Brown: But what is a neural network?', u: 'https://www.youtube.com/watch?v=aircAruvnKk', w: 'The clearest visual introduction to what a neuron, a layer, and a forward pass actually compute, before any of the algebra.', m: 19 },
      { l: '3Blue1Brown: Backpropagation calculus', u: 'https://www.youtube.com/watch?v=tIeHLnjs5U8', w: "The chain rule walked through visually on a real small network, the best companion to this chapter's worked numeric example.", m: 10 },
      { l: 'Andrej Karpathy: The spelled-out intro to neural networks and backpropagation (building micrograd)', u: 'https://www.youtube.com/watch?v=VMj-3S1tku0', w: 'Builds backpropagation from scratch in code, one operation at a time, turning the worked-numbers approach in this chapter into something you can run and modify.', m: 140 },
      { l: "Andrej Karpathy: Let's build GPT, from scratch, in code, spelled out", u: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', w: 'Builds a decoder-only transformer end to end, including attention, from working code rather than only diagrams.', m: 116 },
      { l: 'Jay Alammar: The Illustrated Transformer', u: 'https://jalammar.github.io/illustrated-transformer/', w: 'The standard visual reference for self-attention, multi-head attention, and the encoder-decoder layout.', m: 30 },
      { l: 'StatQuest: Neural Networks Pt. 2 - Backpropagation Main Ideas', u: 'https://www.youtube.com/watch?v=IN2XmBhILt4', w: "A slower, plain-English pass over backpropagation, good for checking the intuition behind this chapter's worked numbers.", m: 17 },
      { l: 'Dive into Deep Learning (d2l.ai)', u: 'https://d2l.ai/', w: 'A full, code-first textbook covering everything in this chapter and beyond, with runnable notebooks for every concept.', m: 45 },
      { l: 'Su et al., RoFormer: Enhanced Transformer with Rotary Position Embedding', u: 'https://arxiv.org/abs/2104.09864', w: 'The original RoPE paper; read the introduction and the rotary formulation for exactly why rotating queries and keys encodes relative position.', m: 25 }
    ],
    glossary: [
      {
        g: 'Deep learning essentials',
        sub: '',
        rows: [
          ['Activation function', "The non-linear function applied after a neuron's weighted sum; without it, depth adds no expressive power.", 'Every hidden layer of every network.'],
          ['Backpropagation', 'The chain rule applied backward through a network, computing every weight\'s gradient by reusing forward-pass values.', 'How every neural network is trained.'],
          ['He initialisation', "Starting weights with variance 2/fan_in, sized for ReLU's tendency to zero out half its inputs.", 'Initialising any ReLU-based network.'],
          ['BatchNorm / LayerNorm / RMSNorm', 'Three ways of rescaling activations mid-network, differing in which axis they normalise over.', 'CNNs (BatchNorm); transformers and RNNs (LayerNorm, RMSNorm).'],
          ['AdamW', "Adam's adaptive per-weight step size, with weight decay applied directly to the weights instead of folded into the gradient.", 'The default optimiser for most deep learning.'],
          ['Warm-up, cosine decay', 'Ramping the learning rate up slowly, then bringing it back down along a cosine curve.', 'Training schedules for transformers and other large networks.'],
          ['Dropout', "Randomly zeroing a fraction of a layer's outputs during training so no unit can be relied on every time.", 'Regularising fully connected and convolutional networks.'],
          ['Receptive field', 'The region of the input that can influence one particular output unit.', 'Reasoning about how deep a CNN needs to be for a given pattern size.'],
          ['LSTM / GRU', 'Gated recurrent designs adding an additive gradient pathway, fighting the vanishing-gradient problem of plain RNNs.', 'Sequence modelling before attention-based models replaced them for most tasks.'],
          ['Scaled dot-product attention', 'softmax(QK^T / sqrt(d_k)) V: every position compared against every other position in one step.', 'The core operation inside every transformer layer.'],
          ['RoPE', 'Rotary position embedding: rotating queries and keys by an angle proportional to position, so attention scores depend on relative distance.', 'Positional encoding in most current open language models.'],
          ['Diffusion model', 'A model trained to reverse a gradual noising process, generating new examples by repeatedly denoising from pure noise.', "Most of today's strongest image, audio and video generators."]
        ]
      }
    ]
  };

  root.PREP_CORE['mlops-tooling'] = {
    id: 'mlops-tooling',
    title: 'MLOps tooling, hands-on',
    level: 'warning',
    levelLabel: 'Common in interviews for roles that build or operate ML systems, not just train models.',
    why: `Knowing the lifecycle stages by name gets you through a conceptual question. The next question is usually more specific: what actually goes in a dvc.yaml, what MLflow logs on every run, what a Dockerfile for a model server should avoid, how a FastAPI endpoint validates a request before it ever reaches the model. This chapter is the hands-on layer underneath the platform: the actual files, commands and code an engineer writes to make the lifecycle real, one tool at a time.`,
    learn: [
      {
        id: 'mot-0',
        part: 'field',
        title: 'Key terms',
        body: `<p>One pass through the tools this chapter names. Read it once, then use the rest of the chapter to see each one in context.</p>
<ul>
<li><b>Git workflow</b> - branching, committing, and merging changes through pull requests, with review before code reaches the main branch.</li>
<li><b>Environment pinning</b> - recording the exact versions of every dependency a project uses, so "it works on my machine" becomes "it works on any machine that installs the same pin file."</li>
<li><b>Virtual environment</b> - an isolated Python installation for one project, so its dependencies cannot clash with another project's.</li>
<li><b>Python packaging</b> - turning a project into an installable unit, described by a <code>pyproject.toml</code> file and built into a distributable wheel.</li>
<li><b>Pre-commit hook</b> - a check that runs automatically before a commit is allowed, such as formatting, linting, or a fast test.</li>
<li><b>Unit test, data test, model test</b> - a unit test checks a function's logic; a data test checks that a dataset still matches its expected columns and ranges; a model (or smoke) test checks that training itself still runs correctly end to end.</li>
<li><b>DVC (Data Version Control)</b> - a tool that versions large data and model files by storing a small pointer in Git and the actual bytes in a separate remote.</li>
<li><b>lakeFS</b> - a tool that adds Git-like branches and commits on top of an existing object storage bucket, without moving the data.</li>
<li><b>Delta Lake</b> - a storage format adding ACID transactions and version history ("time travel") on top of files in a data lake, most often used with Spark.</li>
<li><b>Remote storage</b> - the actual place large files live: an S3-style object storage bucket, referenced by a hash or version id rather than a path.</li>
<li><b>dvc.yaml, pipeline stage</b> - a file declaring a data or training pipeline as a DAG of named stages, each with its inputs, outputs, and the command that produces them.</li>
<li><b>Experiment tracking</b> - recording every training run's parameters, metrics, and output files so runs can be compared and reproduced later.</li>
<li><b>Run, param, metric, artifact</b> - one execution of training code; a fixed input like a learning rate; a measured number like accuracy, logged across a run; and any output file the run produced, such as a saved model.</li>
<li><b>Model registry</b> - a versioned catalogue of trained models with metadata and a promotion state, so a deployment always references a specific, traceable version.</li>
<li><b>Promotion stage</b> - a label on a registered model version, such as staging or production, marking where in its lifecycle it currently sits.</li>
<li><b>Docker image, Dockerfile</b> - a Dockerfile is the recipe; the image is the built, immutable result: a filesystem plus everything needed to run one program.</li>
<li><b>Base image</b> - the starting image a Dockerfile builds on top of, such as a minimal Python image or, for GPU workloads, a CUDA-enabled image.</li>
<li><b>Multi-stage build</b> - a Dockerfile with more than one stage, so tools needed only to build something do not end up in the final, shipped image.</li>
<li><b>FastAPI</b> - a Python web framework for building an API, built around declaring the structure of a request and response as plain Python classes.</li>
<li><b>Pydantic model</b> - the class FastAPI uses to declare a request or response's exact fields and types, which it then validates automatically.</li>
<li><b>Health check: liveness, readiness</b> - a liveness check answers whether a process should be restarted; a readiness check answers whether it should currently receive traffic.</li>
<li><b>Continuous integration, continuous delivery (CI/CD)</b> - automatically testing every change on push, and automatically moving a tested change toward production through a series of checks.</li>
<li><b>Great Expectations, Pandera</b> - two Python libraries for declaring and checking assertions about a dataset - a column's type, its allowed range, whether nulls are permitted - as an automated test.</li>
<li><b>GitOps, ArgoCD, Flux</b> - the pattern where Git holds the desired state of a deployed system and a controller continuously reconciles the running system to match it; ArgoCD and Flux are the two most widely used controllers implementing it for Kubernetes.</li>
<li><b>Pod, Deployment, Service, Ingress</b> - a Pod is one running group of containers; a Deployment manages a set of Pod replicas and rolls out changes to them; a Service gives those Pods one stable network address; an Ingress routes external traffic in, by path or hostname.</li>
<li><b>HPA (Horizontal Pod Autoscaler)</b> - a Kubernetes controller that changes the number of running replicas based on an observed metric, such as CPU use or a custom queue-depth metric.</li>
<li><b>Resource requests and limits</b> - a request is what a Pod is guaranteed and scheduled against; a limit is the hard ceiling it cannot exceed.</li>
<li><b>GPU node pool</b> - a group of cluster nodes with GPUs attached, usually carrying a <b>taint</b>, a marker that repels any Pod that has not explicitly asked for a GPU, so ordinary work never runs on expensive hardware.</li>
<li><b>Prometheus</b> - a monitoring system that pulls numeric metrics from services on a schedule and stores them as time series.</li>
<li><b>Counter, gauge, histogram</b> - three Prometheus metric types: a counter only ever goes up (total requests served); a gauge can go up or down (current queue depth); a histogram buckets observed values, such as latency, so percentiles can be computed later.</li>
<li><b>PromQL, Alertmanager, Grafana</b> - PromQL is Prometheus's query language; Alertmanager turns a PromQL condition into a routed notification; Grafana is the usual tool for turning those metrics into dashboards.</li>
</ul>`,
        deeper: `<p>Every tool in this chapter solves a version of the same problem the platform chapter names in the abstract: making one team's working setup reproducible for a second team, or for the same team six months later. A registry is DVC's or MLflow's answer to reproducibility; a Dockerfile is the same answer for the code's runtime environment; a dvc.yaml or a CI pipeline is the same answer for the sequence of steps that turned raw data into a served model. If you can say which specific problem a tool in this list solves, you can usually guess what a tool you have never used does, from its name and where it sits.</p>`,
        check: {
          question: "A colleague says: \"we don't need an experiment tracker, DVC already versions our data.\" What is the gap in that reasoning?",
          options: [
            'DVC and an experiment tracker do the same thing, so the colleague is right',
            'DVC versions data and pipeline stages; an experiment tracker like MLflow records the runs, parameters and metrics produced by training on that data, and manages promoting a trained model - a related but different responsibility',
            'An experiment tracker can only be used for deep learning models, unlike DVC',
            'DVC requires an experiment tracker to function at all'
          ],
          answer: 1,
          explain: 'They solve adjacent but different problems: DVC versions the data and pipeline; an experiment tracker records what happened when a pipeline ran and manages promoting the result.'
        }
      },
      {
        id: 'mot-f1',
        part: 'field',
        title: 'Source control and project layout for ML',
        body: `<p>An ML repository earns most of its reliability from the same discipline as any other repository, applied without exception: every change goes through a pull request, reviewed before it reaches the main branch, and the main branch is always in a state that could be deployed. The one addition specific to ML is where notebooks fit: excellent for exploration, and a poor place for anything that has to run reliably later. The usual rule is that once a piece of notebook code is going to run more than once - a training script, a feature transform, an evaluation report - it gets promoted into a tested Python module, and the notebook becomes a thin wrapper that calls it.</p>
<p><b>Environment pinning</b> matters more in ML than in most software, because a training run's result can depend on the exact version of a numerical library, not just its rough compatibility. A <code>pyproject.toml</code> declares the project's dependencies and how it is packaged; a lockfile pins every dependency, direct and transitive, to an exact version, so two machines installing "the same project" actually get identical bytes. GPU projects add one more pin worth calling out by name: the installed CUDA toolkit version has to match what the deep learning framework build expects, and a mismatch fails in ways that look nothing like an ordinary dependency error.</p>
<p><b>Pre-commit hooks</b> run automatically before a commit is accepted: a formatter and a linter catch style problems for free, and a fast schema check on a small sample of data catches an obviously broken transform before it is even pushed. The point of a pre-commit hook is speed - anything slow belongs in CI instead, where it will not block someone's local workflow.</p>
<p>Tests split into three kinds worth keeping apart. A <b>unit test</b> checks one function's logic in isolation - does this feature transform handle a missing value the way it should. A <b>data test</b> checks a dataset itself - are the columns present, are values inside their expected ranges. A <b>model test</b>, sometimes called a smoke test, runs the actual training code for one step on a tiny sample and asserts it did not crash and did not produce <code>NaN</code> - cheap enough to run on every pull request, catching an entire class of bug that unit tests on individual functions cannot see.</p>`,
        deeper: null,
        check: {
          question: "Why is a smoke test that trains a model for one step on a tiny sample worth running on every pull request, given that unit tests already cover the individual functions?",
          options: [
            'It replaces the need for unit tests entirely',
            'It exercises the functions wired together the way training actually runs them, which can catch an integration problem - a shape mismatch, a NaN from an interaction never triggered by any single function\'s unit test - that no individual unit test would see',
            'It is required to compute test coverage percentages',
            "It measures the model's final accuracy"
          ],
          answer: 1,
          explain: 'Unit tests check components in isolation; a smoke test that actually runs training end to end for one step catches integration problems between correctly-tested pieces, a different failure mode entirely.'
        }
      },
      {
        id: 'mot-f2',
        part: 'field',
        title: 'Data versioning',
        viz: 'dvc-pipeline',
        body: `<p>Training data is usually too large for Git, and Git is a poor fit for it anyway - built to diff text, not to store or compare gigabytes of binary files. <b>DVC</b> solves this by keeping a small pointer file in Git (a hash of the data's content) while the actual bytes live in a separate <b>remote</b>: an S3-style object storage bucket, or a similar backend. Running <code>dvc add</code> on a file computes its hash and creates that pointer; <code>dvc push</code> and <code>dvc pull</code> move the real data to and from the remote. Cloning the Git repository stays fast, and anyone who needs the actual data pulls exactly the version the pointer names.</p>
<p>DVC's other half is the pipeline. A <code>dvc.yaml</code> file declares a sequence of named <b>stages</b> - such as <code>prepare</code>, <code>train</code>, and <code>evaluate</code> - as a DAG, each listing its dependencies, its outputs, and the command that produces them. Running <code>dvc repro</code> walks the DAG and reruns only the stages whose declared inputs actually changed, both a reproducibility guarantee and a real time saver on a large pipeline.</p>
<p>Two alternatives solve a similar problem differently, and it is worth knowing when each fits. <b>lakeFS</b> adds Git-like branches and commits directly on top of an existing object storage bucket, without moving or duplicating the data, which suits a team that already has a large lake and wants to experiment on a branch without touching the production copy. <b>Delta Lake</b> instead adds a transaction log on top of files in a data lake, giving ACID guarantees and time-travel queries against past versions of a table; it is most at home in a Spark-based pipeline working with structured, tabular data rather than arbitrary files.</p>`,
        deeper: null,
        check: {
          question: 'Why does DVC store a hash in Git instead of the data file itself?',
          options: [
            'Git cannot store binary files at all',
            'Git is built to store and diff relatively small text changes efficiently; a multi-gigabyte binary file in Git history would make every clone slow and every diff meaningless, so DVC keeps Git fast by storing only a pointer and puts the actual bytes in storage built for large objects',
            'Hashes are required for encryption',
            'DVC cannot work with files larger than 1 MB'
          ],
          answer: 1,
          explain: 'The mismatch is between what Git is optimised for (small text diffs) and what training data actually is (large, often binary); a content hash lets Git track exactly which version is referenced without ever storing the bytes itself.'
        }
      },
      {
        id: 'mot-f3',
        part: 'field',
        title: 'Experiment tracking',
        viz: 'mlflow-registry',
        body: `<p>An <b>experiment tracker</b> - MLflow and Weights and Biases are the two most common - exists to answer one question reliably, months after the fact: exactly what produced this result. Each execution of training code is logged as a <b>run</b>: its <b>params</b> (the learning rate, the model size, anything set going in), its <b>metrics</b> (loss and accuracy, usually logged repeatedly across training so you can see the curve, not just the final number), and its <b>artifacts</b> (the saved model file, a confusion matrix plot, anything the run produced as output). Logging a run typically takes a few extra lines around existing training code, and turns "I think that run used a batch size of 64" into an exact, queryable fact.</p>
<p>The <b>model registry</b> sits on top of runs: it is where a specific trained model, produced by a specific run, gets registered as a named, versioned entity, separate from the experiment that produced it. A registered version carries a <b>promotion stage</b> - commonly staging, production, and archived - and moving a version between stages is the actual mechanism of a release: a deployment references the registry by stage or version, never a raw file path, so promoting a new candidate and rolling back a bad one are both one recorded action instead of a manual file swap.</p>
<p>Recent MLflow versions have been shifting away from the fixed staging and production labels toward more flexible aliases and tags on a model version, so do not be surprised if a specific deployment uses one or the other - the underlying idea, a versioned, promotable catalogue that deployments read from, is the same either way.</p>`,
        deeper: null,
        check: {
          question: 'A trained model file sits on a shared drive named model_v12_final_ACTUAL.pkl. What does an experiment tracker and registry fix about this?',
          options: [
            'Nothing; a well-named file is just as good',
            'The filename records no params, metrics, or lineage back to the run and code that produced it, and nothing prevents someone overwriting it; a registry ties a specific version to its run\'s recorded params, metrics and artifacts, and makes promotion an auditable action instead of a file overwrite',
            'It makes the model train faster',
            'It is only useful for very large models'
          ],
          answer: 1,
          explain: 'The problem with a filename-based process is not the naming, it is the missing link back to what produced the file and the lack of any record when it changes - exactly what runs, params, metrics and a registry are designed to capture.'
        }
      },
      {
        id: 'mot-f4',
        part: 'field',
        title: 'Containerising a model',
        body: `<p>A container packages a program with everything it needs to run - the language runtime, libraries, system dependencies - into one portable unit that runs the same way on a laptop, in CI, and in production. A <b>Dockerfile</b> is the recipe that builds it: a sequence of instructions, each adding a layer, with layers cached so an unchanged step does not have to be rebuilt.</p>
<p>A good Dockerfile for a Python inference service follows a short list of habits. Start from a slim <b>base image</b> rather than a full operating system image, cutting both size and attack surface. Copy the dependency file and install dependencies <i>before</i> copying the rest of the application code, so changing application code does not invalidate the cached, often slow, dependency-installation layer. Use a <b>multi-stage build</b> when anything is compiled: one stage does the building with all the necessary tools installed, and only the final built artifact is copied into a clean final stage, so compilers and build-only packages never ship in the image that runs in production. Run as a non-root user, and keep a <code>.dockerignore</code> file so build context, caches, and local data never accidentally end up baked into the image.</p>
<p><b>Image size</b> is not cosmetic: a large image is slower to pull on every new replica during a scale-up or a deploy, directly costing time on the path to serving traffic. For a model with heavy dependencies, an unusually large model file is often the single biggest contributor, and separating it out - baking only code and light dependencies into the image, then loading model weights from a mounted volume or a fetch step at startup - can be worth the added complexity for a model server.</p>
<p><b>CUDA base images</b> come in two common flavours: a <i>devel</i> image includes the full CUDA toolkit and compiler needed to build GPU code, and a much smaller <i>runtime</i> image includes only what is needed to run already-built GPU code. Building in a devel-based stage and running from a runtime-based final stage applies the same multi-stage principle specifically to GPU workloads, usually the single biggest way to shrink a GPU-serving image.</p>`,
        deeper: null,
        check: {
          question: "Why should a Dockerfile install Python dependencies before copying the application's source code, rather than after?",
          options: [
            'Docker requires dependencies to be installed first or the build fails',
            'Docker caches each instruction as a layer; installing dependencies before copying the frequently-changing source code means a code-only change reuses the cached dependency-install layer instead of reinstalling everything, making rebuilds much faster',
            "It reduces the final image's runtime memory use",
            'It is only relevant for multi-stage builds'
          ],
          answer: 1,
          explain: "Docker's layer cache is invalidated from the point of the first changed instruction onward; ordering rarely-changing steps like dependency installation before frequently-changing steps like copying source code keeps the expensive step cached across most rebuilds."
        }
      },
      {
        id: 'mot-f5',
        part: 'field',
        title: 'Serving with an API',
        viz: 'fastapi-serving',
        body: `<p>A model serving endpoint has to do more than call the model: reject a malformed request before wasting compute on it, answer a health check honestly, and not let one slow request hang every other client behind it. <b>FastAPI</b> is a common choice because request and response validation is built directly into how you declare an endpoint, using <b>Pydantic</b> models rather than hand-written checks.</p>
<p>A minimal version of this endpoint, named piece by piece:</p>
<ul>
<li><b>Request model:</b> <code>class PredictRequest(BaseModel): features: list[float] = Field(min_length=10, max_length=10)</code> - the exact structure of a valid request, declared once.</li>
<li><b>Response model:</b> <code>class PredictResponse(BaseModel): score: float; model_version: str</code> - what this endpoint promises to return, not just what it happens to return.</li>
<li><b>Endpoint:</b> <code>@app.post("/predict", response_model=PredictResponse)</code> on a function that takes the already-validated request, calls the model, and returns the response model.</li>
<li><b>Health check:</b> <code>@app.get("/healthz")</code> returning a plain status, cheap enough to call every few seconds.</li>
</ul>
<p>A request with the wrong number of features, or a field of the wrong type, never reaches the prediction function at all: FastAPI validates it against the request model first and returns a 422 error automatically, before any model code runs.</p>
<p><b>Batching</b> collects several incoming requests over a short window - a few milliseconds, or up to some maximum batch size, whichever comes first - and runs them through the model together, which uses a GPU far more efficiently than one request at a time; the cost is a small, bounded amount of added latency for whichever request arrives first in the batch. A <b>health check</b> splits into the same two questions system design already names: readiness (should this replica currently receive traffic) and liveness (should this process be restarted). A <b>timeout</b> should wrap the model inference call specifically, not the whole request handler, so a slow-but-not-dead model still fails a request cleanly within a bounded time instead of holding a connection open indefinitely.</p>`,
        deeper: null,
        check: {
          question: 'In the example above, a request arrives with 8 numbers in features instead of 10. What happens?',
          options: [
            'The prediction function runs and crashes when it tries to use the missing values',
            "FastAPI rejects the request with a 422 error automatically, based on the request model's declared length constraint, before the prediction function is ever called",
            'The model receives the 8 values and pads the rest with zeros',
            'The request hangs until the timeout is reached'
          ],
          answer: 1,
          explain: 'Because the length constraint is declared on the Pydantic model itself, FastAPI validates every incoming request against it before the endpoint function runs, rejecting anything that does not match.'
        }
      },
      {
        id: 'mot-f6',
        part: 'field',
        title: 'CI and CD for ML',
        viz: 'ci-cd-ml',
        body: `<p>CI for an ML repository runs everything from the earlier sections automatically on every pull request: unit tests, the fast model smoke test, and a data validation step. <b>Great Expectations</b> and <b>Pandera</b> both let you declare assertions about a dataset - a column exists and is the right type, values fall inside an expected range, null rates stay under a threshold - and run them as an automated check, the same way a unit test checks code. Put that check where new data enters the pipeline, and a silently broken upstream feed fails a pipeline run loudly instead of quietly corrupting a training set.</p>
<p>Training itself usually does not belong in the same fast CI run as tests. A pull request's CI should stay fast enough that a reviewer gets a result in minutes; full training can take hours and needs GPU resources CI runners may not even have. The common pattern is to run training on a schedule, or as a separate, explicitly triggered pipeline, keep pull-request CI limited to the smoke test and data checks, and let the scheduled or triggered pipeline register a new candidate model when it finishes.</p>
<p><b>Promoting a model</b> is the step that turns a registered candidate into what actually serves traffic, and should be exactly as deliberate as promoting any other change: automated checks against the model already in production, on the metrics and thresholds a platform's release process defines, followed by an explicit approval before the promotion is recorded.</p>
<p>Deployment itself is where <b>GitOps</b> takes over from CI: instead of a pipeline directly pushing a new version onto a running cluster, the pipeline's last step updates a manifest in Git - typically just the model version reference and the image tag - and a controller such as <b>ArgoCD</b> or <b>Flux</b> notices the change and reconciles the cluster to match it. That split matters for one concrete reason: every deployment is now a Git commit, with an author, a timestamp, and a diff, which is what makes "what changed, and who approved it" answerable months later without digging through deployment logs.</p>`,
        deeper: null,
        check: {
          question: 'Why is training usually kept out of the same CI run that tests a pull request, rather than run on every push?',
          options: [
            'Training cannot be automated at all',
            "A pull request's CI needs to stay fast enough for a reviewer to get a result in minutes, while full training can take hours and often needs GPU resources CI runners do not have; training is better run on a schedule or a separate triggered pipeline instead",
            'Training produces different results each time, so it is not worth automating',
            'GitOps controllers do not support training pipelines'
          ],
          answer: 1,
          explain: 'The constraint is speed and resource availability for the pull-request feedback loop, not whether training itself can be automated - it is automated, just as a separate, slower pipeline.'
        }
      },
      {
        id: 'mot-f7',
        part: 'field',
        title: 'Kubernetes for ML services',
        viz: 'k8s-ml-service',
        body: `<p>A <b>Pod</b> is the smallest deployable unit in Kubernetes: one or more containers sharing networking and storage, usually just the one model-serving container in an ML service. A <b>Deployment</b> declares how many replicas of a Pod should run and manages rolling out a new version without taking the service down. A <b>Service</b> gives that shifting set of Pods one stable network address. An <b>Ingress</b> routes external traffic into the cluster, typically by hostname or path, to the right Service.</p>
<p>The pieces of a minimal manifest for a GPU-serving Deployment, named directly:</p>
<ul>
<li><code>replicas: 3</code> - how many Pods the Deployment keeps running.</li>
<li>a <code>nodeSelector</code> targeting a GPU node label - so the scheduler only considers GPU-equipped nodes for this Pod.</li>
<li><code>resources.requests</code> and <code>resources.limits</code>, each including <code>nvidia.com/gpu: "1"</code> - reserving one whole GPU for this Pod.</li>
<li>a <code>readinessProbe</code> pointing at <code>/healthz</code> - the same endpoint this chapter's FastAPI example exposes.</li>
</ul>
<p><b>Resource requests and limits</b> matter for an ML workload specifically because a GPU cannot be shared the way CPU can be time-sliced: requesting one GPU reserves a whole GPU for that Pod, and a <b>GPU node pool</b> - a set of nodes with GPUs attached, usually tainted so ordinary Pods are not scheduled onto expensive GPU hardware by accident - is how a cluster keeps GPU capacity for the workloads that actually declared they need it.</p>
<p>The <b>Horizontal Pod Autoscaler (HPA)</b> changes the replica count automatically, based on an observed metric. CPU usage is the default, but for a model server it is often more useful to scale on a custom metric that better reflects the load a GPU actually feels, such as queue depth or GPU utilisation itself, fed to the HPA through a metrics adapter reading from Prometheus.</p>`,
        deeper: null,
        check: {
          question: "Why does a GPU-serving Pod request nvidia.com/gpu: '1' specifically, rather than just requesting more CPU and memory?",
          options: [
            'GPU access is free and does not need to be requested',
            'A GPU cannot be time-sliced across Pods the way CPU can; requesting a specific GPU count reserves whole GPUs for that Pod, so the scheduler places it only on a node that actually has one free',
            'CPU and memory requests automatically include GPU access',
            'nvidia.com/gpu is a label, not a schedulable resource'
          ],
          answer: 1,
          explain: 'Kubernetes treats a GPU as a discrete, non-shareable resource; declaring it in the resource request is what lets the scheduler reserve an actual GPU rather than merely hoping one is free.'
        }
      },
      {
        id: 'mot-f8',
        part: 'field',
        title: 'Monitoring with Prometheus and Grafana',
        viz: 'two-dashboards',
        body: `<p>Prometheus works by <b>pulling</b> metrics: a service exposes a <code>/metrics</code> endpoint listing its current numbers in a plain text format, and Prometheus scrapes that endpoint on a schedule, storing every value as a time series. Adding this to a FastAPI app is usually a few lines with a ready-made metrics library, which automatically exposes request count and latency, plus whatever custom metrics you register yourself.</p>
<p>Three metric types cover almost everything worth tracking. A <b>counter</b> only ever goes up - total requests served, total prediction errors - and you read it by looking at its rate of change over a window, not its raw value. A <b>gauge</b> can go up or down, like the current queue depth or the number of loaded model replicas. A <b>histogram</b> buckets observed values - request latency is the standard example - so a percentile like p99 can be computed later from the buckets, rather than needing to store every individual value.</p>
<p><b>PromQL</b> is the query language used to turn stored time series into a number worth alerting on or graphing - a typical alert rule might fire when the rate of server-error responses over five minutes exceeds a threshold, or when p99 latency has been above budget for more than two minutes. <b>Alertmanager</b> takes a rule that has started firing and routes the resulting notification to the right channel, with grouping and silencing so one underlying cause does not turn into fifty separate pages. <b>Grafana</b> is the usual place these same metrics become a dashboard a person actually looks at.</p>
<p>An ML service needs one more layer beyond the request-count-and-latency metrics any service exposes: <b>model-quality metrics</b>, tracking what a system health dashboard cannot see on its own - the distribution of the model's own predictions, a drift score against a reference window, and, once labels catch up, actual accuracy. A service can sit at perfect uptime and latency while quietly making worse and worse decisions, which is exactly why the health dashboard and the decision-quality dashboard have to be looked at as two separate questions, not one.</p>`,
        deeper: null,
        check: {
          question: 'Why is request latency tracked as a Prometheus histogram rather than a gauge?',
          options: [
            'Latency cannot change quickly enough to need a gauge',
            "A histogram buckets every observed value, letting you compute a percentile like p99 later from the stored buckets; a gauge only holds one current value and cannot answer \"what was p99 over the last hour\" at all",
            'Gauges cannot store numbers with decimal points',
            'Histograms use less storage than gauges'
          ],
          answer: 1,
          explain: 'A gauge is a single current reading; a percentile needs the whole distribution over a window, which is exactly what a histogram\'s buckets preserve and a gauge does not.'
        }
      },
      {
        id: 'mot-f9',
        part: 'field',
        title: 'A capstone walk-through, and cloud service mapping',
        viz: 'gcp-aws-mapping',
        body: `<p>Put every piece from this chapter in one line and it reads as a single path. Data arrives and is versioned with <b>DVC</b> (or lakeFS, or Delta Lake, depending on whether it is arbitrary files or a Spark-native lake). Before anything trains, a <b>Great Expectations</b> or <b>Pandera</b> check validates the incoming batch against its expected schema and ranges, failing loudly rather than training on quietly broken data. Training runs as a scheduled or triggered pipeline, logging every run's params, metrics and artifacts to <b>MLflow</b> or Weights and Biases. Evaluation compares the resulting candidate against the current production model on a fixed holdout, and a passing candidate is registered as a new version in the <b>model registry</b>. Promotion moves that version's stage, which a <b>GitOps</b> pipeline picks up and reconciles onto a <b>Kubernetes</b> cluster - EKS on AWS, GKE on GCP - as a Deployment behind a Service and an Ingress, with an HPA watching load and a GPU node pool available if the model needs one. Once serving, <b>Prometheus and Grafana</b> watch both halves of the picture: is the service healthy, and separately, are its decisions still good.</p>
<p>The same pipeline can be built almost entirely from one cloud's managed services, and the vocabulary maps closely enough between clouds to be worth translating on the spot. Managed Kubernetes is <b>EKS</b> on AWS and <b>GKE</b> on GCP. Object storage for a DVC or lakeFS remote is <b>S3</b> on AWS and <b>GCS</b> on GCP. A managed, end-to-end training and registry platform is <b>SageMaker</b> on AWS and <b>Vertex AI</b> on GCP - both roughly cover experiment tracking, training jobs, a model registry, and managed endpoints in one product, worth naming as the built-in alternative to assembling DVC, MLflow, and Kubernetes yourself. For a small, bursty inference workload that does not justify a whole cluster, <b>Lambda</b> on AWS and <b>Cloud Run</b> on GCP both run a container without managing any servers at all. <b>Azure ML</b> plays the same managed-platform role on Azure. None of these mappings are exact in the details - eviction behaviour, cold-start latency, and pricing all differ - but they are close enough to talk about competently across clouds, which is usually what an interviewer is checking for.</p>`,
        deeper: null,
        check: {
          question: 'An interviewer asks you to sketch this same pipeline using only managed services on GCP, with no self-hosted Kubernetes. Which single-product substitution covers the largest part of the pipeline?',
          options: [
            'Cloud Run, because it can replace every other component',
            'Vertex AI, because it bundles training jobs, experiment tracking, a model registry, and managed endpoints - the parts of this pipeline that DVC, MLflow, and a hand-built Kubernetes deployment otherwise assemble separately',
            'GCS, because object storage is the foundation of everything else',
            'BigQuery, because all ML pipelines are fundamentally data warehousing problems'
          ],
          answer: 1,
          explain: 'Vertex AI is specifically the managed platform bundling training, tracking, registry and serving together, the largest part of this pipeline to replace with one product; GCS is still needed underneath it for raw data, but does not cover training or serving.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'mot-a1',
        type: 'design',
        title: 'Exercise: design the promotion path for a new model candidate',
        prompt: 'A new model candidate has just finished training and logged its run to MLflow. Walk through, step by step, everything that has to happen before it is serving production traffic, naming which tool or Kubernetes object is responsible for each step.',
        timeboxSec: 360,
        rubric: `Must-haves: (1) evaluation against the model already in production, on a fixed holdout, before anything else; (2) registering the candidate as a new model version in the registry, distinct from just having a logged run; (3) an explicit approval or automated check required before promotion, not automatic promotion on registration alone; (4) promotion changes a reference in a Git-tracked manifest (the model version or image tag), not a direct push to the cluster; (5) a GitOps controller (ArgoCD or Flux) reconciling the cluster to match that manifest; (6) mentions a progressive rollout mechanism (canary or a staged rollout) rather than switching all traffic at once; (7) monitoring watching the new version once it is serving. Common mistakes: skipping the registry step and jumping straight from a run to a deployment; describing the controller as pushing changes rather than reconciling from Git; no mention of gradual rollout or of watching the new version once live. {{HONESTY}}`,
        model: `<p>First, the candidate gets evaluated against the current production model on the same frozen holdout - a paired comparison, not just looking at its own metrics in isolation. If it passes, it gets registered as a new version in the model registry, which is a different step from just having a logged MLflow run: the run is the experiment record, the registry entry is a versioned, promotable artifact. Promotion to production needs a human approval required by policy, not something automatic just because a run finished - the metric diff should be visible to whoever approves it.</p>
<p>Once approved, the actual mechanism is a change to a manifest in Git: the model version or image tag the Kubernetes Deployment references gets updated in a pull request, itself reviewed. A GitOps controller like ArgoCD notices that change and reconciles the cluster to match it - it is not the pipeline pushing to the cluster directly. Rather than switching all traffic at once, I would want the rollout itself to be progressive - a small percentage of traffic first, checked against the release metrics, before it ramps to everyone. Once it is serving, Prometheus and Grafana pick up the story: request-level health as always, plus the model-quality metrics specifically, because a clean rollout on latency and error rate says nothing yet about whether the new model's decisions are actually good.</p>`
      },
      {
        id: 'mot-a2',
        type: 'code',
        title: 'Exercise: write the FastAPI validation for a batch prediction endpoint',
        prompt: 'Extend the single-prediction endpoint from this chapter into one that accepts a batch of up to 32 requests in one call. Describe the Pydantic models and the endpoint, and say what you validate and what you return when part of the batch is invalid.',
        timeboxSec: 300,
        rubric: `Must-haves: (1) a request model wrapping a list field with a maximum length constraint (32) declared on the model itself, not checked manually inside the function body; (2) a response model that can represent a per-item result, so the caller can tell which items in the batch succeeded; (3) a stated decision on partial failure - either reject the whole batch on any invalid item, or return per-item success/failure - with a reason for the choice; (4) does not claim FastAPI batches automatically for GPU efficiency by itself - accepting a batch at the API layer and internal micro-batching for GPU utilisation are different things, and a strong answer keeps them distinct; (5) notes that the length constraint being declared on the model, rather than checked with an if statement, is what makes it return a 422 automatically before the function runs. Common mistakes: no upper bound on batch size at all; conflating request-level batching with internal GPU batching; returning a single pass/fail for the whole batch with no explanation of that choice. {{HONESTY}}`,
        model: `<p>I'd declare the request as a list field with the max length built into the model itself: <code>class BatchRequest(BaseModel): items: list[PredictRequest] = Field(min_length=1, max_length=32)</code>. Putting the bound there, rather than checking the length inside the function, means FastAPI rejects an oversized batch with a 422 automatically, before any of my code runs. The response needs to represent a batch, not a single score, with one result slot per input item so the caller can match results back to what they sent.</p>
<p>On partial failure, I would not fail the whole batch for one bad item - that punishes the 31 good ones for the 1 malformed one - so I would validate each item inside the loop, return a real result where it succeeded and an error message where it did not, and send back a 200 with the mixed batch rather than a single pass/fail. That is a real design decision, not the only correct one - if the caller's contract requires all-or-nothing, reject-the-whole-batch is defensible too, and I would want to know which one the caller actually expects. One thing I would be careful to say out loud: accepting a batch at the API layer and building an efficient batch for the GPU underneath are two different concerns. This endpoint accepting up to 32 items does not automatically make the model call efficient - that still depends on whether the serving code below it actually groups requests before calling the model.</p>`
      },
      {
        id: 'mot-a3',
        type: 'followup',
        title: 'Follow-up question: "Your CI passed and the canary looked fine, but the model still made bad calls in production. What did your pipeline miss?"',
        prompt: 'An interviewer says: "You told me your CI pipeline runs unit tests, data validation, and a metrics comparison against the model already in production, and your canary rollout watched latency and error rate. All of that passed, but three days later the model was making noticeably worse decisions. Walk me through what your pipeline didn\'t catch, and what you\'d add." Answer in first person, in under 100 seconds of spoken content.',
        timeboxSec: 120,
        rubric: `Must-haves: (1) correctly identifies that CI and canary checks are all near-term and about system health, while the failure described - decisions getting worse over three days - is a data or model-quality problem that only shows up once real-world feedback arrives, which none of the listed checks watch for; (2) names at least one plausible cause a canary on latency/error rate cannot see: drift in the input distribution, a feedback loop where the model's own decisions changed the data it now sees, or a segment-specific regression invisible in an aggregate metric; (3) proposes a concrete addition, not just "monitor more": model-quality metrics on the serving dashboard (prediction distribution, drift score, accuracy once labels catch up), a per-slice check rather than only an aggregate one, or a rollback trigger tied to a business metric rather than only system health; (4) does not claim CI or canary checks were pointless - acknowledges they caught a different, real class of problem, just not this one; (5) spoken in first person, under roughly 100-110 seconds. Common mistakes: blaming the canary for not running long enough as the whole answer with no mention of what metric it should have watched instead; claiming this is unfixable; describing a completely different pipeline instead of naming the specific gap. {{HONESTY}}`,
        model: `"The checks I described were all watching whether the service was healthy - tests passing, data validated, latency and error rate steady during the canary. None of them were watching whether the decisions themselves were still good, and that's exactly the kind of failure that doesn't show up as an error or a slow request. Something like input drift, or a segment where the new model quietly regressed while the aggregate number looked fine, would sail through every check I had.

What I'd add is a model-quality layer on the same dashboard as the health metrics, not a separate afterthought: the distribution of the model's own predictions compared against a reference window, a drift score on the incoming features, and accuracy once labels actually catch up, even if that lag is days. I'd also want a per-slice check rather than trusting one aggregate number, since an aggregate can hide exactly the kind of regression that hurts one segment badly.

I wouldn't say the CI and canary checks were wasted - they're real, they catch a real class of problem, they just weren't built to catch this one. The fix isn't more of the same checks, it's a different kind of check that watches the decisions themselves, not just the service serving them."`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    readings: [
      { l: 'DVC: Get Started', u: 'https://dvc.org/doc/start', w: 'The core mechanics this chapter describes: dvc add, dvc.yaml pipelines, and pushing data to a remote, straight from the source.', m: 25 },
      { l: 'MLflow: Tracking documentation', u: 'https://mlflow.org/docs/latest/ml/tracking/', w: 'What a run actually logs - params, metrics, artifacts - and how autologging removes most manual instrumentation.', m: 20 },
      { l: 'FastAPI: Tutorial - User Guide', u: 'https://fastapi.tiangolo.com/tutorial/', w: "The official walkthrough of request and response models, validation, and the automatic docs this chapter's endpoint example is built on.", m: 40 },
      { l: 'Kubernetes docs: Pods', u: 'https://kubernetes.io/docs/concepts/workloads/pods/', w: "The precise definition of a Pod and how it relates to the Deployment, Service and Ingress objects in this chapter's manifest.", m: 15 },
      { l: 'Prometheus: Overview', u: 'https://prometheus.io/docs/introduction/overview/', w: 'The pull model, metric types, and where Alertmanager and Grafana fit, from the project itself.', m: 15 },
      { l: 'Great Expectations: GX Core documentation', u: 'https://docs.greatexpectations.io/docs/home/', w: 'How to declare and run the kind of data-validation checks this chapter puts in a CI pipeline.', m: 20 },
      { l: 'Argo CD: Documentation', u: 'https://argo-cd.readthedocs.io/en/stable/', w: 'The GitOps controller this chapter names for reconciling a cluster to a Git-tracked manifest.', m: 20 },
      { l: 'ByteByteGo: Kubernetes Explained in 6 Minutes', u: 'https://www.youtube.com/watch?v=TlHvYWVUZyc', w: 'A fast visual pass over the same Kubernetes objects - Pods, Deployments, Services - before going deeper in the docs.', m: 6 }
    ],
    glossary: [
      {
        g: 'MLOps tooling',
        sub: '',
        rows: [
          ['DVC', 'Versions large data and pipeline stages by keeping a hash pointer in Git and the bytes in a remote store.', 'Data versioning for any file-based dataset.'],
          ['dvc.yaml', 'Declares a pipeline as a DAG of named stages, each with inputs, outputs, and a command.', 'Reproducible training pipelines.'],
          ['Run, param, metric, artifact', 'The four things an experiment tracker records for one execution of training code.', 'MLflow and Weights and Biases logging.'],
          ['Model registry', "A versioned catalogue of trained models with a promotion stage, that deployments reference instead of a file path.", 'Promoting a model to production, and rolling one back.'],
          ['Multi-stage Docker build', 'A Dockerfile with a build stage and a separate, smaller final stage that only copies in the built result.', 'Keeping a served image small, especially with CUDA.'],
          ['Pydantic model', "The class FastAPI uses to declare a request or response's fields, validated automatically before the endpoint runs.", 'Rejecting a bad request before it reaches model code.'],
          ['Readiness vs liveness', 'Whether a replica should currently get traffic, versus whether the process should be restarted.', 'Kubernetes and load-balancer health checks.'],
          ['GitOps', 'Git holds the desired state of a deployed system; a controller continuously reconciles the running system to match it.', 'ArgoCD and Flux deployments to Kubernetes.'],
          ['HPA', 'A Kubernetes controller that changes replica count based on an observed metric.', 'Autoscaling a model server under variable load.'],
          ['Counter, gauge, histogram', "Prometheus's three metric types: only-increasing, up-or-down, and bucketed for percentiles.", 'Instrumenting a FastAPI service for monitoring.'],
          ['PromQL', "Prometheus's query language, used to define alert rules and dashboard panels.", 'Turning raw metrics into an alert or a graph.'],
          ['Vertex AI / SageMaker', 'Managed platforms bundling training, tracking, a registry, and serving into one product.', 'The single-cloud alternative to assembling DVC, MLflow, and Kubernetes by hand.']
        ]
      }
    ]
  };

}(typeof window !== 'undefined' ? window : this));
