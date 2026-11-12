// Search snippets show roughly 155–160 characters. Keep whole sentences from the
// page's own summary while they fit; otherwise cut the first sentence at a word.
const LIMIT = 160;

export function metaDescription(text: string): string {
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= LIMIT) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [clean];
  let out = "";
  for (const s of sentences) {
    if ((out + s).trim().length > LIMIT) break;
    out += s;
  }
  out = out.trim();
  if (out.length >= 70) return out;
  const cut = clean.slice(0, LIMIT - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

// Facts only from the site's own home page and CV.
export const person = {
  "@type": "Person",
  "@id": "https://richardcheam.github.io/#person",
  name: "Richard Cheam",
  url: "https://richardcheam.github.io/",
  jobTitle: "AI / Machine Learning Engineer",
  worksFor: { "@type": "Organization", name: "Renault" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "ENSIIE" },
    { "@type": "CollegeOrUniversity", name: "Université Paris-Saclay" },
  ],
  knowsAbout: ["Machine learning", "Speech AI", "Large language models", "Deep learning"],
  sameAs: ["https://github.com/richardcheam", "https://www.linkedin.com/in/richard-cheam"],
};
