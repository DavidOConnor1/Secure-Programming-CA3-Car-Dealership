import { insecureSearch } from "@/app/lib/db/insecure-queries";

export async function GET(request){
    const {searchParams} = new URL(request.url);
    const search = searchParams.get('search') || '';

    try {
        const results = await insecureSearch(search);

        return Response.json({
            success: true,
            data: results,
            isInjected: search.includes("' OR ") || search.includes("--") || search.includes(";"),
            searchUsed: search
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
            searchUsed: search,
            isVulnerable: true
        });
    }
}