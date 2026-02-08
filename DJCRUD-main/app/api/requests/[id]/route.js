import mongoose from "mongoose";

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

function serverError(err) {
  const message = String(err?.message || "");
  if (message.includes("Missing MONGODB_URI")) {
    return Response.json({ error: message }, { status: 500 });
  }
  if (process.env.NODE_ENV !== "production" && message) {
    return Response.json({ error: message }, { status: 500 });
  }
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}

function unauthorized() {
  return Response.json(
    { error: "Admin key required or invalid." },
    { status: 401 },
  );
}

export async function DELETE(req, { params }) {
  try {
    if (!process.env.ADMIN_KEY) return adminNotConfigured();
    if (!isAdmin(req)) return unauthorized();

    // In Next.js 16+ `params` can be a Promise in Route Handlers.
    const awaitedParams = await params;
    const rawId = String(awaitedParams?.id || "");
    const id = rawId.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("DELETE invalid id:", { rawId, id, length: id.length });
      return Response.json(
        {
          error:
            process.env.NODE_ENV !== "production"
              ? `Invalid request id (${id.length} chars): ${id}`
              : "Invalid request id.",
        },
        { status: 400 },
      );
    }

    await dbConnect();
    const deleted = await Request.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "Request not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/requests/[id] failed:", err);
    return serverError(err);
  }
}
