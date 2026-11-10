"""Reproduces every number in src/content/blog/model-development-data-mixtures.mdx.

Run: python3 scripts/course/p3_mixtures.py   (pure Python)
"""


def section(title):
    print(f"\n== {title}")


def exposure(weights, sizes, budget):
    """Tokens seen and passes over each source for sampling weights and a budget (billions)."""
    return {s: (w * budget, w * budget / sizes[s]) for s, w in weights.items()}


# -- Weights to exposure -------------------------------------------------------------
section("three sources, 100B budget")
sizes = {"web": 400, "code": 50, "books": 5}
mix = {"web": 0.7, "code": 0.2, "books": 0.1}
for s, (seen, passes) in exposure(mix, sizes, 100).items():
    print(f" {s}: {seen:.0f}B seen, {passes:.3g} passes")
assert [round(p, 3) for _, p in exposure(mix, sizes, 100).values()] == [0.175, 0.4, 2.0]
prop = {s: n / sum(sizes.values()) for s, n in sizes.items()}
print(" proportional weights:", {s: round(w, 3) for s, w in prop.items()}, "-> every source", round(100 / 455, 2), "passes")

# -- Temperature sampling over two languages -------------------------------------------
section("temperature sampling, 400B high-resource and 4B low-resource, 220B budget")
n = {"high": 400, "low": 4}


def temperature(sizes, tau):
    p = {k: v / sum(sizes.values()) for k, v in sizes.items()}
    q = {k: v ** (1 / tau) for k, v in p.items()}
    return {k: v / sum(q.values()) for k, v in q.items()}


for tau in (1, 2, 1e9):
    q = temperature(n, tau)
    e = exposure(q, n, 220)
    print(f" tau = {tau:g}: low weight {q['low']:.3f}, low seen {e['low'][0]:.1f}B = {e['low'][1]:.2f} passes; high {e['high'][1]:.2f} passes")
assert abs(temperature(n, 2)["low"] - 1 / 11) < 1e-12 and abs(exposure(temperature(n, 2), n, 220)["low"][1] - 5) < 1e-9
assert abs(exposure(temperature(n, 1e9), n, 220)["low"][1] - 27.5) < 1e-6


# -- UniMax: uniform with an epoch cap --------------------------------------------------
section("UniMax with a cap of N passes")


def unimax(sizes, budget, N):
    order = sorted(sizes, key=sizes.get)
    alloc, B = {}, budget
    for i, l in enumerate(order):
        per = B / (len(order) - i)
        alloc[l] = sizes[l] * N if per > sizes[l] * N else per
        B -= alloc[l]
    return alloc


u = unimax(n, 220, 4)
print(f" N = 4: low {u['low']}B ({u['low'] / 4:.0f} passes), high {u['high']}B ({u['high'] / 400:.2f} passes), low weight {u['low'] / 220:.3f}")
assert u == {"low": 16, "high": 204}

# -- Activity -------------------------------------------------------------------------
section("activity: books from 10% to 30% of 100B")
before = exposure(mix, sizes, 100)["books"][1]
after = exposure({"web": 0.5, "code": 0.2, "books": 0.3}, sizes, 100)
print(f" books: {before:g} -> {after['books'][1]:g} passes; web {after['web'][0]:.0f}B seen ({after['web'][1]:.3f} passes)")
assert after["books"][1] == 6 and after["web"][0] == 50

# -- Try it ---------------------------------------------------------------------------
section("try it")
q = temperature({"a": 900, "b": 100}, 2)
print(f" sizes 900 and 100, tau = 2: weights {q['a']:.2f} / {q['b']:.2f}")
assert abs(q["b"] - 0.25) < 1e-12
print(f" 5B source at 25% of 200B: {0.25 * 200 / 5:g} passes")
u = unimax({"a": 900, "b": 100, "c": 2}, 300, 4)
print(" UniMax 900/100/2, 300B, N=4:", u)
assert u == {"c": 8, "b": 146, "a": 146}
