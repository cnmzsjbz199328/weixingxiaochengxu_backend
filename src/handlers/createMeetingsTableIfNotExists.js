export async function createMeetingsTableIfNotExists(env) {
  try {
    console.log("Checking if 'Meetings' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isPublic BOOLEAN DEFAULT 1
      )`
    ).run();
    console.log("'Meetings' table ensured.");
  } catch (error) {
    console.error("Error creating 'Meetings' table:", error.message);
  }
}
