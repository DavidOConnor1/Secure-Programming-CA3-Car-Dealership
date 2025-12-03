import { getDatabase } from "./init";

//allows SQL inject via direct string concatenation

export async function insecureSearch(search) {
    const db = await getDatabase();
    // allows use to directly put in SQL
    const query = `SELECT * FROM vehicles WHERE name LIKE '%${search}'`;
    return await db.all(query);
}