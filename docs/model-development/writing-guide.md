# Writing guide for the model-development series

Durable standards for every post and paper review in the series. Read this before writing or revising one; `course-plan.md` holds the sequence and progress.

## The goal is understanding

Posts teach difficult ideas clearly. Depth comes from explaining mechanisms, assumptions and consequences, not from complicated examples, heavy notation or long calculations.

A good default progression, adapted whenever another order teaches better:

1. The problem in ordinary language.
2. The intuition.
3. The smallest useful numerical example.
4. The general equation, with every symbol defined.
5. The connection to implementation and practical consequences.

Explain why a method exists before detailing its machinery. Derive equations through understandable steps; never drop an unexplained formula into the prose. Keep the necessary complexity: simplify the example, not the scientific claim.

## Numerical examples

- Small integers, simple probabilities, short sequences. Numbers a reader can check mentally or with a basic calculator, chosen to expose the mechanism.
- Show intermediate steps and say what each result means.
- One difficulty at a time: scalars before vectors, tiny vectors before matrices.
- Separate small examples are better than one oversized toy that carries masking, normalization, backpropagation and optimization at once. Keep each example internally consistent.
- Illustrative values (for example made-up per-token losses) are fine; do not build a model just to generate them.
- No long decimals carried through a post. Use approximation signs correctly: rounded inputs shown on the page must not appear to produce an incompatible exact result.
- Realistic sizes only when scale itself is the subject.
- Detailed numerical verification lives in `scripts/course/`, never on the page.

## Distinctions readers often confuse

Name and separate them explicitly when they arise: loss masking versus attention masking versus position IDs; a gradient versus an optimizer update; mathematical equivalence versus bitwise numerical identity; a teaching toy versus a real model's behaviour; what an implementation does by default versus what it can be configured to do.

## Failure modes

Teach a few consequential ones, each with a concrete symptom and a check. A long table of every possible mistake is less useful than three that matter.

## Paper reviews

Explain the problem and the preceding approach, then the central method and its derivation, then the decisive experiments and ablations, before any benchmark results. Say what the evidence supports, what it confounds and what it leaves open, and how it should change a training decision.

## Implementation claims

Verify every implementation-specific statement against a pinned version of the source, and execute it where practical. State the version in the text naturally ("In PyTorch 2.6, …"). When behaviour depends on configuration, say which path the statement applies to.

## The page itself

- Blog voice, like the Foundations series: open with a motivating story, not learning objectives.
- Match the Foundations structure: numbered figure captions ("Figure 1. Title."), "Everyday picture" analogies where they help, checks as plain paragraphs (no fold-out boxes), and the standard ending: What to remember, Try it yourself (bold-led bullets with bold answers), Sources.
- Animations only where motion explains something a static figure cannot.
- No production commentary on the page: no evidence labels, disclaimers, verification narration, internal-script links or course wording (lesson, strand, module). Provenance and verification records stay in `src/data/model-development/claims.json`, `sources.json` and `course-plan.md`.
- Keep inline code and formulas short enough to wrap on a phone.
