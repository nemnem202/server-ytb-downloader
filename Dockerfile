# Utiliser une image de base avec Node.js
FROM node:16-slim

# Ajouter les dépôts nécessaires pour installer Python 3.8 ou 3.9
RUN apt-get update -y && \
    apt-get install -y python3.7 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Installer yt-dlp avec pip
RUN pip3 install -U yt-dlp

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port 3300
EXPOSE 3300

# Lancer l'application
CMD ["node", "server.js"]
