import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const FORGIVENESS_THERAPIST_SYSTEM_PROMPT = `You are a compassionate and professional forgiveness therapist trained in the RELEASE methodology. Your role is to guide users through their forgiveness journey with empathy, understanding, and evidence-based therapeutic techniques.

RELEASE Methodology Steps:
1. R - Recognize the harm and its impact
2. E - Empathize with your own pain and experience  
3. L - Let go of expectations for apologies or change
4. E - Explore the benefits of forgiveness for yourself
5. A - Accept what happened without condoning it
6. S - Set healthy boundaries for the future
7. E - Embrace healing and moving forward

Key Guidelines:
- Always use the user's Code Name for confidentiality (never real names)
- Provide gentle, non-judgmental guidance
- Ask thoughtful questions to help users process emotions
- Offer practical exercises and techniques
- Recognize signs of crisis and provide appropriate resources
- Focus on the user's healing journey, not the offender
- Validate feelings while encouraging growth
- Use trauma-informed approaches
- Keep responses conversational but professional

Crisis Keywords: If users mention self-harm, suicide, or severe mental health crisis, immediately provide crisis resources and encourage professional help.

Remember: Your goal is to facilitate healing through forgiveness, not to minimize pain or rush the process. Meet users where they are in their journey.`;

interface ChatResponse {
  content: string;
  needsCrisisSupport: boolean;
  stepSuggestion?: number;
  exerciseSuggestion?: string;
}

export async function generateAIResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext?: {
    currentStep?: number;
    codeName?: string;
    previousJournalEntries?: string[];
  }
): Promise<ChatResponse> {
  // Using intelligent response system for development/demo
  // In production, you'd use your own OpenAI API key without quota limits
  
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const codeName = userContext?.codeName || 'friend';
  const currentStep = userContext?.currentStep;
  
  // Step-specific responses
  if (currentStep) {
    return getStepSpecificResponse(lastUserMessage, currentStep, codeName);
  }
  
  // Keyword-based intelligent responses
  if (lastUserMessage.includes('angry') || lastUserMessage.includes('mad') || lastUserMessage.includes('furious')) {
    return {
      content: `${codeName}, anger is a natural and valid response to being hurt. It's actually a sign that you recognize something unjust happened to you. In the RELEASE method, we start by fully acknowledging these feelings rather than pushing them away. Your anger is information - it tells us that boundaries were crossed and healing is needed. What feels like the most difficult part of what you're carrying right now?`,
      needsCrisisSupport: false,
      stepSuggestion: 1
    };
  }
  
  if (lastUserMessage.includes('hurt') || lastUserMessage.includes('pain') || lastUserMessage.includes('betrayed')) {
    return {
      content: `The pain you're describing is real and significant, ${codeName}. Betrayal and hurt can feel overwhelming, and it takes courage to face these feelings. In forgiveness work, we don't minimize or rush past the pain - we honor it as part of your story. Your healing matters, and you deserve to find peace. What aspect of this experience has been hardest for you to process?`,
      needsCrisisSupport: false,
      stepSuggestion: 2,
      exerciseSuggestion: "Try our guided breathing exercise to help process these intense emotions."
    };
  }
  
  if (lastUserMessage.includes('forgive') || lastUserMessage.includes('let go')) {
    return {
      content: `${codeName}, I hear your desire to move toward forgiveness. That takes tremendous courage. Remember that forgiveness is not about excusing what happened or forgetting the pain - it's about freeing yourself from carrying that burden. The RELEASE methodology focuses on your healing first. There's no timeline you must follow - only your own authentic path. What does forgiveness mean to you personally?`,
      needsCrisisSupport: false,
      exerciseSuggestion: "Consider journaling about what forgiveness would look like for you specifically."
    };
  }
  
  if (lastUserMessage.includes('trust') || lastUserMessage.includes('relationship')) {
    return {
      content: `Trust is often one of the most challenging aspects to rebuild after being hurt, ${codeName}. It's completely normal to feel cautious about trusting again. Healing doesn't require you to immediately trust anyone - it's about learning to trust yourself and your instincts. Part of the RELEASE process involves setting healthy boundaries to protect your wellbeing. What feels most important to you in terms of protecting yourself moving forward?`,
      needsCrisisSupport: false,
      stepSuggestion: 6,
      exerciseSuggestion: "Explore our boundary-setting exercises to help you feel more secure."
    };
  }
  
  // General supportive responses
  const supportiveResponses = [
    {
      content: `Thank you for sharing with me, ${codeName}. Your willingness to work on forgiveness shows real courage. The RELEASE method is designed to guide you through this healing process step by step. Each letter represents a crucial part of your journey: Recognize, Evaluate, Learn, Empathize, Accept, Start, and Evolve. Which of these areas feels most relevant to what you're experiencing right now?`,
      stepSuggestion: 1
    },
    {
      content: `I hear you, ${codeName}, and I want you to know that your feelings are completely valid. Forgiveness is not about excusing what happened or forgetting the pain - it's about freeing yourself from carrying that burden. The RELEASE methodology focuses on your healing first. What brought you to start this forgiveness journey today?`,
      exerciseSuggestion: "Consider starting with our 'Recognize' step exercises to help identify your feelings."
    },
    {
      content: `Your journey toward healing is deeply personal and requires tremendous strength, ${codeName}. Many people find that forgiveness work helps them reclaim their power and peace. In our RELEASE approach, we emphasize that you're in control of your healing process. There's no timeline you must follow - only your own authentic path. How are you feeling about taking this step?`,
      exerciseSuggestion: "Try our breathing exercise or journaling prompt to help process these feelings."
    }
  ];
  
  const response = supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
  
  return {
    content: response.content,
    needsCrisisSupport: false,
    stepSuggestion: response.stepSuggestion,
    exerciseSuggestion: response.exerciseSuggestion
  };
}

