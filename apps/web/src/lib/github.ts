import { Octokit } from 'octokit';
import { createPullRequest } from 'octokit-plugin-create-pull-request';
import type { Place } from '@/types/place';

const MyOctokit = Octokit.plugin(createPullRequest);

export interface CreatePlacePROptions {
  place: Place;
  contributorName?: string;
  contributorEmail?: string;
  contributorGithub?: string;
}

export interface CreatePlacePRResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  error?: string;
}

/**
 * Create a GitHub Pull Request for a new place
 * Uses the GitHub PAT from environment variables
 */
export async function createPlacePR(
  options: CreatePlacePROptions
): Promise<CreatePlacePRResult> {
  const { place, contributorName, contributorEmail, contributorGithub } = options;

  // Validate environment variables
  const githubPat = process.env.GITHUB_PAT;
  const githubOwner = process.env.GITHUB_OWNER || 'OSSPhilippines';
  const githubRepo = process.env.GITHUB_REPO || 'whereinmaginhawa';

  if (!githubPat) {
    return {
      success: false,
      error: 'GitHub PAT not configured. Please set GITHUB_PAT environment variable.',
    };
  }

  try {
    const octokit = new MyOctokit({
      auth: githubPat,
    });

    // Prepare file content
    const fileContent = JSON.stringify(place, null, 2);
    const fileName = `apps/web/src/data/places/${place.slug}.json`;

    // Prepare PR description
    let prBody = `## New Place Submission\n\n`;
    prBody += `**Place Name:** ${place.name}\n`;
    prBody += `**Address:** ${place.address}\n`;
    prBody += `**Cuisine:** ${place.cuisineTypes.join(', ')}\n`;
    prBody += `**Price Range:** ${place.priceRange}\n\n`;

    if (contributorName || contributorEmail || contributorGithub) {
      prBody += `---\n\n### Contributor Information\n\n`;
      if (contributorName) prBody += `**Name:** ${contributorName}\n`;
      if (contributorGithub) prBody += `**GitHub:** @${contributorGithub}\n`;
      if (contributorEmail) prBody += `**Email:** ${contributorEmail}\n`;
      prBody += `\n`;
    }

    prBody += `---\n\n`;
    prBody += `This PR was automatically created via the Where In Maginhawa web form.\n`;
    prBody += `The place file will be validated automatically by GitHub Actions.\n\n`;
    prBody += `⚠️ **Note:** The \`places.json\` and \`stats.json\` index files will be auto-generated after merge.\n`;

    // Create the PR
    const result = await octokit.createPullRequest({
      owner: githubOwner,
      repo: githubRepo,
      title: `Add ${place.name}`,
      body: prBody,
      head: `add-place-${place.slug}-${Date.now()}`,
      base: 'main',
      changes: [
        {
          files: {
            [fileName]: fileContent,
          },
          commit: `Add ${place.name} to places directory\n\nSubmitted via web form`,
        },
      ],
    });

    if (!result || !result.data) {
      return {
        success: false,
        error: 'Failed to create pull request. No data returned from GitHub.',
      };
    }

    return {
      success: true,
      prUrl: result.data.html_url,
      prNumber: result.data.number,
    };
  } catch (error) {
    console.error('Error creating GitHub PR:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to create PR: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while creating the pull request.',
    };
  }
}

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a database
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 5, windowMs: number = 60 * 60 * 1000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Filter out old requests outside the time window
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.limit) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Clean up old entries periodically
    if (this.requests.size > 1000) {
      this.cleanup();
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

/**
 * Create a GitHub Pull Request to update an existing place
 * Uses the GitHub PAT from environment variables
 */
export async function updatePlacePR(
  options: CreatePlacePROptions
): Promise<CreatePlacePRResult> {
  const { place, contributorName, contributorEmail, contributorGithub } = options;

  // Validate environment variables
  const githubPat = process.env.GITHUB_PAT;
  const githubOwner = process.env.GITHUB_OWNER || 'OSSPhilippines';
  const githubRepo = process.env.GITHUB_REPO || 'whereinmaginhawa';

  if (!githubPat) {
    return {
      success: false,
      error: 'GitHub PAT not configured. Please set GITHUB_PAT environment variable.',
    };
  }

  try {
    const octokit = new MyOctokit({
      auth: githubPat,
    });

    // Prepare file content
    const fileContent = JSON.stringify(place, null, 2);
    const fileName = `apps/web/src/data/places/${place.slug}.json`;

    // Prepare PR description
    let prBody = `## Place Update Submission\n\n`;
    prBody += `**Place Name:** ${place.name}\n`;
    prBody += `**Address:** ${place.address}\n`;
    prBody += `**Cuisine:** ${place.cuisineTypes.join(', ')}\n`;
    prBody += `**Price Range:** ${place.priceRange}\n\n`;

    if (contributorName || contributorEmail || contributorGithub) {
      prBody += `---\n\n### Contributor Information\n\n`;
      if (contributorName) prBody += `**Name:** ${contributorName}\n`;
      if (contributorGithub) prBody += `**Social Media:** @${contributorGithub}\n`;
      if (contributorEmail) prBody += `**Email:** ${contributorEmail}\n`;
      prBody += `\n`;
    }

    prBody += `---\n\n`;
    prBody += `This PR was automatically created via the Where In Maginhawa web form.\n`;
    prBody += `The updated place file will be validated automatically by GitHub Actions.\n\n`;
    prBody += `⚠️ **Note:** The \`places.json\` and \`stats.json\` index files will be auto-generated after merge.\n`;

    // Create the PR
    const result = await octokit.createPullRequest({
      owner: githubOwner,
      repo: githubRepo,
      title: `Update ${place.name}`,
      body: prBody,
      head: `update-place-${place.slug}-${Date.now()}`,
      base: 'main',
      changes: [
        {
          files: {
            [fileName]: fileContent,
          },
          commit: `Update ${place.name} information\n\nSubmitted via web form`,
        },
      ],
    });

    if (!result || !result.data) {
      return {
        success: false,
        error: 'Failed to create pull request. No data returned from GitHub.',
      };
    }

    return {
      success: true,
      prUrl: result.data.html_url,
      prNumber: result.data.number,
    };
  } catch (error) {
    console.error('Error creating GitHub PR:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to create PR: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while creating the pull request.',
    };
  }
}

export interface DeletePlacePROptions {
  slug: string;
  name: string;
  reason?: string;
  contributorName?: string;
  contributorEmail?: string;
}

/**
 * Create a GitHub Pull Request to delete a place
 * Uses the GitHub API directly since octokit-plugin-create-pull-request doesn't support file deletion
 */
export async function deletePlacePR(
  options: DeletePlacePROptions
): Promise<CreatePlacePRResult> {
  const { slug, name, reason, contributorName, contributorEmail } = options;

  // Validate environment variables
  const githubPat = process.env.GITHUB_PAT;
  const githubOwner = process.env.GITHUB_OWNER || 'OSSPhilippines';
  const githubRepo = process.env.GITHUB_REPO || 'whereinmaginhawa';

  if (!githubPat) {
    return {
      success: false,
      error: 'GitHub PAT not configured. Please set GITHUB_PAT environment variable.',
    };
  }

  try {
    const octokit = new MyOctokit({
      auth: githubPat,
    });

    const fileName = `apps/web/src/data/places/${slug}.json`;
    const branchName = `delete-place-${slug}-${Date.now()}`;

    // 1. Get the default branch reference
    const { data: ref } = await octokit.rest.git.getRef({
      owner: githubOwner,
      repo: githubRepo,
      ref: 'heads/main',
    });

    const mainSha = ref.object.sha;

    // 2. Create a new branch
    await octokit.rest.git.createRef({
      owner: githubOwner,
      repo: githubRepo,
      ref: `refs/heads/${branchName}`,
      sha: mainSha,
    });

    // 3. Get the file to be deleted (to get its SHA)
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner: githubOwner,
      repo: githubRepo,
      path: fileName,
      ref: branchName,
    });

    if (!('sha' in fileData)) {
      throw new Error('File not found or is a directory');
    }

    // 4. Delete the file
    await octokit.rest.repos.deleteFile({
      owner: githubOwner,
      repo: githubRepo,
      path: fileName,
      message: `Remove ${name} from places directory\n\nPlace reported as closed via web form`,
      sha: fileData.sha,
      branch: branchName,
    });

    // 5. Prepare PR description
    let prBody = `## Place Closure Report\n\n`;
    prBody += `**Place Name:** ${name}\n`;
    prBody += `**Action:** Remove from directory\n\n`;

    if (reason) {
      prBody += `**Reason:** ${reason}\n\n`;
    }

    if (contributorName || contributorEmail) {
      prBody += `---\n\n### Reporter Information\n\n`;
      if (contributorName) prBody += `**Name:** ${contributorName}\n`;
      if (contributorEmail) prBody += `**Email:** ${contributorEmail}\n`;
      prBody += `\n`;
    }

    prBody += `---\n\n`;
    prBody += `This PR was automatically created via the Where In Maginhawa web form to report a place closure.\n`;
    prBody += `Please verify the closure before merging.\n\n`;
    prBody += `⚠️ **Note:** The \`places.json\` and \`stats.json\` index files will be auto-generated after merge.\n`;

    // 6. Create pull request
    const { data: pr } = await octokit.rest.pulls.create({
      owner: githubOwner,
      repo: githubRepo,
      title: `Remove ${name} (Closure Report)`,
      body: prBody,
      head: branchName,
      base: 'main',
    });

    return {
      success: true,
      prUrl: pr.html_url,
      prNumber: pr.number,
    };
  } catch (error) {
    console.error('Error creating GitHub PR:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to create PR: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred while creating the pull request.',
    };
  }
}

// Singleton rate limiter instance
// 5 requests per hour per IP
export const rateLimiter = new RateLimiter(5, 60 * 60 * 1000);
