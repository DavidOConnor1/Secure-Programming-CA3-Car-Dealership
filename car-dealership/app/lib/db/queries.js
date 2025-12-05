import { databaseManager } from "./init";

// FACTORY PATTERN
// In queries.js, debug the factory:
class QueryFactory {
    static createQuery(type, options = {}) {
        console.log(`🏭 Factory: Creating query of type '${type}' with options:`, options);
        
        switch(type) {
            case 'vehicle':
                const query = new VehicleQuery();
                console.log(" Factory: VehicleQuery created");
                return query;
            case 'cart':
                const cartQuery = new CartQuery(options.sessionId);
                console.log(" Factory: CartQuery created");
                return cartQuery;
            case 'search':
                const searchQuery = new SearchQuery(options.filters);
                console.log(" Factory: SearchQuery created");
                return searchQuery;
            default:
                console.error(` Factory: Unknown query type: ${type}`);
                throw new Error(`Unknown query type: ${type}`);
        }
    }
}

// STRATEGY PATTERN 
class FilterStrategy {
    apply(queryBuilder, filters) {
        throw new Error('apply() must be implemented');
    }
}

class SearchFilterStrategy extends FilterStrategy {
    apply(queryBuilder, filters) {
        if (filters.search) {
            const sanitizer = databaseManager.createSanitizer();
            const searchTerm = `%${sanitizer.sanitizeText(filters.search)}%`;
            queryBuilder.where(`
                (v.name LIKE ? OR 
                 v.description LIKE ? OR 
                 v.color LIKE ? OR 
                 v.engine LIKE ? OR
                 v.fuel_type LIKE ?)
            `, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
    }
}

class PriceFilterStrategy extends FilterStrategy {
    apply(queryBuilder, filters) {
        if (filters.minPrice) {
            queryBuilder.where('v.price >= ?', parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            queryBuilder.where('v.price <= ?', parseFloat(filters.maxPrice));
        }
    }
}

class BasicFilterStrategy extends FilterStrategy {
    apply(queryBuilder, filters) {
        if (filters.year) {
            queryBuilder.where('v.year = ?', parseInt(filters.year));
        }
        if (filters.transmission) {
            queryBuilder.where('v.transmission LIKE ?', `%${filters.transmission}%`);
        }
        if (filters.color) {
            queryBuilder.where('v.color LIKE ?', `%${filters.color}%`);
        }
    }
}

// BUILDER PATTERN 
class VehicleQueryBuilder {
    constructor() {
        this.query = `
            SELECT v.*, 
                   GROUP_CONCAT(f.name) as features
            FROM vehicles v
            LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
            LEFT JOIN features f ON vf.feature_id = f.id
            WHERE v.is_sold = 0
        `;
        this.params = [];
        this.groupBy = 'v.id';
        this.orderBy = 'v.id DESC';
    }

    where(condition, ...params) {
        if (this.params.length === 0 && !this.query.includes('AND')) {
            this.query += ' AND ' + condition;
        } else {
            this.query += ' AND ' + condition;
        }
        this.params.push(...params);
        return this;
    }

    orderBy(field, direction = 'DESC') {
        this.orderBy = `${field} ${direction}`;
        return this;
    }

    groupBy(field) {
        this.groupBy = field;
        return this;
    }

    build() {
        this.query += ` GROUP BY ${this.groupBy} ORDER BY ${this.orderBy}`;
        return { query: this.query, params: this.params };
    }
}

// TEMPLATE METHOD PATTERN
class BaseQuery {
    constructor() {
        this.db = null;
    }

    async init() {
        if (!this.db) {
            this.db = await databaseManager.getConnection();
            // Don't re-initialize/seed here
        }
    }
  }

//  CONCRETE CLASSES
class VehicleQuery extends BaseQuery {
    constructor() {
        super();
        this.filterStrategies = [
            new SearchFilterStrategy(),
            new PriceFilterStrategy(),
            new BasicFilterStrategy()
        ];
    }

    async getAllVehicles(filters = {}) {
        try {
            console.log("VehicleQuery.getAllVehicles called with filters:", filters);
            
            const queryBuilder = new VehicleQueryBuilder();
            
            // Apply all filter strategies
            this.filterStrategies.forEach(strategy => {
                strategy.apply(queryBuilder, filters);
            });
            
            const { query, params } = queryBuilder.build();
            
            console.log("Built SQL query:", query);
            console.log("Query params:", params);
            
            // Make sure we have database connection
            if (!this.db) {
                await this.init();
            }
            
            const vehicles = await this.db.all(query, params);
            console.log(`Retrieved ${vehicles.length} raw vehicle records`);
            
            return this.processResults(vehicles);
            
        } catch (error) {
            console.error("VehicleQuery.getAllVehicles error:", error);
            throw error;
        }
    }

    async getVehicleById(id) {
        const vehicle = await this.getOne(`
            SELECT v.*,
                   GROUP_CONCAT(f.name) as features
            FROM vehicles v
            LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
            LEFT JOIN features f ON vf.feature_id = f.id
            WHERE v.id = ? AND v.is_sold = FALSE
            GROUP BY v.id
        `, [id]);

        if (!vehicle) return null;
        return this.processResults([vehicle])[0];
    }

    // Template method implementation
    async processResults(vehicles) {
        return vehicles.map((vehicle) => ({
            ...vehicle,
            features: vehicle.features ? vehicle.features.split(",") : [],
            price: parseFloat(vehicle.price),
        }));
    }
}

// In your queries.js file, replace CartQuery with this:
class CartQuery {
    constructor(sessionId) {
        this.sessionId = sessionId;
    }

    async getCartWithItems() {
        const db = await databaseManager.getConnection();
        
        const cart = await db.get("SELECT * FROM carts WHERE session_id = ?", [
            this.sessionId,
        ]);

        if (!cart) return null;

        // Get all cart items with vehicle details
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

        const processedItems = items.map((item) => ({
            ...item,
            features: item.features ? item.features.split(",") : [],
            price: parseFloat(item.price),
        }));

        const cartTotal = processedItems.reduce(
            (total, item) => total + item.price * item.quantity,
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
            count: cartCount,
        };
    }

    async getOrCreateCart() {
        const db = await databaseManager.getConnection();
        
        let cart = await db.get("SELECT * FROM carts WHERE session_id = ?", [
            this.sessionId,
        ]);

        if (!cart) {
            const result = await db.run("INSERT INTO carts (session_id) VALUES(?)", [
                this.sessionId,
            ]);
            const cartId = result.lastID;
            cart = await db.get("SELECT * FROM carts WHERE id = ?", [cartId]);
        }
        return cart;
    }

    async addToCart(vehicleId, quantity = 1) {
        const db = await databaseManager.getConnection();
        const cart = await this.getOrCreateCart();

        // Check if vehicle exists and is available
        const vehicle = await db.get(
            `SELECT id FROM vehicles WHERE id = ? AND is_sold = FALSE`,
            [vehicleId]
        );

        if (!vehicle) {
            throw new Error("Vehicle not found or sold");
        }

        // Check if item is already in cart
        const existingItem = await db.get(
            "SELECT * FROM cart_items WHERE cart_id = ? AND vehicle_id = ?",
            [cart.id, vehicleId]
        );

        if (existingItem) {
            // Update quantity
            await db.run("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [
                quantity,
                existingItem.id,
            ]);
        } else {
            // Add new item
            await db.run(
                "INSERT INTO cart_items (cart_id, vehicle_id, quantity) VALUES (?, ?, ?)",
                [cart.id, vehicleId, quantity]
            );
        }
        return await this.getCartWithItems();
    }

    async updateCartItem(vehicleId, quantity) {
        const db = await databaseManager.getConnection();
        const cart = await db.get("SELECT * FROM carts WHERE session_id = ?", [
            this.sessionId,
        ]);

        if (!cart) throw new Error("Cart not found");

        if (quantity < 1) {
            // Remove item
            await db.run(
                "DELETE FROM cart_items WHERE cart_id = ? AND vehicle_id = ?",
                [cart.id, vehicleId]
            );
        } else {
            // Update quantity
            await db.run(
                "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND vehicle_id = ?",
                [quantity, cart.id, vehicleId]
            );
        }
        return await this.getCartWithItems();
    }

    async removeFromCart(vehicleId) {
        return this.updateCartItem(vehicleId, 0);
    }

    async clearCart() {
        const db = await databaseManager.getConnection();
        const cart = await db.get("SELECT * FROM carts WHERE session_id = ?", [
            this.sessionId,
        ]);

        if (!cart) return { success: true };

        await db.run("DELETE FROM cart_items WHERE cart_id = ?", [cart.id]);

        return { success: true };
    }
}

class SearchQuery extends BaseQuery {
    constructor(filters = {}) {
        super();
        this.filters = filters;
    }

    async executeSearch() {
        const vehicleQuery = new VehicleQuery();
        return await vehicleQuery.getAllVehicles(this.filters);
    }
}

//FACADE PATTERN 

export const vehicleRepository = {
    // Factory Pattern usage
    async getAllVehicles(filters = {}) {
        try {
            console.log("🔍 Repository: Getting vehicles with filters:", filters);
            
            // FACTORY PATTERN: Create vehicle query
            const query = QueryFactory.createQuery('vehicle');
            
            // Check if query was created
            if (!query) {
                throw new Error("Failed to create query object");
            }
            
            console.log("Repository: Query object created successfully");
            
            // Execute the query
            const result = await query.getAllVehicles(filters);
            
            console.log(`Repository: Retrieved ${result.length} vehicles`);
            
            return result;
        } catch (error) {
            console.error(" Repository Error in getAllVehicles:", error);
            console.error("Error stack:", error.stack);
            throw error; // Re-throw to be caught by API
        }
    },


    async getVehicleById(id) {
        const query = QueryFactory.createQuery('vehicle');
        return await query.getVehicleById(id);
    },

    async searchVehicles(filters = {}) {
        const query = QueryFactory.createQuery('search', { filters });
        return await query.executeSearch();
    }
};

export const cartRepository = {
    // Factory Pattern usage
    async getOrCreateCart(sessionId) {
        const query = QueryFactory.createQuery('cart', { sessionId });
        return await query.getOrCreateCart();
    },

    async addToCart(sessionId, vehicleId, quantity = 1) {
        const query = QueryFactory.createQuery('cart', { sessionId });
        return await query.addToCart(vehicleId, quantity);
    },

    async getCartWithItems(sessionId) {
        const query = QueryFactory.createQuery('cart', { sessionId });
        return await query.getCartWithItems();
    },

    async updateCartItem(sessionId, vehicleId, quantity) {
        const query = QueryFactory.createQuery('cart', { sessionId });
        return await query.updateCartItem(vehicleId, quantity);
    },

    async removeFromCart(sessionId, vehicleId) {
        const query = QueryFactory.createQuery('cart', { sessionId });
        return await query.removeFromCart(vehicleId);
    },

    async clearCart(sessionId) {
        const query = QueryFactory.createQuery('cart', { sessionId });
        return await query.clearCart();
    }
};

// OBSERVER PATTERN
class QueryObserver {
    constructor() {
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify(event, data) {
        this.subscribers.forEach(callback => callback(event, data));
    }
}

export const queryObserver = new QueryObserver();

// Subscribe to query events 
queryObserver.subscribe((event, data) => {
    if (event === 'search') {
        console.log(`Search performed: "${data.searchTerm}", found ${data.results.length} results`);
    }
    if (event === 'cart_update') {
        console.log(`Cart updated: ${data.items.length} items, total: $${data.total}`);
    }
});



export async function getAllVehicles(filters = {}) {
    return await vehicleRepository.getAllVehicles(filters);
}

export async function getVehicleById(id) {
    return await vehicleRepository.getVehicleById(id);
}

export async function createCart(sessionId) {
    const cartQuery = new CartQuery(sessionId);
    return await cartQuery.createCart();
}

export async function getOrCreateCart(sessionId) {
    return await cartRepository.getOrCreateCart(sessionId);
}

export async function addToCart(sessionId, vehicleId, quantity = 1) {
    return await cartRepository.addToCart(sessionId, vehicleId, quantity);
}

export async function getCartWithItems(sessionId) {
    return await cartRepository.getCartWithItems(sessionId);
}

export async function updateCartItem(sessionId, vehicleId, quantity) {
    return await cartRepository.updateCartItem(sessionId, vehicleId, quantity);
}

export async function removeFromCart(sessionId, vehicleId) {
    return await cartRepository.removeFromCart(sessionId, vehicleId);
}

export async function clearCart(sessionId) {
    return await cartRepository.clearCart(sessionId);
}