import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function backendBase(): string {
  return (process.env.API_INTERNAL_URL ?? "http://localhost:8000").replace(
    /\/$/,
    "",
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const target = `${backendBase()}/${path.join("/")}${req.nextUrl.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { detail: "Upstream API is unreachable." },
      { status: 502 },
    );
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
