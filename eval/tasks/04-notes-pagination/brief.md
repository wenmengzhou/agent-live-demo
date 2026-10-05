Goal: Paginate GET /notes. Accept an optional `limit` query parameter (integer 1–100, default 20) and an optional `cursor`. Return `{"notes": [...], "nextCursor": <string or null>}`, oldest first. Passing `nextCursor` back as `cursor` returns the next page; the last page has `nextCursor: null`. An invalid `limit` or `cursor` returns 400 with a JSON error.
Context: Notes are listed in src/notes.js (`list`) and returned by the GET /notes route in src/app.js. Note ids are increasing integers.
Constraints: Without query parameters the response must still contain every note when there are 20 or fewer. No new dependencies.
Done when: Unit tests cover the default limit, walking all pages, and invalid input; an E2E test walks two pages; and `npm run verify` passes.
If unsure: Stop and ask. Don't guess.
