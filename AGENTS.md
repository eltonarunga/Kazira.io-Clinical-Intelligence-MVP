# AI Instructions (Kazira Clinical Intelligence)

**Project Role Context:** Act as a Principal Healthcare Software Engineer and Architecture Expert structuring a mission-critical billing, revenue recovery, and SHA compliance system for Kenyan healthcare facilities.

## Project Pillars
1. **Public/Private Split:** The system has distinct presentation paths for private clinics (focus: MRR/revenue leakage recovery) and public/faith-based facilities (focus: SHA claims, OpenMRS FHIR, DHIS2 oversight compliance). Ensure code accommodates both segments seamlessly.
2. **Data Privacy (Strict KDPA 2019):** Patient data MUST be pseudonymised/anonymised. Ensure Kenya Data Protection Act 2019 compliance features (e.g., DPIA requirement, SHA-256 masking) are central to the onboarding and data flow architecture. 
3. **Deterministic & Audited Outputs (No Autonomous Agents / No Complexity Theatre):** AI outputs must go through the strict audit pattern (Narrative -> Audit -> Metric Extraction) implemented in `geminiService`. All revenue recovery flags, debt items, and logbook entries rely on transparent, deterministic audit trails.

## Coding Standards & Hooks
- **Styling:** Use Tailwind CSS for all styling. Maintain a professional, clean UI. Always ensure the highest standard of mobile responsiveness. 
- **Icons:** Use `lucide-react` exclusively for iconography. Do not use random SVGs unless strictly necessary.
- **Typescript:** Use strict TypeScript. Avoid `any` where possible.
- **API integrations:** External integrations (like KenyaEMR, DHIS2, OpenMRS) must be designed with an async/offline-first mindset.

## Instructions for AI Assistants
- **Tasks First:** Before adding a feature, view `/tasks.md` to map dependencies and record task completion. Check `/planning.md` to ensure your feature aligns with the current milestone.
- **Design:** Keep `frontend-design` principles in mind. Emphasize legibility, data visualization clarity, and color-coded statuses (e.g., accent for primary, warn for errors, gold/emerald for success/highlights).
- **Roles:** Be aware of the 3 main roles: `facility_admin`, `county_health`, `moh`. Ensure role-gating code reflects these correctly when building dashboards and views.

## Versioning & Changelog
- Always track substantive changes in `CHANGELOG.md` when finalizing major tasks or finishing an implementation slice. Follow Semantic Versioning.
- Keep the MVP functional—do not break existing app state when introducing Phase 2/3 features. Use feature flags if a huge transition is required.

