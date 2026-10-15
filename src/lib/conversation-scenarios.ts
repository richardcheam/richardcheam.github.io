// Timelines for the cascade vs full-duplex figure. Durations in seconds.
// Cascade stages use the default budget of the latency figure; the full-duplex
// reply uses Moshi's reported 200 ms practical latency and stops within two
// 80 ms frames when interrupted.

export const BUDGET = { silence: 0.5, asr: 0.2, llm: 0.5, tts: 0.2 };
export const DUPLEX_LATENCY = 0.2;
export const DUPLEX_STOP = 0.16;
export const BARGE_IN = 0.2;
export const T_MAX = 9;

type Lane = "c-user" | "c-ai" | "d-user" | "d-ai";
export type Seg = { lane: Lane; kind: "speech" | "gate" | "stop" | "mark"; t0: number; t1: number; label?: string };

function cascadeReply(start: number, out: Seg[]) {
  let t = start;
  const stages: [keyof typeof BUDGET, string][] = [["silence", "wait"], ["asr", "ASR"], ["llm", "LLM"], ["tts", "TTS"]];
  for (const [k, label] of stages) {
    out.push({ lane: "c-ai", kind: "gate", t0: t, t1: t + BUDGET[k], label });
    t += BUDGET[k];
  }
  return t;
}

export function scenario(interrupt: boolean): Seg[] {
  const s: Seg[] = [];
  const userEnd = 1.8;
  s.push({ lane: "c-user", kind: "speech", t0: 0, t1: userEnd }, { lane: "d-user", kind: "speech", t0: 0, t1: userEnd });

  const cStart = cascadeReply(userEnd, s);
  const dStart = userEnd + DUPLEX_LATENCY;
  s.push({ lane: "c-ai", kind: "mark", t0: userEnd, t1: cStart, label: `+${(cStart - userEnd).toFixed(1)} s` });
  s.push({ lane: "d-ai", kind: "mark", t0: userEnd, t1: dStart, label: `+${DUPLEX_LATENCY.toFixed(1)} s` });

  if (!interrupt) {
    s.push({ lane: "c-ai", kind: "speech", t0: cStart, t1: cStart + 3 }, { lane: "d-ai", kind: "speech", t0: dStart, t1: dStart + 3 });
    return s;
  }
  // The user talks over the assistant 0.8 s into its reply, for 1.2 s.
  const cInt = cStart + 0.8, dInt = dStart + 0.8, talk = 1.2;
  s.push({ lane: "c-ai", kind: "speech", t0: cStart, t1: cInt + BARGE_IN });
  s.push({ lane: "c-ai", kind: "stop", t0: cInt, t1: cInt + BARGE_IN, label: "barge-in" });
  s.push({ lane: "c-user", kind: "speech", t0: cInt, t1: cInt + talk });
  const c2 = cascadeReply(cInt + talk, s);
  s.push({ lane: "c-ai", kind: "speech", t0: c2, t1: Math.min(T_MAX, c2 + 2) });
  s.push({ lane: "c-ai", kind: "mark", t0: cInt + talk, t1: c2, label: `+${(c2 - cInt - talk).toFixed(1)} s` });

  s.push({ lane: "d-ai", kind: "speech", t0: dStart, t1: dInt + DUPLEX_STOP });
  s.push({ lane: "d-ai", kind: "stop", t0: dInt, t1: dInt + DUPLEX_STOP, label: "2 frames" });
  s.push({ lane: "d-user", kind: "speech", t0: dInt, t1: dInt + talk });
  const d2 = dInt + talk + DUPLEX_LATENCY;
  s.push({ lane: "d-ai", kind: "speech", t0: d2, t1: d2 + 2 });
  s.push({ lane: "d-ai", kind: "mark", t0: dInt + talk, t1: d2, label: `+${DUPLEX_LATENCY.toFixed(1)} s` });
  return s;
}

// Geometry shared by the server render and the browser replay.
export const X0 = 112, PX = 72; // 9 s -> 648 px
export const LANE_Y: Record<Lane, number> = { "c-user": 66, "c-ai": 108, "d-user": 198, "d-ai": 240 };
export const x = (t: number) => X0 + t * PX;

function wave(t0: number, t1: number, y: number, seed: number) {
  let d = "";
  const n = Math.max(2, Math.round((t1 - t0) * 28));
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const env = Math.sin((Math.PI * i) / n) * 0.5 + 0.5;
    const a = (5 + 6 * Math.abs(Math.sin(seed + i * 0.9))) * env;
    d += `${i ? "L" : "M"}${x(t).toFixed(1)} ${(y + (i % 2 ? a : -a)).toFixed(1)} `;
  }
  return d.trim();
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** SVG markup for one scenario; every element carries data-t0/data-t1 for the replay. */
export function render(segs: Seg[]) {
  return segs
    .map((g, i) => {
      const y = LANE_Y[g.lane], a = `data-t0="${g.t0}" data-t1="${g.t1}" data-kind="${g.kind}"`;
      const user = g.lane.endsWith("user");
      if (g.kind === "speech") {
        return `<path ${a} d="${wave(g.t0, g.t1, y, i * 1.7)}" fill="none" stroke="${user ? "#5f5f66" : "#594578"}" stroke-width="1.6" stroke-linejoin="round"/>`;
      }
      if (g.kind === "gate") {
        const w = (g.t1 - g.t0) * PX, silent = g.label === "wait";
        const label = w >= 30 ? `<text x="${x(g.t0) + w / 2}" y="${y + 4}" font-size="10" text-anchor="middle" fill="${silent ? "#5f5f66" : "#594578"}">${esc(g.label!)}</text>` : "";
        return `<g ${a}><rect x="${x(g.t0)}" y="${y - 12}" width="${w - 1}" height="24" rx="4" fill="${silent ? "#ececf1" : "#594578"}" fill-opacity="${silent ? 1 : 0.14}" stroke="${silent ? "#d5d5dc" : "#594578"}" stroke-opacity="0.5"/>${label}</g>`;
      }
      if (g.kind === "stop") {
        return `<g ${a}><rect x="${x(g.t0)}" y="${y - 16}" width="${(g.t1 - g.t0) * PX}" height="32" fill="#a33b3b" fill-opacity="0.16"/><line x1="${x(g.t1)}" y1="${y - 16}" x2="${x(g.t1)}" y2="${y + 16}" stroke="#a33b3b" stroke-width="2"/><text x="${x(g.t1) + 4}" y="${y - 19}" font-size="10" fill="#a33b3b">${esc(g.label!)}</text></g>`;
      }
      // mark: bracket from the user's last word to the first reply audio
      const yy = y + 22;
      return `<g ${a}><path d="M${x(g.t0)} ${yy - 4} v4 h${(g.t1 - g.t0) * PX} v-4" fill="none" stroke="#2b2b30" stroke-width="1"/><text x="${x(g.t1) + 4}" y="${yy + 3}" font-size="11" font-weight="600" fill="#2b2b30">${esc(g.label!)}</text></g>`;
    })
    .join("");
}
