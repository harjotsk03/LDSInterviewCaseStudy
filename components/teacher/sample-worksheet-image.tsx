/**
 * An inline SVG of a "scanned worksheet" page that now contains the
 * passage and four questions — matching the multi-question model.
 *
 * Using SVG keeps the prototype self-contained (no image assets) and
 * crisp at any size. The styling intentionally evokes a printed
 * handout rather than a digital UI element.
 */
export function SampleWorksheetImage({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Sample worksheet: a short reading-comprehension passage about a lighthouse, followed by four questions."
    >
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBF8F1" />
          <stop offset="100%" stopColor="#F4EFE3" />
        </linearGradient>
        <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="#1F2937"
            floodOpacity="0.10"
          />
        </filter>
      </defs>

      <g filter="url(#paperShadow)">
        <rect
          x="14"
          y="14"
          width="372"
          height="572"
          rx="6"
          fill="url(#paper)"
          stroke="#E5DDCC"
          strokeWidth="1"
        />
      </g>

      <circle cx="32" cy="32" r="2" fill="#D4C7A8" />
      <circle cx="368" cy="32" r="2" fill="#D4C7A8" />

      <text
        x="40"
        y="58"
        fontFamily="Georgia, serif"
        fontSize="11"
        fill="#6B6253"
        letterSpacing="1"
      >
        ENGLISH · YEAR 8 · READING
      </text>
      <line
        x1="40"
        y1="68"
        x2="360"
        y2="68"
        stroke="#D4C7A8"
        strokeWidth="0.8"
      />

      <text
        x="40"
        y="90"
        fontFamily="Georgia, serif"
        fontSize="14"
        fontWeight="700"
        fill="#2D2A22"
      >
        from “The Lighthouse Keeper's Daughter”
      </text>

      <g
        fontFamily="Georgia, serif"
        fontSize="10.5"
        fill="#3A352B"
        opacity="0.92"
      >
        <text x="40" y="112">
          Mira had always thought the lighthouse on the cliff was creepy. Its
        </text>
        <text x="40" y="126">
          long white finger reached up out of the rocks like something that
        </text>
        <text x="40" y="140">
          didn't quite belong to the village. One afternoon, her grandmother
        </text>
        <text x="40" y="154">
          told her a different story — it had been her great-grandfather's
        </text>
        <text x="40" y="168">
          once, and on storm nights he'd climbed it to keep boats safe. By
        </text>
        <text x="40" y="182">
          the end of summer she'd climbed it herself, and called it hers.
        </text>
      </g>

      {/* Question block — 4 numbered questions */}
      <g>
        <rect
          x="32"
          y="200"
          width="336"
          height="372"
          rx="4"
          fill="#FFFDF6"
          stroke="#D4C7A8"
          strokeWidth="0.8"
        />

        <text
          x="44"
          y="218"
          fontFamily="Georgia, serif"
          fontSize="10"
          fontWeight="700"
          fill="#6B6253"
          letterSpacing="0.5"
        >
          ANSWER ANY ONE QUESTION
        </text>

        {/* Q1 */}
        <text
          x="44"
          y="244"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="700"
          fill="#2D2A22"
        >
          1.
        </text>
        <g fontFamily="Georgia, serif" fontSize="11" fill="#2D2A22">
          <text x="62" y="244">How does Mira's attitude toward the lighthouse</text>
          <text x="62" y="260">change between the beginning and the end?</text>
          <text x="62" y="276">Use specific details from the text.</text>
        </g>
        <line x1="44" y1="290" x2="356" y2="290" stroke="#E5DDCC" />

        {/* Q2 */}
        <text
          x="44"
          y="312"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="700"
          fill="#2D2A22"
        >
          2.
        </text>
        <g fontFamily="Georgia, serif" fontSize="11" fill="#2D2A22">
          <text x="62" y="312">What role does Mira's grandmother play in</text>
          <text x="62" y="328">how Mira sees the lighthouse?</text>
        </g>
        <line x1="44" y1="346" x2="356" y2="346" stroke="#E5DDCC" />

        {/* Q3 */}
        <text
          x="44"
          y="368"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="700"
          fill="#2D2A22"
        >
          3.
        </text>
        <g fontFamily="Georgia, serif" fontSize="11" fill="#2D2A22">
          <text x="62" y="368">Describe one image or phrase from the</text>
          <text x="62" y="384">passage that stayed with you, and explain why.</text>
        </g>
        <line x1="44" y1="402" x2="356" y2="402" stroke="#E5DDCC" />

        {/* Q4 */}
        <text
          x="44"
          y="424"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="700"
          fill="#2D2A22"
        >
          4.
        </text>
        <g fontFamily="Georgia, serif" fontSize="11" fill="#2D2A22">
          <text x="62" y="424">If you were Mira at the start of the story,</text>
          <text x="62" y="440">would you have climbed the lighthouse?</text>
          <text x="62" y="456">Explain your reasoning.</text>
        </g>

        {/* Faint answer lines under the question block */}
        <line x1="44" y1="482" x2="356" y2="482" stroke="#D4C7A8" strokeDasharray="2 3" />
        <line x1="44" y1="502" x2="356" y2="502" stroke="#D4C7A8" strokeDasharray="2 3" />
        <line x1="44" y1="522" x2="356" y2="522" stroke="#D4C7A8" strokeDasharray="2 3" />
        <line x1="44" y1="542" x2="356" y2="542" stroke="#D4C7A8" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}
