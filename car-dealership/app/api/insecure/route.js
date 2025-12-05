import { secureSearch } from "@/app/lib/db/secure-queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const results = await secureSearch(search);

    return Response.json({
      success: true,
      data: results,
      //track injection attempts
      InjectionAttempt:
        search.includes("' OR ") ||
        search.includes("--") ||
        search.includes(";"),
      searchUsed: search,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        searchUsed: search,
      },
      { status: 500 }
    );
  }
}
