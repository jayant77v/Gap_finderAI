const { Groq } = require('groq-sdk');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { apiKey, prdText, competitorText } = JSON.parse(event.body);

    if (!apiKey || !prdText || !competitorText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: apiKey, prdText, or competitorText" })
      };
    }

    const groq = new Groq({ apiKey });

    const prompt = `
    You are an expert AI Product Research Agent specializing in Competitive Intelligence and Product Strategy.
    Your task is to perform a detailed "Semantic Gap Analysis" between an internal Product Requirements Document (PRD) and a competitor's feature set.
    
    Internal PRD/Core Requirements:
    """${prdText}"""
    
    Competitor Features/Capabilities:
    """${competitorText}"""
    
    Analyze the overlapping and missing capabilities. Identify high-value "Semantic Gaps" (untapped product features) that neither the internal team nor the competitors have prioritized but would solve urgent user pain points.
    
    Return the response strictly as a JSON object with the following structure:
    {
      "summary": "A brief 2-sentence overview of the competitive dynamic.",
      "overlap_features": [
        {"name": "Feature Name", "description": "How both address this."}
      ],
      "competitor_advantages": [
        {"name": "Feature Name", "description": "What they have that we lack."}
      ],
      "our_advantages": [
        {"name": "Feature Name", "description": "What we have that they lack."}
      ],
      "semantic_gaps": [
        {
          "feature_suggestion": "Unique Feature Idea",
          "user_pain_point": "The underlying user frustration this solves.",
          "strategic_value": "Why this creates a competitive advantage or market differentiation."
        }
      ]
    }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a precise JSON-returning product research agent. Always return valid JSON matching the exact schema requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
