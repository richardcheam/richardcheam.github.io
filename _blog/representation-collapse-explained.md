---
title: "Zero loss, empty representation"
date: 2026-10-07
category: "deep-learning"
read_time: "14 min"
series_order: 8
series: representation-collapse
featured: false
math: true
excerpt: "Joint-embedding training has a shortcut that always works: produce the same vector for everything. The geometry of that failure, and the linear algebra needed to read it."
question: "What does it mean for a learned representation to be degenerate, and which measurements can see it?"
my_work: "A concept note. I set up the linear algebra of the embedding matrix, its covariance and its spectrum, then use it to separate the distinct failure modes that get called collapse."
result: "Degeneracy is a family of failures, not one state, and the standard rank diagnostics are blind to two of its axes by construction."
evidence_limit: "This is an explanation of established methods and published results, not new measurement. Nothing here reports an experiment of mine."
lesson: "A metric can only detect a failure along an axis it is sensitive to, so read spectrum, scale and angle together rather than choosing between them."
---

<article class="note-article" markdown="1">

Train a classifier and the labels keep it honest: there is an external answer it has to match. Joint-embedding self-supervised methods have no such anchor. They hide part of an input, predict the hidden part's *representation* from the visible part, and score the prediction against the encoder's own output. Both sides of the comparison are produced by the thing being trained.

That creates a shortcut. If the encoder maps every input to the same vector, the prediction is exact and the loss is zero. The constant encoder is not a local minimum the optimizer stumbles into; it is a **global optimum of the objective**, sitting in the open, available from the first step.

Every mechanism in this literature — the stop-gradient, the moving-average target, the explicit distribution regularizer — exists to keep training away from it. What follows is what "degenerate" actually means, the linear algebra you need to read it off a run, and why the most convenient diagnostics are the ones most likely to tell you everything is fine.

## The energy picture

The cleanest framing is the energy-based one. Think of a scalar energy assigned to each pair of inputs: low when they are compatible, high when they are not. Training should carve a landscape with valleys on the data manifold and high ground elsewhere.

A purely predictive loss can reach its minimum in two ways. It can learn structure, so that energy is low exactly where it should be. Or it can **flatten the landscape**, so energy is low everywhere. The second is degeneracy, and the loss cannot tell you which happened.

This also explains a failure that has nothing to do with the encoder. If the predictor takes a latent variable with too much capacity, it can map any context to any target. Energy becomes low off the manifold as well as on it, and nothing has collapsed in the encoder at all — the *discrimination* has. This is why formulations of joint-embedding architectures insist on limiting the information content of that latent.

## The one object every diagnostic is computed on

Before the failure modes, the algebra. Suppose you push N inputs through an encoder f and stack the outputs as rows. For the sake of something concrete, say 10,000 driving clips encoded to 256 dimensions each:

$$Z \in \mathbb{R}^{N \times d}, \qquad z_i = f(x_i) \in \mathbb{R}^{d}$$

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/embedding-matrix.svg' | relative_url }}" alt="A grid with one row per clip and one column per embedding dimension. One highlighted row is a single clip's 256-number embedding; one highlighted column is a single feature read across all 10,000 clips." loading="lazy">
  <figcaption><strong>Figure 1 · The embedding matrix.</strong> Every diagnostic in this post is a statement about this one matrix. Schematic.</figcaption>
</figure>

Read a **row** and you are asking what the encoder thinks about one clip. Read a **column** and you are asking what one feature responds to — sort it and you get the clips that excite that coordinate most. Rank questions are easiest in the row view, correlation questions in the column view.

Two derived objects. The mean μ is the column-wise average, a single vector in the same space as the embeddings: the "average input" according to the encoder. It is rarely near zero, and that will matter later. The covariance is

$$C = \tfrac{1}{N}\bar{Z}^{\top}\bar{Z} \in \mathbb{R}^{d \times d}, \qquad \bar{Z} = Z - \mathbf{1}\mu^{\top}$$

