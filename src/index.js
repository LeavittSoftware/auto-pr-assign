const { context, getOctokit } = require('@actions/github')
const { getInput, setFailed } = require('@actions/core')

/**
 * Request PR review to given reviewers.
 *
 * @param {Octokit} octokit - Octokit instance
 * @param {string} reviewers - GitHub usernames
 * @param {string} teamReviewers - GitHub teams
 */
const review = async (octokit, reviewers, teamReviewers) => {
  try {
    const { owner, repo } = context.issue
    await octokit.pulls.requestReviewers({
      owner: owner,
      repo: repo,
      pull_number: context.payload.pull_request.number,
      reviewers: reviewers.split(',').filter(x => x !== context.actor) || undefined,
      team_reviewers: teamReviewers.split(',') || undefined
    })
  } catch (err) {
    throw new Error(`Couldn't request review.\n  Error: ${err}`)
  }
}

const getTeammates = async (octokit, org, teamSlugs) => {
  try {
  const actor = context.actor;
  const slugs = teamSlugs.split(',');

  for (let index = 0; index < slugs.length; index++) {
    const slug = slugs[index];
    var members =  await octokit.rest.teams.listMembersInOrg({
      org: org,
      team_slug: slug,
    });
    console.log('members', JSON.stringify(members));
  }

   
    console.log(members);



    const { owner, repo } = context.issue
    await octokit.pulls.requestReviewers({
      owner: owner,
      repo: repo,
      pull_number: context.payload.pull_request.number,
      reviewers: reviewers.split(',').filter(x => x !== context.actor) || undefined,
      team_reviewers: teamReviewers.split(',') || undefined
    })
  } catch (err) {
    throw new Error(`Couldn't request review.\n  Error: ${err}`)
  }
}


// Run Action.
const run = async () => {
  try {
    const token = getInput('token', { required: true })
    const org = getInput('org', { required: true }) //LeavittSoftware
    const teams = getInput('production-teams', { required: true }) //mikes-angels,operations
    const teamReviewers = getInput('team-reviewers', { required: false })
    
    if (context.eventName === 'pull_request') {
      const octokit = getOctokit(token)
      await getTeammates(octokit, org, teams);
      // await assign(octokit)
      if (reviewers || teamReviewers) await review(octokit, reviewers, teamReviewers)
    } else {
      throw new Error('Sorry, this Action only works with pull requests.')
    }

  } catch (error) {
    setFailed(error.message)
  }
}

run()
