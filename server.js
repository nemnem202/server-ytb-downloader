const express = require("express");
const { exec } = require("child_process");
const fetch = require("node-fetch"); // Version 2.x de node-fetch
const { promisify } = require("util");
const cors = require("cors");
const execPromise = promisify(exec);

const app = express();
const port = 3300;

// Autoriser les requêtes CORS
app.use(
  cors({
    origin: ["https://nemnem202.github.io", "http://localhost:3000"], // Ajoutez localhost pour le développement
    methods: "GET",
    allowedHeaders: "Content-Type",
  })
);

exec("yt-dlp --version", (error, stdout, stderr) => {
  if (error) {
    console.error("yt-dlp n'est pas installé:", stderr);
  } else {
    console.log("yt-dlp version:", stdout);
  }
});

app.get("/download", async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const videoUrl = req.query.url;
  console.log("URL de la vidéo reçue:", videoUrl);
  if (!videoUrl) {
    return res.status(400).json({ error: "URL manquante" });
  }

  try {
    // Récupère l'URL de téléchargement direct de la vidéo
    const { stdout } = await execPromise(`yt-dlp -f best -g ${videoUrl}`);
    console.log("URL de téléchargement direct:", stdout.trim());
    const directUrl = stdout.trim();

    // Télécharge la vidéo depuis l'URL directe
    const videoStream = await fetch(directUrl);
    if (!videoStream.ok) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération de la vidéo" });
    }

    const videoBuffer = await videoStream.arrayBuffer();

    // Spécifier l'en-tête pour le téléchargement du fichier
    res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
    res.setHeader("Content-Type", "video/mp4");

    // Envoyer les données du fichier vidéo
    res.end(Buffer.from(videoBuffer));
  } catch (error) {
    console.error("Erreur yt-dlp:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la vidéo" });
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
