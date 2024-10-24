export async function createMeetingsTableIfNotExists(env) {
  try {
    console.log("Checking if 'Meetings' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Meetings (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT NOT NULL,
        createdBy TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        isPublic INTEGER NOT NULL
      )`
    ).run();
    console.log("'Meetings' table ensured.");
  } catch (error) {
    console.error("Error creating 'Meetings' table:", error.message);
  }
}