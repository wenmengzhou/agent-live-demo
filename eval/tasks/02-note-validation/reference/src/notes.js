import { ValidationError } from './errors.js';

const MAX_TITLE = 200;

export function createNoteStore() {
  const notes = [];
  let nextId = 1;

  return {
    list(owner) {
      return notes.filter((n) => n.owner === owner);
    },
    create(owner, { title, body = '' }) {
      const trimmed = typeof title === 'string' ? title.trim() : '';
      if (!trimmed) throw new ValidationError('title is required');
      if (trimmed.length > MAX_TITLE) {
        throw new ValidationError(`title must be at most ${MAX_TITLE} characters`);
      }
      const note = { id: nextId++, owner, title: trimmed, body, createdAt: new Date().toISOString() };
      notes.push(note);
      return note;
    },
  };
}
