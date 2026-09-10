/* ml-foundations-b: two core chapters -- the classical models that still run most production ML, and how to evaluate and select between them honestly. */
(function (root) {
  'use strict';
  root.PREP_CORE = root.PREP_CORE || {};

  root.PREP_CORE['classical-models'] = {
    id: 'classical-models',
    title: 'Classical machine learning models',
    level: 'danger',
    levelLabel: 'Asked in almost every machine learning interview, from the first screen to the on-site.',
    why: `Most production ML is not a large neural network; it is a regression, a tree ensemble, or a clustering step, chosen because it is fast, explainable, and good enough. An interviewer uses this chapter to check that you know what each model actually optimises, what it assumes about the data, and where it breaks -- not just its name. Being able to say why gradient boosting usually beats a neural network on a spreadsheet of numbers, or why a tree ensemble needs no feature scaling, is what separates someone who has used a library from someone who understands the model underneath it.`,
    readings: [
      { l: 'StatQuest -- Decision Trees, Clearly Explained', u: 'https://www.youtube.com/watch?v=7VeUPuFGJHk', w: 'The clearest walkthrough of how a tree actually picks a split and why depth is what causes overfitting.', m: 18 },
      { l: 'StatQuest -- Random Forests Part 1: Building, Using and Evaluating', u: 'https://www.youtube.com/watch?v=J4Wdy0Wc_xQ', w: 'Bagging, feature subsampling and out-of-bag error explained with one worked dataset.', m: 10 },
      { l: 'StatQuest -- Gradient Boost Part 1: Regression Main Ideas', u: 'https://www.youtube.com/watch?v=3CC4N4z3GJc', w: 'The clearest introduction to why boosting fits each new tree to the previous errors, before the algebra gets heavier in later parts.', m: 16 },
      { l: 'XGBoost docs -- Introduction to Boosted Trees', u: 'https://xgboost.readthedocs.io/en/stable/tutorials/model.html', w: 'The primary source for how XGBoost scores a tree structure and regularises leaf weights, written by the library\'s own authors.', m: 20 },
      { l: 'LightGBM docs -- Features', u: 'https://lightgbm.readthedocs.io/en/latest/Features.html', w: 'Explains leaf-wise growth and histogram binning directly, which is exactly what differs from XGBoost\'s defaults.', m: 12 },
      { l: 'scikit-learn user guide -- Probability calibration', u: 'https://scikit-learn.org/stable/modules/calibration.html', w: 'The reference explanation of reliability diagrams, Platt (sigmoid) scaling and isotonic regression, with the exact formulas used in this chapter.', m: 15 },
      { l: 'StatQuest -- Logistic Regression', u: 'https://www.youtube.com/watch?v=yIYKR4sgzI8', w: 'Builds the sigmoid and log-odds picture from scratch before the formulas in this chapter.', m: 9 },
      { l: 'Christoph Molnar -- Interpretable Machine Learning: SHAP', u: 'https://christophm.github.io/interpretable-ml-book/shap.html', w: 'The clearest plain-language explanation of Shapley values as fair credit-splitting, with the traps of the naive per-feature interpretation.', m: 25 }
    ],
    learn: [
      {
        id: 'cm-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Feature, label</b> -- an input a model uses to predict (a customer's age); the value it is trying to predict (whether they churn).</li>
<li><b>Residual</b> -- actual value minus predicted value, for one row.</li>
<li><b>Least squares, normal equation</b> -- fitting a line by minimising the sum of squared residuals; the closed-form formula that solves this directly instead of searching for it.</li>
<li><b>Multicollinearity</b> -- when two or more features carry almost the same information, which makes their individual coefficients unstable and hard to trust.</li>
<li><b>Sigmoid, logit</b> -- the S-shaped function that squashes any real number into a probability between 0 and 1; the raw, un-squashed score fed into it.</li>
<li><b>Log loss</b> -- the standard classification loss, which grows sharply as a confident prediction turns out to be wrong.</li>
<li><b>Odds</b> -- the probability an event happens divided by the probability it does not.</li>
<li><b>Generalised linear model (GLM)</b> -- a family that predicts a transformed version of the target's average using a linear combination of features, so the same idea fits probabilities, counts, and other kinds of outcome.</li>
<li><b>Regularisation</b> -- adding a penalty for large coefficients to a model's loss, to stop it fitting noise.</li>
<li><b>Ridge (L2), lasso (L1), elastic net</b> -- a penalty on the sum of squared coefficients; a penalty on the sum of their absolute values, which can push some to exactly zero; a mix of both.</li>
<li><b>Calibration, reliability diagram</b> -- how closely a model's predicted probabilities match the true frequency of the outcome; the plot of predicted probability against observed frequency used to check it.</li>
<li><b>Gini impurity, entropy</b> -- two different ways to score how mixed the classes are inside a group of examples; a tree split is chosen to reduce whichever one it uses.</li>
<li><b>Bagging, out-of-bag (OOB) error</b> -- training many models on different random resamples of the data and averaging them; the free error estimate each bagged model gets from the rows it never happened to see.</li>
<li><b>Boosting, learning rate</b> -- building models one at a time, each one trained to correct the previous ones' errors; how much of each new correction actually gets added in.</li>
<li><b>Feature importance, permutation importance, SHAP value</b> -- a score for how much a feature drove a model's predictions; one version of that score from shuffling the feature and watching accuracy drop; a game-theoretic version that splits one prediction fairly among its features.</li>
<li><b>Support vector machine (SVM), margin, kernel trick</b> -- a classifier that finds the widest possible gap between two classes; the width of that gap; computing similarity as if the data had been mapped into a higher-dimensional space, without ever building that space.</li>
<li><b>Naive Bayes</b> -- a classifier that applies Bayes' rule while assuming every feature is independent of every other feature, given the class.</li>
<li><b>Gaussian mixture model (GMM), Expectation-Maximisation (EM)</b> -- a model that treats data as coming from a few overlapping bell-curve clusters; the two-step algorithm (soft-assign points, then refit each cluster) used to fit it.</li>
<li><b>k-means, centroid</b> -- a clustering algorithm that repeatedly assigns points to their nearest cluster centre and moves each centre to its cluster's mean; that centre.</li>
<li><b>DBSCAN</b> -- a clustering algorithm that groups points sitting in dense neighbourhoods together and calls sparse points noise, without being told how many clusters to expect.</li>
<li><b>Principal component analysis (PCA)</b> -- re-expressing data using the directions along which it varies the most, using fewer of them than the original features.</li>
<li><b>Isolation forest, autoencoder</b> -- an anomaly detector that isolates unusual points with fewer random splits than normal ones; a neural network that flags anomalies by how badly it reconstructs them after squeezing them through a narrow bottleneck.</li>
</ul>`,
        deeper: `<p>Almost every term above reduces to one of two questions: what is this model actually minimising, and what does it assume about the data to do that safely. If you can answer both for every algorithm in this chapter, you can reconstruct any of the formulas below under pressure instead of having memorised them.</p>`,
        check: {
          question: 'Ridge regression and lasso regression both add a penalty to the training loss. What is the practical difference between what the two penalties do to the fitted coefficients?',
          options: [
            'They are mathematically identical; the only difference is which library implements them',
            'Ridge shrinks every coefficient smoothly toward zero without ever setting one exactly to zero; lasso can shrink some coefficients all the way to exactly zero',
            'Lasso always produces a more accurate model, because it always removes the irrelevant features',
            'Ridge is only usable for classification models and lasso only for regression models'
          ],
          answer: 1,
          explain: 'Ridge penalises the sum of squared coefficients, which shrinks everything continuously; lasso penalises the sum of absolute coefficients, whose penalty region has a corner that a coefficient can sit exactly on, zeroing it out. Neither is universally more accurate -- it depends on whether the true relationship really uses only a few features.'
        }
      },
      {
        id: 'cm-f1',
        part: 'field',
        title: 'Linear regression and regularised regression',
        viz: 'ridge-vs-lasso',
        body: `<p>Linear regression fits a straight line (or hyperplane) by choosing coefficients that make the sum of squared residuals as small as possible -- <b>least squares</b>. For most datasets this has a closed-form answer, the <b>normal equation</b>: <code>beta = inverse(X'X) X'y</code>, where <code>X</code> is the matrix of features (with a column of 1s for the intercept) and <code>y</code> is the target. No search, no learning rate -- just linear algebra, as long as <code>X'X</code> is invertible.</p>
<p>That formula is only trustworthy if a few assumptions roughly hold: the true relationship is linear in the features; residuals are independent of each other; residuals have roughly constant spread across the range of predictions (<b>homoscedasticity</b>); and features are not near-duplicates of each other (severe <b>multicollinearity</b> makes <code>X'X</code> close to singular, so tiny changes in the data swing the coefficients wildly). <b>Residual diagnostics</b> check these: plot residuals against predicted values and look for a fan shape (heteroscedasticity) or a curve (missed non-linearity); a quantile-quantile plot checks whether residuals are close to normally distributed, which matters for the model's confidence intervals rather than for the point predictions themselves.</p>
<p><b>Regularisation</b> adds a penalty for large coefficients on top of the squared-error loss. Ridge (L2) penalises the sum of squared coefficients, which shrinks every coefficient toward zero and handles correlated features gracefully by spreading the weight across them. Lasso (L1) penalises the sum of absolute coefficients; because the L1 penalty region has a corner, the optimum often sits exactly on it, zeroing out some coefficients -- lasso performs feature selection as a side effect of fitting. Elastic net mixes both penalties, which is useful when features are correlated and a pure lasso would arbitrarily keep one and drop the rest.</p>`,
        deeper: `<p>Worked example of the shrinkage: with one feature and a ridge penalty lambda, the fitted slope becomes <code>(sum of xy) / (sum of x^2 + lambda)</code> instead of plain least squares' <code>(sum of xy) / (sum of x^2)</code> -- larger lambda visibly divides the slope down toward zero without ever reaching it exactly, which is the algebraic reason ridge never produces a hard zero.</p>`,
        check: {
          question: 'A linear regression\'s residuals fan out much wider for large predicted values than for small ones. Which assumption does this violate, and what should you check first?',
          options: [
            'It violates linearity; you should add polynomial features immediately',
            'It violates homoscedasticity; you should consider a variance-stabilising transform of the target or weighted least squares',
            'It violates independence; you should collect more data',
            'Nothing is wrong -- residuals are expected to grow with the prediction'
          ],
          answer: 1,
          explain: 'A fanning-out pattern in a residual-vs-fitted plot is the classic sign of heteroscedasticity: the errors do not have constant variance. It does not by itself indicate non-linearity (that shows up as a curved pattern) or dependence between observations.'
        }
      },
      {
        id: 'cm-f2',
        part: 'field',
        title: 'Logistic regression and generalised linear models',
        viz: 'sigmoid-threshold',
        body: `<p>Logistic regression predicts a probability by passing a linear score through the <b>sigmoid</b> function: <code>p = 1 / (1 + e^-z)</code>, where <code>z = w1*x1 + w2*x2 + ... + b</code>. Any real-valued <code>z</code> maps to a number strictly between 0 and 1. The model is trained by minimising <b>log loss</b>: <code>-(y * log(p) + (1-y) * log(1-p))</code>, averaged over all rows. This is not an arbitrary choice -- it is exactly the negative log-likelihood of the data under a Bernoulli model, so minimising it is maximum likelihood estimation for a yes/no outcome, and it punishes a confident wrong prediction (say p = 0.99 for a true negative) far more harshly than an unsure one.</p>
<p>Each coefficient has a clean reading in terms of <b>odds</b>: exponentiating a coefficient gives the multiplicative change in the odds of the positive class for a one-unit increase in that feature, holding the others fixed. A coefficient of 0.7 means <code>e^0.7 ≈ 2.01</code> -- the odds roughly double. The default <b>decision threshold</b> of p = 0.5 is just a convention; moving it up trades fewer false positives for more false negatives, and it should be set by the actual cost of each error type, not left at 0.5 by default.</p>
<p>Logistic regression is one member of a larger family, <b>generalised linear models</b>: instead of predicting the target directly, a GLM predicts a transformed version of its average through a link function, using the same linear score underneath. Poisson regression is the GLM for counts (number of claims, number of clicks): it uses a log link, so <code>log(expected count) = z</code>, guaranteeing a positive prediction, and it assumes the outcome's variance equals its mean; when real data is noisier than that (over-dispersion), a negative binomial model is used instead.</p>`,
        deeper: `<p>Log loss is convex in the coefficients for logistic regression (unlike, say, a neural network's loss), so gradient descent on it is guaranteed to find the global optimum -- one reason logistic regression remains a dependable baseline even when a more complex model is the eventual choice.</p>`,
        check: {
          question: 'A logistic regression coefficient for "years since signup" is -0.4. What does that tell you?',
          options: [
            'A one-year increase in tenure decreases the probability of the outcome by exactly 0.4',
            'A one-year increase in tenure multiplies the odds of the outcome by about e^-0.4 ≈ 0.67, i.e. the odds fall by roughly a third',
            'The feature has no real effect because the coefficient is negative',
            'The coefficient cannot be interpreted without first standardising every feature'
          ],
          answer: 1,
          explain: 'Logistic regression coefficients act on the log-odds, so exponentiating converts them into a multiplicative change in the odds, not a direct change in probability. e^-0.4 is about 0.67, so the odds shrink to roughly two-thirds of what they were per extra year.'
        }
      },
      {
        id: 'cm-f3',
        part: 'field',
        title: 'Probability calibration',
        body: `<p>A classifier is <b>calibrated</b> if, among all the rows it assigns a probability of 0.7, roughly 70% actually belong to the positive class. Accuracy and AUC only care about whether positive rows score higher than negative ones, not whether the actual numbers mean anything -- so a model can rank perfectly and still be badly calibrated. This matters whenever a downstream decision multiplies the probability by something, such as an expected-value calculation.</p>
<p>A <b>reliability diagram</b> checks this directly: bucket predictions into ranges (0.0-0.1, 0.1-0.2, and so on), and for each bucket plot the average predicted probability against the observed fraction of positives. A perfectly calibrated model traces the diagonal; a curve sagging below the diagonal means the model is overconfident about the positive class.</p>
<p>Two standard fixes, both fit on a held-out slice of data, never on the training fold itself: <b>Platt scaling</b> fits a one-dimensional logistic regression on top of the model's raw scores, <code>p_calibrated = 1 / (1 + e^-(A*score + B))</code>, learning just two numbers; it works well with little data and when the miscalibration is roughly symmetric. <b>Isotonic regression</b> fits any non-decreasing step function instead of a fixed sigmoid curve, which corrects more general distortions but needs more data (a common rule of thumb is at least 1,000 examples) or it will overfit the calibration curve itself.</p>
<p>Boosted trees and neural networks are both routinely miscalibrated, for different reasons. A tree ensemble's leaf averages get pulled toward the extremes as the boosting rounds keep correcting toward the training labels, pushing predicted probabilities toward 0 or 1 more than the data supports. A large neural network trained with cross-entropy has enough capacity to drive training loss very low while becoming systematically overconfident on new data -- a well-documented result once accuracy keeps improving with deeper networks while calibration quietly gets worse.</p>`,
        deeper: `<p>Isotonic regression's extra flexibility is a double-edged sword: because it can fit any monotonic shape, it can also introduce ties between formerly distinct scores, which slightly hurts ranking-based metrics like AUC even as it improves calibration -- a genuine trade-off, not a free upgrade.</p>`,
        check: {
          question: 'You have 300 labelled examples to calibrate a model that already ranks well but looks overconfident. Which calibration method is the safer choice, and why?',
          options: [
            'Isotonic regression, because it is more flexible and flexibility is always better',
            'Platt scaling, because it only fits two parameters and is less likely to overfit on a small calibration set',
            'Neither works without at least 100,000 labelled examples',
            'Retraining the whole model from scratch is the only way to fix calibration'
          ],
          answer: 1,
          explain: 'Isotonic regression\'s flexibility becomes a liability on small calibration sets, where it can overfit the noisy empirical curve. Platt scaling fits only two numbers, so it degrades much more gracefully with limited data.'
        }
      },
      {
        id: 'cm-f4',
        part: 'field',
        title: 'Decision trees',
        viz: 'tree-split',
        body: `<p>A decision tree grows by repeatedly asking the single best yes/no question it can find. At every node, for every feature and every candidate threshold, it measures how much purer the two resulting groups would be than the current group, and keeps the split with the largest gain.</p>
<p><b>Gini impurity</b> for a group is <code>1 - sum(p_i^2)</code> over its classes; it is 0 for a pure group and highest when classes are evenly mixed. <b>Entropy</b> is <code>-sum(p_i * log2(p_i))</code>, measured in bits; a split's <b>information gain</b> is the parent's entropy minus the weighted average entropy of the children. The two criteria usually pick very similar splits in practice -- Gini is slightly cheaper to compute (no logarithm) and is scikit-learn's and most libraries' default.</p>
<p>Worked example: a node has 10 examples, 5 of each class (Gini = 0.5). A candidate split sends 6 examples left (5 of class A, 1 of class B: Gini = 1 - (5/6)^2 - (1/6)^2 ≈ 0.278) and 4 right (0 of class A, 4 of class B: Gini = 0). The weighted child impurity is <code>(6/10)*0.278 + (4/10)*0 ≈ 0.167</code>, so the gain is <code>0.5 - 0.167 = 0.333</code> -- a strong split, since one side is already pure.</p>
<p>Left unchecked, a tree keeps splitting until every leaf is pure, memorising the training set including its noise -- classic overfitting, visible as near-perfect training accuracy alongside poor validation accuracy. The usual controls are a maximum depth, a minimum number of examples required to split or to form a leaf, a minimum impurity decrease required to accept a split, or growing the full tree and then <b>pruning</b> back branches that do not improve validation performance (cost-complexity pruning). Any one of these trades training fit for a tree that generalises.</p>`,
        deeper: `<p>A single tree's decision boundary is always made of axis-aligned rectangles, since every split tests one feature against one threshold -- this is precisely why a tree needs an ensemble around it (random forest or boosting) to approximate a smooth or diagonal boundary well.</p>`,
        check: {
          question: 'A fully grown decision tree gets 99.8% accuracy on its training set and 71% on a held-out validation set. What does that gap most directly tell you, and what is the most direct fix?',
          options: [
            'The tree is underfitting; add more features',
            'The tree has memorised training-set noise; limit its depth, raise the minimum samples per leaf, or prune it',
            'The impurity criterion (Gini vs entropy) was chosen wrong',
            'The gap is normal and does not need to be addressed'
          ],
          answer: 1,
          explain: 'Near-perfect training accuracy next to much worse validation accuracy is the signature of a tree grown too deep, fitting the specific training rows rather than the general pattern. Depth limits, leaf-size minimums, and pruning are the standard direct fixes; switching impurity criteria rarely changes this much.'
        }
      },
      {
        id: 'cm-f5',
        part: 'field',
        title: 'Random forests and feature importance',
        body: `<p>A random forest fits many decision trees and averages their votes (classification) or predictions (regression). Two sources of randomness keep the trees different from each other, which is what makes averaging them help: <b>bagging</b> draws a bootstrap sample -- <code>n</code> rows drawn with replacement from the training set of size <code>n</code> -- for each tree, and at every split each tree is only allowed to consider a random subset of the features (commonly the square root of the total feature count for classification), rather than all of them. Without that feature subsampling, every tree would tend to split on the same strongest feature first and end up highly correlated, which defeats the point of averaging.</p>
<p>Because each bootstrap sample leaves out roughly <code>1/e ≈ 36.8%</code> of the rows on average, every tree has a small, free validation set: the rows it never trained on. Averaging each row's predictions across only the trees that treated it as out-of-bag gives the <b>out-of-bag (OOB) error</b> -- an estimate of generalisation error with no separate holdout set and no extra training runs.</p>
<p><b>Feature importance</b> answers "which inputs mattered," measured three common ways. Impurity-based importance sums, for each feature, how much it reduced impurity across every split where it was used, weighted by how many samples reached that node -- fast, but biased toward continuous or high-cardinality features that simply offer more possible split points, and measured on training data so it can overstate the influence of an overfit feature. Permutation importance shuffles one feature's values on held-out data and measures how much the model's performance drops -- more reliable and comparable across feature types, at the cost of one extra prediction pass per feature. SHAP values go further, splitting a single prediction's distance from the model's average output fairly across its features, using a game-theoretic rule (Shapley values) originally built to divide credit among players in a cooperative game; TreeSHAP makes this exact and fast for tree ensembles specifically.</p>
<p>The common trap with all three: when two features are highly correlated, the model can use either one, so the true joint importance often gets split between them, making each one individually look less important than it really is.</p>`,
        deeper: `<p>Worked intuition for the correlated-feature trap: if "account age in days" and "account age in months" are both in the data, a tree splitting on either gets almost the same impurity reduction, so the forest uses them interchangeably across its trees -- impurity-based importance can then rank both as merely "medium," even though a version of the model with only one of them would rank that single feature as clearly top.</p>`,
        check: {
          question: 'A random forest\'s impurity-based feature importance ranks a randomly generated ID column as the single most important feature. What is the most likely explanation?',
          options: [
            'The ID column genuinely predicts the outcome and should be kept',
            'Impurity-based importance is biased toward high-cardinality features that offer many possible split points, even when they carry no real signal; permutation importance on held-out data would likely show this differently',
            'The forest was trained with too few trees',
            'Gini impurity cannot be used with categorical features'
          ],
          answer: 1,
          explain: 'A near-unique ID column gives the tree-building algorithm an enormous number of candidate thresholds to exploit for spurious impurity reduction on the training data specifically. Permutation importance, measured on held-out data, does not reward this and would expose the ID column as useless.'
        }
      },
      {
        id: 'cm-f6',
        part: 'field',
        title: 'Gradient boosting',
        viz: 'boosting-residuals',
        body: `<p>Gradient boosting builds trees one at a time, and each new tree is trained to predict the mistakes the current ensemble is still making -- for squared-error regression, that mistake is literally the residual, <code>actual - predicted</code>; for other losses it is the negative gradient of the loss with respect to the current prediction, which is where the name comes from. Each new tree's output is scaled by a <b>learning rate</b> before being added to the running prediction, so no single tree can swing the model too far; a smaller learning rate needs more trees but usually generalises better.</p>
<p>XGBoost and LightGBM are both gradient-boosted tree libraries but differ in how they grow each tree. XGBoost's default grows trees level by level (every node at the current depth is considered before going deeper) and adds explicit L1 and L2 penalties on the leaf weights directly inside its optimisation, plus a built-in rule for handling missing values. LightGBM grows leaf-wise: at each step it picks the single leaf across the whole tree whose split would reduce loss the most, which reaches a lower loss for the same total number of leaves but can overfit faster on small datasets without a depth cap. LightGBM also bins continuous features into histograms by default, trading a little precision for much faster split-finding, and can split directly on categorical features without one-hot encoding them.</p>
<p>The hyperparameters that matter most: the number of trees, the learning rate (these two trade off directly), the tree depth or number of leaves, the fraction of rows and columns sampled per tree (subsample, colsample), a minimum number of samples required in a leaf, and the L1/L2 regularisation strength. Gradient boosting wins so often on tabular data because it handles messy, non-smooth, and interacting features without any scaling, copes natively with missing values, and its additive sequential correction can approximate almost any function to arbitrary precision given enough shallow trees -- exactly the setting where a single linear model is too rigid and a plain neural network has no strong inductive bias to exploit.</p>`,
        deeper: `<p>Early stopping is what makes the learning-rate/number-of-trees trade-off practical: rather than guessing the right number of rounds, train with a small learning rate and a large maximum number of trees, watch validation loss after every round, and stop once it has not improved for a fixed number of rounds -- this gets close to the best possible number of trees automatically.</p>`,
        check: {
          question: 'You switch a gradient boosting model from level-wise growth to leaf-wise growth with the same number of total leaves, on a dataset of only 2,000 rows. What is the most likely trade-off?',
          options: [
            'No change at all -- leaf-wise and level-wise growth always produce identical trees',
            'Leaf-wise growth will likely fit the training data more closely but is more prone to overfitting on this small dataset, so depth limits matter more',
            'Leaf-wise growth is strictly worse and should never be used',
            'Leaf-wise growth removes the need for a learning rate'
          ],
          answer: 1,
          explain: 'Leaf-wise growth (LightGBM\'s default) reaches lower training loss for a fixed leaf budget by always splitting the most promising leaf, but that same greediness makes it more likely to carve out small, noise-fitting regions on small datasets, so a depth cap or larger min-data-in-leaf setting matters more than with level-wise growth.'
        }
      },
      {
        id: 'cm-f7',
        part: 'field',
        title: 'Support vector machines and the kernel trick',
        viz: 'svm-margin',
        body: `<p>A support vector machine looks for the decision boundary that separates two classes with the widest possible gap, the <b>margin</b>, rather than just any boundary that happens to separate them. Only the points closest to that boundary -- the <b>support vectors</b> -- actually determine where it sits; moving any other point without crossing the margin does not change the fitted line at all.</p>
<p>The SVM is trained by minimising <b>hinge loss</b>: <code>max(0, 1 - y*f(x))</code>, where <code>y</code> is the true label (+1 or -1) and <code>f(x)</code> is the model's raw score. A point that is correctly classified and sits beyond the margin contributes zero loss; a point inside the margin, on the boundary, or on the wrong side contributes a penalty that grows linearly the further wrong it is. This is different from log loss, which never reaches exactly zero for any finite score -- hinge loss can be exactly satisfied, which is part of why the fitted boundary depends only on the support vectors and not on every point.</p>
<p>Real data is rarely linearly separable, which is where the <b>kernel trick</b> comes in. Instead of explicitly mapping every point into a higher-dimensional space where it might become separable, a kernel function <code>K(x, x')</code> computes what the dot product between two points would be in that higher-dimensional space directly, without ever constructing it. The <b>RBF (Gaussian) kernel</b>, <code>K(x, x') = exp(-gamma * ||x - x'||^2)</code>, behaves like an infinite-dimensional feature map and is the default choice when the boundary is expected to be smoothly curved rather than a straight line.</p>
<p>SVMs still make sense on small-to-medium, high-dimensional datasets where a clear margin is plausible -- text classification on bag-of-words features was a classic use case before embeddings became standard -- and when a principled maximum-margin guarantee matters more than raw predictive power. They scale poorly to large datasets, since standard training cost grows roughly quadratically to cubically with the number of rows, which is the main reason gradient boosting and neural networks have displaced them on most large tabular and unstructured problems.</p>`,
        deeper: `<p>The margin width in the separable case works out to <code>2 / ||w||</code>, where <code>w</code> is the weight vector defining the boundary -- so minimising <code>||w||</code> subject to correctly classifying every point (with margin) is exactly the same optimisation problem as "find the widest gap," just written in a different but equivalent form.</p>`,
        check: {
          question: 'In a trained SVM, a training point far from the decision boundary, correctly classified and well outside the margin, is moved slightly further from the boundary. What happens to the fitted boundary?',
          options: [
            'It shifts slightly toward the moved point',
            'It does not change at all, because that point is not a support vector',
            'The whole model must be retrained from scratch and could produce an unrelated boundary',
            'The margin automatically widens'
          ],
          answer: 1,
          explain: 'Only support vectors -- points on or inside the margin -- influence where an SVM\'s boundary sits, because hinge loss is exactly zero for any point already correctly classified beyond the margin, contributing nothing to the objective the boundary was fit to minimise.'
        }
      },
      {
        id: 'cm-f8',
        part: 'field',
        title: 'Probabilistic models',
        body: `<p><b>Naive Bayes</b> classifies by Bayes' rule -- <code>P(class | features) proportional to P(class) * P(features | class)</code> -- while assuming every feature is conditionally independent of every other feature given the class. That assumption is almost never literally true (in a spam filter, the words "free" and "prize" are correlated, not independent), yet naive Bayes remains a strong, fast baseline for text classification, because classification only needs the posterior probabilities to be ranked correctly across classes, not individually well-calibrated, and the independence assumption rarely flips that ranking.</p>
<p>A <b>Gaussian mixture model</b> represents the data as a weighted combination of a small number of overlapping Gaussian (bell-curve) clusters, each with its own mean, covariance, and weight, instead of forcing every point into exactly one hard cluster the way k-means does. It is fit with <b>Expectation-Maximisation</b>, alternating two steps until the numbers stop moving much: the E-step computes, for every point and using the current cluster parameters, a soft "responsibility" -- the probability it belongs to each cluster; the M-step then re-estimates each cluster's mean, covariance, and weight using those responsibilities as weights. Each full E-then-M cycle is guaranteed never to decrease the data's likelihood under the model, but EM only finds a local optimum, so the result depends on where the cluster parameters started.</p>
<p>This is a good place to tie back <b>maximum likelihood estimation (MLE)</b> and <b>maximum a posteriori (MAP)</b> estimation: MLE picks the parameter values that make the observed data most probable, using the data alone; MAP adds a prior belief about the parameters and picks the values that maximise the combination of that prior and the data's likelihood. The regularisation earlier in this chapter is exactly MAP estimation in disguise: a ridge penalty is what you get from MAP with a Gaussian prior on the coefficients, and a lasso penalty is what you get from MAP with a Laplace prior -- regularisation strength and prior sharpness are the same knob viewed from two different fields.</p>`,
        deeper: `<p>k-means is, in a real sense, a limiting case of a Gaussian mixture model: if every cluster is forced to have the same, very small, spherical covariance, EM's soft responsibilities collapse into k-means' hard nearest-centroid assignment, and the M-step's weighted mean becomes k-means' ordinary mean update.</p>`,
        check: {
          question: 'A ridge-regularised linear regression and a Bayesian linear regression with a Gaussian prior on the coefficients, evaluated at the MAP estimate, produce the same fitted coefficients. Why?',
          options: [
            'This is a coincidence specific to one dataset',
            'A Gaussian prior\'s effect on the MAP estimate is mathematically equivalent to an L2 penalty, so ridge regression is exactly MAP estimation under that prior',
            'Ridge regression secretly performs Expectation-Maximisation internally',
            'Both methods ignore the prior entirely once enough data is available'
          ],
          answer: 1,
          explain: 'MAP estimation maximises likelihood times prior; with a Gaussian prior centred at zero, the log of that prior is proportional to the negative sum of squared coefficients -- exactly the ridge penalty. Ridge regression and Gaussian-prior MAP estimation are two names for the same optimisation.'
        }
      },
      {
        id: 'cm-f9',
        part: 'field',
        title: 'Unsupervised learning',
        body: `<p><b>k-means</b> repeats two steps until nothing changes: assign every point to its nearest centroid, then move each centroid to the mean of the points now assigned to it. It always converges, but only to a local minimum of within-cluster squared distance, so it is normally run several times from different random starting centroids (or initialised with k-means++, which spreads the starting points out on purpose) and the best run is kept. Choosing <b>k</b> is a judgment call, guided by the elbow method (plot within-cluster sum of squares against k and look for where adding another cluster stops helping much) or the silhouette score (how much closer, on average, each point is to its own cluster than to the next-nearest one, ranging from -1 to 1).</p>
<p><b>Hierarchical clustering</b> builds a full tree of nested clusters (a dendrogram) by repeatedly merging the two closest clusters (agglomerative) according to a linkage rule -- single, complete, average, or Ward's -- and you cut the tree at whatever height gives the number of clusters you want, without deciding k up front. It costs more to compute (roughly quadratic to cubic in the number of points) and does not scale as well as k-means.</p>
<p><b>DBSCAN</b> takes a completely different view: given a neighbourhood radius <code>eps</code> and a minimum point count <code>minPts</code>, it marks any point with at least <code>minPts</code> neighbours within <code>eps</code> as a core point, grows clusters by chaining together connected core points, and labels anything left over as noise. It needs no k, can find oddly shaped clusters that k-means' round boundaries cannot, and naturally flags outliers, but it struggles when clusters have very different densities, since one <code>eps</code> rarely suits all of them.</p>
<p><b>PCA</b> reduces dimensionality by finding the directions (eigenvectors of the data's covariance matrix) along which the data varies the most, ranked by how much variance each one explains, and keeping only the top few. For <b>anomaly detection</b>: an <b>isolation forest</b> builds many trees of random feature/threshold splits and scores a point by how few splits it took to isolate it alone -- outliers are "few and different," so they isolate fast; an <b>autoencoder</b> is a neural network trained only to reconstruct its own input through a narrow bottleneck, and since it only ever learned to reconstruct normal-looking data well, an unusually large reconstruction error on a new point is the anomaly signal.</p>`,
        deeper: `<p>Worked contrast: on a dataset of two concentric rings of points, k-means with k=2 will cut straight through the middle regardless of the true ring structure, because it can only find round, convex clusters -- DBSCAN, with a well-chosen eps, correctly separates the two rings, because it follows density rather than distance to a single centroid.</p>`,
        check: {
          question: 'A dataset has two clusters shaped like crescents wrapped around each other, of similar density. Which clustering method is most likely to separate them correctly, and why?',
          options: [
            'k-means, because it always finds the globally optimal clusters',
            'DBSCAN, because it groups points by connected density rather than by distance to a single centroid, so it is not limited to round, convex cluster shapes',
            'Hierarchical clustering with single linkage always outperforms both on any dataset',
            'None of these methods can find non-convex clusters'
          ],
          answer: 1,
          explain: 'k-means assigns points to the nearest centroid, which only ever produces convex, roughly round regions, so it cannot represent interlocking crescents correctly. DBSCAN follows connected density instead, so it can trace an arbitrarily shaped cluster as long as the density along it stays above the eps/minPts threshold.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'cm-a1',
        type: 'explain',
        title: 'Explain why an accurate boosted-tree model can still be poorly calibrated',
        viz: 'calibration-curve',
        prompt: 'Your fraud model has an AUC of 0.94, which the team is happy with, but the fraud probabilities it outputs do not line up with the true fraud rate -- rows scored 0.8 are fraud only about 40% of the time. Walk me through why this can happen with a boosted-tree model, and how you would fix it, given about 5,000 held-out labelled examples.',
        timeboxSec: 300,
        rubric: 'Must-haves: (1) explains that AUC and accuracy only depend on ranking positives above negatives, not on whether the predicted numbers are meaningful probabilities, so a model can rank well and still be miscalibrated; (2) gives a concrete, plausible mechanism for why boosted trees tend toward overconfidence (successive rounds keep correcting leaf outputs toward the training labels, which pushes predictions toward the extremes); (3) proposes fitting a calibration step -- Platt scaling or isotonic regression -- on a held-out slice never used for training the model itself; (4) given the 5,000-example sample size, reasons about which calibration method fits better (Platt scaling with only two parameters is safer at that size than isotonic regression, though 5,000 is plausibly enough for isotonic too, so either defensible answer with correct reasoning is acceptable) and explicitly says the calibration set must be separate from the model\'s training data. Bonus: mentions checking a reliability diagram before and after to confirm the fix worked, or notes ranking metrics (AUC) will barely change since calibration only rescales, not reorders, the outputs. Common mistakes: proposing to retrain the whole model with a different loss function as the only fix; confusing calibration with accuracy improvement; calibrating on the training data itself. {{HONESTY}}',
        model: `<p>An AUC of 0.94 tells me the model separates fraud from non-fraud rows well in relative terms, but AUC never checks whether a score of 0.8 actually means an 80% chance of fraud. Those are different properties, and a model can have one without the other.</p>
<p>Gradient-boosted trees are especially prone to this because each new tree corrects the errors the ensemble is still making, and over many rounds that correction keeps pushing predictions toward the extremes -- 0 or 1 -- more aggressively than the true rates support.</p>
<p>I would fix this by fitting a calibration mapping on top of the existing scores, using a slice of labelled data the model never trained on -- reusing the training data would just calibrate the model to its own overconfidence. With about 5,000 examples, I would try Platt scaling first, since it only fits two parameters and is less likely to overfit a calibration curve at this size than isotonic regression, which fits a far more flexible step function. If the reliability diagram still shows a clear systematic bend after Platt scaling, I would try isotonic regression next and compare the two diagrams directly.</p>
<p>Either way, I would confirm the fix with a before-and-after reliability diagram, and expect AUC to stay roughly the same, since calibration rescales the outputs without changing which rows rank above which.</p>`
      },
      {
        id: 'cm-a2',
        type: 'design',
        title: 'Design a segmentation approach when nobody knows how many segments exist',
        viz: 'kmeans-steps',
        prompt: 'The marketing team wants to segment 200,000 customers by behaviour so they can target each group differently, but nobody can tell you how many segments make sense. Walk me through how you would approach this, including how you would decide on the number of segments and how you would sanity-check the result.',
        timeboxSec: 360,
        rubric: 'Must-haves: (1) proposes a concrete clustering approach (k-means is a reasonable default at this scale, given feature scaling; mentions that features must be scaled first since k-means uses raw distance) and states its assign/update mechanism briefly; (2) gives at least one concrete method for choosing the number of clusters -- the elbow method on within-cluster sum of squares, or a silhouette score -- rather than picking an arbitrary number; (3) acknowledges the scale (200,000 rows) as a reason k-means or a scalable variant is preferable to full hierarchical clustering, which would be expensive at this size; (4) proposes at least one concrete sanity check beyond the metric itself -- inspecting a sample of customers from each cluster with a human eye, checking cluster sizes are not wildly lopsided (one cluster with 195,000 customers is not a useful segmentation), or checking clusters are stable across re-runs with different random seeds. Bonus: mentions PCA or another dimensionality reduction step to visualise the clusters in 2D as an additional sanity check, or considers DBSCAN if segments are expected to be irregularly shaped rather than compact. Common mistakes: picking a cluster count with no stated method at all; ignoring feature scaling entirely; treating a good silhouette score as sufficient proof the segments are useful to the business without any human review. {{HONESTY}}',
        model: `<p>I would start with k-means, since it scales comfortably to 200,000 rows, but only after scaling every feature -- k-means uses raw distance, so an unscaled feature like annual spend in dollars would dominate one like logins per week purely because of its units.</p>
<p>To pick the number of clusters, I would run k-means across a range of k, plot within-cluster sum of squares against k, and look for the elbow where another cluster stops buying much improvement. I would also compute the silhouette score across the same range as a second opinion, since the elbow can be ambiguous, and prefer a k where both roughly agree.</p>
<p>Before handing anything to marketing, I would sanity-check the result three ways. First, check that cluster sizes are not wildly lopsided -- one cluster holding 190,000 of 200,000 customers means nothing was really separated, whatever the silhouette score says. Second, pull a sample of real customers from each cluster and read through their behaviour by hand, to see whether the clusters map to something a marketer could act on, like frequent-low-spend versus occasional-high-value. Third, re-run with different random seeds and check the clusters come out roughly stable, since instability suggests the structure is weak or k is wrong.</p>
<p>If the clusters looked irregularly shaped rather than compact blobs once visualised with PCA, I would also try DBSCAN, since k-means assumes roughly round, similarly sized clusters that do not always match real customer behaviour.</p>`
      },
      {
        id: 'cm-a3',
        type: 'drill',
        title: 'Explain what actually differs between XGBoost and LightGBM on the same dataset',
        prompt: 'You train both XGBoost and LightGBM with a similar number of leaves on the same tabular dataset, and get noticeably different trees and slightly different accuracy. What is actually different about how each one grew its trees, and how would you decide which one to use for a new project?',
        timeboxSec: 240,
        rubric: 'Must-haves: (1) correctly describes XGBoost\'s default level-wise (depth-wise) tree growth versus LightGBM\'s leaf-wise (best-first) growth; (2) explains the practical consequence: leaf-wise growth reaches lower training loss for the same leaf budget by always splitting the leaf with the largest expected gain, but is more prone to overfitting on smaller datasets without a depth cap; (3) mentions at least one other real implementation difference, such as LightGBM\'s default histogram binning for speed or native categorical feature support, or XGBoost\'s explicit L1/L2 leaf-weight regularisation terms; (4) gives a reasonable decision rule for choosing between them (dataset size, whether categorical features are present and how many, training speed requirements, or simply trying both and comparing on a validation set) rather than declaring one universally better. Bonus: notes that both are fundamentally the same gradient boosting algorithm, so the difference is engineering and default hyperparameters, not a different underlying method. Common mistakes: claiming one library is always more accurate than the other; confusing leaf-wise/level-wise growth with the number of trees or the learning rate; treating the two as fundamentally different algorithms rather than the same algorithm with different growth and engineering choices. {{HONESTY}}',
        model: `<p>Both are gradient boosting -- fitting trees sequentially to the current residual gradient -- so the algorithm is the same. What differs is how each grows a tree. XGBoost's default grows level by level: every node at the current depth is considered before going deeper. LightGBM grows leaf-wise: at each step it finds the single leaf, anywhere in the tree, whose split reduces loss the most.</p>
<p>Leaf-wise growth reaches lower training loss for the same leaf budget, since it always makes the locally best move. That is also its risk: on a smaller dataset, that greediness can carve out narrow regions fitting training noise, so LightGBM leans more on a max-depth cap or a minimum data-per-leaf setting.</p>
<p>Two other differences matter. LightGBM bins continuous features into histograms by default, trading a little precision for real speed and memory savings, and splits directly on categorical features without one-hot encoding. XGBoost's objective bakes explicit L1 and L2 penalties on leaf weights into the score used to evaluate each split.</p>
<p>In practice I would decide by situation: LightGBM for a large dataset where speed matters or categorical features are common; XGBoost for a smaller dataset where I am wary of leaf-wise overfitting, or where I already have a tuned pipeline. Failing a strong reason either way, I would try both with early stopping and compare validation performance.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    glossary: {
      g: 'Classical machine learning models',
      sub: 'The formulas and mechanisms an interviewer expects you to derive, not just name.',
      rows: [
        ['Normal equation', 'beta = inverse(X\'X) X\'y -- the closed-form solution to least squares linear regression.', 'Linear regression.', ''],
        ['Sigmoid', 'p = 1 / (1 + e^-z); squashes any real score into a probability.', 'Logistic regression, neural network output layers.', ''],
        ['Log loss', '-(y*log(p) + (1-y)*log(1-p)); the negative log-likelihood of a Bernoulli outcome.', 'Training loss for logistic regression and most binary classifiers.', ''],
        ['Ridge / lasso / elastic net', 'An L2, L1, or mixed penalty added to a regression loss to shrink or zero out coefficients.', 'Regularised linear and logistic regression.', ''],
        ['Gini impurity', '1 - sum(p_i^2) over the classes in a group; 0 means pure.', 'Decision tree splitting.', ''],
        ['Out-of-bag (OOB) error', 'A bagged model\'s error estimated from the rows each tree never trained on.', 'Random forests.', ''],
        ['Learning rate (boosting)', 'The fraction of each new tree\'s correction actually added to the running prediction.', 'Gradient boosting, XGBoost, LightGBM.', ''],
        ['Leaf-wise vs level-wise growth', 'Splitting the single most promising leaf anywhere in the tree, versus splitting every node at the current depth before going deeper.', 'LightGBM vs XGBoost defaults.', ''],
        ['SHAP value', 'A feature\'s fair share, by Shapley value, of a prediction\'s distance from the model\'s average output.', 'Model interpretability and feature importance.', ''],
        ['Hinge loss', 'max(0, 1 - y*f(x)); zero once a point is correctly classified beyond the margin.', 'Support vector machines.', ''],
        ['Kernel trick', 'Computing a similarity as if data were mapped to a higher-dimensional space, without building that space.', 'SVMs with non-linear (e.g. RBF) kernels.', ''],
        ['Reliability diagram', 'A plot of predicted probability against observed frequency, used to check calibration.', 'Probability calibration.', ''],
        ['Expectation-Maximisation (EM)', 'Alternating soft cluster assignment (E-step) and cluster refit (M-step) until convergence.', 'Gaussian mixture models.', ''],
        ['Elbow method / silhouette score', 'Two ways to choose k in clustering: where added clusters stop reducing within-cluster distance; how well-separated the clusters are.', 'k-means and related clustering.', ''],
        ['Isolation forest', 'An anomaly detector scoring points by how few random splits it takes to isolate them.', 'Unsupervised anomaly detection.', '']
      ]
    }
  };

  root.PREP_CORE['evaluation-and-selection'] = {
    id: 'evaluation-and-selection',
    title: 'Evaluation, metrics and model selection',
    level: 'danger',
    levelLabel: 'Asked in almost every machine learning interview, and in almost every take-home review of your work.',
    why: `A model is only as good as the number used to judge it, and picking the wrong number is the single most common way a strong-looking model turns out to be useless in production. Interviewers use this chapter to check whether you evaluate a model the way it will actually be used -- the right split, the right metric, the right comparison against chance -- rather than reaching for whatever scikit-learn prints by default. The gap between an offline metric and a business outcome is where most ML projects quietly fail, and being able to name that gap and close it is a large part of what separates a junior and a senior answer.`,
    readings: [
      { l: 'StatQuest -- ROC and AUC, Clearly Explained', u: 'https://www.youtube.com/watch?v=4jRBRDbJemM', w: 'Builds the ROC curve point by point from a confusion matrix, which is the fastest way to see what AUC actually measures.', m: 16 },
      { l: 'StatQuest -- Machine Learning Fundamentals: The Confusion Matrix', u: 'https://www.youtube.com/watch?v=Kdsp6soqA7o', w: 'A short, precise walkthrough of precision, recall and why a single accuracy number hides the trade-off between them.', m: 7 },
      { l: 'StatQuest -- Machine Learning Fundamentals: Cross Validation', u: 'https://www.youtube.com/watch?v=fSytzGwwBVw', w: 'The clearest short explanation of why a single train/test split is not enough and what k-fold buys you instead.', m: 6 },
      { l: 'scikit-learn user guide -- Cross-validation: evaluating estimator performance', u: 'https://scikit-learn.org/stable/modules/cross_validation.html', w: 'The reference for every split strategy in this chapter -- stratified, grouped, and time-series cross-validation -- with runnable examples.', m: 25 },
      { l: 'scikit-learn user guide -- Metrics and scoring: quantifying the quality of predictions', u: 'https://scikit-learn.org/stable/modules/model_evaluation.html', w: 'The exact formulas and edge cases for every classification and regression metric in this chapter.', m: 30 },
      { l: 'Google -- Rules of Machine Learning', u: 'https://developers.google.com/machine-learning/guides/rules-of-ml', w: 'Google\'s own field-tested guidance on tying metrics to real outcomes and watching for training-serving skew, from decades of shipping ML at scale.', m: 35 },
      { l: 'Evidently AI -- The confusion matrix, explained', u: 'https://www.evidentlyai.com/classification-metrics/confusion-matrix', w: 'A clear, practically oriented walkthrough of the confusion matrix with worked spam and fraud examples close to the ones in this chapter.', m: 12 },
      { l: 'Evan Miller -- How Not To Run An A/B Test', u: 'https://www.evanmiller.org/how-not-to-run-an-ab-test.html', w: 'The classic explanation of why checking an A/B test repeatedly and stopping early inflates false positives, and what to do instead.', m: 12 }
    ],
    learn: [
      {
        id: 'es-0',
        part: 'field',
        title: 'Key terms',
        body: `<ul>
<li><b>Train, validation, test split</b> -- the portion a model fits its parameters on; the portion used to choose between models or hyperparameters; the portion touched exactly once, at the end, for an unbiased final read.</li>
<li><b>Stratified split</b> -- a split that preserves the proportion of each class, so a rare class is not accidentally missing from one side.</li>
<li><b>Grouped split</b> -- a split that keeps every row belonging to one entity (one customer, one patient, one device) entirely on one side, so no information about that entity leaks across.</li>
<li><b>Time-based split</b> -- training on earlier data and evaluating on later data, matching how the model will actually be used.</li>
<li><b>k-fold cross-validation</b> -- rotating which fold is held out for evaluation across k splits and averaging the result, to reduce the variance of a single train/test split.</li>
<li><b>Nested cross-validation</b> -- an outer loop that estimates generalisation performance wrapped around an inner loop that searches hyperparameters, so the same data never both tunes and scores the model.</li>
<li><b>Leakage</b> -- information about the evaluation data reaching the model during training, making a reported metric optimistic and untrustworthy.</li>
<li><b>Confusion matrix, TP, FP, FN, TN</b> -- the 2x2 (or larger) table of predicted versus actual class; a correctly predicted positive; a negative wrongly predicted positive; a positive wrongly predicted negative; a correctly predicted negative.</li>
<li><b>Precision, recall, F1</b> -- of the rows predicted positive, the fraction actually positive; of the rows actually positive, the fraction caught; the harmonic mean of the two.</li>
<li><b>ROC curve, AUC</b> -- true positive rate plotted against false positive rate across every threshold; the probability a random positive scores higher than a random negative.</li>
<li><b>PR curve</b> -- precision plotted against recall across every threshold, more informative than ROC when positives are rare.</li>
<li><b>MAE, RMSE, MAPE, R-squared</b> -- mean absolute error; root mean squared error, which penalises large errors more; mean absolute percentage error; the fraction of the target's variance the model explains.</li>
<li><b>NDCG, MAP, MRR</b> -- ranking metrics: gain from relevant items discounted by how far down the list they appear, normalised against the best possible order; the average, across queries, of precision measured at each relevant result; the average, across queries, of 1 over the rank of the first relevant result.</li>
<li><b>Expected value, precision at k, lift</b> -- probability multiplied by the value of each outcome, summed; the fraction of the top k ranked items that are actually positive; how much better than the base rate a targeted segment performs.</li>
<li><b>Grid search, random search, Bayesian optimisation</b> -- trying every combination of hyperparameters; trying random combinations; using a model of past trial results to choose the next, more promising, hyperparameter combination to try.</li>
<li><b>Early stopping</b> -- stopping training once validation performance has not improved for a fixed number of rounds.</li>
<li><b>Slicing</b> -- evaluating a model separately on meaningful subgroups instead of only on the whole dataset at once.</li>
<li><b>A/B test, guardrail metric, interleaving</b> -- randomly splitting users between two versions to measure a causal difference; a secondary metric you watch to catch an unintended regression; mixing two systems' results into one list to compare them with far fewer users.</li>
<li><b>Statistical power, effect size, sample size</b> -- the chance a test detects a real effect if one exists; how large that real effect actually is; how many observations are needed to detect it reliably.</li>
</ul>`,
        deeper: `<p>Nearly every mistake in this chapter comes down to one of two things: comparing a metric to the wrong baseline (an ROC-AUC of 0.9 that still means an unusable number of false alarms), or letting information flow backward in time or across a split boundary that should have blocked it (leakage). Checking for both, every time, is worth more than knowing every formula by heart.</p>`,
        check: {
          question: 'A model gets 95% cross-validated accuracy in development but 80% accuracy once deployed. Before assuming the model is simply "worse in production," what should you check first?',
          options: [
            'Whether a more complex model would have scored higher in cross-validation',
            'Whether any preprocessing step (scaling, feature selection, target encoding) was fit on the full dataset before splitting into folds, letting test-fold information leak into training',
            'Whether the model used Gini impurity or entropy',
            'Whether the learning rate was tuned finely enough'
          ],
          answer: 1,
          explain: 'A large, otherwise unexplained gap between cross-validated and production performance is the classic fingerprint of leakage through the evaluation pipeline -- most often a preprocessing statistic fit before splitting, so every fold\'s "held-out" data quietly already influenced training.'
        }
      },
      {
        id: 'es-f1',
        part: 'field',
        title: 'Splitting data correctly',
        viz: 'data-split-time',
        body: `<p>A <b>train/validation/test split</b> exists because the same data cannot fairly do two jobs. The training set fits the model's parameters. The validation set is used to choose between models, features, and hyperparameters -- which means it gets looked at, and reacted to, many times during development. The test set is touched exactly once, at the very end, to report an honest estimate of how the final chosen model will perform on data it has never influenced in any way.</p>
<p>That last rule is stricter than it sounds: <b>you must not tune on the test set.</b> If you check test performance, adjust a hyperparameter, and check again, you have turned the test set into another validation set, and its reported number stops being an honest estimate -- this is the same statistical problem as checking many hypotheses and reporting only the one that happened to look good.</p>
<p>How the split is drawn matters as much as the split itself. A plain random split assumes every row is independent and interchangeable, which is often false. A <b>stratified split</b> preserves the proportion of each class across train, validation and test, which matters most when a class is rare -- without it, a random split could leave the validation set with almost no positive examples at all. A <b>grouped split</b> keeps every row belonging to one entity (one customer, one patient, one device, one document) entirely on one side of the split, because if the same customer appears in both train and test, the model can partly succeed by recognising that specific customer rather than learning the general pattern. A <b>time-based split</b> trains on earlier data and evaluates only on later data, matching how the model is actually used: it will always be asked to predict the future from the past, never the reverse, so a random split that lets future rows train the model quietly overstates its real performance.</p>`,
        deeper: `<p>These three needs can conflict and have to be applied together: a fraud model needs a grouped split (the same account should not appear in both train and test) and a time-based split (train on earlier months, test on later ones) at once, which usually means grouping by account while still cutting strictly by time within each fold.</p>`,
        check: {
          question: 'A model predicts whether a hospital patient will be readmitted within 30 days, trained on a dataset where each patient contributes multiple visits over several years. A plain random row-level split is used. What is the most likely problem?',
          options: [
            'There is no problem; random splits are always safe',
            'The same patient\'s visits can end up in both train and test, letting the model partly succeed by recognising that specific patient rather than learning a pattern that works on new patients -- a grouped split by patient is needed',
            'The dataset needs stratification by hospital name only',
            'The problem is that the split was not done in Python'
          ],
          answer: 1,
          explain: 'When one entity contributes multiple rows, a random row-level split routinely lets the same entity appear on both sides, inflating validation and test performance. The fix is to split by patient, keeping every visit for a given patient entirely in train or entirely in test.'
        }
      },
      {
        id: 'es-f2',
        part: 'field',
        title: 'Cross-validation',
        body: `<p><b>k-fold cross-validation</b> splits the training data into k roughly equal folds, trains k times (each time holding out a different fold for evaluation), and averages the k scores. This gives a much less noisy estimate of performance than one single train/test split, and also gives a spread (standard deviation) across folds that tells you how sensitive the score is to which particular rows ended up in the test set. k=5 or k=10 are the common defaults, trading compute time against how stable the estimate is.</p>
<p><b>Nested cross-validation</b> solves a subtler problem: if you use the same k folds both to search for the best hyperparameters and to report the final performance number, you are implicitly picking the hyperparameters that happen to work best on those exact folds, which is itself a mild form of overfitting to the validation data -- the reported score ends up optimistic. Nested cross-validation fixes this with two loops: an outer loop splits the data into folds purely to estimate generalisation performance; inside each outer training fold, an inner loop runs its own cross-validation purely to choose hyperparameters. The outer fold's held-out data is never used for anything except the final score.</p>
<p>For <b>time-series data</b>, ordinary k-fold is invalid, because it would let future rows train a model that is then tested on the past. The fix is a rolling-origin (forward-chaining) scheme: fold 1 trains on the earliest block and tests on the block right after it; fold 2 trains on everything up to that later point and tests on the next block; and so on, always testing strictly after the training window.</p>
<p>Worked example of leakage through cross-validation: suppose you fit a <code>StandardScaler</code> (which needs the mean and standard deviation of each feature) on the entire dataset before running 5-fold cross-validation. Every fold's "held-out" rows already contributed to that mean and standard deviation, so the scaler has quietly seen part of the test data before training even starts. The fix is to fit the scaler only on each fold's training portion, inside the cross-validation loop, and apply it unchanged to that fold's held-out portion -- the same rule applies to feature selection, target encoding, or any other statistic learned from the data.</p>`,
        deeper: `<p>Worked contrast: fitting a scaler on all 1,000 rows before a 5-fold split lets each 200-row test fold influence the scaling statistics computed from the other 800 rows sitting alongside it in the full dataset; fitting the scaler separately inside each fold, using only that fold's 800 training rows, removes that leak entirely and can measurably lower the reported cross-validation score, revealing that the earlier number was inflated.</p>`,
        check: {
          question: 'You perform feature selection (choosing the top 20 most correlated features with the target) using the full dataset, then run 5-fold cross-validation on those 20 features. What is wrong with this procedure?',
          options: [
            'Nothing; feature selection only needs to happen once',
            'The feature selection step already used every row\'s target value, including rows that later become each fold\'s held-out test data, so the reported cross-validation score is optimistically biased',
            'Five folds is always too few for feature selection',
            'Feature selection should always use mutual information instead of correlation'
          ],
          answer: 1,
          explain: 'Choosing features based on their correlation with the target, using the entire dataset, lets information from every future test fold influence which features are even available to the model -- a leak that inflates the cross-validation score. Feature selection should be repeated inside each fold, using only that fold\'s training rows.'
        }
      },
      {
        id: 'es-f3',
        part: 'field',
        title: 'Confusion matrix, precision, recall and F1',
        viz: 'confusion-matrix',
        body: `<p>Every binary classifier's predictions, compared against the truth, sort into four buckets: a <b>true positive (TP)</b> is a positive correctly predicted positive; a <b>false positive (FP)</b> is a negative wrongly predicted positive; a <b>false negative (FN)</b> is a positive wrongly predicted negative; a <b>true negative (TN)</b> is a negative correctly predicted negative. Laid out as a 2x2 table, this is the <b>confusion matrix</b>, and almost every classification metric is just some ratio of these four numbers.</p>
<p><b>Precision</b> is <code>TP / (TP + FP)</code>: of everything the model flagged positive, what fraction actually was. <b>Recall</b> (also called sensitivity or true positive rate) is <code>TP / (TP + FN)</code>: of everything that actually was positive, what fraction the model caught. The two trade off against each other as the decision threshold moves: flagging more things positive to catch more true cases (raising recall) inevitably drags in more false alarms too (lowering precision).</p>
<p><b>Accuracy</b>, <code>(TP + TN) / total</code>, hides this trade-off entirely and becomes actively misleading once classes are imbalanced: a model that predicts "not fraud" for every single transaction can score 99.9% accuracy on a dataset that is 99.9% legitimate, while catching zero fraud. <b>F1</b>, the harmonic mean of precision and recall, <code>2*precision*recall / (precision + recall)</code>, is a better single number when both errors matter, because the harmonic mean punishes a very low value in either precision or recall far more than a simple average would -- a model with 90% precision and 10% recall gets an F1 of about 18%, not the 50% a plain average would suggest.</p>`,
        deeper: `<p>Worked example: a spam filter flags 120 emails as spam, of which 100 really are spam (20 false positives); the mailbox actually contained 130 spam emails total (so 30 were missed, 30 false negatives). Precision is 100/120 ≈ 0.833, recall is 100/130 ≈ 0.769, and F1 is 2*0.833*0.769 / (0.833+0.769) ≈ 0.800 -- a single number that only looks good if both precision and recall are individually reasonable.</p>`,
        check: {
          question: 'A model for a rare disease has 99% accuracy on a dataset where 1% of patients actually have the disease. What is the minimum extra information you need before deciding whether this model is any good?',
          options: [
            'Nothing more is needed; 99% accuracy is always excellent',
            'The model\'s recall (and ideally precision) for the positive class, since predicting "no disease" for every patient would already achieve 99% accuracy while catching zero real cases',
            'The total number of patients in the dataset',
            'Whether the model used Gini impurity or entropy'
          ],
          answer: 1,
          explain: 'With a 1% base rate, always predicting the negative class already reaches 99% accuracy, so accuracy alone tells you nothing about whether the model catches any positive cases at all. Recall and precision for the positive class are the numbers that actually reveal whether the model does anything useful.'
        }
      },
      {
        id: 'es-f4',
        part: 'field',
        title: 'ROC-AUC versus PR-AUC, thresholds and cost-sensitive choice',
        viz: 'roc-vs-pr',
        body: `<p>A <b>ROC curve</b> plots the true positive rate (recall) against the <b>false positive rate</b>, <code>FP / (FP + TN)</code>, as the decision threshold sweeps from 0 to 1. <b>AUC</b>, the area under that curve, has a clean interpretation: it is the probability that a randomly chosen positive example scores higher than a randomly chosen negative one. A <b>PR curve</b> instead plots precision against recall across the same sweep of thresholds.</p>
<p>These two curves can tell very different stories when positives are rare, because false positive rate divides by the (huge) number of negatives, which hides a false-positive problem that precision, dividing by the (small) number of predicted positives, exposes immediately. Worked fraud example: out of 1,000,000 transactions, 1,000 are fraud (0.1%). A model with 90% recall catches 900 of them. If its false positive rate is just 1%, that is <code>0.01 * 999,000 ≈ 9,990</code> false alarms. Precision is then <code>900 / (900 + 9,990) ≈ 8.3%</code> -- more than 9 out of every 10 flagged transactions are not fraud -- while the ROC-AUC for a model this good at separating the two classes could easily still read above 0.95, looking excellent on that curve alone.</p>
<p>The lesson is not that ROC-AUC is wrong, but that it answers a different question than "how many false alarms will my review team actually deal with." When positives are rare, report PR-AUC, or better, precision and recall at the specific threshold you intend to deploy, alongside ROC-AUC rather than instead of it.</p>
<p>The 0.5 default threshold has no special status. The right threshold minimises the actual expected cost: <code>threshold cost = FP_count * cost_per_false_alarm + FN_count * cost_per_missed_case</code>, evaluated across candidate thresholds using the validation set, then fixed before the final test-set evaluation.</p>`,
        deeper: `<p>Worked threshold example: if a missed fraud case costs 500 (on average) and a false alarm costs 5 (an investigator's time), the model should be tuned toward higher recall even at a real cost in precision, since each additional caught fraud is worth roughly 100 false alarms' worth of investigator time -- the right threshold follows directly from that ratio, not from a fixed convention.</p>`,
        check: {
          question: 'A fraud model reports ROC-AUC of 0.97, and the team is ready to ship it. What is the one number you would ask for before agreeing, given that fraud is rare?',
          options: [
            'Nothing else is needed; 0.97 AUC is already excellent',
            'Precision (or the PR-AUC) at the deployment threshold, since a high ROC-AUC can still hide an unusably low precision when positives are rare',
            'The model\'s training time',
            'Whether the model used k-fold or nested cross-validation'
          ],
          answer: 1,
          explain: 'With a rare positive class, false positive rate can stay low in relative terms while producing an overwhelming absolute number of false alarms, which ROC-AUC does not show but precision (or PR-AUC) does directly.'
        }
      },
      {
        id: 'es-f5',
        part: 'field',
        title: 'Regression and ranking metrics',
        body: `<p><b>MAE</b>, the mean of <code>|actual - predicted|</code>, is in the same units as the target and treats every unit of error equally, which makes it robust to a handful of extreme outliers. <b>RMSE</b>, the square root of the mean of <code>(actual - predicted)^2</code>, is also in the target's units but squares errors before averaging, so it penalises a few large misses much more than many small ones -- pick RMSE when big errors are disproportionately costly, MAE when they are not.</p>
<p><b>MAPE</b>, the mean of <code>|actual - predicted| / |actual|</code> expressed as a percentage, is popular because it is scale-free and easy to explain to a non-technical audience. Its trap: it is undefined when the actual value is zero and explodes toward infinity when the actual value is merely close to zero, and it is asymmetric -- an over-prediction can be penalised without limit, while an under-prediction can never cost more than 100 percent (the worst case is predicting zero), so a model optimised for MAPE is quietly pushed toward predicting lower values than it should.</p>
<p><b>R-squared</b>, <code>1 - (sum of squared residuals) / (sum of squared deviations from the mean)</code>, is the fraction of the target's variance the model explains; it can go negative when a model performs worse than simply predicting the average every time, and it is not comparable across datasets with different amounts of inherent variance, so "R-squared of 0.4" means something different for a noisy human-behaviour target than for a nearly deterministic physical one.</p>
<p>Ranking and recommendation systems need different metrics entirely, since what matters is the order of a list, not any single number's accuracy. <b>NDCG</b> (normalised discounted cumulative gain) rewards relevant items for appearing near the top of a ranked list, discounting their contribution logarithmically the further down they sit, normalised against the best possible ordering so it always falls between 0 and 1. <b>MAP</b> (mean average precision) computes precision at every position where a relevant item appears, averages those, then averages again across queries -- it rewards putting several relevant items near the top, not just one. <b>MRR</b> (mean reciprocal rank) only cares about the position of the first relevant result, averaging <code>1/rank</code> across queries, and is the right choice when a user only needs one good answer, like a search "did you mean" suggestion.</p>`,
        deeper: `<p>Worked MAPE trap: if a demand forecast predicts 2 units when the true demand was 1, the error is 1 unit but MAPE reports <code>|1-2|/1 = 100%</code>; if instead it predicts 999 when the truth is 1,000, the error is also 1 unit but MAPE reports <code>|1000-999|/1000 = 0.1%</code> -- MAPE can make a model look excellent purely because the actual values it was scored against happened to be large, with no change in the model's true skill.</p>`,
        check: {
          question: 'A demand forecasting model is optimised purely for MAPE. Sales managers notice it systematically predicts lower quantities than their own judgment would. What is the most likely statistical reason?',
          options: [
            'MAPE has no known biases; the sales managers are simply wrong',
            'MAPE can penalise an over-prediction without limit, while an under-prediction can never cost more than 100 percent, so the loss is asymmetric and pushes a MAPE-optimised model toward predicting lower values',
            'RMSE and MAPE always produce identical model rankings',
            'The model needs more training data to fix this'
          ],
          answer: 1,
          explain: 'MAPE is bounded at 100 percent when a forecast is too low, since the worst it can do is predict zero, but unbounded when a forecast is too high. That asymmetry systematically rewards a model that shades its predictions downward, relative to a symmetric loss like MAE or RMSE.'
        }
      },
      {
        id: 'es-f6',
        part: 'field',
        title: 'Calibration and business metrics',
        viz: 'calibration-curve',
        body: `<p>Calibration is not just a diagnostic -- it is a precondition for several business metrics to mean anything at all. <b>Expected value</b>, <code>sum over outcomes of probability * value</code>, is only a trustworthy number if the probability really is the probability; a model that ranks perfectly but reports 90% when the true rate is 60% will produce an expected-value calculation that is wrong by a predictable, correctable amount, even though its AUC looks fine.</p>
<p>Two metrics built for constrained, ranked action lists come up constantly outside a pure classification setting. <b>Precision at k</b> asks: of the top k items by predicted score (the 500 cases an investigation team can actually review today, the 1,000 leads a sales team can actually call this week), what fraction are truly positive? This matches operational reality far better than a threshold-based precision number when capacity, not a probability cutoff, is the real constraint. <b>Lift</b> compares the precision within a targeted segment to the overall base rate, <code>lift = precision in segment / base rate</code>; a lift of 4 means the targeted segment converts (or catches fraud, or churns) four times as often as a randomly chosen segment of the same size would.</p>
<p>Tying a metric to money makes trade-offs concrete instead of abstract. Worked example: a fraud review team can investigate 500 cases per day. If the model's precision at k=500 is 30%, that is 150 real fraud cases caught out of 500 reviewed. If the average recovered amount per confirmed fraud case is 800 and each investigation costs 40 in analyst time, the daily value is <code>150 * 800 - 500 * 40 = 120,000 - 20,000 = 100,000</code>. Comparing two candidate models by this single dollar number, rather than by F1 or AUC alone, makes it obvious which one is actually worth shipping, and instantly reveals whether a model with a better F1 but a worse precision at the team's actual daily capacity is really an improvement.</p>`,
        deeper: `<p>The same worked example shows why chasing a slightly higher AUC can be worthless in practice: a second model with AUC improved from 0.94 to 0.95 but precision at k=500 only 28% would produce <code>140*800 - 500*40 = 92,000</code> -- an apparently "better" model by one metric that is worth 8,000 less per day by the metric the business actually experiences.</p>`,
        check: {
          question: 'A recommendation model has a slightly better NDCG than the current production model, but the team wants to know whether it is actually worth shipping. What additional step ties the improvement to something concrete?',
          options: [
            'None -- a better NDCG is always sufficient justification to ship',
            'Translate the improvement into an expected business quantity, such as precision at the number of recommendations actually shown, or an expected-value or lift calculation using real conversion values, ideally validated with an online test',
            'Recompute NDCG with a different logarithm base until the improvement looks larger',
            'Switch to reporting accuracy instead, since it is simpler'
          ],
          answer: 1,
          explain: 'An offline ranking metric improvement does not automatically translate into a meaningful outcome; tying it to a concrete quantity the business tracks -- precision at the actual list length shown, expected value, or lift -- and ideally confirming it online is what actually answers "is this worth shipping."'
        }
      },
      {
        id: 'es-f7',
        part: 'field',
        title: 'Hyperparameter search',
        body: `<p><b>Grid search</b> tries every combination of a specified set of values for each hyperparameter. It is simple and fully reproducible, but the number of trials grows multiplicatively with each hyperparameter added, so it becomes expensive fast, and it wastes trials exploring combinations of a hyperparameter that turns out not to matter much for this dataset.</p>
<p><b>Random search</b> instead samples a fixed number of random combinations from the same ranges. Perhaps counterintuitively, it usually finds a result close to grid search's best in a fraction of the trials, because in most real problems only a couple of hyperparameters actually drive performance -- random search spends its budget exploring many different values of every hyperparameter, while grid search wastes many trials repeating the unimportant ones at every setting of the important ones.</p>
<p><b>Bayesian optimisation</b> goes a step further: it fits a surrogate model (commonly a Gaussian process or a tree-based model) that predicts validation score as a function of the hyperparameters, using every trial run so far, and picks the next combination to try where that surrogate expects the biggest improvement (or the most useful new information). This pays off specifically when each trial is expensive -- training a large model can take hours, so spending a little extra compute deciding what to try next, instead of trying blindly, is worth it.</p>
<p><b>Early stopping</b> is a different, complementary idea: rather than searching over the number of training rounds as a hyperparameter, train with a generous maximum and a small learning rate, watch validation loss after every round, and stop once it has not improved for a fixed patience window -- this gets close to the right number of rounds automatically and saves compute at the same time.</p>
<p>Whatever search method is used, <b>budget and reproducibility</b> matter: decide the number of trials or the wall-clock time up front so results across methods are comparable; fix and record random seeds; log every trial's exact configuration and score; and run the search only on training and validation data -- the test set is not for choosing hyperparameters, only for reporting the final, already-chosen model's performance.</p>`,
        deeper: `<p>Bergstra and Bengio's well-known finding is the core justification for random search over grid search: when only a few hyperparameters actually matter, a grid wastes most of its trials varying the unimportant ones, while random search's trials are spread across every dimension regardless, so it explores the important dimensions far more densely for the same trial budget.</p>`,
        check: {
          question: 'You have a budget of 40 hyperparameter trials, three hyperparameters, and reason to believe only one of them meaningfully affects validation score. Which search method is likely to make the best use of the budget, and why?',
          options: [
            'Grid search, because it is guaranteed to find the true optimum',
            'Random search, because with only one hyperparameter mattering, a grid wastes many trials repeating fine-grained variations of the unimportant ones, while random search\'s 40 trials still explore the important dimension broadly',
            'Neither matters; any 40 trials produce the same result',
            'Bayesian optimisation is always strictly better regardless of trial budget'
          ],
          answer: 1,
          explain: 'When only one hyperparameter drives performance, a grid concentrates trials in combinations of the unimportant ones at each value of the important one, while random search\'s trials are independently spread across every hyperparameter, giving denser effective coverage of the one that actually matters for the same budget.'
        }
      },
      {
        id: 'es-f8',
        part: 'field',
        title: 'Error analysis',
        body: `<p>A strong aggregate metric can hide a model that fails badly for a group that matters. <b>Slicing</b> means evaluating the model separately on meaningful subgroups -- by region, device type, customer tenure, time of day, or any dimension the business cares about -- rather than reporting one number for the whole dataset. A model with 90% overall accuracy might be 97% accurate for the majority group and 60% for a minority group that the aggregate number completely buries.</p>
<p><b>Confusion by segment</b> takes this further: build the confusion matrix separately within each slice, not just the overall one, because opposite error patterns in different slices can cancel out in the aggregate. One region might have poor recall (missing real positives) while another has poor precision (too many false alarms) -- the overall precision and recall can both look acceptable while neither region is actually being served well.</p>
<p><b>Learning from the worst cases</b> means literally reading a sample of the rows the model got most confidently wrong, by hand. This routinely shows something a metric alone cannot: a labelling bug, a feature that is missing or stale for a specific subgroup, a genuinely hard and rare pattern that more of the same kind of training data will not fix, or a case where the model's answer was actually defensible and the label was wrong.</p>
<p><b>Label noise</b> is the last piece: labels themselves are not ground truth, they are someone's (or something's) best guess -- an annotator disagreement, a stale label that has since changed, or an automated proxy label that only approximates what you actually care about. A model "getting a case wrong" against a noisy label is not the same failure as a model getting a case wrong against a trustworthy one, and mixing the two up leads to chasing accuracy on examples that were never learnable in the first place.</p>`,
        deeper: `<p>Worked slicing example: an overall recall of 85% could be composed of 95% recall for customers who signed up more than a year ago and 40% recall for customers who signed up in the last month, if the newer customers simply have less feature history for the model to use -- a fix here (a cold-start feature set, or a separate simpler model for new customers) is completely different from anything an aggregate 85% recall would suggest was needed.</p>`,
        check: {
          question: 'A churn model has 88% overall accuracy, but a colleague suspects it performs unevenly across customer segments. What is the most direct way to check this?',
          options: [
            'Retrain the model with more data and see if the overall accuracy improves',
            'Compute the confusion matrix and key metrics separately for each meaningful segment, rather than relying on the single aggregate number',
            'Switch to a different overall metric like F1 and check whether it also looks acceptable',
            'Nothing further is needed if the aggregate accuracy is already above 85%'
          ],
          answer: 1,
          explain: 'An aggregate metric, whichever one you pick, can always hide uneven performance across subgroups; only computing metrics within each segment separately reveals whether that unevenness exists and where.'
        }
      },
      {
        id: 'es-f9',
        part: 'field',
        title: 'Offline versus online evaluation',
        viz: 'ab-test-flow',
        body: `<p>An <b>A/B test</b> randomly assigns users (or requests, or sessions) to two or more variants and compares an outcome metric between them. Random assignment is what lets you credit any difference in the metric to the change itself, rather than to whichever users happened to be put in which group.</p>
<p>The <b>offline-online gap</b> is the reason online testing exists at all: an offline metric, computed on a fixed, historical dataset, can improve while the real business metric does not move, or moves the wrong way, because offline evaluation cannot see feedback loops (a better recommender changes what users click on next, which changes the very data future models are trained on), cannot see changed behaviour (a faster-loading page might get used differently, not just rated the same but faster), and often optimises a proxy label that only approximates the real goal (predicted click-through is not the same as predicted long-term satisfaction).</p>
<p><b>Interleaving</b> is a faster alternative for comparing two ranking systems specifically: instead of splitting users into separate groups, it mixes both systems' results into a single list a user sees, and measures which system's items get clicked more often within that shared list. Because both systems are compared on literally the same user and the same session, interleaving needs far fewer users than a full A/B test to detect a small ranking-quality difference.</p>
<p><b>Guardrail metrics</b> are secondary metrics watched during a test specifically to catch damage the primary metric would not show -- page load latency, error rate, unsubscribe rate -- so a win on the headline number is not shipped alongside a quiet regression elsewhere.</p>
<p><b>Statistical power</b>, in plain words, is the chance a test detects a real effect of a given size, if one genuinely exists; a low-power test can run for weeks and still report "no significant difference" even with a real improvement present, simply because too few users were included to see it through the noise. Worked example: detecting a lift from a 5% baseline conversion rate to 5.5% with 80% power at 5% significance, using <code>n = (z_alpha/2 + z_beta)^2 * (p1*(1-p1) + p2*(1-p2)) / (p1-p2)^2</code> with <code>z_alpha/2 ≈ 1.96</code> and <code>z_beta ≈ 0.84</code>, needs roughly 31,000 users per arm -- about 62,000 total.</p>`,
        deeper: `<p>The same formula shows why detecting small effects gets expensive fast: halving the effect size (a lift to 5.25% instead of 5.5%) roughly quadruples the required sample size, since the effect size sits squared in the denominator -- this is the concrete, numeric reason a small lift on a low-traffic feature can require an experiment that runs for months rather than days.</p>`,
        check: {
          question: 'An offline evaluation shows a new ranking model improves NDCG by 3% over the current production model. After a full online A/B test, the primary business metric does not move. What is the most likely explanation, and what should you check next?',
          options: [
            'The A/B test must have been run incorrectly, since a real NDCG improvement always translates online',
            'The offline-online gap: offline NDCG uses historical, static labels and cannot capture feedback loops or shifted user behaviour; check whether guardrail metrics moved and whether the offline label really matches the online business goal',
            'NDCG is not a valid metric and should never be used again',
            'The sample size must have been too large'
          ],
          answer: 1,
          explain: 'An offline ranking metric is computed against fixed historical labels and cannot capture how users actually respond to a genuinely different ranking, including feedback loops and behaviour change, which is exactly the offline-online gap online testing exists to catch.'
        }
      }
    ],
    connect: null,
    activities: [
      {
        id: 'es-a1',
        type: 'design',
        title: 'Design an evaluation plan for a fraud-review model with fixed investigator capacity',
        prompt: 'You are shipping a new fraud-detection model. The review team can only investigate 500 flagged cases per day, no matter how many the model flags. Design the evaluation plan: what would you actually measure, both offline and after launch, and why?',
        timeboxSec: 360,
        rubric: 'Must-haves: (1) identifies that a fixed daily capacity of 500 makes precision at k=500 (or an equivalent capacity-matched metric) more operationally meaningful than a threshold-based precision/recall pair or AUC alone; (2) proposes tying the metric to an expected-value or dollar calculation using real recovered-fraud and investigation-cost figures, not just a ranking or classification metric in isolation; (3) proposes appropriate offline evaluation with a correct split (time-based, since fraud patterns change over time and a random split would let the model train on the future) before deployment; (4) proposes an online check after launch -- an A/B test or phased rollout comparing the new model against the current one on the real dollar or precision-at-k outcome, plus at least one guardrail metric (such as investigator time spent, or customer complaints from false accusations). Bonus: mentions monitoring for distribution shift or a change in fraud patterns over time as a reason to re-evaluate periodically, or notes that PR-AUC is a better offline summary than ROC-AUC given how rare fraud is. Common mistakes: recommending only AUC or F1 as the single metric to track; proposing an evaluation plan with no online component at all; ignoring the fixed 500/day constraint entirely. {{HONESTY}}',
        model: `<p>Given a fixed capacity of 500 investigations a day, the metric matching how the team works is precision at k=500: of the top 500 cases ranked each day, what fraction are genuinely fraud. Threshold-based precision and recall, or AUC alone, miss this constraint, since the team never reviews every case above a cutoff -- they review exactly 500, whichever the model ranks highest.</p>
<p>I would tie precision at 500 to a dollar figure: average recovered amount per confirmed case, minus the cost of investigating a clean one, multiplied across the 500 daily reviews. That number lets me compare candidate models honestly, and shows whether the fixed capacity itself is the real bottleneck.</p>
<p>Offline, I would evaluate with a time-based split -- training on earlier months, testing on the most recent one -- since fraud patterns shift and a random split would let the model see the future during training. Given how rare fraud is, I would look at PR-AUC and precision at 500 rather than leaning on ROC-AUC, which can look excellent while producing more false alarms than the team can process.</p>
<p>After launch I would not trust the offline numbers alone. I would run an A/B test or phased rollout comparing the new model's precision at 500, and its dollar value, against the current model's, and watch guardrail metrics too -- investigator hours spent, and complaints from wrongly flagged accounts -- so a headline win is not hiding a quiet cost elsewhere.</p>`
      },
      {
        id: 'es-a2',
        type: 'drill',
        title: 'Debug a cross-validation score that does not survive contact with production',
        prompt: 'A model gets 95% cross-validated accuracy during development, but only 80% accuracy once it is deployed on live data. Walk me through, step by step, what you would check to find out why.',
        timeboxSec: 300,
        rubric: 'Must-haves: (1) checks for leakage through the cross-validation pipeline first -- specifically whether any preprocessing (scaling, imputation, feature selection, target encoding) was fit on the full dataset before splitting into folds; (2) checks for a grouped-entity leak -- whether the same customer, user, or other entity appears in both a training fold and its corresponding held-out fold; (3) checks for a time-based leak -- whether the cross-validation used a random split on data that is actually time-ordered, letting future rows train a model tested on the past; (4) considers distribution shift as a separate, non-leakage explanation -- that production data may simply look different from the development dataset (new user behaviour, a changed upstream feature pipeline), which cross-validation on historical data cannot foresee. Bonus: mentions checking for a training-serving skew, where a feature is computed differently (or from different, fresher or staler data) in the production serving path than it was during training. Common mistakes: assuming the model is simply "worse in production" with no specific hypothesis to check; jumping straight to retraining without first isolating the cause; checking only one of the leakage types above and stopping there. {{HONESTY}}',
        model: `<p>A gap this large between cross-validated and production performance almost always means the cross-validation number was never honest, so I would hunt for leakage rather than assume the model simply degraded after launch.</p>
<p>First, I would check whether any preprocessing -- a scaler, an imputer, a target encoder, a feature selection step -- was fit on the whole dataset before the cross-validation split. That would let each fold's held-out rows quietly influence training, inflating every fold's score in the same direction.</p>
<p>Second, I would check whether the data has a natural grouping -- multiple rows per customer, device, or session -- and whether folds were drawn at the row level instead of the group level. If one customer's rows appear in both a training fold and its paired test fold, the model can partly succeed by recognising that specific customer, an advantage that does not exist against a brand-new production user.</p>
<p>Third, if the data is time-ordered, I would check whether the split was a random shuffle rather than a proper time-based split -- a random split lets the model train on rows chronologically after some of its "test" rows, which cannot happen once deployed and facing only the future.</p>
<p>If none of that explains the gap, I would look outside the model, at whether a feature is computed differently in the live serving path than in training -- a training-serving skew -- or whether live traffic has simply started to look different from the historical training distribution.</p>`
      },
      {
        id: 'es-a3',
        type: 'formulate',
        title: 'Formulate the sample size needed to detect a real conversion lift',
        prompt: 'Product wants to A/B test a checkout redesign expected to lift conversion from a 5% baseline to 5.5%. They want to know, roughly, how many users per arm the test needs, at 80% power and a standard 5% significance level. Walk me through how you would get that number, not just state it.',
        timeboxSec: 300,
        rubric: 'Must-haves: (1) identifies the correct type of test (a two-proportion test, since conversion is a binary outcome) and states the standard sample-size formula with correctly labelled terms, n = (z_alpha/2 + z_beta)^2 * (p1*(1-p1) + p2*(1-p2)) / (p1-p2)^2; (2) correctly identifies the z-values for the stated significance and power (z_alpha/2 ≈ 1.96 for a two-sided 5% test, z_beta ≈ 0.84 for 80% power); (3) plugs in the actual numbers (p1=0.05, p2=0.055) and arrives at a sample size in the right ballpark (roughly 30,000 per arm, allowing reasonable rounding); (4) explains what the number means operationally -- given the site\'s daily traffic, how long the test needs to run to accumulate that many users per arm. Bonus: notes that halving the effect size roughly quadruples the required sample size, or flags the risk of peeking at results before reaching the target sample size. Common mistakes: guessing a round number with no formula behind it; confusing significance level with power, or using the wrong z-value for one-sided versus two-sided; forgetting to square the denominator, which changes the answer by orders of magnitude. {{HONESTY}}',
        model: `<p>Conversion is a yes/no outcome, so this is a two-proportion test, and the standard sample-size formula per arm is n = (z_alpha/2 + z_beta)^2 * (p1*(1-p1) + p2*(1-p2)) / (p1-p2)^2, where p1 and p2 are the two conversion rates, z_alpha/2 corresponds to the significance level, and z_beta corresponds to the desired power.</p>
<p>For a two-sided 5% significance level, z_alpha/2 is about 1.96; for 80% power, z_beta is about 0.84. Their sum is 2.8, and squared that is 7.84.</p>
<p>Plugging in p1 = 0.05 and p2 = 0.055: p1*(1-p1) = 0.05*0.95 = 0.0475, and p2*(1-p2) = 0.055*0.945 ≈ 0.05198, which sum to about 0.09948. The denominator is (p2-p1)^2 = 0.005^2 = 0.000025.</p>
<p>So n ≈ 7.84 * 0.09948 / 0.000025, which comes out to roughly 31,200 users per arm -- call it about 30,000 to 32,000 depending on rounding, or roughly 62,000 users total across both arms.</p>
<p>Operationally, if the checkout page gets, say, 5,000 relevant sessions a day split evenly between the two arms, that is about 2,500 per arm per day, so the test would need to run for around 12 to 13 days to hit the target sample size -- and I would commit to that duration up front rather than checking significance daily and stopping early, since repeated peeking inflates the false-positive rate well above the intended 5%.</p>`
      }
    ],
    sayQuestion: null,
    sayItOutLoud: null,
    glossary: {
      g: 'Evaluation, metrics and model selection',
      sub: 'The splits, metrics and tests an interviewer expects you to choose correctly, not just define.',
      rows: [
        ['Grouped split', 'Keeping every row for one entity entirely on one side of a split.', 'Preventing entity-level leakage.', ''],
        ['Nested cross-validation', 'An outer loop estimating performance around an inner loop that searches hyperparameters.', 'Honest performance estimates when tuning hyperparameters.', ''],
        ['Precision, recall', 'TP/(TP+FP); TP/(TP+FN).', 'Classification metrics, especially under class imbalance.', ''],
        ['F1 score', 'The harmonic mean of precision and recall.', 'A single number balancing both error types.', ''],
        ['ROC-AUC', 'The probability a random positive scores higher than a random negative.', 'Ranking quality of a classifier, most reliable when classes are balanced.', ''],
        ['PR-AUC', 'The area under the precision-recall curve.', 'Ranking quality when positives are rare.', ''],
        ['MAPE', 'Mean absolute percentage error; undefined at zero, asymmetric.', 'Regression metrics; forecasting.', ''],
        ['NDCG / MAP / MRR', 'Ranking metrics rewarding relevant items near the top of a list, by different rules.', 'Search and recommendation evaluation.', ''],
        ['Precision at k', 'The fraction of the top k ranked items that are truly positive.', 'Capacity-constrained review or targeting.', ''],
        ['Lift', 'Precision in a targeted segment divided by the overall base rate.', 'Targeting and marketing evaluation.', ''],
        ['Bayesian optimisation', 'Using a surrogate model of past trials to choose the next hyperparameter combination.', 'Expensive-to-train hyperparameter search.', ''],
        ['Slicing', 'Evaluating a model separately on meaningful subgroups.', 'Error analysis, fairness checks.', ''],
        ['Interleaving', 'Mixing two systems\' ranked results into one list to compare clicks directly.', 'Fast online ranking comparisons.', ''],
        ['Guardrail metric', 'A secondary metric watched to catch an unintended regression during a test.', 'A/B testing.', ''],
        ['Statistical power, sample size', 'The chance a test detects a real effect if one exists; how many observations that requires.', 'Designing an A/B test correctly.', '']
      ]
    }
  };

}(typeof window !== 'undefined' ? window : this));
