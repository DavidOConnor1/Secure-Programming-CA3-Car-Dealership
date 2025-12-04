import { getDatabase } from "./init";

//allows SQL inject via direct string concatenation

//updated to no longer allow sql injection

export async function secureSearch(search) {
    const db = await getDatabase();
    //  used allow to directly put in SQL
    //now uses parameterized queries
    const query = `SELECT * FROM vehicles WHERE name LIKE ?`;
    const params = [`%${search}%`]

    console.log("Executing Secure Query: ", query, " with params: ",params);

    const results = await db.all(query, params);

    return results;
}