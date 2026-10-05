import { ValidationError } from './errors.js';

export function createNoteStore() {
  const notes = [];
  let nextId = 1;

  return {
    list(owner) {
      return notes.filter((n) => n.owner === owner);
    },
    page(owner, { limit, cursor } = {}) {
      const size = limit === null || limit === undefined ? 20 : Number(limit);
      if (!Number.isInteger(size) || size < 1 || size > 100 || (limit != null && !/^\d+$/.test(limit))) {
        throw new ValidationError('limit must be an integer from 1 to 100');
      }
      let after = 0;
      if (cursor !== null && cursor !== undefined) {
        if (!/^\d+$/.test(cursor)) throw new ValidationError('invalid cursor');
        after = Number(cursor);
      }
      const mine = notes.filter((n) => n.owner === owner && n.id > after);
      const page = mine.slice(0, size);
      const nextCursor = mine.length > size ? String(page[page.length - 1].id) : null;
      return { notes: page, nextCursor };
    },
    create(owner, { title, body = '' }) {
      if (typeof title !== 'string') {
        throw new ValidationError('title must be a string');
      }
      const note = { id: nextId++, owner, title, body, createdAt: new Date().toISOString() };
      notes.push(note);
      return note;
    },
  };
}
