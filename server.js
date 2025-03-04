const express = require("express");
const { exec } = require("child_process");
const fetch = require("node-fetch"); // Version 2.x
const { promisify } = require("util");
const cors = require("cors");

const execPromise = promisify(exec);
const app = express();
const port = 3300;

app.use(cors());

exec("yt-dlp --version", (error, stdout, stderr) => {
  if (error) {
    console.error("yt-dlp non installé:", stderr);
  } else {
    console.log("yt-dlp version détectée:", stdout.trim());
  }
});

app.get("/download", async (req, res) => {
  console.log("Requête reçue avec paramètres:", req.query);

  if (!req.query.url) {
    return res.status(400).json({ error: "Paramètre 'url' requis." });
  }

  const videoUrl = req.query.url;

  try {
    console.log("Exécution de yt-dlp...");
    const { stdout } = await execPromise(
      `yt-dlp -f best -g --cookies cookies.txt ${videoUrl}`
    );
    const directUrl = stdout.trim();
    console.log("URL directe obtenue:", directUrl);

    if (!directUrl || !directUrl.startsWith("http")) {
      throw new Error("yt-dlp n'a pas retourné d'URL valide.");
    }

    console.log("Téléchargement de la vidéo...");
    const videoStream = await fetch(directUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        Referer: "https://www.youtube.com/",
        Cookie: "CONSENT=PENDING+999;",
      },
    });

    console.log("Statut HTTP:", videoStream.status);

    if (!videoStream.ok) {
      throw new Error(`Erreur HTTP ${videoStream.status}`);
    }

    res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
    res.setHeader("Content-Type", "video/mp4");

    videoStream.body.pipe(res);
  } catch (error) {
    console.error("Erreur:", error);
    res
      .status(500)
      .json({ error: "Échec du téléchargement: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
