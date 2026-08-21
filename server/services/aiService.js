const systemPrompt = `You are an expert educational quiz generator. Your task is to generate a high-quality multiple-choice quiz in raw JSON format.
You must respond with ONLY a clean JSON object, with no markdown code block backticks (\`\`\`json), no explanation, and no extra conversational text.

The JSON object must strictly match this schema:
{
  "title": "A catchy and relevant title for the quiz",
  "description": "A short, engaging description of what this quiz covers",
  "questions": [
    {
      "text": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option C", 
      "timeLimit": 15
    }
  ]
}

Key Requirements:
1. You must generate exactly the number of questions requested.
2. Each question MUST have exactly 4 options.
3. The 'correctAnswer' field MUST exactly match one of the string values in the 'options' array.
4. The 'timeLimit' must be an integer between 10 and 60 representing seconds.
5. Create interesting, correct, and educational questions suitable for the requested difficulty level.`;

function extractJson(text) {
  try {
    // Try direct parsing first
    return JSON.parse(text);
  } catch (e) {
    console.log("Direct JSON parse failed, trying code block extraction...");
    // Attempt to extract JSON from markdown code blocks
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerErr) {
        throw new Error('Failed to parse extracted JSON block from model response: ' + innerErr.message);
      }
    }
    // Clean up typical leading/trailing text
    const cleanText = text.trim().substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    try {
      return JSON.parse(cleanText);
    } catch (finalErr) {
      console.error("Raw response text was:", text);
      throw new Error('Response is not valid JSON and could not be extracted automatically.');
    }
  }
}

async function callOpenAI(userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("Calling OpenAI (gpt-4o-mini)...");
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI returned status ${response.status}`);
  }

  const data = await response.json();
  return extractJson(data.choices[0].message.content);
}

async function callClaude(userPrompt) {
  const apiKey = process.env.CLAUDE_API_KEY;
  console.log("Calling Claude (claude-3-5-haiku)...");

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude returned status ${response.status}`);
  }

  const data = await response.json();
  return extractJson(data.content[0].text);
}

async function callGemini(userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Calling Gemini (gemini-1.5-flash)...");

  const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: fullPrompt }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return extractJson(text);
}

function postProcessQuiz(rawQuiz, defaultTimeLimit = 15) {
  if (!rawQuiz || typeof rawQuiz !== 'object') {
    throw new Error('AI returned an invalid response structure');
  }

  const title = String(rawQuiz.title || 'AI Generated Quiz').trim();
  const description = String(rawQuiz.description || 'Generated with AI').trim();
  const rawQuestions = Array.isArray(rawQuiz.questions) ? rawQuiz.questions : [];

  const questions = rawQuestions.map((q, index) => {
    const text = String(q.text || `Question ${index + 1}`).trim();
    
    // Normalise options (must have exactly 4 options)
    let options = Array.isArray(q.options) ? q.options.map(o => String(o).trim()) : [];
    if (options.length < 4) {
      options = [...options, 'Option A', 'Option B', 'Option C', 'Option D'].slice(0, 4);
    } else if (options.length > 4) {
      options = options.slice(0, 4);
    }

    // Normalise correct answer (if the AI returns A, B, C, D instead of option text)
    let correctAnswer = String(q.correctAnswer || '').trim();
    const cleanAnswer = correctAnswer.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(cleanAnswer) && correctAnswer.length === 1) {
      const optionIndex = cleanAnswer.charCodeAt(0) - 65;
      correctAnswer = options[optionIndex];
    } else {
      // Find the closest matching option text to prevent mismatches
      const match = options.find(opt => opt.toLowerCase() === correctAnswer.toLowerCase());
      if (match) {
        correctAnswer = match;
      } else if (!options.includes(correctAnswer)) {
        // Default to the first option if nothing matches
        correctAnswer = options[0];
      }
    }

    const timeLimit = Number(q.timeLimit) || defaultTimeLimit;

    return {
      id: String(Date.now() + index + Math.floor(Math.random() * 1000)),
      text,
      options,
      correctAnswer,
      timeLimit,
      media: null
    };
  });

  return {
    title,
    description,
    questions
  };
}

async function generateQuizFromAI(topic, numQuestions = 5, difficulty = 'Medium') {
  const userPrompt = `Please generate a quiz about the following topic:
- Topic: "${topic}"
- Number of questions: ${numQuestions}
- Difficulty: "${difficulty}"`;

  let rawQuiz = null;
  let errorMsg = "";

  // 1. Try OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      rawQuiz = await callOpenAI(userPrompt);
    } catch (err) {
      console.error("OpenAI call failed:", err.message);
      errorMsg += `OpenAI: ${err.message}. `;
    }
  }

  // 2. Try Claude if configured and OpenAI failed/not set
  if (!rawQuiz && process.env.CLAUDE_API_KEY) {
    try {
      rawQuiz = await callClaude(userPrompt);
    } catch (err) {
      console.error("Claude call failed:", err.message);
      errorMsg += `Claude: ${err.message}. `;
    }
  }

  // 3. Try Gemini if configured and both above failed/not set
  if (!rawQuiz && process.env.GEMINI_API_KEY) {
    try {
      rawQuiz = await callGemini(userPrompt);
    } catch (err) {
      console.error("Gemini call failed:", err.message);
      errorMsg += `Gemini: ${err.message}. `;
    }
  }

  // If no response could be generated
  if (!rawQuiz) {
    const errorDetails = errorMsg ? ` Errors: ${errorMsg}` : ' No API keys are configured in the server .env file.';
    throw new Error(`Failed to generate quiz from AI.${errorDetails}`);
  }

  // Post-process the quiz to ensure DB schema compatibility
  return postProcessQuiz(rawQuiz);
}

module.exports = {
  generateQuizFromAI
};
