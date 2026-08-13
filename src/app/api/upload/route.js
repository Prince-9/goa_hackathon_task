export const runtime = "nodejs";

// Anonymous, no-signup image hosts we try in order. Each must accept a
// multipart file upload and return a direct public image URL as plain text.
async function tryCatbox(fileBlob, filename) {
  const fd = new FormData();
  fd.append("reqtype", "fileupload");
  fd.append("fileToUpload", fileBlob, filename);
  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: fd,
  });
  const text = (await res.text()).trim();
  if (res.ok && /^https?:\/\//.test(text)) return text;
  throw new Error(`catbox failed: ${res.status} ${text.slice(0, 200)}`);
}

async function try0x0(fileBlob, filename) {
  const fd = new FormData();
  fd.append("file", fileBlob, filename);
  const res = await fetch("https://0x0.st", {
    method: "POST",
    body: fd,
    headers: { "User-Agent": "hh-goa-frame-in-goa/1.0" },
  });
  const text = (await res.text()).trim();
  if (res.ok && /^https?:\/\//.test(text)) return text;
  throw new Error(`0x0.st failed: ${res.status} ${text.slice(0, 200)}`);
}

export async function POST(req) {
  try {
    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!file) {
      return Response.json({ error: "No file provided." }, { status: 400 });
    }

    const filename = "hh-goa-2026.png";
    let url;
    let lastError;
    for (const uploader of [tryCatbox, try0x0]) {
      try {
        url = await uploader(file, filename);
        break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!url) {
      return Response.json(
        { error: "Upload hosts unavailable.", detail: String(lastError) },
        { status: 502 }
      );
    }

    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
