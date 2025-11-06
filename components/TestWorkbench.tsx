"use client";

import { useMemo, useState } from "react";

type TextMetrics = {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  averageWordLength: number;
  readingTimeMinutes: number;
  repeatedWords: string[];
};

type ComparisonMetrics = {
  wordDelta: number;
  characterDelta: number;
  similarity: number;
};

const defaultPrimary =
  "Testing requires setting expectations and measuring real outcomes. Paste your text here to explore quick insights.";
const defaultSecondary =
  "Testing is about defining expectations and validating reality. Drop an alternative cut here to compare.";

const repeatedWordLimit = 5;

function computeMetrics(raw: string): TextMetrics {
  const text = raw.trim();
  const words = text === "" ? [] : text.split(/\s+/);
  const sentences = text === "" ? [] : text.split(/[.!?]+/).filter(Boolean);
  const paragraphs = text === "" ? [] : text.split(/\n\s*\n/).filter(Boolean);

  const counts = words.reduce<Record<string, number>>((acc, word) => {
    const key = word.toLowerCase().replace(/[^a-z0-9'-]/gi, "");
    if (key === "") {
      return acc;
    }

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const repeatedWords = Object.entries(counts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, repeatedWordLimit)
    .map(([word]) => word);

  return {
    characters: text.length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    averageWordLength:
      words.length === 0
        ? 0
        : words.reduce((sum, word) => sum + word.length, 0) / words.length,
    readingTimeMinutes: words.length / 200,
    repeatedWords
  };
}

function computeComparison(primary: string, secondary: string): ComparisonMetrics {
  const primaryMetrics = computeMetrics(primary);
  const secondaryMetrics = computeMetrics(secondary);
  const totalWords = primaryMetrics.words + secondaryMetrics.words || 1;

  const sharedWords = new Set<string>();
  const primaryWords = primary
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9'-]/gi, ""))
    .filter(Boolean);
  const secondaryWords = secondary
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9'-]/gi, ""))
    .filter(Boolean);

  const primaryMap = new Set(primaryWords);
  secondaryWords.forEach((word) => {
    if (primaryMap.has(word)) {
      sharedWords.add(word);
    }
  });

  const similarity = totalWords === 0 ? 0 : (sharedWords.size * 2) / totalWords;

  return {
    wordDelta: secondaryMetrics.words - primaryMetrics.words,
    characterDelta: secondaryMetrics.characters - primaryMetrics.characters,
    similarity
  };
}

function formatMinutes(minutes: number): string {
  if (minutes === 0) {
    return "under 1 min";
  }

  if (minutes < 1) {
    return `${Math.max(1, Math.round(minutes * 60))} sec`;
  }

  return `${minutes.toFixed(1)} min`;
}

export default function TestWorkbench() {
  const [primary, setPrimary] = useState(defaultPrimary);
  const [secondary, setSecondary] = useState(defaultSecondary);

  const primaryMetrics = useMemo(() => computeMetrics(primary), [primary]);
  const secondaryMetrics = useMemo(() => computeMetrics(secondary), [secondary]);
  const comparison = useMemo(
    () => computeComparison(primary, secondary),
    [primary, secondary]
  );

  return (
    <div className="workbench">
      <div className="input-grid">
        <label className="input-group">
          <span className="label">
            Primary Text <span className="hint">(baseline)</span>
          </span>
          <textarea
            value={primary}
            onChange={(event) => setPrimary(event.target.value)}
            rows={8}
            aria-label="Primary text sample"
          />
        </label>
        <label className="input-group">
          <span className="label">
            Secondary Text <span className="hint">(comparison)</span>
          </span>
          <textarea
            value={secondary}
            onChange={(event) => setSecondary(event.target.value)}
            rows={8}
            aria-label="Secondary text sample"
          />
        </label>
      </div>

      <div className="metrics-grid">
        <section className="metrics-card">
          <h2>Primary Metrics</h2>
          <dl>
            <div>
              <dt>Characters</dt>
              <dd>{primaryMetrics.characters}</dd>
            </div>
            <div>
              <dt>Words</dt>
              <dd>{primaryMetrics.words}</dd>
            </div>
            <div>
              <dt>Sentences</dt>
              <dd>{primaryMetrics.sentences}</dd>
            </div>
            <div>
              <dt>Paragraphs</dt>
              <dd>{primaryMetrics.paragraphs}</dd>
            </div>
            <div>
              <dt>Average Word Length</dt>
              <dd>{primaryMetrics.averageWordLength.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Reading Time</dt>
              <dd>{formatMinutes(primaryMetrics.readingTimeMinutes)}</dd>
            </div>
          </dl>
          {primaryMetrics.repeatedWords.length > 0 && (
            <div className="repeated">
              <h3>Repeated Words</h3>
              <ul>
                {primaryMetrics.repeatedWords.map((word) => (
                  <li key={word}>{word}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="metrics-card">
          <h2>Secondary Metrics</h2>
          <dl>
            <div>
              <dt>Characters</dt>
              <dd>{secondaryMetrics.characters}</dd>
            </div>
            <div>
              <dt>Words</dt>
              <dd>{secondaryMetrics.words}</dd>
            </div>
            <div>
              <dt>Sentences</dt>
              <dd>{secondaryMetrics.sentences}</dd>
            </div>
            <div>
              <dt>Paragraphs</dt>
              <dd>{secondaryMetrics.paragraphs}</dd>
            </div>
            <div>
              <dt>Average Word Length</dt>
              <dd>{secondaryMetrics.averageWordLength.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Reading Time</dt>
              <dd>{formatMinutes(secondaryMetrics.readingTimeMinutes)}</dd>
            </div>
          </dl>
          {secondaryMetrics.repeatedWords.length > 0 && (
            <div className="repeated">
              <h3>Repeated Words</h3>
              <ul>
                {secondaryMetrics.repeatedWords.map((word) => (
                  <li key={word}>{word}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="metrics-card comparison-card">
          <h2>Comparison</h2>
          <dl>
            <div>
              <dt>Word Delta</dt>
              <dd className={comparison.wordDelta > 0 ? "positive" : comparison.wordDelta < 0 ? "negative" : ""}>
                {comparison.wordDelta >= 0 ? "+" : ""}
                {comparison.wordDelta}
              </dd>
            </div>
            <div>
              <dt>Character Delta</dt>
              <dd className={comparison.characterDelta > 0 ? "positive" : comparison.characterDelta < 0 ? "negative" : ""}>
                {comparison.characterDelta >= 0 ? "+" : ""}
                {comparison.characterDelta}
              </dd>
            </div>
            <div>
              <dt>Jaccard Similarity</dt>
              <dd>{(comparison.similarity * 100).toFixed(1)}%</dd>
            </div>
          </dl>
          <p className="comparison-note">
            Similarity uses a simple Jaccard index across distinct, lowercased
            tokens. Use it as a quick signal, not an exhaustive diff.
          </p>
        </section>
      </div>
    </div>
  );
}
