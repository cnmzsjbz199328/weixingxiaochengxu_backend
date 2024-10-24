export async function createUsersTableIfNotExists(env) {
  try {
    console.log("Checking if 'Users' table exists...");
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openid TEXT NOT NULL,
        nickName TEXT NOT NULL,
        avatarUrl TEXT,
        joinDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        booksRead INTEGER DEFAULT 0,
        meetingsAttended INTEGER DEFAULT 0
      )`
    ).run();
    console.log("'Users' table ensured.");
  } catch (error) {
    console.error("Error creating 'Users' table:", error.message);
  }
}
