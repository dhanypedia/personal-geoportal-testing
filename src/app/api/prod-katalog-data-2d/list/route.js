import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const res = await fetch(
      "https://matiur-geoportal.com/portal/api/katalog-data-2d/list",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("authorization") || "",
        },
        cache: "no-store",
      }
    );

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: result.message || "Gagal mengambil data" },
        { status: res.status }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}