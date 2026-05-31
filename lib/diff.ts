/**
 * Word-level diff between the raw transcript and the tidied output,
 * tailored to the four kinds of edits this product is allowed to make:
 *
 *  - filler removal       (um, uh, "like,")
 *  - capitalization       (start-of-sentence)
 *  - punctuation insertion (periods, commas the student didn't say)
 *  - whitespace cleanup    (collapsed)
 *
 * We deliberately use an LCS over a *normalized* token form (lowercase,
 * stripped of punctuation) so that case- and punctuation-only edits
 * appear as "same" matches, and we can visually flag them as
 * "tidied" rather than "different".
 */

export type DiffToken = {
  /** Verbatim text including the original casing/punctuation. */
  text: string;
  status:
    | "same"
    /** Word kept, but its casing or punctuation was lightly fixed. */
    | "polished"
    /** Word the student said that we removed (filler). */
    | "removed"
    /** A token (usually punctuation) we inserted. */
    | "added";
};

function tokenize(s: string): string[] {
  // Words (with apostrophes), runs of punctuation, runs of whitespace.
  return s.match(/[A-Za-z]+(?:'[A-Za-z]+)?|[^A-Za-z\s]+|\s+/g) ?? [];
}

function normalize(tok: string): string {
  return tok.replace(/[^A-Za-z]/g, "").toLowerCase();
}

function isWord(tok: string) {
  return /[A-Za-z]/.test(tok);
}

function isPunct(tok: string) {
  return /^[^A-Za-z\s]+$/.test(tok);
}

function isSpace(tok: string) {
  return /^\s+$/.test(tok);
}

/**
 * LCS over the WORD tokens (ignoring whitespace + punctuation).
 * Returns a pair of aligned arrays: for each side, every token is
 * tagged with its status.
 */
export function diffPair(
  raw: string,
  tidied: string,
): { rawTokens: DiffToken[]; tidiedTokens: DiffToken[] } {
  const a = tokenize(raw);
  const b = tokenize(tidied);

  // Build index arrays of *just* the words for LCS.
  const aWordIdx: number[] = [];
  const bWordIdx: number[] = [];
  a.forEach((t, i) => isWord(t) && aWordIdx.push(i));
  b.forEach((t, i) => isWord(t) && bWordIdx.push(i));

  const m = aWordIdx.length;
  const n = bWordIdx.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sameWord =
        normalize(a[aWordIdx[i - 1]]) === normalize(b[bWordIdx[j - 1]]);
      dp[i][j] = sameWord
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to produce per-word alignment.
  const aWordStatus: ("same" | "removed")[] = new Array(m).fill("removed");
  const bWordStatus: ("same" | "added")[] = new Array(n).fill("added");
  /** For every paired same-word, store the indices into a and b. */
  const pairs: Array<[number, number]> = [];
  {
    let i = m;
    let j = n;
    while (i > 0 && j > 0) {
      if (normalize(a[aWordIdx[i - 1]]) === normalize(b[bWordIdx[j - 1]])) {
        aWordStatus[i - 1] = "same";
        bWordStatus[j - 1] = "same";
        pairs.push([aWordIdx[i - 1], bWordIdx[j - 1]]);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
  }

  // Per-word "polished" flag = same word, different casing.
  const polishedA = new Set<number>();
  const polishedB = new Set<number>();
  for (const [ai, bi] of pairs) {
    if (a[ai] !== b[bi]) {
      polishedA.add(ai);
      polishedB.add(bi);
    }
  }

  // Map word-level statuses back onto the full token streams.
  // Whitespace tokens always inherit "same". Punctuation tokens are
  // "added"/"removed" depending on which side they appear on relative
  // to nearby paired words — we keep it simple: punctuation present
  // on tidied but not raw is "added"; on raw but not tidied is "removed".
  const rawTokens: DiffToken[] = a.map((t, idx) => {
    if (isSpace(t)) return { text: t, status: "same" };
    if (isWord(t)) {
      const wIdx = aWordIdx.indexOf(idx);
      const status = aWordStatus[wIdx];
      if (status === "removed") return { text: t, status: "removed" };
      return {
        text: t,
        status: polishedA.has(idx) ? "polished" : "same",
      };
    }
    // Punctuation — mark "removed" if it isn't echoed in tidied near
    // the same paired position. For simplicity, mark all raw punctuation
    // outside of common pairs as "removed".
    return { text: t, status: "removed" };
  });

  const tidiedTokens: DiffToken[] = b.map((t, idx) => {
    if (isSpace(t)) return { text: t, status: "same" };
    if (isWord(t)) {
      const wIdx = bWordIdx.indexOf(idx);
      const status = bWordStatus[wIdx];
      if (status === "added") return { text: t, status: "added" };
      return {
        text: t,
        status: polishedB.has(idx) ? "polished" : "same",
      };
    }
    // Punctuation on the tidied side is almost always an insertion.
    return { text: t, status: "added" };
  });

  return { rawTokens, tidiedTokens };
}
