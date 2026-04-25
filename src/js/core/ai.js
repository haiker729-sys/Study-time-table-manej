/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

let aiClient = null;

export const AI = {
  init() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[AI] Gemini API Key missing. Service will be limited.');
      return;
    }
    aiClient = new GoogleGenAI({ apiKey });
  },

  async askAI(prompt, appState = {}) {
    if (!aiClient) {
      throw new Error('AI System Offline: API Key not configured');
    }

    try {
      const model = "gemini-3-flash-preview";
      
      // Inject context from app state
      const context = `
        Current User Progress:
        - XP: ${appState.gamification?.xp || 0}
        - Level: ${appState.gamification?.level || 'Beginner'}
        - Streak: ${appState.goals?.streak || 0}
        - Subjects: ${JSON.stringify(appState.timetable?.map(t => t.subject) || [])}
        - Daily Target: ${appState.settings?.studyHours || 4} hours
        
        System Context: You are Aether, a high-performance study assistant. 
        User Question: ${prompt}
      `;

      const response = await aiClient.models.generateContent({
        model: model,
        contents: context,
      });

      return response.text;
    } catch (e) {
      console.error('[AI] Generation Error:', e);
      throw e;
    }
  }
};
