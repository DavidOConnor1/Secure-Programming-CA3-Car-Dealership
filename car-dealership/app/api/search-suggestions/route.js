import { Search } from "lucide-react";

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

    //was previously malicious code
    //returns plain data, lets frontend to handle render safely
    return Response.json({
        success: true,
        query: query,
        suggestions: suggestions.map(s => s.replace(/[<>]/g, '')), //santizes the suggestion
        analytics: {
            searchTerm: query,
            timestamp: new Date().toISOString()
        }
    });

   
}