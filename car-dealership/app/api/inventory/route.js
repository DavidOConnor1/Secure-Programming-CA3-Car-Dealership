
import { vehicleRepository } from "@/app/lib/db/queries";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const filters = {
            minPrice: searchParams.get('minPrice'),
            maxPrice: searchParams.get('maxPrice'),
            year: searchParams.get('year'),
            transmission: searchParams.get('transmission'),
            color: searchParams.get('color'),
            search: searchParams.get('search'),
        };

        console.log("Testing VehicleQuery directly...");
        
        
        const vehicles = await vehicleRepository.getAllVehicles(filters);
        console.log("VehicleQuery instance created");
        
        
        
        return Response.json({
            success: true,
            data: vehicles,
            count: vehicles.length,
            message: "Direct VehicleQuery test successful"
        });

    } catch (error) {
        console.error('Direct test failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return Response.json({
            success: false,
            error: 'Failed to fetch inventory',
            message: error.message,
            test: 'direct-vehiclequery-failed'
        }, { status: 500 });
    }
}