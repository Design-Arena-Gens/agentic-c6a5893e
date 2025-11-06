import Link from "next/link";
import TestWorkbench from "../components/TestWorkbench";

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="badge">Utility</p>
          <h1>Quick Text Testing Playground</h1>
          <p className="tagline">
            Run lightweight checks on snippets of text, compare revisions, and
            inspect metrics in real time.
          </p>
        </div>
        <div className="hero-actions">
          <Link
            href="#workbench"
            className="button button-primary"
          >
            Open Workbench
          </Link>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
            className="button button-secondary"
          >
            Learn Next.js
          </a>
        </div>
      </header>

      <section id="workbench" className="panel">
        <TestWorkbench />
      </section>

      <footer className="footer">
        Built with Next.js and React &mdash; optimized for Vercel deployment.
      </footer>
    </main>
  );
}
