import { askChatbot, getForecast, getRecommendations } from '../services/aiService.js';

export async function forecastController(req, res, next) {
  try {
    const data = await getForecast({ horizonDays: req.query.horizonDays });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function recommendationsController(_req, res, next) {
  try {
    const data = await getRecommendations();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function chatbotController(req, res, next) {
  try {
    const data = await askChatbot({ question: req.body?.question });
    res.json(data);
  } catch (error) {
    next(error);
  }
}
