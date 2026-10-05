Goal: POST /notes must reject a note without a usable title. Return 400 with `{"error":"title is required"}` when the title is missing, empty, or only whitespace, and 400 with `{"error":"title must be at most 200 characters"}` when it is longer than 200 characters. Store the title trimmed.
Context: Validation lives in `createNoteStore().create` in src/notes.js. Today it only checks that the title is a string, so empty titles are accepted.
Constraints: Keep the API paths and the success response shape unchanged. No new dependencies.
Done when: Unit tests and an E2E test cover each rejected case and the trimming, and `npm run verify` passes.
If unsure: Stop and ask. Don't guess.
