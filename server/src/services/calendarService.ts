import { google } from 'googleapis';
import { User } from '../models/user.model.js';

// Define the structure for a single event to be created
export interface CalendarEvent {
    title: string;
    description: string;
    startTime: string; // ISO 8601 format
    endTime: string;   // ISO 8601 format
}

/**
 * Creates one or more events in the user's Google Calendar.
 * @param user The user object, which must contain a refreshToken.
 * @param events An array of event objects to be created.
 * @returns A promise that resolves with the results of the event creation.
 */
export const createCalendarEvents = async (user: any, events: CalendarEvent[]) => {
    if (!user.refreshToken) {
        throw new Error('User has no refresh token. Please re-authenticate.');
    }

    // Create a new OAuth2 client with the user's credentials
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.SERVER_URL ? `${process.env.SERVER_URL}/auth/google/callback` : 'http://localhost:3000/auth/google/callback'
    );

    // Set the refresh token on the OAuth2 client
    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const creationPromises = events.map(event => {
        return calendar.events.insert({
            calendarId: 'primary', // Use the user's primary calendar
            requestBody: {
                summary: event.title,
                description: event.description,
                start: {
                    dateTime: event.startTime,
                    timeZone: 'America/Los_Angeles', // This could be made dynamic later
                },
                end: {
                    dateTime: event.endTime,
                    timeZone: 'America/Los_Angeles',
                },
            },
        });
    });

    try {
        const results = await Promise.all(creationPromises);
        console.log('Successfully created calendar events:', results.map(r => r.data.htmlLink));
        return { success: true, message: `Successfully created ${events.length} event(s).` };
    } catch (error) {
        console.error('Error creating calendar events:', error);
        throw new Error('Failed to create one or more calendar events.');
    }
}; 