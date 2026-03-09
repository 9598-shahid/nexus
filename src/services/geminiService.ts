import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppraisalInput } from "../types";

const API_KEY = (window as any).env?.GEMINI_API_KEY || "AIzaSyATeUUKvv6z_XhD8c2eVdd5HqG2m3ez_34";

export async function extractRiskIndicators(input: { companyName: string, industry: string, financialData: string, text: string }) {
  console.log("API Key being used:", API_KEY.substring(0, 5) + "...");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `
    Target Entity: ${input.companyName}
    Industry: ${input.industry}
    Financial Data: ${input.financialData}
    
    Document Text:
    ${input.text}
    
    Task: Extract key risk indicators, management sentiment, and any red flags from this text.
    Provide a concise summary that can be used for credit appraisal.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
}

export async function generateProfessionalCAM(input: AppraisalInput) {
  console.log("API Key being used:", API_KEY.substring(0, 5) + "...");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `
    Act as a Senior Credit Officer. Based on the 5Cs of Credit (Character, Capacity, Capital, Collateral, Conditions), analyze the provided data and output a professional Credit Appraisal Memo (CAM) with a final Risk Score and a Recommendation (Approve/Decline).
    
    COMPANY NAME: ${input.companyName}
    INDUSTRY: ${input.industry}
    
    DATA COLLECTED:
    - Pillar 1 (Financials): ${input.financialData}
    - Pillar 2 (Research/Docs): ${input.unstructuredDocs}
    - Pillar 3 (External/DD): ${input.externalIntelligence} ${input.dueDiligence}
    
    OUTPUT FORMAT:
    Return a JSON object with:
    {
      "risk_score": number (0-100),
      "recommendation": "Approve" | "Reject",
      "loan_limit": "string",
      "interest_rate": "string",
      "risk_categories": {
        "financial": number,
        "legal": number,
        "sector": number,
        "operational": number,
        "management": number
      },
      "cam_markdown": "Full professional CAM in Markdown format."
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risk_score: { type: Type.NUMBER },
          recommendation: { type: Type.STRING },
          loan_limit: { type: Type.STRING },
          interest_rate: { type: Type.STRING },
          risk_categories: {
            type: Type.OBJECT,
            properties: {
              financial: { type: Type.NUMBER },
              legal: { type: Type.NUMBER },
              sector: { type: Type.NUMBER },
              operational: { type: Type.NUMBER },
              management: { type: Type.NUMBER }
            },
            required: ["financial", "legal", "sector", "operational", "management"]
          },
          cam_markdown: { type: Type.STRING }
        },
        required: ["risk_score", "recommendation", "loan_limit", "interest_rate", "risk_categories", "cam_markdown"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateCreditAppraisal(input: AppraisalInput) {
  console.log("API Key being used:", API_KEY.substring(0, 5) + "...");
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `
    You are a Senior AI Engineer, FinTech Architect, and Banking Credit Analyst.
    Your task is to perform a complete corporate credit appraisal for "Intelli-Credit: Next-Gen Corporate Credit Appraisal".
    
    Strictly follow these THREE CORE PILLARS in your analysis:
    1. DATA INGESTOR: Analyze the provided financial documents (GST, Bank Statements, Annual Reports, etc.).
    2. RESEARCH AGENT: Use your internal search tools to gather external intelligence on the company, promoters, legal disputes, and industry risks.
    3. RECOMMENDATION ENGINE: Build an explainable credit decision model based on the Five Cs of Credit (Character, Capacity, Capital, Collateral, Conditions).

    COMPANY NAME: ${input.companyName}
    INDUSTRY: ${input.industry}

    INPUT DATA:
    - Financial Data: ${input.financialData}
    - Unstructured Docs: ${input.unstructuredDocs}
    - External Intel Provided: ${input.externalIntelligence}
    - Due Diligence Notes: ${input.dueDiligence}

    SPECIFIC REQUIREMENTS:
    - Detect early warning signals (circular trading, revenue spikes, litigation).
    - Calculate a credit risk score (0–100).
    - Provide a structured risk intelligence summary.
    - Recommend loan approval/rejection, limit, and interest rate.

    OUTPUT FORMAT:
    Return a JSON object with:
    {
      "risk_score": number (0-100),
      "recommendation": "Approve" | "Approve with conditions" | "Reject",
      "loan_limit": "string (e.g. $5M)",
      "interest_rate": "string (e.g. 8.5%)",
      "risk_categories": {
        "financial": number (0-100, 100 is best),
        "legal": number (0-100),
        "sector": number (0-100),
        "operational": number (0-100),
        "management": number (0-100)
      },
      "cam_markdown": "Full professional CAM in Markdown format with these 12 sections:
        1. Executive Summary
        2. Company Overview
        3. Promoter Background
        4. Financial Performance Analysis
        5. Industry Analysis
        6. Risk Assessment
        7. Five Cs Evaluation
        8. Credit Risk Score
        9. Early Warning Signals
        10. Loan Recommendation
        11. Interest Rate Suggestion
        12. Final Decision"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risk_score: { type: Type.NUMBER },
          recommendation: { type: Type.STRING },
          loan_limit: { type: Type.STRING },
          interest_rate: { type: Type.STRING },
          risk_categories: {
            type: Type.OBJECT,
            properties: {
              financial: { type: Type.NUMBER },
              legal: { type: Type.NUMBER },
              sector: { type: Type.NUMBER },
              operational: { type: Type.NUMBER },
              management: { type: Type.NUMBER }
            },
            required: ["financial", "legal", "sector", "operational", "management"]
          },
          cam_markdown: { type: Type.STRING }
        },
        required: ["risk_score", "recommendation", "loan_limit", "interest_rate", "risk_categories", "cam_markdown"]
      }
    }
  });

  return JSON.parse(response.text);
}
