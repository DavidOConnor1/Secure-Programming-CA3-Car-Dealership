import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

// Singleton Database Manager Class
class DatabaseManager {
    static instance = null;
    connection = null;
    
    constructor() {
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        DatabaseManager.instance = this;
    }
    
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    
    async getConnection() {
    if (!this.connection) {
        this.connection = await open({
            filename: path.join(process.cwd(), "database.db"),
            driver: sqlite3.Database,
        });
        
        // Initialize database (tables, etc.)
        await this.initializeDatabase(this.connection);
    }
    
    // Check if database is already seeded
    const isSeeded = await this.checkIfSeeded();
    if (!isSeeded) {
        await this.seedDatabase(this.connection);
    }
    
    return this.connection;
}

async checkIfSeeded() {
    try {
        // Check if vehicles table has data
        const result = await this.connection.get(
            "SELECT COUNT(*) as count FROM vehicles"
        );
        return result.count > 0;
    } catch (error) {
        // Table might not exist yet
        return false;
    }
}
    
    async initializeDatabase(db) {
        // Enable foreign keys
        await db.run("PRAGMA foreign_keys = ON");
        
        // Create tables
        await this.createTables(db);
        
    }
    
    async createTables(db) {
        // DRY Principle: Single source of truth for table schemas
        const tableSchemas = [
            `CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                year INTEGER NOT NULL,
                price REAL NOT NULL,
                image_url TEXT NOT NULL,
                mileage INTEGER DEFAULT 0,
                color TEXT NOT NULL,
                transmission TEXT NOT NULL,
                horsepower INTEGER,
                fuel_type TEXT NOT NULL,
                engine TEXT,
                description TEXT,
                is_sold INTEGER DEFAULT 0
            )`,
            
            `CREATE TABLE IF NOT EXISTS features (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )`,
            
            `CREATE TABLE IF NOT EXISTS vehicle_features (
                vehicle_id INTEGER,
                feature_id INTEGER,
                PRIMARY KEY (vehicle_id, feature_id),
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
                FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
            )`,
            
            `CREATE TABLE IF NOT EXISTS carts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                user_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cart_id INTEGER NOT NULL,
                vehicle_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                added_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
                UNIQUE(cart_id, vehicle_id)
            )`,
            
            `CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                address TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                payment_method TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )`,
            
            `CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                vehicle_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_purchase REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
            )`
        ];
        
        // Execute all table creation queries
        for (const schema of tableSchemas) {
            await db.exec(schema);
        }
    }
    
    // Factory Method Pattern for sanitization
    createSanitizer() {
      const sanitizeText = (text) => {
        if(!text) return '';
        return text.replace(/[<>]/g, '');
      };
        return {
            sanitizeVehicleData: (vehicle) => ({
                ...vehicle,
                name: sanitizeText(vehicle.name),
                description: sanitizeText(vehicle.description),
                color: sanitizeText(vehicle.color),
                transmission: sanitizeText(vehicle.transmission),
                fuel_type: sanitizeText(vehicle.fuel_type),
                engine: sanitizeText(vehicle.engine),
            }),
        };
    }
    
