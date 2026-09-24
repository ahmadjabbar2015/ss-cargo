# Repo instructions

## Before making any commit in this repo

Follow [docs/git-identity-setup.md](docs/git-identity-setup.md):

1. Check `git remote -v` to determine if this is a personal repo or an office repo (`Logicode-Technologies` org).
2. Ensure the **local** `git config user.email` (not global) matches the account that has access to this specific repo — see the table in that doc.
3. On office repos, append a `Co-authored-by: Ahmad Jabbar <jb2015.1989@gmail.com>` trailer to the commit message, in addition to the normal author (only if the personal account actually has access to the repo).
4. **Never** add a `Co-Authored-By: Claude ...` trailer to any commit in this repo.
5. Never rewrite existing commit history to fix past authorship unless explicitly asked.
6. Never embed a token/credential directly in a remote URL (`git remote -v` should never show `ghp_...`); use a credential manager instead.
