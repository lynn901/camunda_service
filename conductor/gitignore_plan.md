# Objective
Update the `.gitignore` file to explicitly ignore unnecessary, auto-generated, and dependency-related directories for both the frontend (React/Vite) and backend (Spring Boot) projects.

# Key Files & Context
- `.gitignore` (Root directory)

# Implementation Steps
1. Reorganize `.gitignore` to have explicit sections for the backend and frontend projects.
2. Add the following ignores for the **Backend** (`backend/`):
   - `target/`, `bin/`, `out/`, `build/`
   - `.mvn/wrapper/maven-wrapper.jar`, `dependency-reduced-pom.xml`
   - Generated artifacts (`*.jar`, `*.war`, `*.ear`, `*.zip`, `*.tar.gz`, `*.rar`)
   - `logs/`
3. Add the following ignores for the **Frontend** (`frontend/`):
   - `node_modules/`, `dist/`, `dist-ssr/`, `build/`, `coverage/`
   - `.vite/`, `.eslintcache`, `.stylelintcache`, `.parcel-cache`
   - `.next/`, `.nuxt/`, `.cache/`, `.npm/`, `.yarn-integrity`
   - NPM/Yarn/PNPM debug logs (`npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `pnpm-debug.log*`)
4. Retain global fallback rules (e.g. `node_modules/`, `target/`), IDE configurations (`.idea/`, `.vscode/`, `*.iml`, etc.), environment variables (`.env*`), and OS-specific files (`.DS_Store`).

# Verification & Testing
- Use `git status --ignored` to verify that the specified paths are correctly ignored.
- Confirm that no tracked source code files are accidentally ignored.