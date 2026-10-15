"""Toy 2 (v2: two targets so the summed vector must carry BOTH the reference and the stream token): additive vs insertive injection in a tiny causal transformer (CPU).
Task: a 'conversation' stream of T random tokens; a reference of L symbols must be
reproduced in REVERSE order at the last L positions (the 'body'),\nso the first body slot needs the LAST reference vector. Each body slot also has to\nrecall the stream token at position s+k (the conversation the reference was summed onto). The reference enters either
  additive : summed onto stream positions [s, s+L)   (length stays T)
  insertive: inserted as L extra positions at s      (length T+L)
'late' = additive with s chosen so the reference is still streaming in when the body starts.
This is a toy, not a reproduction of the paper."""
import torch, torch.nn as nn, time, sys
torch.manual_seed(0)
V, R, T, L, D = 16, 16, 24, 6, int(__import__("os").environ.get("D","16"))        # stream vocab, ref vocab, stream len, ref len, width
BODY = T - L                              # body occupies positions BODY..T-1

class Net(nn.Module):
    def __init__(s, maxlen):
        super().__init__()
        s.tok = nn.Embedding(V, D); s.ref = nn.Embedding(R, D)
        s.proj = nn.Linear(D, D)          # one linear layer, as in the paper
        s.pos = nn.Embedding(maxlen, D)
        layer = nn.TransformerEncoderLayer(D, 4, 4*D, 0.0, batch_first=True, norm_first=True)
        s.enc = nn.TransformerEncoder(layer, 2); s.out = nn.Linear(D, R); s.out2 = nn.Linear(D, V)
    def forward(s, x, ref, mode, start):
        B = x.shape[0]; h = s.tok(x); r = s.proj(s.ref(ref))
        if mode == "add":
            h = h.clone(); h[:, start:start+L] = h[:, start:start+L] + r
            body_idx = torch.arange(BODY, T)
        else:
            h = torch.cat([h[:, :start], r, h[:, start:]], 1)
            body_idx = torch.arange(BODY, T) + L
        n = h.shape[1]; h = h + s.pos(torch.arange(n))
        mask = nn.Transformer.generate_square_subsequent_mask(n)
        h = s.enc(h, mask=mask, is_causal=True)
        # each body position predicts reference symbol k (predict next-to-say from state)
        hb = h[:, body_idx]
        return s.out(hb), s.out2(hb)

def run(mode, start, steps=1500, seed=0):
    torch.manual_seed(seed); net = Net(T + L); opt = torch.optim.Adam(net.parameters(), 3e-3)
    for it in range(steps):
        x = torch.randint(0, V, (128, T)); ref = torch.randint(0, R, (128, L))
        a, b = net(x, ref, mode, start); ce = nn.functional.cross_entropy
        loss = ce(a.reshape(-1, R), ref.flip(1).reshape(-1)) + ce(b.reshape(-1, V), x[:, start:start+L].reshape(-1))
        opt.zero_grad(); loss.backward(); opt.step()
    with torch.no_grad():
        x = torch.randint(0, V, (4000, T)); ref = torch.randint(0, R, (4000, L))
        a, b = net(x, ref, mode, start)
        acc = (a.argmax(-1) == ref.flip(1)).float().mean(0); acc2 = (b.argmax(-1) == x[:, start:start+L]).float().mean()
    return acc, acc2

t0 = time.time()
cfgs = [("insertive, early (s=4)", "ins", 4),
        ("additive,  early (s=4)", "add", 4),
        ("insertive, late (s=16)", "ins", 16),
        ("additive,  late (s=16, slots 0-1 need ref not yet arrived)", "add", 16)]
for name, mode, s in cfgs:
    res = [run(mode, s, seed=k) for k in range(2)]
    m = torch.stack([r[0] for r in res]).mean(0); m2 = sum(r[1] for r in res) / len(res)
    print(f"{name:60s} ref-recall {m.mean():.3f} | per slot {[round(v,2) for v in m.tolist()]} | conversation-recall {m2:.3f}", flush=True)
print(f"D={D}; chance = {1/R:.3f}; runtime {time.time()-t0:.0f} s")
