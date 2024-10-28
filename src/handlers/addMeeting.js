import { createMeetingsTableIfNotExists } from './createMeetingsTableIfNotExists.js';
import { headers } from '../config.js';

export async function addMeeting(request, env) {
  await createMeetingsTableIfNotExists(env); // 确保表存在
  try {
    const meetingData = await request.json();
    console.log("Adding new meeting:", meetingData);
    
    const result = await env.DB.prepare(
      `INSERT INTO Meetings (name, date, time, location, createdBy) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      meetingData.name,
      meetingData.date,
      meetingData.time,
      meetingData.location,
      meetingData.createdBy
    ).run();
    
    console.log("Meeting added successfully:", result);
    return new Response(JSON.stringify({ 
      message: "Meeting added successfully" 
    }), {
      headers: headers,
    });
  } catch (error) {
    console.error("Error adding meeting:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: headers,
    });
  }
}
