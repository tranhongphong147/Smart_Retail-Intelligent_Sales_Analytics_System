import { importHistoricalData } from '../services/uploadService.js';

export async function uploadDataController(req, res, next) {
  try {
    const result = await importHistoricalData(req.file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
