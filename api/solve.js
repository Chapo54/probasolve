// api/solve.js — Vercel Serverless Function
// La clé API Anthropic reste côté serveur, jamais exposée au navigateur

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { type, exercise, system } = req.body;

  if (!exercise) {
    return res.status(400).json({ error: "Exercice manquant" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: system,
        messages: [
          {
            role: "user",
            content: `Type : ${type}\n\nExercice :\n${exercise}\n\nRésous complètement avec toutes les étapes et formules en LaTeX.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || "Erreur API Anthropic" });
    }

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text;

    if (!text) {
      return res.status(500).json({ error: "Réponse vide de l'API" });
    }

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
