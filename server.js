const express = require("express");
const { exec } = require("child_process");
const fetch = require("node-fetch"); // Version 2.x de node-fetch
const { promisify } = require("util");
const cors = require("cors");
const execPromise = promisify(exec);

const app = express();
const port = 3300;

// Autoriser les requêtes CORS
app.use(cors());

// Vérification de la disponibilité de yt-dlp
exec("yt-dlp --version", (error, stdout, stderr) => {
  if (error) {
    console.error("yt-dlp n'est pas installé:", stderr);
  } else {
    console.log("yt-dlp version détectée:", stdout.trim());
  }
});

app.get("/download", async (req, res) => {
  console.log("Requête reçue sur /download avec paramètres:", req.query);

  if (req.method !== "GET") {
    console.warn("Méthode non autorisée utilisée:", req.method);
    return res
      .status(405)
      .json({ error: "Méthode non autorisée. Utilisez GET." });
  }

  const videoUrl = req.query.url;
  if (!videoUrl) {
    console.warn("Requête sans URL de vidéo.");
    return res.status(400).json({ error: "Paramètre 'url' requis." });
  }

  try {
    console.log("Exécution de yt-dlp pour récupérer l'URL de la vidéo...");
    const { stdout } = await execPromise(`yt-dlp -f best -g ${videoUrl}`);
    console.log("yt-dlp output brut:", stdout);
    const directUrl = stdout.trim();
    console.log("URL directe obtenue:", directUrl);

    if (!directUrl) {
      throw new Error("yt-dlp n'a pas retourné d'URL valide.");
    }

    console.log("Téléchargement de la vidéo depuis:", directUrl);
    const videoStream = await fetch(directUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    console.log("Statut HTTP de la requête fetch:", videoStream.status);
    console.log("Headers reçus:", videoStream.headers.raw());

    if (!videoStream.ok) {
      console.error(
        "Échec du téléchargement, statut HTTP:",
        videoStream.status
      );
      return res.status(500).json({
        error: "Impossible de récupérer la vidéo. Vérifiez l'URL et réessayez.",
      });
    }

    const videoBuffer = await videoStream.arrayBuffer();
    console.log("Vidéo téléchargée avec succès, envoi au client...");

    res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
    res.setHeader("Content-Type", "video/mp4");
    res.end(Buffer.from(videoBuffer));
  } catch (error) {
    console.error(
      "Erreur lors de l'exécution de yt-dlp ou du téléchargement:",
      error
    );
    res
      .status(500)
      .json({ error: "Une erreur est survenue. Détails: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
