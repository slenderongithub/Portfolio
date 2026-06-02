const GITHUB_USERNAME = "slenderongithub";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
let customDescriptions = {};

async function loadCustomDescriptions() {
  try {
    const response = await fetch("./projects-descriptions.json");
    if (response.ok) {
      customDescriptions = await response.json();
    }
  } catch (error) {
    console.warn("Could not load custom descriptions:", error);
  }
}

function getCustomDescription(repoName) {
  return customDescriptions[repoName] || null;
}

async function fetchGitHubRepos() {
  try {
    const response = await fetch(`${GITHUB_API}?sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return [];
  }
}

function transformRepoToProjectNode(repo, index) {
  const colors = [
    { x: -0.95, y: 0.52, z: 0.34 },
    { x: 1.02, y: 0.34, z: -0.22 },
    { x: -0.52, y: -0.86, z: 0.44 },
    { x: 0.86, y: -0.62, z: 0.52 },
    { x: 0.08, y: 0.98, z: -0.08 },
    { x: -0.68, y: 0.15, z: 0.72 },
    { x: 0.72, y: 0.08, z: -0.68 },
    { x: -0.34, y: -0.72, z: -0.58 },
  ];

  const position = colors[index % colors.length];
  const tags = repo.topics && repo.topics.length > 0
    ? repo.topics
    : (repo.language ? [repo.language] : ["Project"]);

  return {
    key: repo.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    title: repo.name,
    description: repo.description || "No description available.",
    tags: tags.slice(0, 3),
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    position,
  };
}

function transformRepoToTerminalCard(repo) {
  const description = repo.description || "Project repository";
  const language = repo.language ? `| ${repo.language}` : "";
  const key = repo.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return {
    key,
    name: repo.name,
    url: repo.html_url,
    description,
    language,
  };
}

async function loadProjectsFromGitHub() {
  await loadCustomDescriptions();

  let repos = await fetchGitHubRepos();

  if (repos.length === 0) {
    console.warn("No repos fetched from GitHub");
    return { projectNodes: [], terminalCards: [] };
  }

  repos = repos.map(repo => ({
    ...repo,
    description: getCustomDescription(repo.name) || repo.description,
  }));

  const projectNodes = repos
    .filter(repo => !repo.private && !repo.fork)
    .slice(0, 8)
    .map((repo, index) => transformRepoToProjectNode(repo, index));

  const terminalCards = repos
    .filter(repo => !repo.private && !repo.fork)
    .slice(0, 12)
    .map(repo => transformRepoToTerminalCard(repo));

  return { projectNodes, terminalCards };
}

window.loadProjectsFromGitHub = loadProjectsFromGitHub;
