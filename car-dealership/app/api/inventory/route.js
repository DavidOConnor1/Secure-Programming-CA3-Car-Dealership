import { getDatabase } from "@/app/lib/db/init";
import { getAllVehicles } from "@/app/lib/db/queries";

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

        let vehicles;
        
        // Check if this is an insecure search (when search contains SQL injection patterns)
        if (filters.search && 
            (filters.search.includes("' OR '1'='1") || 
             filters.search.includes("' OR 1=1") ||
             filters.search.includes("--") ||
             filters.search.includes(";") ||
             filters.search.toUpperCase().includes("UNION"))) {
            
            
            const db = await getDatabase();
            
            // VULNERABLE: Direct string concatenation (SQL Injection)
            let whereClauses = ["is_sold = 0"];
            let queryParams = [];
            
            // Insecure search concatenation
            if (filters.search) {
                whereClauses.push(`name LIKE '%${filters.search}%'`);
            }
            
            // queries for minimum price
            if (filters.minPrice) {
                whereClauses.push(`price >= ?`);
                queryParams.push(filters.minPrice);
            }
            
            if (filters.maxPrice) {
                whereClauses.push(`price <= ?`);
                queryParams.push(filters.maxPrice);
            }
            
            if (filters.year) {
                whereClauses.push(`year = ?`);
                queryParams.push(filters.year);
            }
            
            if (filters.transmission) {
                whereClauses.push(`transmission = ?`);
                queryParams.push(filters.transmission);
            }
            
            if (filters.color) {
                whereClauses.push(`color = ?`);
                queryParams.push(filters.color);
            }
            
            const whereClause = whereClauses.length > 0 ? 
                `WHERE ${whereClauses.join(' AND ')}` : '';
            
            const query = `SELECT * FROM vehicles ${whereClause}`;
            
            console.log("⚠️ VULNERABLE QUERY EXECUTED:", query);
            
            vehicles = await db.all(query, queryParams);
            
            // Check if we should simulate customer data exposure
            if (filters.search.includes("' UNION") || filters.search.includes("customers")) {
                // Simulate what a UNION attack could expose
                const customers = await db.all("SELECT name, email, phone FROM customers LIMIT 3");
                console.log("🚨 POTENTIAL DATA LEAK: Customer data could be exposed via UNION attack");
            }
            
        } else {
            // Normal safe search
            vehicles = await getAllVehicles(filters);
        }

        return Response.json({
            success: true,
            data: vehicles,
            count: vehicles.length,
            filters,
            // Add subtle hint if insecure search was used
            note: filters.search && filters.search.includes("' OR '1'='1") ? 
                "Search returned all matching vehicles" : undefined
        });

    } catch (error) {
        console.error('Error fetching inventory: ', error);
        
        // If it's a SQL error from injection, give a hint
        const isSqlError = error.message.includes('SQL') || error.message.includes('syntax');
        
        return Response.json({
            success: false,
            error: 'Failed to fetch inventory',
            message: isSqlError ? 
                `SQL Error: Invalid query syntax. Try a different search.` : 
                error.message,
            hint: isSqlError ? "The search query may contain invalid SQL syntax" : undefined
        }, { status: 500 });
    }
}