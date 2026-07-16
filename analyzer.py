import os
import json
from groq import Groq

def analyze_semantic_gap(prd_text, competitor_features_text, api_key=None):
    """
    Analyzes the semantic gap between a company's internal PRD and competitor feature sets
    using Groq's high-speed LPU inference engine.
    """
    # Fallback to env variable if key is not passed
    api_key = api_key or os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"error": "GROQ_API_KEY is not configured."}
        
    client = Groq(api_key=api_key)
    
    prompt = f"""
    You are an expert AI Product Research Agent specializing in Competitive Intelligence and Product Strategy.
    Your task is to perform a detailed "Semantic Gap Analysis" between an internal Product Requirements Document (PRD) and a competitor's feature set.
    
    Internal PRD/Core Requirements:
    """{prd_text}"""
    
    Competitor Features/Capabilities:
    """{competitor_features_text}"""
    
    Analyze the overlapping and missing capabilities. Identify high-value "Semantic Gaps" (untapped product features) that neither the internal team nor the competitors have prioritized but would solve urgent user pain points.
    
    Return the response strictly as a JSON object with the following structure:
    {{
      "summary": "A brief 2-sentence overview of the competitive dynamic.",
      "overlap_features": [
        {{"name": "Feature Name", "description": "How both address this."}}
      ],
      "competitor_advantages": [
        {{"name": "Feature Name", "description": "What they have that we lack."}}
      ],
      "our_advantages": [
        {{"name": "Feature Name", "description": "What we have that they lack."}}
      ],
      "semantic_gaps": [
        {{
          "feature_suggestion": "Unique Feature Idea",
          "user_pain_point": "The underlying user frustration this solves.",
          "strategic_value": "Why this creates a competitive advantage or market differentiation."
        }}
      ]
    }}
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise JSON-returning product research agent. Always return valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-70b-8192",
            response_format={"type": "json_object"},
            temperature=0.3
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}
