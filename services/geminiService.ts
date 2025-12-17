import { GoogleGenAI, Type } from "@google/genai";
import { HotelResult } from "../types";

export const fetchOptimalHotels = async (): Promise<HotelResult[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Role: You are an expert travel planner using Chinese mapping logic (simulating Amap/Gaode Maps data).
    
    Task: Find the top 6 hotels in Nanjing that minimize the TOTAL travel cost for a "Hub and Spoke" (驻地式) itinerary.
    
    Itinerary Model:
    - Stay at one hotel for 3 nights.
    - Day 1: Round trip to Fuzimiao.
    - Day 2: Round trip to Zhongshanling.
    - Day 3: Round trip to Niushoushan.
    - Commute: Arrival and Departure from Nanjing South Station.

    Anchors (WGS84):
    1. Nanjing South Station: 31.968789, 118.798537
    2. Fuzimiao: 32.022579, 118.783786
    3. Zhongshanling: 32.0643, 118.8483
    4. Niushoushan: 31.91322, 118.74507

    Algorithm:
    1. Search for 20 real hotels within a 3km buffer of the polygon formed by these 4 points.
    2. For each hotel, calculate DRIVING time (minutes) and distance (km) for:
       - Trip A: Nanjing South Station <-> Hotel (1 Round Trip = 2x one-way)
       - Trip B: Hotel <-> Fuzimiao (1 Round Trip)
       - Trip C: Hotel <-> Zhongshanling (1 Round Trip)
       - Trip D: Hotel <-> Niushoushan (1 Round Trip)
    3. Total Cost = Trip A + Trip B + Trip C + Trip D.
    4. Rank by lowest Total Duration. Return the top 6.

    Constraint:
    - Use real coordinates for hotels.
    - Simulate 10:00 AM traffic conditions.
  `;

  // Define reusable schema part
  const routeCostSchema = {
    type: Type.OBJECT,
    properties: {
      destination: { type: Type.STRING },
      distanceKm: { type: Type.NUMBER },
      durationMin: { type: Type.NUMBER },
    },
    required: ["destination", "distanceKm", "durationMin"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              coords: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                },
                required: ["lat", "lng"]
              },
              totalDurationMin: { type: Type.NUMBER },
              totalDistanceKm: { type: Type.NUMBER },
              costs: {
                type: Type.OBJECT,
                properties: {
                  station: routeCostSchema,
                  fuzimiao: routeCostSchema,
                  zhongshanling: routeCostSchema,
                  niushoushan: routeCostSchema,
                },
                required: ["station", "fuzimiao", "zhongshanling", "niushoushan"]
              },
            },
            required: ["id", "name", "address", "coords", "totalDurationMin", "totalDistanceKm", "costs"]
          },
        },
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response from AI model.");
    }
    
    // With responseMimeType, we parse the text directly.
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    // Propagate the actual error message to the UI
    throw new Error(error.message || "Unknown error occurred");
  }
};