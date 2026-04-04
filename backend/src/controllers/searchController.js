import { searchGlobal } from '../services/searchService.js';

export async function searchGlobalController(req, res, next) {
  try {
    const data = await searchGlobal({
      q: req.query.q,
      limit: req.query.limit
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
}
