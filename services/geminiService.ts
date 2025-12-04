import { GoogleGenAI, Type } from "@google/genai";
import { Skill, Character } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mapped as per instructions: nano banana -> gemini-2.5-flash-image
const IMAGE_MODEL = 'gemini-2.5-flash-image';
// Using Flash for text speed and creativity
const TEXT_MODEL = 'gemini-2.5-flash'; 

export const generateCharacterDetails = async (
  name: string,
  race: string,
  classType: string,
  background: string,
  alignment: string
): Promise<{ skills: Skill[]; backstory: string }> => {
  const ai = getAI();

  const prompt = `
    Generate a short, compelling backstory (max 80 words) and 3 unique special skills for a character in a Space Opera RPG named "Scholomance".
    Character: ${name}, Race: ${race}, Class: ${classType}, Background: ${background}, Alignment: ${alignment}.
    
    The skills should be creative, powerful, and fit a high-tech anime/sci-fi magic school theme.
    Each skill must have a 'statScale' (STR, DEX, INT, CHA, or VIT).
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            backstory: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['Active', 'Passive'] },
                  statScale: { type: Type.STRING, enum: ['STR', 'DEX', 'INT', 'CHA', 'VIT'] }
                },
                required: ['name', 'description', 'type', 'statScale']
              }
            }
          },
          required: ['backstory', 'skills']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Character Details Generation Failed:", error);
    // Fallback data if text generation fails
    return {
      backstory: "A mysterious transfer student with a redacted file.",
      skills: [
        { name: "Void Strike", description: "Attacks with cosmic energy.", type: "Active", statScale: "STR" },
        { name: "Tech Shield", description: "Deploys a kinetic barrier.", type: "Active", statScale: "INT" },
        { name: "Survivor", description: "Resilient against harsh environments.", type: "Passive", statScale: "VIT" }
      ]
    };
  }
};

const generateImageWithRetry = async (prompt: string, retries = 1): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: { parts: [{ text: prompt }] }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data in response");
    } catch (e) {
        if (retries > 0) {
            console.warn("Image generation failed, retrying with simplified prompt...", e);
            // Simplifies the prompt to avoid potential safety triggers
            const safePrompt = prompt
                .replace("Japanese manga style", "Sci-fi art style")
                .replace("highly attractive", "heroic")
                .replace("stunning", "detailed")
                .replace("alluring", "cool")
                .replace("intense gaze", "focused look")
                .replace("masterpiece, 8k", "");
            return generateImageWithRetry(safePrompt, retries - 1);
        }
        throw e;
    }
};

export const generateCharacterPortrait = async (
  race: string,
  classType: string,
  description: string
): Promise<string> => {
  // Modified prompt to be safer but still high quality
  const imagePrompt = `
    Japanese manga style, charismatic, very high level of detail, 8k resolution, masterpiece.
    Character portrait of a ${race} ${classType} in a futuristic sci-fi Scholomance academy setting.
    The character should look visually impressive, stylish, and heroic.
    ${description}.
    Dynamic neon lighting, vibrant colors, clear features.
    Upper body shot, detailed face and eyes.
  `;

  try {
      return await generateImageWithRetry(imagePrompt);
  } catch (e) {
      console.error("Portrait generation failed after retry:", e);
      // Fallback placeholder to prevent app crash
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuCLAKx5KilVQ6C2HBWpxyj2eFD3ag0DuoidnW4L2zf3ROVbYTqHvzG8DLdpqHkBYJVOaTqrSGGkFFVE8am3QXa4y0AlJGYhB2Sr0GTEl1YdCm2DA2Qd1YKhVcV6OqDaZAL214j2NCx288CF95gNA12R42C8OQ7yXIIW3EXAyFs41m8F3ivDpJ-XQT2I83_ykyf5Y98aKbz3phuzVJLjrVerfQT73xizbR8FWlmuOMBK2GRuI7X_M093P4zgps1a353nwGEbl0zGr5Km"; 
  }
};

export const generateNextScene = async (
    history: {role: string, text: string}[],
    currentAction: string,
    character: Character
): Promise<{ description: string; choices: string[] }> => {
    const ai = getAI();
    
    // Construct context
    const context = history.map(h => `${h.role}: ${h.text}`).join('\n');
    
    const prompt = `
      You are the Game Master (GM) of a Space Opera RPG called Scholomance.
      The player is a ${character.race} ${character.classType} named ${character.name}.
      
      Previous Context:
      ${context}
      
      Player Action: ${currentAction}
      
      Task:
      1. Describe the outcome and the new scene (max 60 words). Keep it dramatic, anime-style, engaging and slightly edgy.
      2. Provide 3 distinct, short choices for the player's next move.
    `;

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        choices: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } 
                        }
                    },
                    required: ['description', 'choices']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text returned");
        return JSON.parse(text);
    } catch (e) {
        console.error("Scene Generation Failed:", e);
        return {
            description: "The void fluctuates, causing a momentary lapse in reality data. The path ahead is unclear.",
            choices: ["Attempt to recalibrate", "Wait for the glitch to pass", "Proceed with caution"]
        };
    }
}

export const generateSceneImage = async (description: string): Promise<string> => {
    const prompt = `
        Japanese manga style, stunning sci-fi aesthetic, very high level of detail, masterpiece, 8k.
        Sci-fi space opera background scenery for the Scholomance Academy.
        ${description}.
        No text, atmospheric, dramatic lighting, detailed background art, neon cyberpunk accents.
    `;
    
    try {
        return await generateImageWithRetry(prompt);
    } catch (e) {
        console.error("Scene generation failed:", e);
        // Fallback image (generic sci-fi background) to ensure UI doesn't hang
        return "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpMXZpauCMb9Iq8akecPXFGb_05yQxeZb7f3oj2gr_9lSH-V8UIbFE1ItN3BhA4DAFBsHxmssYwIQm8a3eAY47W67Wh_fvK-d2FL6Pr5AE0VnNHWkg6IBmDHvvXpdhckJnb0jtx8I4ozbOVTrIF3BrveS7SDGG9VRYJiZqvrYvH4awyRU7qVfDwPCQkUPX5_lGFIvgzs55osc-QndtakOI0kKGJ75_J0YEMSA7sVUz0Bdrtqgnf8LKJBxzkw_W-QdirrcIAQVejyy";
    }
}