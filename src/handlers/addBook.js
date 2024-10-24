import { createBooksTableIfNotExists } from './createBooksTableIfNotExists.js';
import { headers } from '../config.js';

export async function addBook(request, env) {
  await createBooksTableIfNotExists(env); // 确保表存在
  try {
    const bookData = await request.json();
    console.log("Adding new book:", bookData);
    const result = await env.DB.prepare(
      `INSERT INTO Books (name, author, abstract, createdBy) VALUES (?, ?, ?, ?)`
    ).bind(
      bookData.name,
      bookData.author,
      bookData.abstract,
      bookData.createdBy
    ).run();
    console.log("Book added successfully:", result);
    return new Response(JSON.stringify({ message: "Book added successfully" }), {
      headers: headers,
    });
  } catch (error) {
    console.error("Error adding book:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: headers,
    });
  }
}