Note the shape change: Z is 10,000 × 256, but C is 256 × 256. The dataset dimension has been summed away. C is not about clips any more; it is a table of relationships between features. Entry C<sub>jk</sub> takes column j and column k, centres both, multiplies elementwise and averages — so it answers: across the dataset, when feature j runs above its average, does feature k do the same?

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/covariance-entries.svg' | relative_url }}" alt="Two five-by-five grids. In the first only the diagonal is dark, meaning features vary without moving together. In the second several off-diagonal cells are shaded, meaning groups of features duplicate each other." loading="lazy">
  <figcaption><strong>Figure 2 · What one cell of the covariance means.</strong> The diagonal is a feature's own variance; off-diagonal entries are variation two features share. Schematic.</figcaption>
</figure>

## Eigenvalues are variances

C is symmetric and positive semi-definite, and that second property has a concrete reading worth internalising. For any unit vector v, project every embedding onto v and take the variance of those N numbers:

$$\operatorname{Var}(\bar{Z}v) = v^{\top} C v \;\ge\; 0$$

So the quadratic form vᵀCv *is* "how much do my embeddings spread along direction v". Non-negative because variance cannot be negative — that is all positive semi-definite means here.

Now ask which direction has the most spread. Maximising vᵀCv over unit vectors gives the top eigenvector u₁, and the maximum value is the top eigenvalue λ₁. Repeat in the orthogonal complement for u₂, λ₂, and so on. The spectral theorem says this works cleanly for symmetric matrices:

$$C = U\Lambda U^{\top}, \qquad U^{\top}U = I, \qquad \Lambda = \operatorname{diag}(\lambda_1 \ge \dots \ge \lambda_d \ge 0)$$

**λᵢ is the variance along direction uᵢ.** That one sentence is why eigenvalue spectra became the standard collapse diagnostic: it turns an abstract algebra question into "how fat is the cloud in each direction".

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/covariance-ellipse.svg' | relative_url }}" alt="A tilted cloud of embeddings with an ellipse fitted to it and two arrows leaving the mean along the ellipse axes, a long one labelled as the direction of most variance and a short one as the least." loading="lazy">
  <figcaption><strong>Figure 3 · Eigenvectors are the axes of the data ellipse.</strong> In the eigenframe the covariance is diagonal and the cloud is axis-aligned, with semi-axis lengths the square roots of the eigenvalues. Schematic.</figcaption>
</figure>

Papers say "singular value" where you expected "eigenvalue" because the two are the same information in different clothes. Writing Z̄ = UΣVᵀ gives C = (1/N)·VΣ²Vᵀ, so λᵢ = σᵢ²/N. In practice take the SVD of the embedding matrix directly rather than forming C: squaring the matrix squares the condition number and destroys precision exactly in the small-eigenvalue tail you care most about.

## Coordinates are arbitrary, and that has consequences

Nothing in this kind of training makes "dimension 37" mean anything. Which coordinate ends up carrying rain or traffic density is an accident of initialisation, and the information is smeared across coordinates.

A rotation is a change of measuring rulers. The cloud sits fixed; you choose a different frame to describe it in. Distances, angles and shape are unchanged — only the numbers you write down change.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/change-of-basis.svg' | relative_url }}" alt="Two panels holding the identical cloud. On the left the axes are the encoder's output units and one highlighted point is projected onto them; on the right the axes are the eigenvectors and the same point is projected onto those instead." loading="lazy">
  <figcaption><strong>Figure 4 · A rotation changes the rulers, not the cloud.</strong> The highlighted point is one input, described twice. Schematic.</figcaption>
</figure>

Concretely, u₁ is a 256-long vector of weights — a recipe. Applying it, u₁ᵀzᵢ, gives one number per input: a synthetic feature built as a weighted blend of all 256 coordinates. The eigendecomposition picks the recipe whose outputs have the largest spread, then the next largest orthogonal to it.

Worth saying plainly: there is **no guarantee eigenvectors align with human concepts**. They are directions of maximum variance, and variance is not semantics. If your dataset has wildly varying camera exposure, u₁ will be exposure. This is a real failure mode when people over-read PCA plots of embeddings.

