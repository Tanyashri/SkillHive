
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { User, Skill, AiSkillRecommendation, AiPeerRecommendation, AiRoadmap, Match, Session, Feedback, QuizQuestion, Task } from '../types';

// Strict adherence to @google/genai initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using standard Gemini 3 models for production consistency
const PERFORMANCE_MODEL = 'gemini-3-flash-preview';
const ULTRALIGHT_MODEL = 'gemini-flash-lite-latest';

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    peerRecommendations: {
      type: Type.ARRAY,
      description: 'List of recommended users to connect with.',
      items: {
        type: Type.OBJECT,
        properties: {
          userId: { type: Type.STRING, description: 'The ID of the recommended user.' },
          reason: { type: Type.STRING, description: 'A brief explanation for the recommendation.' },
        },
        required: ['userId', 'reason'],
        propertyOrdering: ['userId', 'reason']
      },
    },
    skillRecommendations: {
      type: Type.ARRAY,
      description: 'List of recommended skills to learn.',
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING, description: 'The name of the recommended skill.' },
          reason: { type: Type.STRING, description: 'A brief explanation for why this skill is recommended.' },
        },
        required: ['skillName', 'reason'],
        propertyOrdering: ['skillName', 'reason']
      },
    },
  },
  required: ['peerRecommendations', 'skillRecommendations'],
  propertyOrdering: ['peerRecommendations', 'skillRecommendations']
};

export const getAIRecommendations = async (
  currentUser: User, 
  allUsers: User[], 
  allSkills: Skill[],
  userMatches: Match[],
  userSessions: Session[],
  userFeedbacks: Feedback[],
  userTasks: Task[]
): Promise<{ peers: AiPeerRecommendation[], skills: AiSkillRecommendation[] }> => {
  const completedTasks = userTasks.filter(t => t.status === 'completed').map(t => t.title);
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin').slice(0, 10);
  const userSkillsWanted = allSkills.filter(s => currentUser.skillsWanted.includes(s.id)).map(s => `${s.name} (${s.level})`);

  const prompt = `
    Task: Quick peer and skill matches for ${currentUser.name}.
    Context: Goals: ${userSkillsWanted.join(', ')} | Mastered: ${completedTasks.join(', ')}
    Peers: ${JSON.stringify(otherUsers.map(u => ({ id: u.id, name: u.name, offers: u.skillsOffered, rating: u.rating })))}
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: PERFORMANCE_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: 'application/json', 
        responseSchema: recommendationSchema,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });
    const parsed = JSON.parse(response.text?.trim() || '{}');
    return { peers: parsed.peerRecommendations || [], skills: parsed.skillRecommendations || [] };
  } catch (error) {
    return { peers: [], skills: [] };
  }
};

export const getAISynergyDiscoveries = async (currentUser: User, allUsers: User[], allSkills: Skill[]): Promise<AiPeerRecommendation[]> => {
    const userWants = allSkills.filter(s => currentUser.skillsWanted.includes(s.id)).map(s => s.name);
    const userOffers = allSkills.filter(s => currentUser.skillsOffered.includes(s.id)).map(s => s.name);
    const candidates = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin').slice(0, 10);

    const prompt = `
        Match expert: Find 4 Synergy Pairs for ${currentUser.name}.
        Offers: ${userOffers.join(', ')} | Wants: ${userWants.join(', ')}
        Candidates: ${JSON.stringify(candidates.map(u => ({ id: u.id, name: u.name, offers: u.skillsOffered, wants: u.skillsWanted, rating: u.rating })))}
        Return JSON { discoveries: [{ userId, reason }] }.
    `;

    try {
        const response = await ai.models.generateContent({
            model: PERFORMANCE_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        discoveries: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { userId: { type: Type.STRING }, reason: { type: Type.STRING } },
                                required: ['userId', 'reason']
                            }
                        }
                    },
                    required: ['discoveries']
                }
            }
        });
        const parsed = JSON.parse(response.text?.trim() || '{"discoveries":[]}');
        return parsed.discoveries;
    } catch (e) { return []; }
};

export const getAIRoadmap = async (skillName: string): Promise<AiRoadmap> => {
    const prompt = `Quick 5-step learning path for "${skillName}". Include resources and times.`;
    try {
        const response = await ai.models.generateContent({
            model: PERFORMANCE_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: roadmapSchema,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        return JSON.parse(response.text?.trim() || '{}');
    } catch (error) { throw error; }
};

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    skill: { type: Type.STRING },
    overview: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          duration: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: { 
              type: Type.ARRAY, 
              items: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, url: { type: Type.STRING }, type: { type: Type.STRING } },
                  required: ['title', 'url', 'type']
              }
          }
        },
        required: ['step', 'title', 'description', 'resources', 'duration', 'topics']
      },
    },
  },
  required: ['skill', 'overview', 'steps']
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: PERFORMANCE_MODEL,
    config: {
      systemInstruction: "You are the friendly SkillHive guide. Help users find partners. Keep answers under 2 sentences.",
      thinkingConfig: { thinkingBudget: 0 }
    },
  });
};

export const generateSkillQuiz = async (skillName: string, level: string): Promise<QuizQuestion[]> => {
    const prompt = `5-question test for "${skillName}" at "${level}" level. 4 options, one correctIndex. JSON only.`;
    try {
        const response = await ai.models.generateContent({
            model: ULTRALIGHT_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizSchema,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return JSON.parse(response.text?.trim() || '{"questions":[]}').questions;
    } catch (e) { throw e; }
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER }
                },
                required: ['question', 'options', 'correctIndex']
            }
        }
    },
    required: ['questions']
};

export const getAIResponseForPost = async (title: string, content: string): Promise<string> => {
    const prompt = `Expert reply to post: ${title}. Content: ${content}. Max 2 sentences.`;
    try {
        const response = await ai.models.generateContent({
            model: ULTRALIGHT_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        return response.text || "No suggestion available.";
    } catch (e) { return "Processing too many requests. Try again shortly!"; }
};
