import { getDatabase } from "./init";

export async function getAllVehicles(filters = {}) {
  const db = await getDatabase();
  
  try {
    let query = `
      SELECT v.*, 
             GROUP_CONCAT(f.name) as features
      FROM vehicles v
      LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
      LEFT JOIN features f ON vf.feature_id = f.id
      WHERE v.is_sold = 0
    `;
    
    const params = [];
    const conditions = [];
    
    // Search filter
    if (filters.search) {
      conditions.push(`
        (v.name LIKE ? OR 
         v.description LIKE ? OR 
         v.color LIKE ? OR 
         v.engine LIKE ? OR
         v.fuel_type LIKE ?)
      `);
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Price filters
    if (filters.minPrice) {
      conditions.push('v.price >= ?');
      params.push(parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      conditions.push('v.price <= ?');
      params.push(parseFloat(filters.maxPrice));
    }
    
    // Year filter
    if (filters.year) {
      conditions.push('v.year = ?');
      params.push(parseInt(filters.year));
    }
    
    // Transmission filter
    if (filters.transmission) {
      conditions.push('v.transmission LIKE ?');
      params.push(`%${filters.transmission}%`);
    }
    
    // Color filter
    if (filters.color) {
      conditions.push('v.color LIKE ?');
      params.push(`%${filters.color}%`);
    }
    
    // Add conditions to query
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY v.id ORDER BY v.id DESC';
    
    console.log('SQL Query:', query);
    console.log('SQL Params:', params);
    
    const vehicles = await db.all(query, params);
    console.log('Found vehicles:', vehicles.length);
    
    // Parse features from string to array
    const processedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      features: vehicle.features ? vehicle.features.split(',') : [],
      price: parseFloat(vehicle.price)
    }));
    
    return processedVehicles;
    
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    console.error('SQLite error details:', error.message);
    
    // Return empty array on error
    return [];
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

export async function addToCart(sessionId, vehicleId, quantity = 1) {
    const db = await getDatabase();

    const cart = await getOrCreateCart(sessionId);

    //check if the vehicle exists and is available
    const vehicle = await db.get(
        `SELECT id FROM vehicles WHERE id = ? AND is_sold = FALSE`,
        [vehicleId]
    );

    if(!vehicle){
        throw new Error('Vehicle not found or sold');
    }

    //checking if the item is in cart
    const existingItem = await db.get(
        'SELECT * FROM cart_items WHERE cart_id = ? AND vehicle_id =?',
        [cart.id, vehicleId]
    );

    if(existingItem){
        //Update quantity
        await db.run(
            'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
            [quantity, existingItem.id]
        );
    } else {
        //add new item
        await db.run(
        'INSERT INTO cart_items (cart_id, vehicle_id, quantity) VALUES (?, ?, ?)',
        [cart.id, vehicleId, quantity]
        );
    }
    return await getCartWithItems(sessionId);
}


export async function getCartWithItems(sessionId) {
    const db = await getDatabase();

    const cart = await db.get(
        'SELECT * FROM carts WHERE session_id = ?',
        [sessionId]
    );

    if(!cart) return null;

    const items = await db.all(`
    SELECT ci.*, 
           v.name, v.year, v.price, v.image_url, v.color, v.transmission,
           GROUP_CONCAT(f.name) as features
    FROM cart_items ci
    JOIN vehicles v ON ci.vehicle_id = v.id
    LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
    LEFT JOIN features f ON vf.feature_id = f.id
    WHERE ci.cart_id = ?
    GROUP BY ci.id
  `, [cart.id]);
  
  const processedItems = items.map(item => ({
    ...item,
    features: item.features ? item.features.split(',') : [],
    price: parseFloat(item.price)
  }));
  
  const cartTotal = processedItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  
  const cartCount = processedItems.reduce(
    (count, item) => count + item.quantity,
    0
  );
  
  return {
    ...cart,
    items: processedItems,
    total: cartTotal,
    count: cartCount
  };
}

export async function updateCartItem(sessionId, vehicleId, quantity)
{
    const db = await getDatabase();

    const cart = await db.get(
        'SELECT * FROM carts WHERE session_id = ?',
        [sessionId]
    );

    if(!cart) throw new Error('cart not found');

    if(quantity < 1){
        //remove item
        await db.run(
            'DELETE FROM cart_items WHERE cart_id = ? AND vehicle_id = ?',
            [cart.id, vehicleId]
        );
    } else {
        //updaating the quantity
        await db.run(
            'UPDATE cart_items SET quantity = ? WHERE cart_id = ? and vehicle_id = ?',
            [quantity, cart.id, vehicleId]
        );
    }
     return await getCartWithItems(sessionId);
}

export async function removeFromCart(sessionId, vehicleId){
    return updateCartItem(sessionId, vehicleId, 0);
}

export async function clearCart(sessionId){
    const db = await getDatabase();

    const cart = await db.get(
        'SELECT * FROM carts WHERE session_id = ?',
        [sessionId]
    );

    if(!cart) return;

    await db.run('DELETE FROM cart_items WHERE cart_id = ?', 
        [cart.id]
    );

    return {success: true};
}   

