import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required for AI summary service");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SessionData {
  sessionTitle: string;
  facilitatorNotes?: string;
  participantCount: number;
  sessionType: string;
  scheduledTime: string;
  duration?: number;
}

interface SummaryResult {
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  nextStepsRecommendations: string;
  engagementLevel: 'high' | 'medium' | 'low';
}

export async function generateSessionSummary(
  sessionData: SessionData
): Promise<SummaryResult> {
  try {
    const prompt = `
You are an AI assistant specialized in generating session summaries for forgiveness and emotional healing group therapy sessions. 

Session Information:
- Title: ${sessionData.sessionTitle}
- Type: ${sessionData.sessionType}
- Date: ${sessionData.scheduledTime}
- Participants: ${sessionData.participantCount}
- Facilitator Notes: ${sessionData.facilitatorNotes || 'No specific notes provided'}

Please generate a comprehensive session summary that includes:
1. A brief overview of the session (2-3 sentences)
2. Key topics discussed during the session
3. Action items for participants to work on before the next session
4. Recommendations for next steps in the healing journey
5. Assessment of engagement level based on participation

Please format your response as JSON with the following structure:
{
  "summary": "Brief overview of the session",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "actionItems": ["action1", "action2", "action3"],
  "nextStepsRecommendations": "Detailed recommendations for continued healing",
  "engagementLevel": "high|medium|low"
}

Focus on themes of forgiveness, emotional healing, personal growth, and community support. Keep the tone supportive, encouraging, and professional.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a compassionate AI assistant specializing in forgiveness therapy and emotional healing. Generate supportive, professional session summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const result = JSON.parse(content);
    
    // Validate the response structure
    if (!result.summary || !result.keyTopics || !result.actionItems || !result.nextStepsRecommendations || !result.engagementLevel) {
      throw new Error("Invalid response structure from OpenAI");
    }

    return result;
  } catch (error) {
    console.error("Error generating AI session summary:", error);
    
    // Fallback summary if AI fails
    return {
      summary: `Group session on ${sessionData.sessionTitle} with ${sessionData.participantCount} participants focused on forgiveness and emotional healing.`,
      keyTopics: ["Forgiveness practice", "Emotional processing", "Group support"],
      actionItems: ["Continue daily reflection", "Practice self-compassion", "Apply forgiveness techniques"],
      nextStepsRecommendations: "Continue working through the RELEASE methodology with focus on the current step. Practice the techniques discussed in today's session.",
      engagementLevel: "medium"
    };
  }
}

export async function analyzeSentiment(text: string): Promise<{
  score: number;
  label: string;
  emotions: string[];
}> {
  try {
    const prompt = `
Analyze the emotional sentiment of this text from a forgiveness journey context:

"${text}"

Please provide:
1. A sentiment score from -1 (very negative) to 1 (very positive)
2. A sentiment label (positive, neutral, or negative)
3. A list of 3-5 emotions detected in the text

Respond in JSON format:
{
  "score": 0.5,
  "label": "positive",
  "emotions": ["hopeful", "reflective", "peaceful"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in emotional analysis and sentiment detection, specializing in forgiveness and healing contexts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    
    // Fallback analysis
    return {
      score: 0,
      label: "neutral",
      emotions: ["contemplative"]
    };
  }
}

export async function generatePersonalInsights(userData: {
  journalEntries: number;
  completedSteps: number;
  sessionAttendance: number;
  recentEmotions: string[];
}): Promise<{
  strengths: string[];
  recommendations: string[];
  emotionalTrend: string;
}> {
  try {
    const prompt = `
Based on a user's forgiveness journey data, provide personalized insights:

Journey Data:
- Journal entries completed: ${userData.journalEntries}
- RELEASE steps completed: ${userData.completedSteps}/7
- Group sessions attended: ${userData.sessionAttendance}
- Recent emotions: ${userData.recentEmotions.join(', ')}

Please provide:
1. 3-4 strengths or positive patterns you observe
2. 3-4 personalized recommendations for continued growth
3. Overall emotional trend assessment

Respond in JSON format:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "emotionalTrend": "improving|stable|needs_attention"
}

Be encouraging and supportive while providing actionable insights.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a compassionate AI counselor specializing in forgiveness therapy and personal growth insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating personal insights:", error);
    
    // Fallback insights
    return {
      strengths: ["Committed to healing journey", "Open to self-reflection", "Engaged in personal growth"],
      recommendations: ["Continue regular journaling", "Practice daily forgiveness exercises", "Connect with support community"],
      emotionalTrend: "stable"
    };
  }
}