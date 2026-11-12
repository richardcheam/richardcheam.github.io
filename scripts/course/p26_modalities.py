"""Reproduces src/content/blog/model-development-other-modalities.mdx.

Run: python3 scripts/course/p26_modalities.py   (pure Python)
Tokens per unit of content across modalities, and what they do to a context window.
"""


def section(title):
    print(f"\n== {title}")


section("image patches (ViT, 16 x 16 patches)")
for side in (224, 336, 1024):
    print(f" {side} x {side} image: {(side // 16) ** 2} patches")
assert (224 // 16) ** 2 == 196 and (1024 // 16) ** 2 == 4096

section("audio tokens (Mimi: 12.5 frames per second, 8 codebooks in Moshi)")
per_s = 12.5 * 8
print(f" {per_s:.0f} tokens per second; one minute = {per_s * 60:,.0f} tokens")
assert per_s == 100

section("activity: an 8,192-position context")
print(f" {8192 // 196} images of 224 x 224; about {8192 / 1.3:,.0f} words of English text")
print(f" audio, hypothetical flattened stream of 100 symbols/s: {8192 / 100:.0f} s; Moshi temporal layout, 12.5 positions/s: {8192 / 12.5:.0f} s")
assert 8192 // 196 == 41 and round(8192 / 100) == 82 and round(8192 / 12.5) == 655
