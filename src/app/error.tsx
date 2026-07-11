"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page">
      <div className="container narrow-page">
        <section className="empty-state card">
          <h2>Something went wrong.</h2>
          <p>Please try again. If it keeps happening, come back in a moment.</p>
          <button className="button" onClick={reset}>Try again</button>
        </section>
      </div>
    </main>
  );
}
