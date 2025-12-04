export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    //simulate suggestions
    const suggestions = [
        `Honda ${query}`,
        `Toyota ${query}`,
        `${query} 2024`,
        `Used ${query}`
    ];

    //tracking suggestion
    if (query.length > 2) {
        suggestions.push(
            `<span data-search="${query}">Popular: ${query} </span>`
        );
    }

    //User Input in JSON response that is rendered
    return Response.json({
        success: true,
        query: query,
        suggestions: suggestions,
        //diguised analytics but contains raw html
        analytics: `<script>window._searchTerm="${query.replace(/"/g, '\\"')}" </script>`,
        timestamp: new Date().toISOString() + `<!-- Search: ${query} -->`
    });
}