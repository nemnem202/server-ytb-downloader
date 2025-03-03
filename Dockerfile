# Utiliser une image officielle de Node.js comme base
FROM node:16

# Installer yt-dlp
RUN apt-get update && apt-get install -y yt-dlp

# Créer un dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances de Node.js
RUN npm install

# Exposer le port sur lequel ton serveur Node.js fonctionne
EXPOSE 3300

# Démarrer ton application avec npm
CMD ["npm", "start"]
