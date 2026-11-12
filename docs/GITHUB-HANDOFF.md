# GitHub and employee handoff

## Repository destination

The owner requested a **new public repository** in the connected account `stanleespiderman`. Repository: [stanleespiderman/practo-demo](https://github.com/stanleespiderman/practo-demo). Public means source is readable by anyone. Do not include credentials, real patient data or deployment bypass links. The repository destination and upload result must be verified before claiming it has been pushed.

The supplied handoff snapshot intentionally omits the original Sites `.git/` history and `.openai/` metadata. It includes editable source, the wrapper, documentation and browser reference screenshots. Keep the original Sites repository intact.

## Clone the repository

```sh
git clone https://github.com/stanleespiderman/practo-demo.git
cd practo-demo
npm ci
npm run check
npm run preview
```

## If uploading an independent copy from the source archive

Extract the archive and open a terminal in its project root. After authenticating GitHub CLI on your own workstation, create a new repository from that extracted folder:

```sh
git init -b main
git add .
git commit -m "Prepare Practo demo source and developer handover"
gh repo create YOUR_ACCOUNT/YOUR_NEW_REPOSITORY --public --source=. --remote=origin --push
```

These commands are instructions, not proof of upload. If the repository already exists, do not run create or force-push. Inspect its branch/history, then add the correct remote to a clean snapshot and push through a normal reviewed change. Never overwrite an unrelated repository.

GitHub Actions is configured to run source/build/format checks on push and pull requests. It never assembles Android. Review the actual Actions result after upload; local checks do not prove hosted CI passed. Add a suitable required-check/branch protection policy if supported by the account and agreed by the owner.

## Give the employee access

For read-only review, share the public repository URL and `docs/HANDOVER.md`. For development, obtain the employee's exact GitHub username, then use repository Settings → Collaborators to invite that person with the necessary access. Do not infer an identity from a name or give administrator access by default.

No employee has been identified or invited as part of this snapshot. The repository owner remains responsible for approving release and access decisions.

## Employee acceptance checklist

- [ ] Clone the repository and confirm the default branch and latest handover commit.
- [ ] Read README → HANDOVER → DEVELOPMENT → BACKLOG.
- [ ] Run source checks and open the browser review.
- [ ] Reproduce the patient/doctor message and DEMO-document workflow.
- [ ] Record local Android environment and H-01 results without packaging.
- [ ] Agree the first backlog issue, reviewer and backend owner.
- [ ] Acknowledge the APK approval hold and the unconnected backend.

Use issue IDs H-01 onward in branches and pull requests. Keep new decisions in the repository rather than relying on chat history.
