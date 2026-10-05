import { ValidationError } from './errors.js';

export function createNoteStore() {
  const notes = [];
  let nextId = 1;

  return {
    list(owner) {
      return notes.filter((n) => n.owner === owner);
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
