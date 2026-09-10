/* ml-foundations-a: two core chapters -- the maths behind ML models, and how data becomes features that generalise. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['ml-math-essentials'] = {
    id: 'ml-math-essentials',
    title: 'Maths for machine learning',
    level: 'danger',
    levelLabel: 'Asked, in some form, in almost every machine learning interview.',
    why: `A model is built from five pieces of maths: linear algebra to hold the data and the weights, calculus to fit the weights, probability to reason about noise, information theory to score how wrong a prediction is, and an optimiser to search for good weights. Interviewers lean on this vocabulary constantly, even in a system-design or behavioural round, because it is the fastest way to check that you understand what the model is actually doing rather than just which library call trains it. Doing the worked numbers in this chapter by hand, on paper, is worth more than reading it twice.`,
    readings: [
      { l: '3Blue1Brown -- Essence of linear algebra', u: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', w: 'The best visual explanation of vectors, dot products, and what a matrix does to space -- watch chapters 1 to 3 and the one on eigenvectors.', m: 45 },
      { l: '3Blue1Brown -- Essence of calculus', u: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', w: 'Chapter 1 for what a derivative really is, and the chapter on the chain rule -- both build the picture that makes backpropagation obvious rather than memorised.', m: 30 },
      { l: 'Andrej Karpathy -- The spelled-out intro to neural networks and backpropagation: building micrograd', u: 'https://www.youtube.com/watch?v=VMj-3S1tku0', w: 'Builds a working backpropagation engine from the chain rule in about two hours, live, with no framework hiding the mechanism. The single best source for this section.', m: 120 },
      { l: 'StatQuest -- Bayes\' theorem, clearly explained', u: 'https://www.youtube.com/watch?v=9wCnvr7Xw4E', w: 'The medical-test example worked slowly with a tree diagram, which is exactly the intuition Bayes\' rule needs.', m: 15 },
      { l: 'StatQuest -- Maximum Likelihood, clearly explained', u: 'https://www.youtube.com/watch?v=XepXtl9YKwc', w: 'What "likelihood" means as a function of the parameter rather than the data, before the MLE-versus-MAP distinction is introduced.', m: 10 },
      { l: 'Chris Olah -- Visual Information Theory', u: 'https://colah.github.io/posts/2015-09-Visual-Information/', w: 'The clearest written derivation of entropy, cross-entropy and KL divergence as the cost, in bits, of a bad code -- read it once and the classification loss stops being a formula you memorised.', m: 25 },
      { l: 'PRIMER: Softmax function', u: 'https://en.wikipedia.org/wiki/Softmax_function', w: 'Short and exact on the formula and the temperature parameter, for checking the worked numbers in this chapter.', m: 8 },
      { l: 'Sebastian Ruder -- An overview of gradient descent optimization algorithms', u: 'https://ruder.io/optimizing-gradient-descent/', w: 'Momentum and Adam laid out side by side with the exact update rules, so you can see what each one adds on top of plain gradient descent.', m: 25 }
    ],
    learn: [
      {
        id: 'mfe-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Scalar, vector, matrix, tensor</b> -- a single number; an ordered list of numbers; a 2-D grid of numbers; the general word for a grid of any number of dimensions. A colour image is a 3-D tensor: height, width, and three colour channels.</li>
<li><b>Dot product</b> -- multiply two vectors' matching entries and add up the results. It turns two vectors into one number.</li>
<li><b>Norm</b> -- a single number measuring a vector's size. <b>L2 norm</b> is the ordinary straight-line length; <b>L1 norm</b> is the sum of the absolute values of the entries.</li>
<li><b>Cosine similarity</b> -- the cosine of the angle between two vectors. It is 1 for vectors pointing the same way, 0 for perpendicular vectors, and it ignores how long either vector is.</li>
<li><b>Eigenvector, eigenvalue</b> -- a direction a matrix only stretches, never rotates, and the amount it stretches that direction by.</li>
<li><b>Derivative, gradient</b> -- how fast a function changes as its input changes; the gradient is that same idea for a function of several inputs at once, written as one vector, one entry per input.</li>
<li><b>Chain rule</b> -- the rule for differentiating a function built out of nested functions, by multiplying the derivatives of each layer together.</li>
<li><b>Jacobian</b> -- the gradient's generalisation again, for a function with several outputs: a grid holding every output's derivative with respect to every input.</li>
<li><b>Random variable</b> -- a quantity whose value is uncertain until observed, described by a distribution of possible values and how likely each one is.</li>
<li><b>Expectation, variance</b> -- the long-run average value of a random variable, and how far its values typically spread around that average.</li>
<li><b>Likelihood</b> -- the probability of the data you actually observed, written as a function of an unknown parameter so you can ask which parameter value makes it largest.</li>
<li><b>Prior, posterior</b> -- what you believed about a parameter before seeing data, and what you believe after combining that belief with the data through Bayes' rule.</li>
<li><b>Entropy, cross-entropy, KL divergence</b> (KL is short for Kullback-Leibler, the two people it is named after) -- how much uncertainty a distribution has; how many extra bits it costs to describe outcomes from the true distribution using a guessed one; and the gap between the two, which measures how wrong the guess is.</li>
<li><b>Logit</b> -- a model's raw, unnormalised output score for a class, before softmax turns it into a probability.</li>
<li><b>Softmax</b> -- the function that turns a vector of logits into a vector of probabilities that add up to one.</li>
<li><b>Loss function</b> -- the single number a model is trained to make small, measuring how wrong its predictions are on the training data.</li>
<li><b>Gradient descent</b> -- repeatedly nudging the model's parameters a small step in the direction that most reduces the loss.</li>
<li><b>Learning rate</b> -- how big each of those steps is.</li>
<li><b>Convex function</b> -- a function shaped like a single bowl, with no dip anywhere other than the true minimum, so there is nowhere for a downhill search to get stuck.</li>
<li><b>Local minimum, saddle point</b> -- a point that looks like the bottom from nearby but is not the true minimum; and a point that is a minimum in some directions and a maximum in others.</li>
</ul>`,
        deeper: `<p>None of these words is optional in an interview about how a model actually works. Someone who can say "gradient descent" but cannot say what a gradient is, or which direction a parameter moved and why, has memorised the name of the mechanism without the mechanism. The fastest way to check yourself is the reverse test: pick any term above and try to produce the worked number that goes with it, from memory, before reading on.</p>`,
        check: {
          question: 'A colleague says "the gradient is just the derivative." What is the more precise relationship?',
          options: [
            'They are unrelated concepts that happen to share worked examples',
            'The gradient is the derivative applied only to convex functions',
            'The gradient is the same idea generalised to a function of several inputs: one partial derivative per input, collected into a vector',
            'The gradient is the derivative of the loss function specifically, and nothing else'
          ],
          answer: 2,
          explain: 'A derivative describes the rate of change of a function of one variable. The gradient is the vector of partial derivatives for a function of several variables -- the same idea, one entry per input.'
        }
      },
      {
        id: 'mfe-f1',
        part: 'field',
        title: 'Vectors: dot product, cosine similarity, and the two norms',
        viz: 'dot-product-similarity',
        body: `<p>A vector is just an ordered list of numbers: an embedding of a word, the pixel values of an image row, the weights of one layer of a network. Almost everything else in this chapter is an operation on vectors, so three operations are worth knowing cold.</p>
<p><b>Dot product.</b> For vectors a and b of the same length, <code>dot(a, b) = a1*b1 + a2*b2 + ... + an*bn</code>. Worked example: a = (1, 2, 3), b = (4, 5, 6). <code>dot(a, b) = 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32</code>.</p>
<p><b>L2 norm.</b> The ordinary length of a vector: <code>||v||2 = sqrt(v1^2 + v2^2 + ... + vn^2)</code>. For a = (1, 2, 3), <code>||a||2 = sqrt(1 + 4 + 9) = sqrt(14) ≈ 3.742</code>.</p>
<p><b>L1 norm.</b> The sum of absolute values: <code>||v||1 = |v1| + |v2| + ... + |vn|</code>. For a = (1, 2, 3), <code>||a||1 = 1 + 2 + 3 = 6</code>. It is the distance you would travel walking only along grid lines, which is why it is also called the Manhattan distance.</p>
<p><b>Cosine similarity.</b> The angle between two vectors, independent of their length: <code>cos(θ) = dot(a, b) / (||a||2 * ||b||2)</code>. With a = (1, 2, 3) and b = (4, 5, 6), <code>||b||2 = sqrt(16 + 25 + 36) = sqrt(77) ≈ 8.775</code>, so <code>cos(θ) = 32 / (3.742 * 8.775) ≈ 0.974</code> -- the two vectors point in nearly the same direction.</p>
<p>The two norms show up in different places for a reason. The L2 norm is what Euclidean distance and ridge regression penalise, and it punishes one large entry more than several small ones because it squares first. The L1 norm treats every entry the same regardless of size, which is exactly why penalising it (as lasso regression does) tends to push whole entries to zero rather than just shrinking them -- it produces sparse solutions. Both penalties are taught in full in <a href="#data-and-generalization/dag-f7">Regularisation</a>. Cosine similarity is the default comparison for embeddings, because two documents about the same topic should count as similar whether one of them is twice as long as the other; raw distance would incorrectly penalise the length difference.</p>`,
        deeper: `<p>Cosine similarity is a normalised dot product, so when every vector in a system is already scaled to length 1, ranking by dot product and ranking by cosine similarity give identical results, and the dot product is cheaper to compute. This is why production vector search indexes often store unit-normalised embeddings and use a plain dot product internally, while the person reading the code still calls it "cosine similarity search."</p>`,
        check: {
          question: 'Two embedding vectors have a dot product of 0. What can you conclude?',
          options: [
            'The two vectors are identical',
            'At least one of the vectors has length zero',
            'The vectors are perpendicular (cosine similarity 0), or one of them has length zero -- the sign alone does not tell you which',
            'The vectors point in exactly opposite directions'
          ],
          answer: 2,
          explain: 'cos(θ) = dot(a, b) / (||a|| ||b||). A dot product of zero makes the numerator zero, which happens when the vectors are perpendicular or when either norm in the denominator is itself zero.'
        }
      },
      {
        id: 'mfe-f2',
        part: 'field',
        title: 'Matrices: multiplication, broadcasting, and what SVD and PCA mean geometrically',
        body: `<p><b>Matrix multiplication.</b> For A of shape (m, n) and B of shape (n, p), the product C = AB has shape (m, p), with each entry <code>C[i][j] = sum over k of A[i][k] * B[k][j]</code>. Worked example: A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]]. <code>C[0][0] = 1*5 + 2*7 = 19</code>, <code>C[0][1] = 1*6 + 2*8 = 22</code>, <code>C[1][0] = 3*5 + 4*7 = 43</code>, <code>C[1][1] = 3*6 + 4*8 = 50</code>, so C = [[19, 22], [43, 50]]. The inner dimensions have to match -- this is why a batch of inputs times a weight matrix only works when the weight matrix's first dimension equals the number of features per input.</p>
<p><b>Broadcasting.</b> NumPy and PyTorch let you add or multiply arrays of different shapes by comparing their shapes from the right and stretching any dimension of size 1 to match. Adding a bias vector of shape (n,) to a batch of activations of shape (batch, n) works because the bias is stretched across the batch dimension, so it is added to every row without writing a loop. It is a convenience with a sharp edge: a shape mismatch that broadcasting can silently "fix" the wrong way is one of the most common sources of a bug that runs without error and trains a model on garbage.</p>
<p><b>SVD, geometrically.</b> SVD is the <b>singular value decomposition</b>. Any matrix A factors as <code>A = U * S * V_transpose</code>, where U and V hold orthogonal (perpendicular, unit-length) direction vectors and S is diagonal. Geometrically, every linear map is a rotation, then a stretch along a set of perpendicular axes by the values in S, then another rotation. The values in S, sorted largest to smallest, say which of those directions the map stretches the most.</p>
<p><b>PCA, geometrically.</b> Principal component analysis finds the directions along which centred data spreads out the most, by taking the eigenvectors of the data's covariance matrix. The first principal component is the single direction of greatest variance; each later one is the direction of greatest remaining variance, perpendicular to the ones already chosen. Worked example: covariance matrix [[4, 2], [2, 3]] has eigenvalues solving <code>(4 - λ)(3 - λ) - 4 = 0</code>, giving λ ≈ 5.56 and λ ≈ 1.44. The first principal component explains <code>5.56 / (5.56 + 1.44) ≈ 79%</code> of the variance -- one direction captures most of the spread in the data.</p>`,
        deeper: `<p>SVD and PCA are the same computation in disguise. PCA on a centred data matrix X is exactly the SVD of X: the right singular vectors of X are its principal component directions, and the squared singular values divided by the number of samples give the eigenvalues of the covariance matrix used above. Most software computes PCA through SVD directly rather than forming the covariance matrix at all, because that avoids numerical error from squaring the data.</p>`,
        check: {
          question: 'A dataset\'s first two principal components together explain 96% of the variance out of ten original features. What does that mean?',
          options: [
            'The other eight features are useless and can be deleted from the raw data',
            'A model trained on just those two components will always outperform one trained on all ten raw features',
            'Ten correlated features can be summarised by roughly two independent directions with very little loss of the spread in the data',
            'The dataset has exactly two meaningful data points'
          ],
          answer: 2,
          explain: 'A high explained-variance ratio for the first few components tells you the features are strongly correlated, so most of their combined spread lies along a couple of directions -- a statement about redundancy in the features, not about the raw features being worthless or about model accuracy.'
        }
      },
      {
        id: 'mfe-f3',
        part: 'field',
        title: 'Derivatives, the gradient, the chain rule, and backpropagation',
        viz: 'chain-rule-graph',
        body: `<p>A derivative answers one question: if the input moves a tiny amount, how much and in what direction does the output move? The <b>gradient</b> is the same question asked for a function of several inputs at once: it is a vector, one entry per input, and it points in the direction that increases the function fastest.</p>
<p><b>Chain rule.</b> For a function built by feeding one function into another, <code>d/dx f(g(x)) = f'(g(x)) * g'(x)</code> -- differentiate the outer function at the inner function's value, then multiply by the inner function's own derivative. Worked example: let f(x) = (3x + 1)^2. Write it as the outer function h(u) = u^2 fed the inner function u = g(x) = 3x + 1. At x = 2, g(2) = 7, g'(x) = 3, h'(u) = 2u so h'(7) = 14. Chain rule gives <code>f'(2) = 14 * 3 = 42</code>. Check directly: expanding gives f(x) = 9x^2 + 6x + 1, so f'(x) = 18x + 6, and f'(2) = 36 + 6 = 42. Both routes agree.</p>
<p><b>Jacobian.</b> When a function has several outputs as well as several inputs, the gradient generalises once more into the Jacobian: a grid where row i, column j holds the derivative of output i with respect to input j. A single layer of a neural network is exactly this kind of function, so its local effect on the loss is described by a Jacobian, not a single gradient.</p>
<p><b>Backpropagation is the chain rule applied through a graph.</b> A neural network is a chain of simple functions -- each layer feeds the next. The <b>forward pass</b> computes and stores every intermediate value, layer by layer, ending in the loss. The <b>backward pass</b> starts at the loss with a gradient of 1, then walks back through the graph one layer at a time, at each step multiplying the gradient arriving from the layer above by that layer's own local derivative -- exactly the chain rule, applied once per layer instead of once per parameter. This is what makes it efficient: one backward pass computes the gradient with respect to every parameter in the network at once, by reusing the same intermediate values the forward pass already stored.</p>`,
        deeper: `<p>The reason backpropagation is not "just the chain rule" as a footnote, but the single most important algorithmic idea in deep learning, is the reuse. Differentiating a million-parameter network by computing d(loss)/d(parameter) separately for every parameter, from scratch, would cost roughly a million forward passes. Backpropagation gets every one of those million derivatives from one forward pass and one backward pass, because the chain rule lets the graph share the intermediate gradients that flow backward through shared nodes.</p>`,
        check: {
          question: 'During the backward pass of backpropagation, what is being computed at each node of the graph?',
          options: [
            'The original forward-pass value of that node, recomputed for accuracy',
            'The gradient of the loss with respect to that node\'s output, multiplied by that node\'s local derivative, to produce the gradient with respect to its inputs',
            'A new random initialisation for that node\'s weights',
            'The average of all forward-pass values seen during training'
          ],
          answer: 1,
          explain: 'Backpropagation walks backward applying the chain rule at each node: it takes the gradient of the loss with respect to the node\'s output (arriving from the layer above) and multiplies by the node\'s own local derivative to get the gradient with respect to its inputs, which then flows further back.'
        }
      },
      {
        id: 'mfe-f4',
        part: 'field',
        title: 'Probability: distributions, expectation, variance, and Bayes\' rule',
        body: `<p>A random variable's behaviour is described by a distribution. Three come up constantly. <b>Bernoulli</b>: one trial with two outcomes, <code>P(X=1) = p</code>, mean p, variance <code>p*(1-p)</code> -- a single coin flip, a single click or no click. <b>Poisson</b>: a count of rare events in a fixed window, <code>P(X=k) = (λ^k * e^(-λ)) / k!</code>, with mean and variance both equal to λ -- requests per second, defects per batch. <b>Gaussian (normal)</b>: the classic bell curve, <code>f(x) = (1 / (σ * sqrt(2π))) * e^(-(x-μ)^2 / (2σ^2))</code>, mean μ, variance σ^2 -- measurement noise, and the distribution most model residuals are assumed to follow.</p>
<p><b>Expectation and variance.</b> Expectation is the long-run average: <code>E[X] = sum of x * P(x)</code> for a discrete variable. Variance is the average squared distance from that average: <code>Var(X) = E[(X - E[X])^2]</code>. For a Bernoulli(0.3) variable, E[X] = 0.3 and Var(X) = 0.3 * 0.7 = 0.21.</p>
<p><b>Bayes' rule.</b> <code>P(A|B) = P(B|A) * P(A) / P(B)</code> -- turn a belief about A before seeing B into a belief about A after seeing B. Worked example: a disease has a 1% prior prevalence, a test with 99% sensitivity (true positive rate) and a 5% false-positive rate. A patient tests positive. P(disease) = 0.01, P(positive) = 0.01*0.99 + 0.99*0.05 = 0.0099 + 0.0495 = 0.0594. So <code>P(disease | positive) = 0.0099 / 0.0594 ≈ 16.7%</code> -- far below the test's own 99% sensitivity, because the disease was rare to start with. This is the standard interview trap: a "99% accurate" test on a rare condition still leaves most positives being false alarms.</p>
<p><b>MLE vs MAP.</b> Maximum likelihood estimation picks the parameter value that makes the observed data most probable, with no other assumption. Maximum a posteriori estimation picks the parameter value that maximises the posterior, which folds in a prior belief: <code>P(θ|data) ∝ P(data|θ) * P(θ)</code>. Worked example: 7 heads out of 10 coin flips. MLE gives p̂ = 7/10 = 0.7. Adding a Beta(2, 2) prior (a mild pull toward 0.5) gives a MAP estimate of <code>(7 + 2 - 1) / (10 + 2 + 2 - 2) = 8/12 ≈ 0.667</code> -- pulled toward 0.5 relative to the MLE, because the prior counts as if it had already seen a few flips of its own.</p>`,
        deeper: `<p>As the amount of data grows, MLE and MAP converge to the same answer, because the likelihood term eventually dominates any fixed prior. MAP earns its keep specifically with little data or a rare event, which is exactly the 7-flips and the 1%-prevalence examples above -- both are cases where the data alone is too thin to trust on its own, and a sensible prior changes the answer by a meaningful amount.</p>`,
        check: {
          question: 'A screening test is 99% sensitive and has a 5% false-positive rate, for a condition with 1% prevalence. A patient tests positive. Roughly what is the chance they actually have the condition?',
          options: [
            'About 99%, matching the test\'s sensitivity',
            'About 17%, because the condition was rare to begin with',
            'About 50%, since the test result is the only new information',
            'It cannot be estimated without more information'
          ],
          answer: 1,
          explain: 'Bayes\' rule: P(positive) = 0.01*0.99 + 0.99*0.05 = 0.0594. P(disease|positive) = 0.0099/0.0594 ≈ 16.7%. Low prevalence means most positives are false alarms even from an accurate test.'
        }
      },
      {
        id: 'mfe-f5',
        part: 'field',
        title: 'Entropy, cross-entropy, and KL divergence',
        viz: 'cross-entropy-curve',
        body: `<p><b>Entropy</b> measures how much uncertainty a distribution has: <code>H(p) = -sum of p_i * log(p_i)</code>. A fair coin has <code>H = -(0.5*log(0.5) + 0.5*log(0.5)) = log(2) ≈ 0.693</code> nats. A coin that always lands heads has entropy 0 -- no uncertainty left to describe.</p>
<p><b>Cross-entropy</b> measures the average cost, in the same units, of describing outcomes drawn from the true distribution p using a code built for a different, guessed distribution q: <code>H(p, q) = -sum of p_i * log(q_i)</code>. This is exactly the standard classification loss, because p is the true one-hot label (probability 1 on the correct class, 0 elsewhere) and q is the model's predicted probability distribution. Minimising cross-entropy over the training set is mathematically identical to maximum likelihood estimation of the model's parameters -- the two ideas that sound separate in this chapter are the same computation.</p>
<p>Worked example: the true class has predicted probability 0.8. Loss = <code>-ln(0.8) ≈ 0.223</code>. If the predicted probability drops to 0.5 -- no better than a coin flip between two classes -- loss = <code>-ln(0.5) ≈ 0.693</code>, which is exactly the entropy of a fair coin above. That number is the standard "the model has learned nothing better than chance" benchmark for a two-class problem with balanced classes; a trained model's loss should sit well below it. A "good" loss value, in general, means close to the entropy of the true label distribution -- for clean, one-hot labels that floor is 0, so a loss confidently near 0 means near-perfect, confident, correct predictions, while a loss near <code>ln(number of classes)</code> means the model is not distinguishing the classes at all.</p>
<p><b>KL divergence</b> is the gap between the two: <code>D_KL(p||q) = H(p, q) - H(p) = sum of p_i * log(p_i / q_i)</code>. It is exactly the extra cost cross-entropy pays beyond the best possible code for p, so it measures how far q is from p, with D_KL = 0 only when q equals p everywhere. It is not symmetric: <code>D_KL(p||q)</code> is generally not equal to <code>D_KL(q||p)</code>, which is why it is called a divergence and not a distance.</p>`,
        deeper: `<p>Because the true label distribution p is fixed for a given training set, H(p) is a constant with respect to the model's parameters, so minimising cross-entropy and minimising KL divergence are the same optimisation problem -- they only differ by a constant that does not depend on what the model does. That is why almost every classification loss you will see quoted in a paper is called cross-entropy rather than KL divergence, even though KL is the more intuitive "distance from the truth" way of putting it: cross-entropy is simply cheaper to state, since it drops a term that never changes during training.</p>`,
        check: {
          question: 'A binary classifier reports a loss of about 0.693 on its validation set. What does that number, on its own, most strongly suggest?',
          options: [
            'The model is performing perfectly',
            'The model is assigning close to 50% probability to each class -- no better than chance for a balanced two-class problem',
            'The model has overfit the training data',
            'The learning rate is set too high'
          ],
          answer: 1,
          explain: '-ln(0.5) ≈ 0.693. A loss at that value means the predicted probability of the true class is sitting around 0.5, the same as a fair coin -- the model is not separating the classes.'
        }
      },
      {
        id: 'mfe-f6',
        part: 'field',
        title: 'Softmax and temperature',
        viz: 'softmax-temperature',
        body: `<p>Softmax turns a vector of raw scores (logits) into a probability distribution that sums to 1: <code>softmax(z)_i = e^(z_i) / sum over j of e^(z_j)</code>. Worked example: logits z = (2, 1, 0.1). <code>e^2 ≈ 7.389</code>, <code>e^1 ≈ 2.718</code>, <code>e^0.1 ≈ 1.105</code>, sum ≈ 11.212, so the probabilities are approximately (0.659, 0.242, 0.099) -- the largest logit gets the largest share, but every class keeps some probability.</p>
<p><b>Temperature</b> is a single number T that divides the logits before the exponential is applied: <code>softmax(z/T)_i</code>. Worked example with the same logits at T = 2: divide first, giving (1, 0.5, 0.05). <code>e^1 ≈ 2.718</code>, <code>e^0.5 ≈ 1.649</code>, <code>e^0.05 ≈ 1.051</code>, sum ≈ 5.418, giving probabilities approximately (0.502, 0.304, 0.194) -- visibly flatter than the T = 1 case, even though the relative order of the classes has not changed.</p>
<p>As T approaches 0, dividing by a tiny number stretches the gap between logits until the largest one completely dominates, so the distribution collapses onto a single class -- softmax with T→0 behaves like a hard argmax. As T grows large, the scaled logits all shrink toward 0, and the exponentials all approach 1, so the distribution flattens toward uniform across every class, regardless of which logit was originally largest.</p>
<p>Temperature is not a training-time parameter of the model's weights; it is a knob applied at inference time, after the logits already exist. Two places it matters in practice: sampling from a language model, where a low temperature produces safer, more repetitive text and a high temperature produces more varied and more error-prone text; and knowledge distillation, where a high temperature is applied to a large "teacher" model's output so a smaller "student" model can learn from the relative confidence across all classes, not just which one won.</p>`,
        deeper: `<p>Because raw exponentials can overflow for large logits, real implementations subtract the maximum logit from every entry before exponentiating: <code>softmax(z)_i = e^(z_i - max(z)) / sum of e^(z_j - max(z))</code>. This produces the identical probabilities -- the max(z) term cancels in the ratio -- while keeping every exponent at or below zero, so nothing overflows. Any softmax implementation that skips this step will eventually produce NaN (not a number, the special floating-point value that marks an invalid result such as infinity divided by infinity) outputs on some batch of real data, usually the day it matters.</p>`,
        check: {
          question: 'Raising the temperature parameter used in softmax sampling from 1 to 5 will typically do what to the output distribution?',
          options: [
            'Make it sharper, concentrating almost all probability on the single largest logit',
            'Flatten it toward a more uniform distribution across classes, without changing which logit was largest',
            'Have no effect, since temperature only matters below 1',
            'Change the ranking of the classes, so a different class becomes most likely'
          ],
          answer: 1,
          explain: 'Dividing logits by a larger T shrinks the differences between them before the exponential is applied, which flattens the resulting probabilities toward uniform. The ranking of the logits, and therefore of the probabilities, is unchanged.'
        }
      },
      {
        id: 'mfe-f7',
        part: 'field',
        title: 'Gradient descent, learning rate, momentum, Adam, and convexity',
        viz: 'gradient-descent-bowl',
        body: `<p><b>Gradient descent.</b> Update rule: <code>θ(t+1) = θ(t) - η * ∇L(θ(t))</code>, where θ is the parameter, η is the learning rate, and ∇L is the gradient of the loss. Worked example: L(θ) = θ^2, so ∇L(θ) = 2θ. Starting at θ(0) = 5 with η = 0.1: <code>θ(1) = 5 - 0.1*10 = 4</code>, <code>θ(2) = 4 - 0.1*8 = 3.2</code>, <code>θ(3) = 3.2 - 0.1*6.4 = 2.56</code> -- each step shrinks the distance to the minimum at 0 by the same 20%, because the gradient of a quadratic shrinks in proportion to the distance already covered. A learning rate that is too large overshoots and can diverge instead of converge; one that is too small converges correctly but wastes enormous amounts of compute getting there.</p>
<p><b>Momentum</b> keeps a running average of past gradients and steps in that direction instead of the latest gradient alone: <code>v(t) = β*v(t-1) + η*∇L(θ(t))</code>, then <code>θ(t+1) = θ(t) - v(t)</code>, with β typically around 0.9. It damps the back-and-forth that happens in a narrow, curved valley and speeds up movement in any direction the gradient has agreed on for several steps in a row.</p>
<p><b>Adam</b> keeps an exponential moving average of the gradient itself, m(t), and of the squared gradient, v(t): <code>m(t) = β1*m(t-1) + (1-β1)*g(t)</code>, <code>v(t) = β2*v(t-1) + (1-β2)*g(t)^2</code>, bias-corrected as <code>m̂(t) = m(t)/(1-β1^t)</code> and <code>v̂(t) = v(t)/(1-β2^t)</code>, with update <code>θ(t+1) = θ(t) - η * m̂(t) / (sqrt(v̂(t)) + ε)</code>. Standard defaults are β1 = 0.9, β2 = 0.999, ε = 1e-8. The effect: each parameter gets its own effective learning rate, shrunk where its gradient has recently been large or noisy, and left larger where it has been small or steady -- m(t) supplies the momentum, and v(t) supplies the per-parameter scaling.</p>
<p><b>Convexity.</b> A function is convex if a straight line between any two points on its graph never dips below the graph itself. For a convex loss, gradient descent with a small enough learning rate is guaranteed to reach the global minimum, because there is no other low point to get trapped in. Most deep network losses are not convex -- they have many local minima and saddle points -- yet gradient descent, usually with momentum or Adam, still reliably finds solutions that generalise well in practice. That last fact is observed empirically far more solidly than it is explained theoretically.</p>`,
        deeper: `<p>The reason Adam divides by sqrt(v̂(t)) rather than v̂(t) itself is dimensional: g(t) has the same units as the gradient, and sqrt(v̂(t)) is an estimate of the gradient's typical magnitude in those same units, so the ratio m̂(t)/sqrt(v̂(t)) is roughly unit-free -- close to +1 or -1 once the running estimates settle down -- which is why Adam's learning rate behaves similarly across very differently scaled parameters without needing to be re-tuned per layer.</p>`,
        check: {
          question: 'Training loss oscillates wildly and eventually grows instead of shrinking. Gradient descent is being used with no momentum. What is the most likely first thing to try?',
          options: [
            'Increase the learning rate, to escape the oscillation faster',
            'Decrease the learning rate, since oscillation and divergence are the classic signature of steps that overshoot the minimum',
            'Switch the loss function to a non-convex one',
            'Increase the batch size to exactly the size of the full dataset'
          ],
          answer: 1,
          explain: 'A learning rate too large for the local curvature causes each step to overshoot past the minimum, and the overshoot compounds step after step into growing oscillation. Lowering the learning rate is the standard first fix.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'mfe-a1',
        type: 'explain',
        title: 'Explain backpropagation as the chain rule applied through a graph',
        viz: 'chain-rule-graph',
        prompt: 'Walk me through how backpropagation actually works. Assume I know calculus, but connect it explicitly to the chain rule and tell me why it is efficient.',
        timeboxSec: 300,
        rubric: 'Must-haves: (1) states the chain rule correctly, d/dx f(g(x)) = f\'(g(x))*g\'(x); (2) describes the forward pass as computing and storing every intermediate value through the network\'s layers; (3) describes the backward pass as starting from the loss with gradient 1 and multiplying, layer by layer going backward, by each layer\'s local derivative -- the chain rule applied once per layer; (4) explains the efficiency argument: one backward pass gives the gradient for every parameter at once by reusing shared intermediate values, instead of one pass per parameter; (5) does not claim backpropagation is a different algorithm from the chain rule, and does not skip the forward pass. Bonus: mentions the Jacobian for layers with multiple outputs, or gives a small worked numeric example. Common mistakes: describing backprop only as "the network learning from its mistakes" with no mechanism; forgetting that the forward pass must store values for the backward pass to use; confusing the gradient direction (steepest increase) with the direction gradient descent actually steps in (the negative of it). {{HONESTY}}',
        model: `<p>Backpropagation is the chain rule, applied systematically through the network's computation graph, and the reason it exists is efficiency. Start with the forward pass: each layer takes the previous layer's output, applies its own function, and I keep every one of those intermediate values in memory, all the way to the final loss number.</p>
<p>The backward pass starts at the loss with a gradient of exactly 1, since the loss's derivative with respect to itself is 1. Then I walk backward one layer at a time. At each layer, I already have the gradient of the loss with respect to that layer's output, arriving from the layer above. I multiply it by that layer's own local derivative -- computed using the values the forward pass stored -- to get the gradient with respect to that layer's input, which becomes the "arriving gradient" for the layer below. That single multiply-and-pass-back step, repeated layer by layer, is exactly the chain rule: d(loss)/d(x) equals d(loss)/d(layer output) times d(layer output)/d(x).</p>
<p>The efficiency comes from doing this once, backward, instead of once per parameter, forward. A network with a million parameters would need roughly a million separate derivative computations if I differentiated with respect to each parameter from scratch. Backpropagation gets every one of those million gradients from a single forward pass and a single backward pass, because the chain rule lets gradients that flow through shared nodes get reused rather than recomputed.</p>`
      },
      {
        id: 'mfe-a2',
        type: 'formulate',
        title: 'Formulate the MLE and MAP estimate for a biased coin',
        prompt: 'You flip a coin 10 times and see 7 heads. Write down the maximum likelihood estimate of the coin\'s bias. Then write down the MAP estimate under a Beta(2, 2) prior, and tell me, in words, why the two numbers differ.',
        timeboxSec: 240,
        rubric: 'Must-haves: (1) states the MLE for a Bernoulli/binomial parameter is the observed proportion, p_hat = 7/10 = 0.7, and says why (it is exactly the value that maximises the likelihood of seeing 7 heads in 10 flips); (2) gives the correct MAP formula for a Beta(a, b) prior combined with binomial data, (heads + a - 1) / (n + a + b - 2), and computes (7+2-1)/(10+2+2-2) = 8/12 ≈ 0.667; (3) explains the difference in words: the prior acts like extra, imagined data pulling the estimate toward 0.5, and its influence shrinks as the number of real flips grows; (4) does not confuse the prior\'s hyperparameters (2, 2 for Beta) with observed data counts. Bonus: notes that with a uniform prior (Beta(1,1)) MAP and MLE would coincide, or that MLE and MAP converge as n grows. Common mistakes: reporting MAP as 0.7 (ignoring the prior entirely); reporting MLE with the prior folded in by mistake; getting the MAP formula\'s denominator wrong. {{HONESTY}}',
        model: `<p>The maximum likelihood estimate is the value of p that makes the observed data most probable, with no other assumption folded in. For 7 heads out of 10 flips, that is just the observed proportion: p_hat = 7/10 = 0.7. There is a real derivation behind that -- differentiating the binomial likelihood and setting it to zero -- but for a single proportion it always reduces to "count of successes over count of trials."</p>
<p>The MAP estimate adds a prior belief about p before I saw any data, here a Beta(2, 2) distribution, which is a mild, symmetric pull toward 0.5. Combining a Beta(a, b) prior with binomial data gives a MAP estimate of (heads + a - 1) / (n + a + b - 2). Plugging in heads = 7, n = 10, a = 2, b = 2: (7 + 2 - 1) / (10 + 2 + 2 - 2) = 8/12, which is about 0.667.</p>
<p>The two numbers differ because the prior behaves like extra, imagined flips added to the real data -- a Beta(2, 2) prior acts roughly like having already seen one head and one tail before the experiment started. With only 10 real flips, that imagined data still has a noticeable pull, moving the estimate from 0.7 down to about 0.667. If I had flipped the coin 1,000 times and still seen 70% heads, the same prior would barely move the estimate at all, because the real data would completely dominate two imagined flips. That is the general relationship between MLE and MAP: they converge as the amount of real data grows.</p>`
      },
      {
        id: 'mfe-a3',
        type: 'code',
        title: 'Implement a numerically stable softmax with temperature',
        prompt: 'Write out, step by step, how you would implement a softmax function that takes a temperature parameter and does not overflow on large inputs. What is the one trick that keeps it stable, and why does it not change the answer?',
        timeboxSec: 300,
        rubric: 'Must-haves: (1) divides the input logits by temperature T before exponentiating; (2) subtracts the maximum (scaled) logit from every entry before calling exp, as the numerical-stability step; (3) explains why this does not change the result: subtracting a constant from every logit before exponentiating divides every term of the sum by the same factor e^(-max), which cancels top and bottom in the final ratio; (4) sums the exponentials and divides each one by the sum to get probabilities that add to 1. Bonus: notes what happens without the trick (e^(large number) overflows to infinity, producing NaN once divided) or mentions that very small T can also cause underflow in the unstable version. Common mistakes: subtracting the max after dividing by an already-large T without noticing the order does not matter here; forgetting the final normalisation step; claiming the subtraction changes which class is most likely (it does not). {{HONESTY}}',
        model: `<p>I would write it in three steps, in this order. First, scale the logits by the temperature: <code>scaled = logits / T</code>. Second, for numerical stability, subtract the largest scaled logit from every entry: <code>shifted = scaled - max(scaled)</code>. Third, exponentiate and normalise: <code>exps = exp(shifted)</code>, then <code>probs = exps / sum(exps)</code>.</p>
<p>The trick that matters is the subtraction in step two. Without it, a logit of, say, 800 produces exp(800), which overflows any floating-point representation to infinity, and infinity divided by infinity in the final normalisation comes out as NaN. The subtraction fixes this because it is mathematically a no-op on the final answer: subtracting the same constant c from every entry before exponentiating multiplies every term, top and bottom, by exp(-c), and that factor cancels exactly in the ratio exps / sum(exps). So the probabilities are identical to the unstable version in exact arithmetic; the only thing that changes is that every exponent is now at most zero, so every exp() call returns a value between 0 and 1 instead of a number that can blow up.</p>
<p>One thing worth saying out loud in an interview: this trick is why every production softmax implementation, including the one inside PyTorch's cross-entropy loss, does the max-subtraction internally rather than trusting the caller to have well-scaled logits.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    glossary: {
      g: 'Maths for machine learning',
      sub: 'The formulas an interviewer expects you to be able to write down and explain, not just name.',
      rows: [
        ['Dot product', 'Multiply matching entries of two vectors and add the results: dot(a,b) = sum of a_i*b_i.', 'Similarity search, attention scores, any linear layer.', ''],
        ['Cosine similarity', 'The cosine of the angle between two vectors; ignores their length.', 'Comparing embeddings.', ''],
        ['L1 / L2 norm', 'Sum of absolute values, versus the ordinary straight-line length.', 'Lasso versus ridge regularisation.', ''],
        ['PCA', 'Finding the directions of greatest variance in centred data, via the eigenvectors of its covariance matrix.', 'Dimensionality reduction, visualisation.', ''],
        ['Gradient', 'The vector of partial derivatives of a function, pointing toward steepest increase.', 'Every training step of every model.', ''],
        ['Chain rule', 'Differentiate the outer function at the inner value, multiply by the inner function\'s derivative.', 'Backpropagation.', ''],
        ['Backpropagation', 'The chain rule applied backward through a computation graph, reusing stored forward-pass values.', 'How every neural network is trained.', ''],
        ['Bayes\' rule', 'P(A|B) = P(B|A)*P(A)/P(B): turning a prior belief into a posterior belief given evidence.', 'Any question about base rates or rare-event tests.', ''],
        ['MLE vs MAP', 'The parameter that maximises the likelihood of the data, versus the parameter that maximises the posterior once a prior is included.', 'Parameter estimation with small or large data.', ''],
        ['Cross-entropy', 'The average cost of describing outcomes from the true distribution using a code built for the predicted distribution; the standard classification loss.', 'Almost every classifier\'s training loss.', ''],
        ['KL divergence', 'Cross-entropy minus entropy: the extra cost of using the wrong distribution; not symmetric.', 'Comparing two distributions, variational methods.', ''],
        ['Softmax temperature', 'A scalar dividing the logits before softmax; low values sharpen the distribution, high values flatten it.', 'Sampling from language models, knowledge distillation.', ''],
        ['Momentum', 'An exponential moving average of past gradients, used as the step direction instead of the latest gradient alone.', 'Faster, less oscillatory training.', ''],
        ['Adam', 'Keeps moving averages of the gradient and the squared gradient, giving each parameter its own adapted effective learning rate.', 'The default optimiser for most deep learning.', ''],
        ['Convexity', 'A function shaped like a single bowl, guaranteeing gradient descent reaches the global minimum.', 'Linear and logistic regression; not most deep nets.', '']
      ]
    }
  };

  root.PREP_CORE['data-and-generalization'] = {
    id: 'data-and-generalization',
    title: 'Data, features and generalisation',
    level: 'danger',
    levelLabel: 'Asked in almost every machine learning interview, usually as "how do you know this model will actually work."',
    why: `A model only ever sees the data you hand it, and it only ever learns to do well on that data unless you actively force it to generalise. Nearly every embarrassing production failure in machine learning -- a model that looked great offline and useless in production, a leaderboard score nobody could reproduce -- traces back to one of the ideas in this chapter: a leak, a sampling mistake, or a distribution that quietly moved. Interviewers ask about this because it is where real engineering judgement shows, far more than which model architecture you pick.`,
    readings: [
      { l: 'StatQuest -- Machine Learning Fundamentals: Bias and Variance', u: 'https://www.youtube.com/watch?v=EuBBz3bI-aA', w: 'The clearest short explanation of the bias-variance trade-off, with the dartboard picture this chapter\'s diagram is based on.', m: 8 },
      { l: 'StatQuest -- Regularization Part 1: Ridge (L2) Regression', u: 'https://www.youtube.com/watch?v=Q81RR3yKn30', w: 'Builds the L2 penalty from a plain least-squares fit, step by step, so the formula is not just handed to you.', m: 20 },
      { l: 'StatQuest -- Regularization Part 2: Lasso (L1) Regression', u: 'https://www.youtube.com/watch?v=NGf0voTMlcs', w: 'Same treatment for L1, and the direct visual reason it produces sparse solutions where ridge does not.', m: 8 },
      { l: 'Kaggle Learn -- Data Leakage', u: 'https://www.kaggle.com/code/alexisbcook/data-leakage', w: 'Short, concrete, worked examples of target leakage and train-test leakage with real (if simplified) tabular data, which is exactly the intuition an interviewer is testing for.', m: 15 },
      { l: 'Google: Rules of Machine Learning -- Rule #37: Measure Training/Serving Skew', u: 'https://developers.google.com/machine-learning/guides/rules-of-ml#rule_37_measure_trainingserving_skew', w: 'The production-engineering version of leakage and distribution shift, from the people who operate ML at very large scale.', m: 10 },
      { l: 'PRIMER: Probably approximately correct learning', u: 'https://en.wikipedia.org/wiki/Probably_approximately_correct_learning', w: 'Short and precise on what the PAC framework actually promises -- read it after this chapter\'s plain-English version, to see the same idea in its formal form.', m: 10 },
      { l: 'Chip Huyen -- Data Distribution Shifts and Monitoring', u: 'https://huyenchip.com/2022/02/07/data-distribution-shifts-and-monitoring.html', w: 'A practising ML engineer\'s field guide to covariate shift, label shift and concept drift, with detection methods and real examples from production systems.', m: 30 },
      { l: 'scikit-learn -- Preprocessing data', u: 'https://scikit-learn.org/stable/modules/preprocessing.html', w: 'The reference for standardisation, min-max scaling, and one-hot versus ordinal encoding, with the exact formulas each transformer applies.', m: 15 }
    ],
    learn: [
      {
        id: 'dag-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Population, sample</b> -- everything you could in principle observe, and the finite subset you actually collected. A model is trained on a sample and hopefully works on the population.</li>
<li><b>Data-generating process</b> -- the real-world mechanism that produced your data, including whatever made some things more likely to be observed than others.</li>
<li><b>i.i.d.</b> -- independent and identically distributed: each observation is drawn from the same distribution, and drawing one tells you nothing about the next. Most standard ML theory assumes it.</li>
<li><b>Sampling bias</b> -- the sample was collected in a way that systematically over- or under-represents part of the population.</li>
<li><b>Missing at random, missing not at random</b> -- whether the fact that a value is missing depends on unobserved information related to that same value; "missing completely at random" adds that it does not even depend on other observed columns.</li>
<li><b>Feature</b> -- one measured or computed input column a model reads. <b>Target</b> (or label) -- the value the model is trained to predict.</li>
<li><b>Encoding</b> -- turning a non-numeric feature, most often a category, into numbers a model can use.</li>
<li><b>Data leakage</b> -- information reaching the model during training that would not actually be available at prediction time in production.</li>
<li><b>Empirical risk</b> -- the average loss a model achieves on the training sample, as opposed to its true, unobservable average loss on the whole population.</li>
<li><b>Bias (statistical)</b> -- the systematic gap between a model's average prediction and the true value, caused by the model being too simple to capture the real pattern.</li>
<li><b>Variance (statistical)</b> -- how much a model's predictions would change if it were retrained on a different sample from the same population.</li>
<li><b>Regularisation</b> -- any technique that deliberately makes a model simpler or less confident than it would be if only training performance mattered, to reduce variance.</li>
<li><b>Overfitting, underfitting</b> -- a model that has matched the noise in the training sample and will not generalise; a model too simple to have matched even the real pattern.</li>
<li><b>Generalisation</b> -- how well a model trained on a sample performs on new data it has never seen.</li>
<li><b>PAC learning</b> (PAC is short for probably approximately correct) -- a formal framework guaranteeing that, given enough i.i.d. samples, a model that fits the training data well will, with high probability, also generalise well.</li>
<li><b>Distribution shift</b> -- the statistical relationship between features, labels, or both, changes between training time and prediction time.</li>
</ul>`,
        deeper: `<p>Nearly every term above describes a way the sample you trained on can differ from the population you will actually be judged against. That is the single thread running through this entire chapter: a model is only ever a statement about the data it saw, and every technique here exists either to make that statement more honest (leakage checks, learning curves) or to make it generalise further than the raw training sample alone would justify (regularisation).</p>`,
        check: {
          question: 'A feature is "missing not at random." What does that mean, precisely?',
          options: [
            'The feature is missing for a random 10% of rows, with no discernible pattern',
            'Whether the value is missing depends on the unobserved value itself, or on something closely tied to it',
            'The feature was never collected for any row',
            'The feature is missing only for rows with a particular, easily observed label'
          ],
          answer: 1,
          explain: 'Missing not at random means the missingness carries information: for example, high earners systematically declining to report income means the income column\'s own missing pattern depends on income, which is exactly what makes MNAR hard to handle with simple imputation.'
        }
      },
      {
        id: 'dag-f1',
        part: 'field',
        title: 'Sampling and the data-generating process',
        body: `<p>Every dataset is a sample from some real-world data-generating process, and the model you train can only ever be honest about the process that actually produced your sample -- not the process you assumed produced it. The standard assumption behind most ML theory and most off-the-shelf training code is that observations are <b>i.i.d.</b>: independent (one observation tells you nothing about the next) and identically distributed (every observation comes from the same underlying distribution).</p>
<p>Both halves of that assumption break constantly in practice, and it matters because most generalisation guarantees, including the PAC bound later in this chapter, depend on it. <b>Independence breaks</b> when observations are linked: repeated measurements of the same user, adjacent time steps in a time series, or rows scraped from the same web page. Training and evaluating as if these were independent overstates how much you actually know, because effectively you have fewer independent pieces of evidence than you have rows. <b>Identical distribution breaks</b> when the process itself changes partway through collection -- a sensor recalibrated mid-collection, a product's user base shifting as it grows, a policy change altering who applies for a loan.</p>
<p><b>Sampling bias</b> is the more common practical failure: the sample systematically over- or under-represents part of the population because of how it was collected, not because of anything about the underlying process. A churn model trained only on customers who called support will not generalise to customers who churned silently. A fraud model trained only on transactions that were flagged for review will never see most fraud, because most of it was never flagged in the first place -- the label itself is a function of an earlier, imperfect detection process, which quietly caps how good the new model can ever be.</p>`,
        deeper: `<p>The sharpest version of this problem is when the labels you have are themselves the output of the decision you are trying to improve -- a loan approval model trained only on approved loans has never seen what would have happened to the loans it rejected, so it cannot learn to be less conservative than the process that generated its training data. This is a form of sampling bias specific to systems that act on the world and then learn from the consequences of their own past actions, and it usually needs a deliberate randomised exploration policy to fix, not a bigger dataset.</p>`,
        check: {
          question: 'A fraud-detection model is trained only on transactions that a legacy rules engine flagged for manual review, since only those got a definite fraud/not-fraud label. What is the main risk?',
          options: [
            'The model will be too slow at inference time',
            'The training sample is biased toward what the old rules engine already caught, so the model may never learn to catch fraud patterns the old rules missed entirely',
            'The model will overfit because there is too much data',
            'This has no effect, because labels are labels regardless of how the rows were selected'
          ],
          answer: 1,
          explain: 'The labelled sample only covers transactions the old system already suspected, so it under-represents fraud patterns outside the old rules\' coverage -- a sampling bias baked in by the labelling process itself, not fixable by collecting more of the same kind of row.'
        }
      },
      {
        id: 'dag-f2',
        part: 'field',
        title: 'Exploratory analysis and missing data',
        body: `<p>Before any modelling, look at the data: distributions of each feature, the relationship between each feature and the target, correlations between features, and outliers. This is not a formality -- it is usually the fastest way to catch a leaking feature, a broken pipeline, or a units mismatch, all of which are far more common causes of a bad model than the choice of algorithm.</p>
<p><b>Missing data</b> comes in three flavours, and the right fix depends on which one you have. <b>Missing completely at random (MCAR)</b>: the chance a value is missing has nothing to do with any variable, observed or not -- a sensor drops readings at random moments. Simple imputation (mean, median) or dropping rows introduces no systematic bias here. <b>Missing at random (MAR)</b>: the chance of being missing depends on other <i>observed</i> variables, but not on the missing value itself -- older customers are less likely to fill in an optional email field, and age is recorded. You can model the missingness using the columns you have, and imputation conditioned on those columns is unbiased. <b>Missing not at random (MNAR)</b>: the chance of being missing depends on the unobserved value itself -- people with very high or very low income are less likely to report it. This is the dangerous case: any imputation method that ignores the reason for missingness will systematically bias the filled-in values, because the missing values are not a random subset of the true distribution.</p>
<p>A practical habit that catches MNAR before it causes damage: add a binary "was this missing" indicator column alongside any imputed feature. If that indicator itself turns out to be predictive of the target, missingness is carrying information, and a naive fill-in-and-forget imputation was about to throw that information away.</p>`,
        deeper: `<p>The "was this missing" indicator is doing double duty. It lets a tree-based model learn a different rule for missing-and-imputed rows than for genuinely-observed rows at that same value, which is exactly the flexibility a naive imputation removes. And it is a cheap diagnostic: running a quick model or even a simple correlation between the indicator and the target tells you, in minutes, whether you are looking at MCAR (indicator uncorrelated with the target) or something closer to MNAR (indicator strongly correlated with the target) without ever having to prove the missingness mechanism formally.</p>`,
        check: {
          question: 'A survey feature is missing for customers who have unusually low reported satisfaction, because dissatisfied customers are less likely to finish the survey. What kind of missingness is this, and why does it matter?',
          options: [
            'MCAR -- it is safe to impute with the column mean',
            'MAR -- it depends only on other observed columns, so conditional imputation is unbiased',
            'MNAR -- the missingness depends on the value itself, so naive imputation will systematically bias the filled-in values toward looking more satisfied than reality',
            'It does not matter which kind it is, since any imputation method gives an unbiased estimate in expectation'
          ],
          answer: 2,
          explain: 'The missing value is tied to the (unobserved) low satisfaction score itself, which is the definition of missing not at random. Filling it in with the mean of the observed (higher-satisfaction) rows would systematically overstate satisfaction.'
        }
      },
      {
        id: 'dag-f3',
        part: 'field',
        title: 'Scaling and encoding',
        body: `<p><b>Scaling.</b> Standardisation rescales a feature to mean 0 and standard deviation 1: <code>z = (x - mean) / standard_deviation</code>. Worked example: a feature with mean 50 and standard deviation 10 -- a raw value of 65 standardises to <code>(65 - 50) / 10 = 1.5</code>, meaning 1.5 standard deviations above average. <b>Min-max scaling</b> instead maps a feature into a fixed range, usually 0 to 1: <code>x' = (x - min) / (max - min)</code>. Standardisation is the default for algorithms sensitive to feature scale, such as anything using a distance calculation, gradient descent on unscaled inputs, or <a href="#data-and-generalization/dag-f7">L1 (a penalty on the sum of absolute weights) or L2 (a penalty on the sum of squared weights) regularisation</a> -- an unscaled feature with large raw values gets penalised differently from one with small raw values purely because of units, not because it matters more. Min-max scaling is preferred when a bounded range is required by the model itself, such as some neural network input layers, or when the interpretation "0 to 1" is meaningful to a downstream consumer.</p>
<p><b>Encoding categorical features.</b> <b>One-hot encoding</b> creates one binary column per category -- correct when categories have no natural order, but it can badly inflate the number of columns for a high-cardinality feature like a product ID with 50,000 distinct values. <b>Ordinal encoding</b> assigns an integer per category based on a real order -- correct only when that order genuinely exists and is meaningful to the model, such as "small, medium, large"; assigning arbitrary integers to an unordered category like a country code and feeding it to a linear model invents a false numeric relationship between countries that happen to get adjacent numbers.</p>
<p>Tree-based models are comparatively insensitive to monotonic rescaling of a numeric feature, since a tree only ever asks "is this feature above or below a threshold," so standardisation rarely changes a tree model's predictions. Linear models, distance-based models, and anything trained with gradient descent are sensitive to it, and skipping scaling for those is a common, quiet cause of a model that trains slowly or weights features by their raw units rather than their real importance.</p>`,
        deeper: `<p>Scaling parameters (the mean and standard deviation used for standardisation, or the min and max used for min-max scaling) must be computed only on the training set and then applied unchanged to validation and test data. Recomputing them on the full dataset before splitting is a specific, common form of train-test leakage: it lets a small amount of information about the test set's distribution -- its mean, its range -- influence how every training row gets rescaled.</p>`,
        check: {
          question: 'A feature has training-set mean 20 and standard deviation 4. A new value of 28 arrives at inference time. What is its standardised value, and using which statistics?',
          options: [
            '2.0, using the training set\'s mean and standard deviation',
            '2.0, but recomputing the mean and standard deviation including this new value',
            '8.0, the raw difference from the mean with no division',
            '0.5, dividing the value by the standard deviation without subtracting the mean'
          ],
          answer: 0,
          explain: 'z = (x - mean) / sd = (28 - 20) / 4 = 2.0. The scaling statistics are fixed at training time and applied unchanged to new data; recomputing them per new point would make every prediction depend on data the model never trained on.'
        }
      },
      {
        id: 'dag-f4',
        part: 'field',
        title: 'Feature engineering: numeric, categorical, text, time, interactions, and target encoding',
        body: `<p>Feature engineering turns raw data into inputs a model can actually use well. <b>Numeric</b> features often benefit from a transform that makes their distribution closer to normal or their relationship to the target closer to linear -- a log transform for a right-skewed quantity like income or price, or binning a continuous variable into ranges when the true relationship is a step function rather than smooth. <b>Categorical</b> features get one-hot or ordinal encoding as covered above, or <a href="#deep-learning-essentials/dle-f9">embeddings</a> when the cardinality is large and there is enough data to learn a dense representation, as is common for user IDs or product IDs in recommendation systems. <b>Text</b> features range from simple counts (bag-of-words, or <a href="#search-and-retrieval/sr-f2">TF-IDF</a>, short for term frequency-inverse document frequency) up to dense <a href="#deep-learning-essentials/dle-f9">embeddings</a> from a pretrained language model. <b>Time</b> features extract calendar structure a raw timestamp hides from a model directly -- day of week, hour of day, is-a-holiday, and time since a reference event -- because most models cannot infer "this timestamp is a Tuesday" on their own from a single large integer.</p>
<p><b>Interaction features</b> capture that two variables' combined effect is not just the sum of their separate effects -- multiplying "is weekend" by "hour of day," for instance, when a model class (like plain linear regression) cannot discover that interaction on its own; tree-based models can often find useful interactions automatically, which is one reason they need less manual feature engineering.</p>
<p><b>Target encoding</b> replaces a category with the average target value for that category. Worked example: if customers in category "Region: East" have a historical churn rate of 0.32, every "East" row gets the numeric value 0.32 in place of the category label. This can be a powerful encoding for high-cardinality categorical features, but it carries a specific <b>leakage risk</b>: computing the average target value using the very rows you are about to train on lets each row's own label leak into its own feature. The standard fix is to compute the encoding using only out-of-fold data (a different fold's rows, in cross-validation) or a held-out portion of the training set, often combined with smoothing toward the overall average for categories with few observations: <code>smoothed_mean = (n_c * mean_c + m * global_mean) / (n_c + m)</code>, where n_c is the count of rows in that category and m is a smoothing weight.</p>`,
        deeper: `<p>The smoothing formula above is worth working through with real numbers, not just reading. With a category that has only 3 observations (n_c = 3), a global mean of 0.20, a category mean of 0.90, and a smoothing weight m = 10: smoothed_mean = (3*0.90 + 10*0.20) / (3 + 10) = (2.7 + 2.0) / 13 ≈ 0.362 -- pulled far back toward the global average, because 3 observations are not enough evidence to trust the raw category mean of 0.90. A category with 500 observations and the same 0.90 mean would barely move: (500*0.90 + 10*0.20)/510 ≈ 0.886. The smoothing weight m controls exactly how much evidence a category needs before its own mean is trusted over the population average.</p>`,
        check: {
          question: 'A target-encoded categorical feature is computed by taking, for every row, the average target value of all rows sharing that category -- including the row itself -- then used directly as a training feature. What is the problem?',
          options: [
            'Nothing; this is the standard and correct way to compute target encoding',
            'The feature is not numeric, so most models cannot use it',
            'Each row\'s own label leaks into its own feature value, which can make the training metric look far better than the model will actually perform on new data',
            'Target encoding should only ever be used for numeric features, not categorical ones'
          ],
          answer: 2,
          explain: 'Including a row\'s own label when computing that row\'s target-encoded feature leaks the label into the feature. The fix is to compute the per-category average from a different fold or a held-out split, never including the row being encoded.'
        }
      },
      {
        id: 'dag-f5',
        part: 'field',
        title: 'Data leakage: train-test, temporal, and target leakage, with real examples',
        viz: 'leakage-timeline',
        body: `<p>Data leakage means information reaches training that would not actually be available when the model makes a real prediction, and it is the single most common reason a model looks excellent offline and performs badly, or not at all, in production. Three recurring forms.</p>
<p><b>Train-test leakage.</b> Any statistic computed from the full dataset -- a scaling mean and standard deviation, a target encoding, a feature selection step, an imputation value -- and then applied to both the training and test split. The test set's own values quietly influenced the transformation used on the training data, so the test score no longer measures generalisation to genuinely unseen data. Fix: fit every such statistic on the training split only, inside a cross-validation fold if you are cross-validating, and apply it unchanged to the test split.</p>
<p><b>Temporal leakage.</b> A feature that was not actually knowable at the moment the prediction would have been made in production. A classic real example: a churn model with a feature "number of support tickets in the customer's final month" -- customers who are about to churn often contact support a lot right before leaving, so this feature is strongly predictive in a backtest, but at real prediction time (say, 30 days before a hypothetical churn date) that final month has not happened yet. Fix: for every row, enforce that every feature's value was computed using only information available strictly before that row's prediction timestamp, sometimes called <a href="#data-features/df-f2">point-in-time correctness</a>.</p>
<p><b>Target leakage.</b> A feature that is, in effect, a proxy for the label, often because it is a downstream consequence of the same event the label represents rather than a genuine predictor of it. A real example from a well-known cautionary tale: a hospital readmission model that included "discharge disposition: transferred to another facility" as a feature -- but patients who are readmitted are frequently the ones who get that specific discharge code recorded, so the feature is partly a record of the outcome, not a predictor of it. Fix: for every candidate feature, ask explicitly "would this value exist, in this form, if the label had not already happened" -- if the honest answer is no, drop it.</p>`,
        deeper: `<p>All three forms share one underlying test: draw a strict timeline with the moment of prediction marked on it, and check that every single number your model reads was genuinely computable strictly before that mark, using only the process that will actually run in production. Train-test leakage violates it by letting test-set information flow backward into training-time statistics; temporal leakage violates it directly, by using a feature from after the prediction moment; target leakage violates it because the "feature" is really a delayed echo of the label itself, appearing to be knowable earlier than it actually is.</p>`,
        check: {
          question: 'A model to predict whether a loan will default performs excellently offline, with a feature called "days since last payment received" among its top predictors. In production, this feature performs far worse. What is the most likely explanation?',
          options: [
            'The production data pipeline has a bug unrelated to the feature itself',
            'The feature is temporal or target leakage: a loan that has already defaulted naturally accumulates a large "days since last payment," so the feature is partly a record of the default rather than an early warning of it',
            'The model needs more training data to fix the discrepancy',
            'The feature should have been one-hot encoded instead of used as a raw number'
          ],
          answer: 1,
          explain: 'A loan nearing or past default will, almost by definition, have a growing gap since its last payment -- the feature is downstream of the outcome it is meant to predict, so it looks powerful in a backtest but carries much less real early-warning signal in production.'
        }
      },
      {
        id: 'dag-f6',
        part: 'field',
        title: 'Empirical risk minimisation, bias, and variance',
        viz: 'bias-variance-targets',
        body: `<p><b>Empirical risk minimisation (ERM)</b> is the formal name for what training a model actually does: pick the parameters that minimise the average loss over the training sample, <code>θ_hat = argmin over θ of (1/n) * sum over i of L(y_i, f(x_i; θ))</code>. The word "empirical" is doing real work in that name -- it is minimising loss on the sample you have, not on the true population, which you cannot observe directly. The entire rest of this chapter exists because those two quantities are not the same thing, and a model that perfectly minimises empirical risk can still generalise badly.</p>
<p>The gap between training performance and true performance decomposes into three parts: <code>expected test error = bias^2 + variance + irreducible noise</code>. <b>Bias</b> is the systematic error from a model too simple to represent the real pattern -- a straight line fit to a curved relationship will be wrong in the same direction across many different training samples. <b>Variance</b> is how much the fitted model would change if you retrained it on a different sample from the same population -- a model that memorises training-set noise will fit very differently each time. <b>Irreducible noise</b> is randomness in the data-generating process itself that no model, however good, can predict away.</p>
<p>Worked example: suppose a model's squared bias is 0.04, its variance is 0.09, and the irreducible noise is 0.02. Total expected squared error = 0.04 + 0.09 + 0.02 = 0.15. A simpler model might trade variance for bias -- say bias^2 rises to 0.10 but variance falls to 0.03 -- giving total error 0.10 + 0.03 + 0.02 = 0.15, an identical total reached by a completely different balance. This is the trade-off in one number: the two models can have the same overall error while failing in opposite ways, one systematically wrong in the same direction, the other wildly inconsistent across retrainings.</p>`,
        deeper: `<p>A high-variance model is recognisable in practice before you ever compute the decomposition: retrain it on a different random split, or with a different random seed, and its predictions on the same test points move noticeably. A high-bias model is recognisable the opposite way: it is stable and consistent across retrainings, but consistently wrong in the same places, and its training-set error is already high, not just its test-set error -- a high-bias model cannot even fit the data it was trained on well, which is the tell that separates it from overfitting.</p>`,
        check: {
          question: 'Two models have the same total expected test error. Model A has low training error but noticeably different predictions when retrained on different random splits. Model B has similarly mediocre error on both the training set and the test set, and stable predictions across retrainings. What does this tell you?',
          options: [
            'Model A has low variance and high bias; Model B has high variance and low bias',
            'Model A has low bias and high variance; Model B has high bias and low variance',
            'Both models must have identical bias and identical variance, since their total errors match',
            'This information is not enough to say anything about bias or variance'
          ],
          answer: 1,
          explain: 'Low training error plus instability across retrainings is the signature of low bias and high variance (it fits the training data closely but differently each time). Stable but mediocre performance everywhere is the signature of high bias and low variance.'
        }
      },
      {
        id: 'dag-f7',
        part: 'field',
        title: 'Regularisation: L1, L2, dropout, early stopping, and data augmentation',
        body: `<p>Regularisation trades a small increase in training error for a hoped-for larger decrease in the gap between training and true performance -- deliberately holding a model back from the empirical risk minimum, in exchange for lower variance.</p>
<p><b>L2 (ridge)</b> adds a penalty proportional to the sum of squared weights to the loss: <code>L_reg = L + λ * sum of θ_i^2</code>, where λ controls how strongly weights are pushed toward zero. Because the penalty grows with the square, it punishes one large weight disproportionately more than several small ones, so it shrinks weights smoothly without usually forcing any of them to exactly zero. <b>L1 (lasso)</b> instead penalises the sum of absolute weights, <code>L_reg = L + λ * sum of |θ_i|</code>, which treats every unit of weight the same regardless of size and, geometrically, tends to push whole weights to exactly zero -- L1 regularisation performs feature selection as a side effect, L2 does not.</p>
<p><b>Dropout</b> randomly zeroes out a fraction p of a layer's units on every training step, forcing the remaining units to not rely on any single other unit always being present -- a form of built-in redundancy that reduces overfitting in large networks. At evaluation time, dropout is turned off and (in the standard "inverted dropout" implementation) the training-time activations are already scaled by 1/(1-p) so no rescaling is needed at test time.</p>
<p><b>Early stopping</b> monitors validation loss during training and stops once it has not improved for a set number of epochs (the "patience"), instead of training until training loss is as low as possible -- because training loss keeps falling past the point where validation loss starts rising, and that divergence point is the practical definition of overfitting beginning.</p>
<p><b>Data augmentation</b> manufactures additional, plausible training examples by transforming existing ones -- rotating and cropping an image, adding background noise to audio, paraphrasing a sentence -- which increases the effective size and diversity of the training sample without collecting any new real data, directly attacking variance by giving the model more to generalise from.</p>`,
        deeper: `<p>All five of these techniques are best understood as different ways of injecting the same kind of information: a prior belief that the true function is simpler, smoother, or more robust than the training data alone would suggest. L1 and L2 encode that belief directly into the loss function as a penalty on the weights. Dropout and data augmentation encode it into the training process itself, by making the model succeed under artificially harder or noisier conditions than the clean training set presents. Early stopping encodes it into a stopping rule rather than the model or the data at all. Recognising them as variations on one idea, rather than five unrelated tricks, is usually the difference between reciting the list and actually explaining why it works.</p>`,
        check: {
          question: 'A model is regularised with L1 and ends up with many feature weights set to exactly zero, while an L2-regularised version of the same model has small but nonzero weights almost everywhere. Why the difference?',
          options: [
            'L1 regularisation is simply a stronger form of L2 regularisation',
            'The absolute-value penalty in L1 treats every unit of weight equally regardless of size, which geometrically favours solutions where some weights are exactly zero; the squared penalty in L2 punishes large weights more but rarely forces any weight all the way to zero',
            'L2 regularisation always produces sparser models than L1',
            'This behaviour depends only on the learning rate, not on which penalty is used'
          ],
          answer: 1,
          explain: 'L1\'s penalty is linear in each weight\'s magnitude, so the optimum of the penalised loss geometrically tends to sit exactly on an axis (a zero weight) for less important features. L2\'s penalty grows quadratically, which shrinks weights toward zero smoothly but rarely reaches it exactly.'
        }
      },
      {
        id: 'dag-f8',
        part: 'field',
        title: 'Learning curves and the PAC idea in plain words',
        viz: 'learning-curves',
        body: `<p>A <b>learning curve</b> plots training error and validation error against the amount of training data used (or against training epochs). Two patterns tell you almost everything about what to do next. If both curves are high and close together, the model is underfitting -- it cannot fit even the training data well, so more data will not help; you need a more flexible model or better features. If training error is low but validation error is much higher, with a persistent gap between the two curves, the model is overfitting -- it has memorised training-set noise; here, more data or more regularisation will help, because the gap is exactly the quantity those two remedies attack.</p>
<p>Watching how the gap changes as you add more training data tells you which remedy will actually work before you spend the time. If the gap keeps shrinking as more data is added, the model just needed more examples to generalise properly, and collecting more data is worth the cost. If the gap stays wide even with a lot more data, throwing more data at the problem has stopped helping, and regularisation, a simpler model, or better features is the more useful next step.</p>
<p><b>The PAC (probably approximately correct) idea</b>, in plain words: given enough independent, identically distributed training examples, a model that fits the training data well will, with high probability, also perform well on new data -- and the framework makes both "well" and "high probability" precise, quantitative promises rather than hopes. A simplified version of the classic bound, for a finite set of candidate models H (the "hypothesis class"), states that <code>n ≥ (1/ε) * (ln|H| + ln(1/δ))</code> training examples are enough to guarantee, with probability at least 1-δ, a model that fits the training data perfectly will have true error at most ε. Worked example: with 1,000 candidate models (|H| = 1,000), wanting error at most ε = 0.1 with confidence 1-δ = 0.95 (so δ = 0.05): <code>n ≥ (1/0.1) * (ln(1000) + ln(20)) = 10 * (6.908 + 2.996) ≈ 99</code> -- about 100 examples are enough, in this idealised setting.</p>`,
        deeper: `<p>The practical lesson underneath the PAC formula is qualitative, and it is the part worth remembering even without the algebra: the number of examples needed to generalise reliably grows with how large and flexible your hypothesis class is (more candidate models to distinguish between needs more evidence to pick the right one), and shrinks as you tolerate more error or accept a lower confidence level. That is precisely why a more flexible model class -- a deep network versus a linear model -- needs proportionally more data to generalise as reliably, and why "it worked with only 200 examples" is a claim that means very different things depending on how flexible the model being trained actually was.</p>`,
        check: {
          question: 'A learning curve shows training error near zero, validation error much higher, and the gap between them barely shrinks even after tripling the amount of training data. What should you try next?',
          options: [
            'Collect even more training data of the same kind, since the gap will eventually close',
            'Add regularisation, simplify the model, or improve the features, since more data of the same kind has stopped closing the gap',
            'Switch to a more flexible model, since the current one is clearly underfitting',
            'Lower the learning rate'
          ],
          answer: 1,
          explain: 'A persistent train-validation gap that does not shrink with more data of the same kind signals that the model has enough capacity to overfit and needs to be constrained, not fed more examples -- regularisation, a simpler model, or better features are what actually target that gap.'
        }
      },
      {
        id: 'dag-f9',
        part: 'field',
        title: 'Distribution shift: covariate, label, and concept, and how to detect it',
        viz: 'distribution-shift',
        body: `<p>A model trained on data from one point in time is being deployed against a future you cannot observe in advance, and the relationship between features and labels can move. Three distinct kinds, worth telling apart because each needs a different fix.</p>
<p><b>Covariate shift.</b> The distribution of the inputs, P(X), changes, while the true relationship between inputs and outputs, P(Y|X), stays the same. Example: a model trained on customers acquired mostly through one marketing channel is deployed after a new channel brings in a different mix of customer ages -- the age distribution moved, but a 40-year-old customer still churns for the same underlying reasons as before. This is detectable purely by watching the input features, without ever needing a fresh label.</p>
<p><b>Label shift.</b> The distribution of the labels, P(Y), changes, while the relationship P(X|Y) -- what the inputs look like, given a particular label -- stays the same. Example: a fraud model's overall fraud rate genuinely rises during a known fraud wave, but fraudulent transactions still look statistically the same as they did before; only how common the label is has moved.</p>
<p><b>Concept drift.</b> The relationship between inputs and outputs itself changes, P(Y|X) moves, regardless of whether the input or label distributions move at all. Example: a spam filter's model of what "spam" looks like becomes outdated as spammers actively adapt their wording specifically to evade it -- the exact same email text that was safe six months ago is now spam, or vice versa. This is the hardest of the three to detect from features alone, because the inputs can look completely unchanged while their true relationship to the label has quietly flipped.</p>
<p><b>Detection.</b> Covariate shift is detectable by comparing the distribution of each input feature between training and live data -- a common metric is the <b>population stability index (PSI)</b>: <code>PSI = sum over bins of (actual_pct - expected_pct) * ln(actual_pct / expected_pct)</code>, with a PSI above roughly 0.25 usually read as a significant shift. Label shift needs a source of fresh labels, even a small delayed sample, to compare P(Y) over time. Concept drift is the hardest: since the inputs alone do not reveal it, it usually needs monitoring an actual accuracy or <a href="#classical-models/cm-f3">calibration</a> metric against fresh ground truth, or a proxy signal that correlates with the true label but arrives sooner. What to actually do once a shift is detected - alert, retrain, or roll back - is <a href="#reliability-ops/ro-f3">covered in Reliability and operations</a>.</p>`,
        deeper: `<p>Worked PSI example, with two bins: training data had 60% of customers in a "young" age bin and 40% in "old"; live data now shows 40% "young" and 60% "old." <code>PSI = (0.40 - 0.60)*ln(0.40/0.60) + (0.60 - 0.40)*ln(0.60/0.40) = (-0.20)*(-0.405) + (0.20)*(0.405) ≈ 0.081 + 0.081 = 0.162</code>. That sits below the common 0.25 alert threshold, meaning the shift is real but usually not yet judged severe enough on its own to force an unscheduled retrain -- a useful number to have ready, since "PSI of 0.16" is a much stronger interview answer than "the distribution moved a bit."</p>`,
        check: {
          question: 'A spam classifier\'s input features (word frequencies, sender patterns) look statistically almost identical between last quarter and this quarter, but its precision on newly labelled email has quietly dropped. Which kind of shift is the most likely explanation?',
          options: [
            'Covariate shift, since the inputs have clearly changed',
            'Label shift, since the proportion of spam must have changed',
            'Concept drift, since the relationship between the inputs and the true spam label has changed even though the inputs themselves look unchanged',
            'This cannot be distribution shift, since the input features have not moved'
          ],
          answer: 2,
          explain: 'Stable input features with a dropping true accuracy against fresh labels is the classic signature of concept drift: P(Y|X) has moved even though P(X) has not, which is exactly why monitoring features alone cannot catch it -- it needs fresh labels.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'dag-a1',
        type: 'explain',
        title: 'Explain the bias-variance trade-off without using the word "overfitting" as your whole answer',
        prompt: 'Explain the bias-variance trade-off to me. I already know the word "overfitting" -- tell me what is actually happening statistically, and what you would do differently for a high-bias model versus a high-variance one.',
        timeboxSec: 240,
        rubric: 'Must-haves: (1) defines bias as systematic error from a model too simple to capture the true pattern, and variance as sensitivity of the fitted model to which particular training sample it saw; (2) states the decomposition, expected error = bias^2 + variance + irreducible noise, or at least the qualitative trade-off between the two; (3) gives a distinguishing diagnostic: high bias shows up as high error on the training set itself, high variance shows up as low training error but a large gap to validation error, or as instability across retrainings; (4) names at least one concrete remedy for each case (more flexible model or better features for high bias; more data, regularisation, or a simpler model for high variance) and does not give the same remedy for both. Bonus: mentions that irreducible noise is a hard floor no model choice can remove. Common mistakes: treating "bias" and "variance" as synonyms for underfitting and overfitting with no mechanism behind the words; recommending "get more data" as the fix for a high-bias model, where it will not help. {{HONESTY}}',
        model: `<p>Bias and variance are two different ways a model's predictions can be wrong, and they come from two different causes. Bias is systematic error: the model class itself is too simple to represent the true relationship, so it is wrong in the same direction no matter how much data you give it or which particular sample you trained on. A straight line fit to a genuinely curved relationship has bias baked into the model choice, not into the data.</p>
<p>Variance is instability: how much the fitted model would change if you retrained it on a different sample drawn from the same population. A model with high variance can fit any one training set closely, including its noise, but a different training set produces a meaningfully different fitted model, and neither one is more "correct" than the other -- they are just each memorising their own sample's idiosyncrasies.</p>
<p>The diagnostic that tells them apart is where the error shows up. High bias shows up on the training set itself -- the model cannot even fit the data it was trained on well. High variance shows up as a gap: low training error, much higher validation error, or predictions that visibly move around if you retrain with a different random seed.</p>
<p>The remedies are different too, and using the wrong one wastes real time. For high bias, I would move to a more flexible model, add features, or reduce regularisation -- more data alone will not fix a model that is fundamentally too simple. For high variance, I would add regularisation, simplify the model, or collect more training data, since more data directly narrows how much any one sample's noise can move the fit.</p>`
      },
      {
        id: 'dag-a2',
        type: 'design',
        title: 'Design a leakage-safe feature pipeline for a churn model',
        prompt: 'Design the feature pipeline for a monthly customer-churn model. Walk me through how you would avoid train-test leakage, temporal leakage, and target leakage specifically, not just in general terms.',
        timeboxSec: 360,
        rubric: 'Must-haves: (1) states a concrete point-in-time rule -- every feature for a given customer-month row is computed using only information available strictly before that month\'s cutoff, and the label (churned in the following period) is defined strictly after it; (2) addresses train-test leakage specifically -- any scaling, imputation, or target-encoding statistic is fit only on the training fold/split and applied unchanged elsewhere, never fit on the full dataset before splitting; (3) addresses target leakage specifically -- names at least one plausible leaking feature for churn (a cancellation-flow event, a final support ticket, a "days since last login" computed after a churn date rather than before) and explains why it would leak; (4) addresses temporal leakage in a validation strategy -- splits by time (train on earlier months, validate on later months) rather than a random shuffle split, so the validation setup matches how the model will actually be used. Bonus: mentions target encoding\'s specific leakage risk and the out-of-fold fix. Common mistakes: describing leakage prevention only in the abstract without naming a concrete feature or mechanism; using a random train-test split for a fundamentally time-ordered problem; forgetting that the label itself needs a point-in-time definition, not just the features. {{HONESTY}}',
        model: `<p>I would define a strict cutoff for every row: a customer-month row's features can only use information dated strictly before that month's boundary, and its label -- did this customer churn in the following period -- can only look strictly after it. That single rule is the backbone the rest of the design enforces.</p>
<p>For temporal leakage, the clearest risk in a churn model is a feature like "number of support contacts in the final 30 days," since customers who are about to leave often contact support right before doing so -- that feature is only knowable after the fact, so I would recompute it as "support contacts in the 30 days ending at the cutoff," strictly excluding anything after it, and I would specifically audit any feature with a name like "final," "last," or "before cancellation" for this pattern.</p>
<p>For target leakage, I would look hard at any feature that is really a byproduct of the churn event itself rather than a predictor of it -- something like a "cancellation flow started" flag would leak the outcome directly, since it only exists because the customer was already leaving. I would drop anything where the honest answer to "would this value exist if the customer had not churned" is no.</p>
<p>For train-test leakage, I would compute every scaling statistic, imputation value, and any target encoding using only the training split, and for target encoding specifically I would use out-of-fold averages so a row's own label never contributes to its own encoded feature.</p>
<p>Finally, for evaluation, I would split by time -- train on earlier months, validate on a later month -- rather than a random shuffle, because a random split lets future months leak backward into training and does not test what the model will actually face: predicting forward in time it has never seen.</p>`
      },
      {
        id: 'dag-a3',
        type: 'drill',
        title: 'Classify the shift, and pick a detection method',
        prompt: 'I will describe three situations. For each, tell me quickly whether it is covariate shift, label shift, or concept drift, and how you would detect it in production. (1) A recommendation model\'s click-through rate drops after a UI redesign changes where recommendations are shown on the page, with no change in which items get clicked once seen. (2) A demand forecasting model starts under-predicting during a holiday season it was never trained on, even though the same seasonal patterns existed in history it simply was not shown. (3) A pricing model\'s elasticity assumptions stop holding after a new competitor enters the market, changing how customers respond to the same price at the same product.',
        timeboxSec: 180,
        rubric: 'Must-haves: (1) situation 1 is closer to a covariate shift or a broken assumption about the serving context (the input distribution of "where and how the item is shown" changed) rather than concept drift on the item-level relevance relationship itself, and is detectable by monitoring input/context feature distributions; (2) situation 2 is a data or training gap rather than a true shift -- correctly flags that the model never saw holiday seasonality in training, so this is closer to an underfitting/missing-feature problem than a live distribution shift, and the fix is adding the missing seasonal history or features, not shift detection; (3) situation 3 is concept drift -- the same price and product now produce a different customer response because a new competitor changed the relationship P(response|price), and detecting it needs a monitored business metric (actual conversion versus predicted) against fresh outcomes, since the price feature itself has not moved. Bonus: names PSI or a similar distributional distance for the covariate case. Common mistakes: calling every one of the three "concept drift" without distinguishing them; missing that scenario 2 is a training-data gap rather than a live shift. {{HONESTY}}',
        model: `<p>Situation 1: this is best read as a shift in the serving context rather than concept drift in what customers actually find relevant -- the redesign changed the input distribution the model is scored against (where and how an item is shown), while the underlying "is this item relevant to this customer" relationship has not changed. I would detect it by monitoring the distribution of context features like placement and comparing pre- and post-redesign CTR by placement, not by assuming the model itself degraded.</p>
<p>Situation 2: I would not call this a live distribution shift at all -- it is a training data gap. If the same seasonal pattern existed historically but the model was simply never trained on a holiday period, the fix is adding that history or explicit seasonal features, not shift monitoring, because nothing about the world changed between training and deployment; the model was undertrained for a regime it will predictably face every year.</p>
<p>Situation 3: this is concept drift. The price is the same, the product is the same, but a new competitor has changed how customers respond to that price -- the relationship P(response|price) has moved, not the price distribution itself. Since the input features look unchanged, I would not expect to catch this from feature monitoring; I would need to track actual conversion or revenue against the model's predictions on fresh data, and treat a growing gap between predicted and real elasticity as the trigger to retrain or refit the demand curve.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    glossary: {
      g: 'Data, features and generalisation',
      sub: 'The words for why a model that trains well may not generalise, and what to do about each cause.',
      rows: [
        ['i.i.d.', 'Independent and identically distributed: each observation is drawn from the same distribution and does not inform the next.', 'The standard assumption behind most ML theory.', ''],
        ['MCAR / MAR / MNAR', 'Missing completely at random; missing depending on other observed columns; missing depending on the value itself.', 'Deciding whether imputation is safe.', ''],
        ['Target encoding', 'Replacing a category with the average target value for that category, smoothed toward the global average for rare categories.', 'High-cardinality categorical features.', ''],
        ['Train-test leakage', 'A statistic fit on the full dataset (scaling, encoding, selection) before splitting into train and test.', 'The most common accidental leak in a pipeline.', ''],
        ['Temporal leakage', 'A feature computed using information from after the moment a real prediction would have been made.', 'Any model trained on historical, time-ordered data.', ''],
        ['Target leakage', 'A feature that is really a downstream consequence of the label, not a genuine predictor of it.', 'Features with suspicious near-perfect predictive power.', ''],
        ['Empirical risk minimisation', 'Training as minimising average loss on the training sample: θ_hat = argmin of average loss over the training data.', 'What every training loop is actually doing.', ''],
        ['Bias (statistical)', 'Systematic error from a model too simple to capture the true relationship.', 'Underfitting.', ''],
        ['Variance (statistical)', 'How much a fitted model changes if retrained on a different sample from the same population.', 'Overfitting.', ''],
        ['L1 / L2 regularisation', 'A penalty on the sum of absolute weights, or the sum of squared weights, added to the loss.', 'Controlling variance; L1 also performs feature selection.', ''],
        ['Learning curve', 'Training and validation error plotted against training set size, used to diagnose bias versus variance.', 'Deciding whether to collect more data or add regularisation.', ''],
        ['PAC learning', 'A framework guaranteeing that enough i.i.d. samples make a well-fitting model generalise well, with high probability.', 'The formal justification for "more data helps, up to a point."', ''],
        ['Covariate shift', 'The input distribution P(X) changes; the true P(Y|X) relationship does not.', 'A changed user population or acquisition channel.', ''],
        ['Concept drift', 'The relationship P(Y|X) itself changes over time.', 'An adaptive adversary, or a market genuinely changing.', ''],
        ['Population stability index (PSI)', 'A binned measure of how far a live feature distribution has moved from its training distribution.', 'The standard covariate-shift monitoring metric.', '']
      ]
    }
  };

}(typeof window !== 'undefined' ? window : this));
