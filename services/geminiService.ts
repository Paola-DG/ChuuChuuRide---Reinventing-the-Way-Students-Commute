
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import type { Ride, UserProfile, AIResponse } from '../types';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

// Define the function declaration for the model
const requestRideFunctionDeclaration: FunctionDeclaration = {
    name: 'requestRide',
    description: "Use this function when a user wants to find, book, or request a ride. Analyze the user's prompt to extract the origin, destination, and any other relevant details such as event names, times, or preferences (like 'quiet' or 'music').",
    parameters: {
        type: Type.OBJECT,
        properties: {
            origin: {
                type: Type.STRING,
                description: "The starting point of the ride, e.g., 'Brickell, Miami'."
            },
            destination: {
                type: Type.STRING,
                description: "The destination of the ride, e.g., 'FIU Graham Center'."
            },
            details: {
                type: Type.STRING,
                description: "Any other relevant information from the user's prompt. This can include event names ('for ShellHacks'), desired arrival/departure times, or preferences ('looking for a quiet ride')."
            },
        },
        required: ["origin", "destination", "details"],
    },
};

const findBestRideMatch = (rides: Ride[], args: { origin: string; destination: string; details: string }, currentUser: UserProfile): Ride | null => {
    const { destination, details } = args;
    const destinationLower = destination.toLowerCase();
    const detailsLower = details.toLowerCase();

    const availableRides = rides.filter(ride => 
        ride.driver.id !== currentUser.id && ride.driver.role !== 'Organization'
    );

    let bestMatch: Ride | null = null;
    let highestScore = -1;

    for (const ride of availableRides) {
        let score = 0;
        const rideDestinationLower = ride.destination.toLowerCase();
        
        // Basic destination match
        if (rideDestinationLower.includes(destinationLower) || destinationLower.includes(rideDestinationLower)) {
            score += 5;
        }

        // Check for event name match in details
        if (ride.eventId && detailsLower.includes('event')) {
             // A more robust check would be to match event name, but this is a simple heuristic
             score += 3;
        }
        
        // Simple preference match
        if (detailsLower.includes(ride.driver.preferences.chattiness.toLowerCase())) {
            score += 1;
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = ride;
        }
    }

    // Only return a match if it has a reasonable score
    return highestScore >= 5 ? bestMatch : null;
};


export const getAIResponse = async (prompt: string, rides: Ride[], currentUser: UserProfile): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are ChuuChuuRide AI, an AI assistant for a student carpooling app. Your primary goal is to help students get a ride. When a user expresses their need for a ride, you MUST use the 'requestRide' tool to process their request. Based on the tool's output (which you don't see), the system will either find a match or create a ride request. Formulate a friendly, conversational response to let the user know you are processing their request. User's prompt: "${prompt}"`,
      config: {
        tools: [{functionDeclarations: [requestRideFunctionDeclaration]}],
      }
    });
    
    const functionCalls = response.functionCalls;
    const textResponse = response.text;

    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name === 'requestRide') {
        const args = functionCalls[0].args as { origin: string; destination: string; details: string };
        const matchedRide = findBestRideMatch(rides, args, currentUser);

        if (matchedRide) {
            return {
                action: 'INITIATE_CHAT',
                ride: matchedRide,
                responseText: textResponse || `I found a potential match for you with ${matchedRide.driver.name}! I'll connect you now.`,
            };
        } else {
             return {
                action: 'CREATE_RIDE_REQUEST',
                args: args,
                responseText: textResponse || "I couldn't find an exact match right now, but I've created a public ride request for you. We'll notify you when a driver responds!",
            };
        }
    }

    // If no function call, it's a general query.
    return {
        action: 'GENERAL_QUERY',
        responseText: textResponse || "I'm sorry, I didn't quite understand that. Could you please specify where you're going from and to?",
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
        action: 'GENERAL_QUERY',
        responseText: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
    };
  }
};
