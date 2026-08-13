export const runtime = "nodejs";

function safeUrl(v) {
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {}
  return null;
}

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const img = safeUrl(sp?.img);
  const text = sp?.text || "Just got my HH Goa 2026 builder graphic ✨ #FrameInGoa";

  const base = {
    title: "HH Goa 2026 — Frame in Goa",
    description: text,
  };

  if (!img) return base;

  return {
    ...base,
    openGraph: {
      title: "HH Goa 2026 — Frame in Goa",
      description: text,
      images: [{ url: img, width: 1080, height: 1080 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "HH Goa 2026 — Frame in Goa",
      description: text,
      images: [img],
    },
  };
}

export default async function SharePage({ searchParams }) {
  const sp = await searchParams;
  const img = safeUrl(sp?.img);
  const text = sp?.text || "Just got my HH Goa 2026 builder graphic ✨ #FrameInGoa";
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B6839",
        color: "#FFFBE8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        gap: 20,
      }}
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt="HH Goa 2026 graphic"
          style={{ maxWidth: 360, borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
        />
      ) : (
        <p>No graphic attached.</p>
      )}
      <p style={{ maxWidth: 420, opacity: 0.85 }}>{text}</p>
      <a
        href={intent}
        style={{
          background: "#FF0080",
          color: "#FFFBE8",
          fontWeight: 700,
          padding: "14px 28px",
          borderRadius: 999,
          textDecoration: "none",
          border: "2px solid #000",
        }}
      >
        Open on X
      </a>
    </main>
  );
}
