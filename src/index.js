const { context, getOctokit } = require("@actions/github");
const { getInput, setFailed } = require("@actions/core");

/**
 * Request PR review to given reviewers.
 *
 * @param {Octokit} octokit - Octokit instance
 * @param {Array} reviewers - GitHub usernames
 */
const review = async (octokit, reviewers) => {
  try {
    const { owner, repo } = context.issue;
    console.log(
      JSON.stringify({
        owner: owner,
        repo: repo,
        pull_number: context.payload.pull_request.number,
        reviewers: reviewers.filter((x) => x !== context.actor) || undefined,
      })
    );
    await octokit.pulls.requestReviewers({
      owner: owner,
      repo: repo,
      pull_number: context.payload.pull_request.number,
      reviewers: reviewers.filter((x) => x !== context.actor) || undefined,
    });
  } catch (err) {
    throw new Error(`Couldn't request review.\n  Error: ${err}`);
  }
};

const getTeammates = async (octokit, org, teamSlugs) => {
  try {
    const actor = context.actor;
    const slugs = teamSlugs.split(",");

    for (let index = 0; index < slugs.length; index++) {
      const slug = slugs[index];
      var members = await octokit.rest.teams.listMembersInOrg({
        org: org,
        team_slug: slug,
      });

      if (members.data.some((o) => o.login === actor)) {
        return members.data.map((o) => o.login);
      }
    }
    return [];
  } catch (err) {
    throw new Error(`Failed to find your teammates.\n  Error: ${err}`);
  }
};

// Run Action.
const run = async () => {
  try {
    const token = getInput("token", { required: true });
    const defaultToken = getInput("default-token", { required: true });
    const org = getInput("org", { required: true });
    const teams = getInput("production-teams", { required: true });

    if (context.eventName === "pull_request") {
      const octokitPriv = getOctokit(token);
      const octokitStd = getOctokit(defaultToken);
      var reviewers = await getTeammates(octokitPriv, org, teams);
      if (reviewers.length === 0) {
        console.log("Could not determine your teammates. Nothing to do.");
      } else {
        await review(octokitStd, reviewers);
      }
    } else {
      throw new Error("Sorry, this Action only works with pull requests.");
    }
  } catch (error) {
    setFailed(error.message);
  }
};

run();
