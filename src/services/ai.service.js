const z = require('zod');

async function callOpenRouter(messages) {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) throw new Error('OPEN_ROUTER_API_KEY is not set');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'arcee-ai/trinity-large-preview:free',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenRouter returned an empty content response');
  }

  return content;
}

function parseDay(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) return Number(match[0]);
  }

  return value;
}

function nonEmptyString(value, fallback) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return fallback;
}

function normalizeQuestions(value, typeLabel) {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const question = nonEmptyString(
      item?.question,
      `${typeLabel} question ${index + 1}`
    );

    const intention = nonEmptyString(
      item?.intention ?? item?.intent ?? item?.purpose,
      `Assess ${typeLabel.toLowerCase()} competencies`
    );

    const answer = nonEmptyString(
      item?.answer ?? item?.sampleAnswer ?? item?.idealAnswer ?? item?.recommendedAnswer,
      'Provide a structured answer with a concrete example and measurable outcome.'
    );

    return { question, intention, answer };
  });
}

function normalizeSkillGaps(value) {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const skill = nonEmptyString(item?.skill, `Skill gap ${index + 1}`);
    const rawSeverity = nonEmptyString(item?.severity, 'medium').toLowerCase();
    const severity = ['low', 'medium', 'high'].includes(rawSeverity) ? rawSeverity : 'medium';
    return { skill, severity };
  });
}

function normalizePreparationPlan(value) {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const tasks = Array.isArray(item?.tasks)
      ? item.tasks
          .map((task) => nonEmptyString(task, ''))
          .filter(Boolean)
      : [];

    return {
      day: parseDay(item?.day ?? index + 1),
      focus: nonEmptyString(item?.focus, `Day ${index + 1} preparation`),
      tasks: tasks.length ? tasks : ['Review role requirements and practice targeted examples.'],
    };
  });
}

function normalizeInterviewReportPayload(payload, jobdescription) {
  return {
    ...payload,
    technicalQuestions: normalizeQuestions(payload?.technicalQuestions, 'Technical'),
    behavioralQuestions: normalizeQuestions(payload?.behavioralQuestions, 'Behavioral'),
    skillGaps: normalizeSkillGaps(payload?.skillGaps),
    preparationPlan: normalizePreparationPlan(payload?.preparationPlan),
    tittle: nonEmptyString(payload?.tittle ?? payload?.title ?? payload?.jobTitle, nonEmptyString(jobdescription, 'Interview Preparation Report')),
  };
}

const interviewReportSchema = z.object({
  matchScore: z.coerce.number().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string().min(1),
      intention: z.string().min(1),
      answer: z.string().min(1),
    }),
  ).min(5, 'At least 5 technical questions are required'),
  behavioralQuestions: z.array(
    z.object({
      question: z.string().min(1),
      intention: z.string().min(1),
      answer: z.string().min(1),
    }),
  ).min(5, 'At least 5 behavioral questions are required'),
  skillGaps: z.array(
    z.object({
      skill: z.string().min(1),
      severity: z.enum(['low', 'medium', 'high']),
    }),
  ),
  preparationPlan: z.array(
    z.object({
      day: z.preprocess(parseDay, z.number().int().min(1)),
      focus: z.string().min(1),
      tasks: z.array(z.string().min(1)).min(1),
    }),
  ).length(7, 'Preparation plan must contain exactly 7 days'),
  tittle: z.string().describe('The Tille of The Job for which the interview report is generated')

});

function parseModelJson(raw) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('Model did not return a valid JSON object');
    }

    const possibleJson = cleaned.slice(firstBrace, lastBrace + 1);
    return JSON.parse(possibleJson);
  }
}

async function generateInterviewReport({ resume, selfdescription, jobdescription }) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert technical interviewer and career coach.
Return ONLY a valid JSON object.
Do not return markdown or code fences.

Required shape:
{
  "matchScore": number (0-100),
  "technicalQuestions": [{ "question": string, "intention": string, "answer": string }],
  "behavioralQuestions": [{ "question": string, "intention": string, "answer": string }],
  "skillGaps": [{ "skill": string, "severity": "low" | "medium" | "high" }],
  "preparationPlan": [{ "day": number, "focus": string, "tasks": string[] }]
  "tittle": string
}

Rules:
- Provide at least 10 technicalQuestions
- Provide at least 10 behavioralQuestions
- Provide exactly 7 preparationPlan entries with day as numbers 1..7`,
    },
    {
      role: 'user',
      content: `Generate an interview preparation report for the following candidate.

RESUME:
${resume}

SELF DESCRIPTION:
${selfdescription}

JOB DESCRIPTION:
${jobdescription}`,
    },
  ];

  const raw = await callOpenRouter(messages);
  const parsed = parseModelJson(raw);
  const normalized = normalizeInterviewReportPayload(parsed, jobdescription);
  const result = interviewReportSchema.safeParse(normalized);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    throw new Error(`AI response schema validation failed: ${JSON.stringify(issues)}`);
  }

  return result.data;
}

module.exports = { generateInterviewReport };
