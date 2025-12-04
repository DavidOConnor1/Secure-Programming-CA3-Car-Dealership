import { getDatabase } from "./init";

//allows SQL inject via direct string concatenation

export async function insecureSearch(search) {
    const db = await getDatabase();
    // allows use to directly put in SQL
    const query = `SELECT * FROM vehicles WHERE name LIKE '%${search}'`;

    console.log("Executing Query: ", query);

    const results = await db.all(query);

    return results;
}