The split that matters for diagnostics is what survives a rotation:

- **Rotation-invariant:** rank, trace, the eigenvalue spectrum, all pairwise distances and angles — and therefore all retrieval results and rank scores. These describe the cloud.
- **Not rotation-invariant:** the variance of any individual coordinate, the off-diagonal entries of C. These describe the cloud *as seen from one frame*.

That is why a method like VICReg needs two separate terms. Its variance term pushes the diagonal of C up so every coordinate actually varies; its covariance term pushes off-diagonal entries down so coordinates stop duplicating each other. Both are frame-dependent by construction: together they push the encoder's own output axes towards being the eigenframe with equal variance along each. Diagonalising without equalising still permits a spectrum cliff; equalising without diagonalising still permits redundancy.

## Degeneracy is a family, not a state

With the algebra in place the failure modes separate cleanly.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/collapse-modes.svg' | relative_url }}" alt="Four schematic point clouds: a healthy cloud using all directions, a cloud flattened onto a line, a cone of points spreading from the origin in one heading, and a single point." loading="lazy">
  <figcaption><strong>Figure 5 · Four shapes a representation can take.</strong> Only the last is what "collapse" usually brings to mind. Schematic.</figcaption>
</figure>

**Complete collapse.** The constant encoder. Covariance is zero in every direction; rank is zero.

