import { GAME } from "../config/game.js";

export function getLocalPlayer(name = "Anonymous") {
  const id = localStorage.getItem("daisy-player-id") || crypto.randomUUID();
  localStorage.setItem("daisy-player-id", id);
  return { id, name: name.trim() || "Anonymous", authProvider: "local" };
}

export async function startSession(player) {
  return postEvent("session_start", { player });
}

export async function submitScore(payload) {
  return postEvent("score_submit", payload);
}

export async function getLeaderboard() {
  return { ok: false, scores: [] };
}

async function postEvent(type, payload) {
  if (!GAME.api.webhookUrl) return { ok: false, skipped: true };

  try {
    const response = await fetch(GAME.api.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, payload, sentAt: new Date().toISOString() })
    });
    return { ok: response.ok };
  } catch (error) {
    console.warn("[api] network call failed gracefully", error);
    return { ok: false, error };
  }
}