    async seedDatabase(db) {
        // Check if data already exists
        const vehicleCount = await db.get("SELECT COUNT(*) as count FROM vehicles");
        if (vehicleCount.count > 0) return;
        
        // Seed features
        const features = [
            "VTEC Turbo", "Manual Transmission", "Automatic Transmission", "Convertible",
            "AWD", "RWD", "Turbocharged", "Supercharged", "Sunroof", "Leather Seats",
            "Navigation System", "Backup Camera", "Apple CarPlay", "Android Auto",
            "Heated Seats", "Ventilated Seats", "Premium Audio", "Keyless Entry",
            "Push Button Start", "Lane Keep Assist", "Adaptive Cruise Control",
            "Blind Spot Monitoring", "Parking Sensors", "360 Camera"
        ];
        
        // Batch insert features
        for (const feature of features) {
            await db.run("INSERT OR IGNORE INTO features (name) VALUES(?)", feature);
        }
        
        // Seed vehicles with sanitization
        const vehicles = this.getSeedVehicles();
        const sanitizer = this.createSanitizer();
        
        for (const vehicle of vehicles) {
            const sanitizedVehicle = sanitizer.sanitizeVehicleData(vehicle);
            
            const result = await db.run(
                `INSERT INTO vehicles (
                    name, year, price, image_url, mileage, color, transmission,
                    fuel_type, horsepower, engine, description
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sanitizedVehicle.name,
                    sanitizedVehicle.year,
                    sanitizedVehicle.price,
                    sanitizedVehicle.image_url,
                    sanitizedVehicle.mileage,
                    sanitizedVehicle.color,
                    sanitizedVehicle.transmission,
                    sanitizedVehicle.fuel_type,
                    sanitizedVehicle.horsepower,
                    sanitizedVehicle.engine,
                    sanitizedVehicle.description,
                ]
            );
            
            await this.addVehicleFeatures(db, result.lastID, vehicle.name);
        }
    }
    
    // Method Pattern for vehicle feature assignment
    async addVehicleFeatures(db, vehicleId, vehicleName) {
        const featureNames = this.getVehicleFeatures(vehicleName);
        
        for (const featureName of featureNames) {
            const feature = await db.get(
                "SELECT id FROM features WHERE name = ?",
                featureName
            );
            if (feature) {
                await db.run(
                    "INSERT INTO vehicle_features (vehicle_id, feature_id) VALUES(?,?)",
                    [vehicleId, feature.id]
                );
            }
        }
    }
    
    getVehicleFeatures(vehicleName) {
        // Strategy Pattern for feature assignment
        if (vehicleName.includes("Type R")) {
            return ["VTEC Turbo", "Manual Transmission", "Turbocharged", "Navigation System"];
        } else if (vehicleName.includes("MX-5")) {
            return ["Convertible", "Manual Transmission", "Keyless Entry", "Apple CarPlay"];
        } else if (vehicleName.includes("GR86")) {
            return ["RWD", "Manual Transmission", "Keyless Entry", "Backup Camera"];
        } else {
            return ["Classic", "Manual Transmission", "RWD", "Lightweight"];
        }
    }
    
    getSeedVehicles() {
        return [
            {
name: "2025 Honda Civic Type R",
year: 2025,
price: 87000,
image_url:
"https://www.autoblog.com/.image/w_3840,q_auto:good,c_limit/MjA5MDg4OTM3NDAxMTMyNjU2/2023-honda-civic-type-r.jpg",
mileage: 10,
color: "championship white",
transmission: "6-Speed Manual",
horsepower: 306,
fuel_type: "petrol",
engine: "2.0L VTEC TURBO",
description:
"Track ready performance and an engine that gives satifying speeds and reliability",
},
{
name: "2025 Mazda MX-5 Miata",
year: 2025,
price: 36900,
image_url:
"https://hips.hearstapps.com/hmg-prod/images/2025-mazda-mx-5-miata-35th-anniversary-pr-114-6792b9db0b3ec.jpg?crop=0.707xw:0.596xh;0.168xw,0.334xh&resize=2048:*",
mileage: 150,
color: "Soul Red Crystal",
transmission: "6-Speed Manual",
horsepower: 181,
fuel_type: "petrol",
engine: "2.0L I4",
description: "Pure driving experience",
},
{
name: "Toyota GR86",
year: 2024,
price: 32000,
image_url:
"https://c0.carzone.ie/Jato/Images/Photolib/Irl/TOYOTA/GR86/2023/2CO.JPG",
mileage: 3000,
color: "Trueno Blue",
transmission: "6-Speed Manual",
horsepower: 228,
fuel_type: "petrol",
engine: "2.4L Boxer-4",
description: "Affordable Sports Car",
},
{
name: "Toyota AE86 Trueno",
year: 2026,
price: 40000,
image_url:
"https://cdn.motor1.com/images/mgl/13P3q/s1/modern-day-toyota-ae86-rendering-front.webp",
mileage: 0,
color: "Black & White", // ADDED THIS MISSING FIELD
transmission: "5-Speed Manual",
horsepower: 130,
fuel_type: "Electric",
engine: "4A-GE",
description:
"Iconic Initial D drift legend. Classic Japanese sports coupe.",
},
//Stored XSS
{
name: "2024 Toyota Camry",
year: 2024,
price: 28000,
image_url:
"https://carwow-uk-wp-3.imgix.net/Toyota-Camry-Hybrid-Exterior-Dynamic-NOT-UK-SPEC-19.jpg",
mileage: 0,
color: "Midnight Black",
transmission: "Automatic",
horsepower: 203,
fuel_type: "Hybrid",
engine: "2.5L 4-cylinder",
description:
"Excellent fuel economy. Features include: <a href='javascript:console.log(`user clicked link`)'>Premium Audio</a> and <img src='/api/track?item=camry' style='display:none'>",
},
{
name: "Honda Civic LX",
year: 2023,
price: 23500,
image_url:
"https://di-uploads-pod10.dealerinspire.com/hondaworlddowney/uploads/2018/03/2017-honda-civic-lx-front-side.jpg",
mileage: 15000,
color: "Crystal Red",
transmission: "CVT",
horsepower: 158,
fuel_type: "Petrol",
engine: "2.0L",
description:
"Great daily driver. <iframe src='data:text/html,<script>parent.postMessage(`iframe loaded`,\"*\")</script>' style='width:0;height:0;border:0'></iframe>",
},
        ];
    }
    
    // Close connection (for testing/cleanup)
    async closeConnection() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Legacy export for backward compatibility
export async function getDatabase() {
    return await databaseManager.getConnection();
}

export async function initDatabase() {
    return await databaseManager.getConnection();
}