**Dimensional collapse.** Variation survives but occupies a few directions out of many — a nominally 256-dimensional embedding effectively living in twelve. [Jing et al.](https://arxiv.org/abs/2110.09348) attribute this to implicit regularisation in gradient descent rather than to the loss having a bad optimum. Broad distinctions survive, fine ones do not, which is the worst case for search: the rare item you most wanted to find lands on top of a common one.

**Informational collapse.** Full rank, but coordinates heavily correlated — redundant dimensions. Distinct from dimensional collapse in that per-coordinate variance is preserved. This is the failure VICReg's covariance term targets.

**Latent-variable degeneracy.** The predictor-side failure from earlier: energy low off the manifold because the latent carries too much capacity. The encoder need not collapse at all.

**Cluster collapse.** In prototype-based methods, every sample routed to one prototype.

One term worth separating: **neural collapse** ([Papyan, Han and Donoho](https://arxiv.org/abs/2008.08186)) is a different phenomenon — supervised, terminal-phase training, class means converging to a simplex equiangular tight frame. Reviewers conflate it with the above often enough that it is worth a footnote in anything you write.

A methodological point that matters more than it sounds: **measure at the right layer.** In methods with a projector, the loss lives in projector space and the backbone can retain rank while the projector collapses, or the reverse. In predictive architectures you have a context encoder, a target encoder and a predictor, and degeneracy can be asymmetric across them.

## Reading a spectrum

The standard figure plots log λᵢ against index, sorted descending. The log axis is not cosmetic: healthy spectra span many orders of magnitude and a linear axis flattens every interesting eigenvalue against zero.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/eigenvalue-spectrum.svg' | relative_url }}" alt="Two curves on a log axis against eigenvalue index. One decays gradually across all indices; the other falls off a cliff after the first few and flattens near the numerical floor." loading="lazy">
  <figcaption><strong>Figure 6 · Gradual decay against a rank cliff.</strong> The cliff is dimensional collapse: a handful of directions carry everything and the rest sit at numerical noise. Schematic.</figcaption>
</figure>

Rank itself is discrete and brittle. The flattened cloud almost never has an exactly-zero eigenvalue; it has λ₂ ≈ 10⁻⁹. Technically full rank, effectively one-dimensional. Every "effective rank" measure exists to give a continuous, threshold-free answer instead:

$$\text{stable rank} = \frac{\sum_i \sigma_i^2}{\sigma_1^2}, \qquad \text{RankMe} = \exp\!\Big(-\sum_i p_i \log p_i\Big),\; p_i = \frac{\sigma_i}{\sum_j \sigma_j}$$

[RankMe](https://proceedings.mlr.press/v202/garrido23a.html) is the exponentiated Shannon entropy of the normalised singular values: mass on one direction gives about 1, mass spread evenly over k gives about k. It is the continuous relaxation of counting non-zeros. A related diagnostic fits λᵢ ∝ i<sup>−α</sup> and reports the exponent. For predictive architectures specifically, [LiDAR](https://arxiv.org/abs/2312.04000) was built because entropy-of-spectrum measures underperform there, using a discriminant-style rank in predictor space.

Here is the structural catch. **Every one of these is a ratio.** Scale cancels. If a representation shrinks toward numerical noise, that noise is isotropic — and isotropic noise has excellent rank. A ratio-valued diagnostic can rise while a representation dies, not because it malfunctioned but because it answered the question it was asked, which was about shape, at a moment when the informative question was about magnitude. Read any rank number beside total variance, never instead of it.

## Rank is not the whole story: angular structure

Retrieval using cosine similarity discards norms entirely. Only angles survive to influence the ranking, and angle is a different axis from rank.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/angular-structure.svg' | relative_url }}" alt="Three unit circles with the resulting pairwise cosine distribution underneath each: a collapsed case where all cosines pile at one, a cone where they concentrate in a high band, and a spread case where they cover the range." loading="lazy">
  <figcaption><strong>Figure 7 · Where the pairwise cosines land.</strong> Retrieval ranks inside that band and nowhere else. Schematic.</figcaption>
</figure>

The canonical decomposition is [Wang and Isola's](https://arxiv.org/abs/2005.10242) alignment and uniformity: alignment is the expected distance between positive pairs, uniformity measures how close the embedding distribution is to uniform on the sphere. Complete collapse is uniformity at its worst; the simplex frame of neural collapse is maximal angular separation. Most degenerate solutions sit somewhere on that axis.

Rank metrics are global and linear. Retrieval only cares about the *ordering* of angles in each query's neighbourhood — a local, ordinal property. These come apart. The clearest symptom is **hubness**: in high-dimensional angular spaces a few points appear in a disproportionate share of nearest-neighbour lists, which you can check directly by counting how often each item appears in others' top-k.

A caution about the third panel: it is a 2D cartoon of something that behaves differently at real dimensionalities. In high d, random unit vectors are near-orthogonal by default, so cosines concentrate near zero with variance about 1/d even under a random encoder. Angular spread is the null hypothesis, not the achievement. What distinguishes a good representation is positive-pair mass sitting well above that concentration.

## Centering decides which object you measured

This is the piece that most often explains two diagnostics disagreeing about the same encoder.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/centering-changes-the-object.svg' | relative_url }}" alt="The same cloud read two ways: on the left the raw embeddings with the mean vector drawn from the origin and contributing to the spectrum, on the right the centered cloud with the mean subtracted first." loading="lazy">
  <figcaption><strong>Figure 8 · Translation is invisible to one diagnostic and not the other.</strong> Schematic.</figcaption>
</figure>

Covariance-based measures subtract the mean first, so they describe spread and nothing else. Measures computed on the raw embedding matrix keep the mean, which contributes a rank-one term to the spectrum. Algebraically the two second-moment matrices differ by exactly that:

$$\tfrac{1}{N}Z^{\top}Z = C + \mu\mu^{\top}$$

So a representation can have a beautiful centered spectrum while the uncentered one is dominated by a single rank-one term. That is the cone: every embedding pointing roughly the same way from the origin, documented as anisotropy in language models by [Ethayarajh](https://arxiv.org/abs/1909.00512) among others. Since retrieval never centers, cosine ranking is then decided by a thin residual. Computing the spectrum both ways and reading the gap tells you how much of your apparent structure is just the mean.

**Whitening** closes the loop: transform z̃ = C<sup>−1/2</sup>(z − μ) so the new covariance is the identity — all eigenvalues equal, condition number one. This is the operation behind [Barlow Twins](https://arxiv.org/abs/2103.03230) driving a cross-correlation matrix to identity, and behind post-hoc "all-but-the-top" fixes. It is also why near-zero eigenvalues are dangerous beyond rank counting: inverting one amplifies noise, which is why these methods regularise the inverse.

## Two families of fix

Methods divide by *where* they put the solution, and it is worth knowing which camp a method is in before claiming anything about it.

**Dynamics.** BYOL, SimSiam and predictive architectures leave the degenerate optimum in the landscape and rely on the optimisation trajectory not reaching it. Stop-gradient, the moving-average target and the predictor create a system whose trajectories avoid collapse; [Tian et al.](https://arxiv.org/abs/2102.06810) analyse this in terms of predictor eigenspace alignment. Collapse-avoidance here is an *optimization* property.

**Landscape.** VICReg and Barlow Twins instead remove the degenerate optimum by construction, adding terms that are large exactly when the representation degenerates.

Which camp a method belongs to determines whether a claim about it is a stability claim or a loss-design claim, and reviewers will ask.

## What to measure

The useful summary is not a ranking of metrics but a note of which axis each one can see.

<figure class="blog-figure blog-figure--wide" tabindex="0">
  <img src="{{ '/assets/blog/diagnostic-sensitivity.svg' | relative_url }}" alt="A property table of measurements against three columns: sensitivity to scale, sensitivity to direction, and whether labels are needed. The two rank measures are marked in neither of the first two columns, highlighted by a dashed box." loading="lazy">
  <figcaption><strong>Figure 9 · Definitional properties, not experimental results.</strong> Each mark follows from how the quantity is computed. Schematic.</figcaption>
</figure>

A practical logging set, with the reason each earns its place:

- **Total variance**, beside every rank number rather than instead of it. It is the quantity that falls when scale is lost.
- **Mean pairwise cosine**, the cheapest direct read on the angular structure retrieval depends on.
- **The spectrum both ways**, centered and raw, treating the gap between them as information about the mean.
- **A retrieval metric**, if retrieval is what the representation is for. A linear probe answers whether a decision boundary exists somewhere in the representation; retrieval answers whether near neighbours share an attribute. These are different questions and one does not stand in for the other.
- **Per-layer**, not just at the loss. Backbone, projector and predictor can disagree.

The underlying rule is simple enough to state in one line: **a metric can only detect a failure along an axis it is sensitive to.** Scale-invariant measures cannot see a loss of scale; rotation-invariant measures cannot see a bad choice of frame; centered measures cannot see a drifting mean. None of them are wrong. They are answering a question that is not the one collapse happens to be posing.

<div class="note-callout note-callout--definition" markdown="1">
**If you take one thing:** no single number establishes that a representation is healthy. "Did it collapse" is the wrong question; "which of these failure modes happened, and which of my measurements could even have seen it" is the one that leads somewhere.
</div>

<div class="note-related" markdown="1">

## Related

- I put these diagnostics under controlled conditions in a separate study — see the [Embedding diagnostics project page](https://richardcheam.github.io/embedding-diagnostics/).
- Assran et al. (2023), [Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture](https://arxiv.org/abs/2301.08243)
- Jing et al. (2022), [Understanding Dimensional Collapse in Contrastive Self-Supervised Learning](https://arxiv.org/abs/2110.09348)
- Wang and Isola (2020), [Understanding Contrastive Representation Learning through Alignment and Uniformity on the Hypersphere](https://arxiv.org/abs/2005.10242)
- Garrido et al. (2023), [RankMe: Assessing the Downstream Performance of Pretrained Self-Supervised Representations by Their Rank](https://proceedings.mlr.press/v202/garrido23a.html)
- Thilak et al. (2023), [LiDAR: Sensing Linear Probing Performance in Joint Embedding SSL Architectures](https://arxiv.org/abs/2312.04000)
- Tian et al. (2021), [Understanding Self-Supervised Learning Dynamics without Contrastive Pairs](https://arxiv.org/abs/2102.06810)
- Bardes et al. (2022), [VICReg: Variance-Invariance-Covariance Regularization](https://arxiv.org/abs/2105.04906)
- Zbontar et al. (2021), [Barlow Twins: Self-Supervised Learning via Redundancy Reduction](https://arxiv.org/abs/2103.03230)

</div>

</article>
