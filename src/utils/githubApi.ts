export interface GitHubSettings {
  repo: string;
  token: string;
  branch: string;
}

export interface GitHubContentFile {
  path: string;
  sha?: string;
  content?: string;
}

const SETTINGS_REPO_KEY = 'salaf-library-github-repo';
const SETTINGS_BRANCH_KEY = 'salaf-library-github-branch';
const SETTINGS_TOKEN_KEY = 'salaf-library-github-token-session';

export function saveGitHubSettings(settings: GitHubSettings) {
  localStorage.setItem(SETTINGS_REPO_KEY, settings.repo.trim());
  localStorage.setItem(SETTINGS_BRANCH_KEY, settings.branch.trim() || 'main');
  // Токен намеренно хранится только в sessionStorage: после закрытия вкладки он исчезает.
  sessionStorage.setItem(SETTINGS_TOKEN_KEY, settings.token.trim());
}

export function loadGitHubSettings(): GitHubSettings {
  return {
    repo: localStorage.getItem(SETTINGS_REPO_KEY) || 'aminmod-bit/salaf-library-1',
    branch: localStorage.getItem(SETTINGS_BRANCH_KEY) || 'main',
    token: sessionStorage.getItem(SETTINGS_TOKEN_KEY) || '',
  };
}

export function hasGitHubSettings() {
  const settings = loadGitHubSettings();
  return Boolean(settings.repo && settings.token);
}

export function parseRepo(repo: string) {
  const clean = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/^\/+|\/+$/g, '');
  const [owner, name] = clean.split('/');
  if (!owner || !name) throw new Error('Репозиторий должен быть в формате owner/repo, например aminmod-bit/salaf-library-1');
  return { owner, name };
}

async function githubFetch(settings: GitHubSettings, endpoint: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${settings.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `GitHub API error ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function testGitHubConnection(settings: GitHubSettings) {
  const { owner, name } = parseRepo(settings.repo);
  return githubFetch(settings, `/repos/${owner}/${name}`);
}

export interface GitHubTreeFile {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

export async function listGitHubFiles(settings: GitHubSettings): Promise<GitHubTreeFile[]> {
  const { owner, name } = parseRepo(settings.repo);
  const data = await githubFetch(settings, `/repos/${owner}/${name}/git/trees/${encodeURIComponent(settings.branch || 'main')}?recursive=1`);
  return Array.isArray(data?.tree) ? data.tree.filter((item: GitHubTreeFile) => item.type === 'blob') : [];
}

export async function getGitHubFile(settings: GitHubSettings, filePath: string): Promise<GitHubContentFile | null> {
  const { owner, name } = parseRepo(settings.repo);
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  const endpoint = `/repos/${owner}/${name}/contents/${encodedPath}?ref=${encodeURIComponent(settings.branch || 'main')}`;

  try {
    const data = await githubFetch(settings, endpoint);
    if (!data || Array.isArray(data) || data.type !== 'file') return null;
    return {
      path: data.path,
      sha: data.sha,
      content: data.content ? decodeBase64Utf8(data.content) : undefined,
    };
  } catch (error) {
    if (error instanceof Error && /Not Found/i.test(error.message)) return null;
    throw error;
  }
}

export async function putGitHubFile(settings: GitHubSettings, filePath: string, contentBase64: string, message: string, sha?: string) {
  const { owner, name } = parseRepo(settings.repo);
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');

  return githubFetch(settings, `/repos/${owner}/${name}/contents/${encodedPath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: settings.branch || 'main',
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function upsertTextFile(settings: GitHubSettings, filePath: string, text: string, message: string) {
  const existing = await getGitHubFile(settings, filePath);
  return putGitHubFile(settings, filePath, encodeUtf8Base64(text), message, existing?.sha);
}

export async function upsertBinaryFile(settings: GitHubSettings, filePath: string, file: File, message: string) {
  const existing = await getGitHubFile(settings, filePath);
  const content = await fileToBase64(file);
  return putGitHubFile(settings, filePath, content, message, existing?.sha);
}

export function encodeUtf8Base64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

export function decodeBase64Utf8(value: string) {
  const clean = value.replace(/\s/g, '');
  return decodeURIComponent(escape(atob(clean)));
}

export async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function slugifyFileName(name: string) {
  const ext = name.includes('.') ? `.${name.split('.').pop()?.toLowerCase()}` : '';
  const baseName = name.replace(/\.[^.]+$/, '');
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  const slug = baseName
    .normalize('NFC')
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => map[ch] || ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'file';
  return `${slug}${ext}`;
}

export function nextContentId(items: Array<{ id?: string }>, prefix: string) {
  const max = items.reduce((acc, item) => {
    const id = String(item.id || '');
    if (!id.startsWith(prefix)) return acc;
    const num = Number(id.slice(prefix.length).replace(/^0+/, '') || '0');
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}
