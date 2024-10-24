export async function createBooksTableIfNotExists(env) {
  try {
    console.log("Checking if 'Books' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        author TEXT NOT NULL,
        abstract TEXT,
        createdBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        commentCount INTEGER DEFAULT 0,
        isPublic BOOLEAN DEFAULT 1
      )`
    ).run();
    console.log("'Books' table ensured.");
  } catch (error) {
    console.error("Error creating 'Books' table:", error.message);
  }
}
