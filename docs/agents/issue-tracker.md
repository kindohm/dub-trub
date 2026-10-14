# Issue tracker: GitHub

Issues and specs live in kindohm/dub-trub GitHub Issues.
Use the gh CLI from this repository.

## Operations

- Publish a spec or ticket: gh issue create --title "..." --body-file <file>
- Read: gh issue view <number> --json number,title,body,labels,comments
- List: gh issue list --state open; filter with --label as needed.
- Comment: gh issue comment <number> --body-file <file>
- Label: gh issue edit <number> --add-label "..." or --remove-label "..."
- Close: gh issue close <number>

Write multiline bodies to a temporary file and use --body-file.

## Relationships and wayfinding

Keep each implementation ticket in its own issue.
Link children with GitHub sub-issues where supported; otherwise,
add "Part of #<parent>" to each child and a task list to the parent.

Use native GitHub issue dependencies for blocking relationships.
If unavailable, record "Blocked by: #<number>" in the issue body.
A ticket is ready when every blocker is closed.

For wayfinding, label the map wayfinder:map and children
wayfinder:research, wayfinder:prototype, wayfinder:grilling,
or wayfinder:task. Create missing labels before applying them.

Select open, unblocked, unassigned children in map order.
Claim with gh issue edit <number> --add-assignee @me.
Resolve by commenting with the answer, closing the child,
and adding a linked summary to the map's Decisions-so-far.

## Pull requests as a triage surface

PRs as a request surface: no.
