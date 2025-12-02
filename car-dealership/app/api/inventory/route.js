import { getAllVehicles } from "@/app/lib/db/queries";

export async function GET(request) {
    try{
        const { searchParams } = new URL(request.url);

        const filters = {
            minPrice: searchParams.get('minPrice'),
            maxPrice: searchParams.get('maxPrice'),
            year: searchParams.get('year'),
            transmission: searchParams.get('transmission'),
            color: searchParams.get('color'),
            search: searchParams.get('search'),
        };

        const vehicles = await getAllVehicles(filters);

        return Response.json(vehicles);
    } catch (error) {
        console.error('Error fetching inventory: ',error);
        return Response.json(
            {error: 'Failed to fetch inventory'},
            { status:500}
        );
    }
}