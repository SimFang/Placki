import type { FreelancerProfile, Language, MatchResponse, PlatformFilter } from '../src/types.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2026-10-21';
const ANTHROPIC_MODEL = 'claude-opus-5-5';

interface AnthropicContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

interface AnthropicResponse {
  id: string;
  content: AnthropicContentBlock[];
  stop_reason: string;
  error?: { message?: string };
}

const FEMALE_AVATARS = [
  '/src/assets/images/avatar_woman_dev_1794823663488.jpg',
  '/src/assets/images/avatar_woman_designer_1794823664426.jpg',
  '/src/assets/images/avatar_woman_strategist_1794823665091.jpg',
  '/src/assets/images/avatar_woman_brand_1794823666075.jpg',
  '/src/assets/images/avatar_woman_mobile_1794823667364.jpg',
];

const MALE_AVATARS = [
  '/src/assets/images/avatar_man_architect_1794823663941.jpg',
  '/src/assets/images/avatar_man_creative_1794823664601.jpg',
  '/src/assets/images/avatar_man_engineer_1794823665563.jpg',
  '/src/assets/images/avatar_man_senior_1794823665880.jpg',
  '/src/assets/images/avatar_man_freelance_1794823667720.jpg',
];

function extractJsonObject(raw: string): MatchResponse | null {
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as MatchResponse;
  } catch {
    return null;
  }
}

function sanitizeUrl(url: string | undefined, platform: 'Fiverr' | 'Malt', nameOrSkill: string): string {
  const trimmed = (url || '').trim();
  if (trimmed.startsWith('https://')) {
    if (platform === 'Fiverr' && trimmed.includes('fiverr.com')) return trimmed;
    if (platform === 'Malt' && (trimmed.includes('malt.fr') || trimmed.includes('malt.com'))) return trimmed;
  }
  const encoded = encodeURIComponent(nameOrSkill);
  return platform === 'Fiverr'
    ? `https://www.fiverr.com/search/gigs?query=${encoded}`
    : `https://www.malt.fr/s?q=${encoded}`;
}

function normalizeMatchResponse(parsed: MatchResponse, lang: Language): MatchResponse {
  const rawList = Array.isArray(parsed.freelancers) ? parsed.freelancers : [];
  let femaleIdx = 0;
  let maleIdx = 0;

  const freelancers: FreelancerProfile[] = rawList.slice(0, 10).map((item, idx) => {
    const platform: 'Fiverr' | 'Malt' =
      String(item.platform).toLowerCase().includes('malt') ? 'Malt' : 'Fiverr';
    const fallbackRate = platform === 'Malt'
      ? (lang === 'fr' ? 'Tarif sur profil' : 'See profile rate')
      : (lang === 'fr' ? 'Voir offres' : 'See packages');

    const genderHint: 'female' | 'male' =
      item.genderHint === 'female' ? 'female' : 'male';
    const avatarUrl =
      genderHint === 'female'
        ? FEMALE_AVATARS[femaleIdx++ % FEMALE_AVATARS.length]
        : MALE_AVATARS[maleIdx++ % MALE_AVATARS.length];

    return {
      rank: idx + 1,
      id: item.id || `${platform.toLowerCase()}-${idx + 1}`,
      name: item.name || `Freelance #${idx + 1}`,
      handle: item.handle || '',
      platform,
      title: item.title || '',
      location: item.location || (platform === 'Malt' ? 'France / Remote' : 'Remote'),
      rate: item.rate || fallbackRate,
      rating: item.rating || '4.9',
      reviewsCount: item.reviewsCount || (lang === 'fr' ? 'Vérifié' : 'Verified'),
      experience: item.experience || (platform === 'Malt' ? 'Confirmé' : 'Top Rated'),
      responseTime: item.responseTime || '< 2h',
      skills: Array.isArray(item.skills) ? item.skills.slice(0, 6) : [],
      matchReason: item.matchReason || '',
      bio: item.bio || item.matchReason || '',
      deliverables: Array.isArray(item.deliverables) ? item.deliverables.slice(0, 4) : [],
      profileUrl: sanitizeUrl(item.profileUrl, platform, `${item.name || ''} ${item.title || ''}`),
      avatarUrl,
      genderHint,
    };
  });

  return {
    pitchSummary: parsed.pitchSummary || '',
    detectedDomains: Array.isArray(parsed.detectedDomains) ? parsed.detectedDomains.slice(0, 4) : [],
    freelancers,
  };
}

