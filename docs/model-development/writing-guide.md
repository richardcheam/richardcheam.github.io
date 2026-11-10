# Writing guide for the model-development series

Durable standards for every post and paper review in the series. Read this before writing or revising one; `course-plan.md` holds the abilities, topics and progress.

## The editorial rule

**Teach what a research scientist, AI engineer or applied researcher needs to understand, not everything discovered while researching the topic.**

Before writing, decide how deeply each concept deserves treatment *for this post's question*:

- **Understand deeply:** the central mechanisms a reader needs to reason about model behaviour, design experiments, implement training, interpret results or diagnose consequential failures. Explain completely enough to reason with.
- **Understand operationally:** what a technique does, why it is used, its main trade-offs and when it matters, with one small example where useful.
- **Recognize and reference:** supporting techniques and specialist details. Introduce briefly and link to a good explanation.

The level depends on the question, not the topic. MinHash gets a brief operational explanation in a general corpus-building post; its derivation belongs in a specialist deduplication article. Gradient accumulation deserves deep treatment where the question is whether distributed training preserves the objective. These categories are planning tools: never show them on the page.

For every section, ask:

1. What useful understanding or ability does this give the reader?
2. Would omitting the detail prevent them from understanding the main idea or making a sound decision?
3. Is this detail broadly useful, or mainly needed by someone implementing this particular subsystem?

If a detail mainly serves a specialist, summarize it and link further reading. Do not create a separate article automatically because material was researched; write one only when it is needed.

**Short posts are welcome.** Choose length by the question. Do not pad a post to resemble a university lecture, satisfy a template or display sophistication. A topic deserves more space when misunderstanding it would cause a consequential training or application mistake.

**Concision must not change the claim.** Keep the assumptions and limitations needed for correctness. A result obtained in one setting (one model size, one benchmark suite, one data source) is presented in that setting, not as a universal rule. Toy examples and analogies must not imply a general law that the evidence does not support.

Judge a post by whether the reader can explain the central idea, recognize when it applies and reason about its consequences, not by word count, citation count or mathematical density.

## Explaining a mechanism

A good default progression, adapted whenever another order teaches better:

1. The problem in ordinary language.
2. The intuition.
3. The smallest useful numerical example.
4. The general equation, with every symbol defined (only if the equation helps the reader reason).
5. The connection to implementation and practical consequences.

Explain why a method exists before its machinery. Derive equations through understandable steps; never drop an unexplained formula into the prose. Simplify the example, not the scientific claim. Equations, code excerpts, figures, animations and exercises each earn their place by improving understanding; no post needs all of them.

## Numerical examples

- Small integers, simple probabilities, short sequences, chosen to expose the mechanism and checkable mentally.
- Show intermediate steps and say what each result means.
- One difficulty at a time: scalars before vectors, tiny vectors before matrices.
- A few memorable examples beat many variations. Separate small examples beat one oversized toy.
- Illustrative values are fine; say they are illustrative when it matters.
- No long decimals. Use approximation signs correctly.
- Realistic sizes only when scale changes the conclusion.
- Detailed verification lives in `scripts/course/`, never on the page.

## Small activities

Important posts include at least one short task that asks the reader to **predict, calculate, trace, implement or diagnose** something, followed by an explained answer (not just the result). Examples: predict how a sampling change alters token exposure; trace one shifted target and its loss; say which tensors a GPU owns; compare prompting, retrieval and fine-tuning for one use case; find why a reward encourages a shortcut. Avoid exercises that only ask for terminology.

## Distinctions readers often confuse

Separate them explicitly when they arise: loss masking, attention masking and position IDs; a gradient and an optimizer update; mathematical equivalence and bitwise identity; a teaching toy and a real model; an implementation's default and its configurable behaviour; general knowledge that also appears in a benchmark and exposure to the benchmark's items, solutions or close derivatives; a result in its experimental setting and a general rule.

## Failure modes

Teach a few consequential ones, with a concrete symptom and a check. An exhaustive table is not required.

## Using sources

- Courses support the teaching progression; papers supply methods and evidence; implementation documentation and code reveal operational details. Choose a small set that actually explains the post's question.
- Prefer original lectures, notes, papers, reports and documentation. Record exact sections, lecture files or timestamps internally (`sources.json`, `course-plan.md`).
- Never claim to have watched a video on the strength of its title, description or slides; record what was actually read or watched.
- Where sources disagree on conventions, defaults or results, explain the disagreement rather than silently combining them.
- Write original explanations. Link readers to sources where further study would help.
- Verify implementation-specific statements against a pinned version and execute them where practical. State the version naturally in the text ("In PyTorch 2.6, …") and say which configuration a statement applies to.

## Paper reviews

A review deepens the evidence and interpretation behind a post; it does not repeat the post. Explain the problem and prior approach, the method and its central argument, the decisive experiments and ablations, then what the evidence supports, confounds and leaves open, and how it should change a decision. Specialist details and paper-versus-code discrepancies belong here or in internal records, not in the introductory post. Cite section and page for claims from the paper.

## Modalities

Language models are the starting point. When other modalities come up, say which principle transfers and where the objective or architecture differs, briefly, until the dedicated post.

## The page itself

- Blog voice, like the Foundations series: open with a motivating story, not learning objectives.
- Numbered figure captions ("Figure 1. Title."); "Everyday picture" analogies only where they help and never where they would overgeneralize; checks as plain paragraphs (no fold-out boxes).
- Ending: "What to remember" and "Sources" as in the Foundations series; "Try it yourself" or an in-body activity with explained answers for important posts. Optional "Further reading" for specialist depth.
- Animations only where motion explains something a static figure cannot.
- No production commentary: no evidence labels, depth categories, disclaimers, verification narration, internal-script links or course wording (lesson, strand, module, track).
- Keep inline code and formulas short enough to wrap on a phone.
