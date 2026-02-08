import dbConnect from "@/lib/mongodb";
import Request from "@/models/Request";

export const runtime = "nodejs";

function isAdmin(req) {
  const provided = req.headers.get("x-admin-key");
  const expected = process.env.ADMIN_KEY;
  return Boolean(expected && provided && provided === expected);
}

function adminNotConfigured() {
  return Response.json(
    { error: "Server misconfigured: ADMIN_KEY is not set." },
    { status: 500 },
  );
}

function badRequest(message) {
  return Response.json({ error: message }, { status: 400 });
}

function unauthorized() {
  return Response.json(
    { error: "Admin key required or invalid." },
    { status: 401 },
  );
}

function cleanString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function serverError(err) {
  const message = String(err?.message || "");
  if (message.includes("Missing MONGODB_URI")) {
    return Response.json({ error: message }, { status: 500 });
  }
  // In dev, bubble up the actual error message to make setup/debugging easy.
  // In production, keep the response generic.
  if (process.env.NODE_ENV !== "production" && message) {
    return Response.json({ error: message }, { status: 500 });
  }
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body.");

    const name = cleanString(body.name);
    const song = cleanString(body.song);

    if (name.length < 2) return badRequest("Name must be at least 2 characters.");
    if (song.length < 2) return badRequest("Song must be at least 2 characters.");

    await dbConnect();
    const created = await Request.create({ name, song });

    return Response.json(
      {
        ok: true,
        request: {
          id: created._id.toString(),
          name: created.name,
          song: created.song,
          status: created.status,
          createdAt: created.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/requests failed:", err);
    return serverError(err);
  }
}

export async function GET(req) {
  try {
    if (!process.env.ADMIN_KEY) return adminNotConfigured();
    if (!isAdmin(req)) return unauthorized();

    await dbConnect();
    const requests = await Request.find({})
      .sort({ createdAt: -1 })
      .select("name song status createdAt")
      .limit(500)
      .lean({ virtuals: false });

    return Response.json({
      ok: true,
      requests: requests.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        song: r.song,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET /api/requests failed:", err);
    return serverError(err);
  }
}
