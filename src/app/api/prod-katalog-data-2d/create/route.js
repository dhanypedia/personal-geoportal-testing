import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const res = await fetch(
      "https://matiur-geoportal.com/portal/api/katalog-data-2d/create",
      {
        method: "POST",
        headers: {
          Authorization: request.headers.get("authorization") || "",
        },
        body: formData,
      }
    );

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: result.message || "Gagal menyimpan layer" },
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