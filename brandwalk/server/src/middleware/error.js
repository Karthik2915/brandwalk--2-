import { ZodError } from 'zod';
import { env } from '../config/env.js';

export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: err.issues[0]?.message || 'Invalid input',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err?.code === 11000) return res.status(409).json({ message: 'That value is already in use' });
  if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ message: 'Payload too large' });
  if (err?.status && err.status < 500) return res.status(err.status).json({ message: err.message });

  console.error(err); // never leak stack traces to clients
  res.status(500).json({ message: 'Something went wrong', ...(env.isProd ? {} : { detail: err?.message }) });
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