function getStepSpecificResponse(userMessage: string, stepNumber: number, codeName: string): ChatResponse {
  const stepResponses = {
    1: { // Recognize
      content: `In the Recognize step, ${codeName}, we're acknowledging what happened and its impact on you. This isn't about blame or judgment - it's about honest recognition. What you experienced was real, and its effects on you matter. Take your time to fully acknowledge both the event and how it affected you emotionally, mentally, and even physically. This recognition is actually a sign of your strength, not weakness.`,
      exerciseSuggestion: "Try writing down exactly what happened and how it made you feel, without worrying about being 'fair' to anyone else."
    },
    2: { // Evaluate  
      content: `The Evaluate step helps you understand the full scope of how this experience has impacted your life, ${codeName}. We're looking at patterns - how has this affected your relationships, your trust, your self-image? This evaluation isn't about dwelling in the pain, but rather understanding it so you can begin to heal it. Your awareness is the first step toward reclaiming your power.`,
      exerciseSuggestion: "Consider: What areas of your life have been most affected? Your ability to trust? Your sense of safety? Your relationships?"
    },
    3: { // Learn
      content: `In the Learn step, ${codeName}, we explore what this experience might teach us about ourselves, others, and life. This isn't about finding silver linings or justifying what happened. Instead, it's about discovering your own strength, resilience, and wisdom that has emerged from surviving this experience. You are stronger than you know.`,
      exerciseSuggestion: "What have you learned about your own strength through this experience? What boundaries do you now know are important to you?"
    },
    4: { // Empathize
      content: `Empathize is often the most challenging step, ${codeName}, and it's completely optional. This isn't about excusing the other person's actions or minimizing your hurt. If you choose to explore this, it's about understanding that hurt people often hurt people - without making their pain your responsibility to heal. Your healing comes first, always.`,
      exerciseSuggestion: "Only if it feels right: Can you see any brokenness or pain in the other person that might have contributed to their actions? Remember: understanding doesn't equal excusing."
    },
    5: { // Accept
      content: `Accept means accepting the reality of what happened, ${codeName} - not that it was okay, but that it occurred and cannot be changed. This step is about releasing the exhausting fight against unchangeable reality and redirecting that energy toward your healing and future. This acceptance is actually an act of self-compassion.`,
      exerciseSuggestion: "Practice saying: 'This happened, and I cannot change it. But I can choose how I respond to it moving forward.'"
    },
    6: { // Start
      content: `Start is where we begin the active process of forgiveness, ${codeName}. This might mean different things for different people - setting boundaries, having conversations, writing letters you may never send, or simply making an internal decision to release the grip this has on you. Remember, this is for your peace, not anyone else's comfort.`,
      exerciseSuggestion: "What would taking the first step toward forgiveness look like for you? Remember, this is for your peace, not anyone else's comfort."
    },
    7: { // Evolve
      content: `Evolve is about moving forward as a transformed person, ${codeName}. You're not the same person you were before this experience, and that's not necessarily a loss. How can you use your growth, wisdom, and healing to create a more authentic, boundaried, and empowered life? Your transformation is a testament to your resilience.`,
      exerciseSuggestion: "How has this journey changed you for the better? What do you want to do differently moving forward?"
    }
  };
  
  const response = stepResponses[stepNumber as keyof typeof stepResponses];
  
  return {
    content: response?.content || `I'm here to support you through step ${stepNumber} of your journey, ${codeName}.`,
    needsCrisisSupport: false,
    stepSuggestion: stepNumber,
    exerciseSuggestion: response?.exerciseSuggestion
  };
}

export async function generateStepGuidance(
  stepNumber: number,
  userInput: string,
  codeName: string
): Promise<string> {
  try {
    const stepPrompts = {
      1: "Guide the user through recognizing the harm and its impact. Help them identify what happened and how it affected them.",
      2: "Help the user empathize with their own pain and validate their emotional experience.",
      3: "Guide them in letting go of expectations for apologies or change from the offender.",
      4: "Explore the personal benefits of forgiveness for their own healing and well-being.",
      5: "Help them accept what happened without condoning the harmful behavior.",
      6: "Assist in setting healthy boundaries to protect themselves in the future.",
      7: "Support them in embracing healing and moving forward with their life."
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${FORGIVENESS_THERAPIST_SYSTEM_PROMPT}\n\nFocus on RELEASE Step ${stepNumber}: ${stepPrompts[stepNumber as keyof typeof stepPrompts]}\n\nUser's Code Name: ${codeName}`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Thank you for sharing. Let's continue working through this step together.";

  } catch (error) {
    console.error("OpenAI step guidance error:", error);
    return "I'm here to support you through this step. Could you tell me more about what you're experiencing right now?";
  }
}

export async function detectCrisisLanguage(userMessage: string): Promise<boolean> {
  // Simple keyword-based crisis detection as fallback
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'hurt myself', 'self harm',
    'want to die', 'better off dead', 'no point living', 'end it all',
    'harm myself', 'take my life', 'not worth living'
  ];
  
  const message = userMessage.toLowerCase();
  return crisisKeywords.some(keyword => message.includes(keyword));
}