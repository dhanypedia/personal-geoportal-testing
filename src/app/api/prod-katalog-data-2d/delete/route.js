import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const data_2d_id = searchParams.get("data_2d_id");

    const res = await fetch(
      `https://matiur-geoportal.com/portal/api/katalog-data-2d/delete?data_2d_id=${data_2d_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: request.headers.get("authorization") || "",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: result.message || "Gagal menghapus layer" },
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