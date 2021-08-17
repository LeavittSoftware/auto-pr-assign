# @delivery-much/actions-assigner

Auto assign all team members to a PR

## Inputs

| Name | Description | Example |
| --- | --- | --- |
| `token` | **Required** A `repo` scoped personal access token.  ${{ secrets.GH_TOKEN }}
| `org` | GitHub org
| `production-teams` | Slugs of active production teams, separated by comma | backend

## Example workflow

- Create a file `pull-request.yml` in `.github/workflows/` directory with the following content:

```yaml
name: pull-request
on:
  pull_request:
    types: [opened, reopened]
jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: LeavittSoftware/auto-pr-assign
        with:
          token: ${{ secrets.GH_TOKEN }}
          org: myOrg
          production-teams: 'TeamA,TeamB'
```
