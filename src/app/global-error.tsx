"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <button onClick={reset} style={{ padding: "10px 18px", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
