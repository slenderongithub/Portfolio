const GITHUB_USERNAME = "slenderongithub";
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
let customDescriptions = {};
async function loadCustomDescriptions() {
  try {
    const response = await fetch("./data/projects-descriptions.json");
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
// Evenly spread `count` points over a sphere (Fibonacci lattice) so any
// number of repos gets its own non-overlapping node position.
function fibonacciSpherePositions(count) {
  const phi = Math.PI * (Math.sqrt(5) - 1);
  return Array.from({ length: count }, (_, i) => {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
  });
}
function transformRepoToProjectNode(repo, position) {
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
  const publicRepos = repos.filter(repo => !repo.private && !repo.fork);
  const positions = fibonacciSpherePositions(publicRepos.length);
  const projectNodes = publicRepos.map((repo, index) => transformRepoToProjectNode(repo, positions[index]));
  const terminalCards = publicRepos.map(repo => transformRepoToTerminalCard(repo));
  return { projectNodes, terminalCards };
}
window.loadProjectsFromGitHub = loadProjectsFromGitHub;
