-- Vehicles Table

CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    mileage INTEGER DEFAULT 0,
    color TEXT NOT NULL,
    transmission TEXT NOT NULL,
    horsepower INTEGER,
    fuel_type TEXT NOT NULL,
    engine TEXT,
    description TEXT,
    is_sold BOOLEAN DEFAULT FALSE
)

--Features table
CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Vehocle features Junction TABLE

CREATE TABLE IF NOT EXISTS vehicles_features (
    
)