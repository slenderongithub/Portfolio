const CACHE_KEY = "portfolio_repo_descriptions";
const GEMINI_API_KEY = localStorage.getItem("gemini_api_key") || "";
function getDescriptionCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}
function saveDescriptionCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    console.warn("Failed to save description cache");
  }
}
async function generateDescriptionWithGemini(repo) {
  if (!GEMINI_API_KEY) {
    return null;
  }
  const prompt = `Generate a single witty, engaging 1-2 sentence description for this GitHub project:
Name: ${repo.name}
Current Description: ${repo.description || "No description"}
Topics/Languages: ${[...((repo.topics || []).slice(0, 3)), repo.language].filter(Boolean).join(", ")}
Requirements:
- Be witty and engaging, like startup pitch language
- Show what it does and why it matters
- Max 2 sentences
- Don't use generic phrases like "This project"
- Sound like these examples:
  "Caregiving coordination app with reminders, adherence scoring, and AI health insights."
  "Wearable emergency communication device using gesture-triggered safety alerts."
  "Productivity tracker with reminders, streak intelligence, and behavioral analytics."
Just provide the description, nothing else.`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.warn(`Gemini API error: ${response.status}`, error);
      return null;
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.warn("Failed to generate description with Gemini:", error);
    return null;
  }
}
async function enhanceRepoDescriptions(repos) {
  const cache = getDescriptionCache();
  const reposNeedingDescriptions = repos.filter(r => !cache[r.name]);
  if (reposNeedingDescriptions.length === 0) {
    console.log("All descriptions cached, skipping API calls");
    return repos;
  }
  console.log(`Generating descriptions for ${reposNeedingDescriptions.length} new repos...`);
  for (const repo of reposNeedingDescriptions) {
    const generated = await generateDescriptionWithGemini(repo);
    if (generated) {
      cache[repo.name] = generated;
      console.log(`✓ Generated description for ${repo.name}`);
    }
  }
  saveDescriptionCache(cache);
  return repos;
}
function applyDescriptionsFromCache(repos) {
  const cache = getDescriptionCache();
  return repos.map(repo => ({
    ...repo,
    description: cache[repo.name] || repo.description,
  }));
}
window.setGeminiApiKey = (key) => {
  localStorage.setItem("gemini_api_key", key);
  console.log("Gemini API key saved.");
};
window.clearDescriptionCache = () => {
  localStorage.removeItem(CACHE_KEY);
  console.log("Description cache cleared");
};
window.enhanceRepoDescriptions = enhanceRepoDescriptions;
window.applyDescriptionsFromCache = applyDescriptionsFromCache;
