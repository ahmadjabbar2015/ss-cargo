# Git Identity Setup — Fix Per-Repo Contribution Attribution

## Background

Two separate GitHub accounts are in use across this user's machines, each with its own verified email. A commit only counts toward a GitHub contribution graph if its author email is verified on an account **that also has access to that repo**. Using the wrong email in a given repo means the commit counts for nobody.

| Context | GitHub account | Verified email to use |
|---|---|---|
| Personal repos | `ahmadjabbar2015` | `jb2015.1989@gmail.com` |
| Office repos (org: `Logicode-Technologies`) | `ahmadjabbarlogic` | `ahmedj@logicodetech.com` |

## Task

In the current repo, do the following:

1. Run `git remote -v` and check the owner/org in the URL.
   - If the remote points to `Logicode-Technologies` (or any other repo owned by the office GitHub account), this is an **office repo**.
   - Otherwise, treat it as a **personal repo**.

2. Check the current local config:
   ```
   git config user.email
   git config user.name
   ```

3. Set the correct **local** (not global) identity for this repo:
   - Office repo:
     ```
     git config user.email "ahmedj@logicodetech.com"
     git config user.name "Ahmad Jabbar"
     ```
   - Personal repo:
     ```
     git config user.email "jb2015.1989@gmail.com"
     git config user.name "Ahmad Jabbar"
     ```
   Do **not** use `--global` — each repo needs its own local override since the two accounts are mixed across projects on this machine.

4. Confirm the change:
   ```
   git config user.email
   ```

5. **Do not rewrite existing commit history** (no `git commit --amend`, `git rebase`, or `filter-branch`) to fix authorship on commits already pushed, unless explicitly asked — that's destructive on shared branches and can break collaborators' clones. This fixes attribution for **future** commits only.

6. Security check while in there: run `git remote -v` and confirm the URL does **not** contain a plaintext token (pattern `ghp_...` or similar embedded before `@github.com`). If it does:
   - Tell the user to revoke that token immediately at https://github.com/settings/tokens (it's now been exposed).
   - Reset the remote to a clean URL:
     ```
     git remote set-url origin https://github.com/<owner>/<repo>.git
     ```
   - Let Windows Credential Manager / Git Credential Manager handle auth instead of embedding a token in the URL.

## Also: credit the personal account on office commits too

On **office repos**, append a `Co-authored-by` trailer to every commit message so the commit also counts toward the personal account (`ahmadjabbar2015`), in addition to the office account:

```
<commit summary>

Co-authored-by: Ahmad Jabbar <jb2015.1989@gmail.com>
```

- Author/committer email stays `ahmedj@logicodetech.com` (per the rule above) — only add the trailer, don't change `user.email`.
- When committing via CLI, use `-m` twice or a heredoc so the trailer lands as its own paragraph, e.g.:
  ```
  git commit -m "Fix vendor sync bug" -m "Co-authored-by: Ahmad Jabbar <jb2015.1989@gmail.com>"
  ```
- **This only actually grants credit if `ahmadjabbar2015` has access to the repo** (org member/collaborator on `Logicode-Technologies`, or the repo is public). If that account isn't a member of the org, the trailer does nothing — check/request access first rather than assuming the trailer alone is enough.
- Don't add this trailer on personal repos — no need to co-author your own commits with yourself.
- Never add a `Co-authored-by: Claude ...` trailer to any commit, in this repo or any other.

## Notes

- This does not merge or connect the two GitHub accounts — that's not possible. It just ensures each repo's commits are authored with the email that actually gets credit in that context.
- An email can only be verified on one GitHub account at a time, so double-check before switching an email between accounts.