export async function callClaudeForFreelancers(
  pitch: string,
  lang: Language,
  platform: PlatformFilter,
  apiKey: string
): Promise<MatchResponse> {
  const platformInstruction =
    platform === 'fiverr'
      ? 'Find EXACTLY 10 real freelancers/gigs on Fiverr (fiverr.com).'
      : platform === 'malt'
        ? 'Find EXACTLY 10 real freelancers on Malt (malt.fr or en.malt.fr or malt.com).'
        : 'Find EXACTLY 10 real freelancers: 5 top matches on Malt (malt.fr / en.malt.fr / malt.com) and 5 top matches on Fiverr (fiverr.com).';

  const outputLanguage = lang === 'fr' ? 'French' : 'English';

  const systemPrompt = [
    'You are an elite talent-sourcing specialist.',
    'Your mission: analyze a founder/user project pitch and use web_search to find REAL, active freelancer profiles on Fiverr and Malt whose expertise matches the project as closely as possible.',
    platformInstruction,
    `Write all descriptive text (pitchSummary, detectedDomains, title, location, experience, responseTime, matchReason, bio, deliverables) in ${outputLanguage}.`,
    'CRITICAL RELEVANCE RULE: Every single one of the 10 freelancers MUST genuinely match the core technical/creative domain of the pitch (e.g. mobile app developers for a mobile app pitch, brand designers for a branding pitch). Never include an off-topic freelancer just to fill a slot.',
    'CRITICAL URL RULE: Every profileUrl MUST be an authentic fiverr.com or malt.fr / en.malt.fr / malt.com URL discovered in your web_search results. Never invent fake profile slugs—if you cannot verify a direct profile URL for one slot, use a verified profile URL found in another search result on that platform.',
    'Return ONLY a single raw JSON object (no markdown fences, no commentary before or after) matching this exact TypeScript shape:',
    '{',
    '  "pitchSummary": "1 concise sentence summarizing what talent the project needs",',
    '  "detectedDomains": ["Domain 1", "Domain 2", "Domain 3"],',
    '  "freelancers": [',
    '    {',
    '      "rank": 1,',
    '      "id": "unique-slug",',
    '      "name": "Full Name or Seller Name",',
    '      "handle": "@username or handle",',
    '      "genderHint": "female" | "male",',
    '      "platform": "Malt" | "Fiverr",',
    '      "title": "Exact specialty headline",',
    '      "location": "City, Country",',
    '      "rate": "e.g. 550 €/jour or À partir de 250 €",',
    '      "rating": "e.g. 4.9",',
    '      "reviewsCount": "e.g. 48 avis or 120+ reviews",',
    '      "experience": "e.g. 7 ans · Supermalter or Level 2 Seller",',
    '      "responseTime": "e.g. ~1h",',
    '      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],',
    '      "matchReason": "2 sharp sentences explaining specifically why this freelancer is an ideal fit for this exact pitch.",',
    '      "bio": "2-3 clear sentences describing their background, specialties, and concrete achievements from their profile.",',
    '      "deliverables": ["Concrete deliverable 1", "Concrete deliverable 2", "Concrete deliverable 3"],',
    '      "profileUrl": "https://www.malt.fr/profile/... or https://www.fiverr.com/..."',
    '    }',
    '  ]',
    '}',
    'Ensure the "freelancers" array contains EXACTLY 10 distinct freelancers sorted from best match (rank 1) to rank 10.',
  ].join('\n');

  const messages: Array<{ role: string; content: unknown }> = [
    {
      role: 'user',
      content: `Project pitch:\n"""\n${pitch}\n"""\n\nSearch Malt and/or Fiverr right now and return the JSON object with 10 real matching freelancers.`,
    },
  ];

  let finalText = '';

  for (let turn = 0; turn < 4; turn++) {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 8,
          },
        ],
        messages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
    }

    const data = (await response.json()) as AnthropicResponse;

    const textParts = (data.content || [])
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text as string);

    if (textParts.length > 0) {
      finalText += textParts.join('');
    }

    if (data.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: data.content });
      messages.push({
        role: 'user',
        content: 'Continue and output the complete JSON object with all 10 freelancers now.',
      });
      continue;
    }

    break;
  }

  let parsed = extractJsonObject(finalText);

  if (!parsed || !Array.isArray(parsed.freelancers) || parsed.freelancers.length < 10) {
    const repairResponse = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 6000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Based on this pitch:\n"${pitch}"\n\nAnd these preliminary findings:\n${finalText || 'No prior findings.'}\n\nOutput ONLY the valid JSON object with EXACTLY 10 freelancers matching the requested schema in ${outputLanguage}.`,
          },
        ],
      }),
    });

    if (repairResponse.ok) {
      const repairData = (await repairResponse.json()) as AnthropicResponse;
      const repairText = (repairData.content || [])
        .filter((b) => b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text as string)
        .join('');
      const repaired = extractJsonObject(repairText);
      if (repaired && Array.isArray(repaired.freelancers) && repaired.freelancers.length > 0) {
        parsed = repaired;
      }
    }
  }

  if (!parsed || !Array.isArray(parsed.freelancers) || parsed.freelancers.length === 0) {
    throw new Error('Unable to parse structured freelancer matches from Claude.');
  }

  return normalizeMatchResponse(parsed, lang);
}
