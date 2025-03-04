# Utiliser une image de base avec Node.js
FROM node:16-slim

# Installer Python 3.9 et pip
RUN apt-get update -y && \
    apt-get install -y python3.9 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Définir Python 3.9 comme version par défaut
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

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
