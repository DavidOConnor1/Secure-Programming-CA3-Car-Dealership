import { getDatabase } from "./init";

export async function getAllVehicles(filters = {}) {
    const db = await getDatabase();

    let query = `
    SELECT v.*,
    GROUP_CONCAT(f.name) as features
    FROM vehicles v
    LEFT JOIN vehicles_features vf on v.id = vf.vehicle_id
    LEFT JOIN features f on vf.feature_id = f.id
    WHERE v.is_sold = FALSE
    `;

    const params = [];
    const conditions = [];

    if(filters.minPrice)
    {
        conditions.push('v.price >= ?');
        params.push(filters.minPrice);
    }

    if(filters.maxPrice){
        conditions.push('v.price <= ?');
        params.push(filters.maxPrice);
    }

    if(filters.year){
        conditions.push('v.year = ?');
        params.push(filters.year);
    }

    if(filters.transmission){
        conditions.push('v.transmission LIKE ?');
        params.push(`%${filters.transmission}%`);
    }

    if(filters.color){
        conditions.push('v.color LIKE ?');
        params.push(`%${filters.color}%`);
    }

    if(filters.search){
        conditions.push(
            `
            (v.name LIKE ? OR
            v.description LIKE ? OR
            v.color LIKE ? OR
            v.enginer LIKE ?)
            `
        );

        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if(conditions.length > 0){
        query += 'GROUP BY v.id ORDER BY v.created_at DESC';

        const vehicles = await db.all(query, params);

        //Parse Features from String to array
        return vehicles.map(vehicle => ({
            ...vehicle,
            features: vehicle.features ? vehicle.features.split(',') : [],
            price: parseFloat(vehicle.price)
        }));
    }
}

export async function getVehicleById(id) {
    const db = await getDatabase();

    const vehicle = await db.get(`
        SELECT v.*,
        GROUP_CONCAT(f.name) as features
        FROM vehicles v
        LEFT JOIN vehicles_features vf on v.id = vf.vehicle_id
        LEFT JOIN features f on vf.feature_id = f.id
        WHERE v.id = ? AND v.is_sold = FALSE
        GROUP BY v.id
        `, [id]);

        if(!vehicle) return null;

        return {
            ... vehicle,
            features: vehicle.features ? vehicle.features.split(',') : [],
            price: parseFloat(vehicle.price)
        };
}

export async function createCart(sessionId) {
    const db = await getDatabase();

    const result = await db.run(
        'INSERT INTO carts (session_id) VALUES(?)',
        [sessionId]
    );
    return result.lastID;
}

export async function getOrCreateCart(sessionId) {
    const db = await getDatabase();

    let cart = await db.get(
        'SELECT * FROM carts WHERE session_id = ?',
        [sessionId]
    );

    if(!cart){
        const cartId = await createCart(sessionId);
        cart = await db.get('SELECT * FROM carts WHERE id = ?', [cartId]);

    }
    return cart;
    
}