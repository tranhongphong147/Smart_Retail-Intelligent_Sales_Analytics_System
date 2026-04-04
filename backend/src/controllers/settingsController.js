import { getSettingsOverview, saveSettingsSection } from '../services/settingsService.js';

export async function settingsOverviewController(_req, res, next) {
  try {
    const data = await getSettingsOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function settingsSaveProfileController(req, res, next) {
  try {
    const result = await saveSettingsSection('profile', req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function settingsSaveBusinessController(req, res, next) {
  try {
    const result = await saveSettingsSection('business', req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function settingsSaveNotificationsController(req, res, next) {
  try {
    const result = await saveSettingsSection('notifications', req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function settingsSaveAiController(req, res, next) {
  try {
    const result = await saveSettingsSection('ai', req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function settingsSaveSecurityController(req, res, next) {
  try {
    const result = await saveSettingsSection('security', req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
