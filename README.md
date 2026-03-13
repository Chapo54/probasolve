# 🎲 ProbaSolve

Résolveur d'exercices de probabilités avec formules LaTeX et explications détaillées.

---

## 🚀 Déploiement en 5 étapes

### 1. Mettre le projet sur GitHub

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit"

# Sur github.com → New repository → nommer "probasolve"
# Copier l'URL du dépôt, puis :
git remote add origin https://github.com/VOTRE_USERNAME/probasolve.git
git push -u origin main
```

### 2. Connecter à Vercel

1. Aller sur [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Cliquer **Add New Project**
3. Importer le dépôt `probasolve`
4. Vite est détecté automatiquement → cliquer **Deploy**

### 3. Obtenir une clé API Anthropic

1. Aller sur [console.anthropic.com](https://console.anthropic.com)
2. **API Keys** → **Create Key**
3. Copier la clé (commence par `sk-ant-...`)

### 4. Configurer la clé API sur Vercel

1. Dans votre projet Vercel → **Settings** → **Environment Variables**
2. Ajouter :
   - **Name** : `ANTHROPIC_API_KEY`
   - **Value** : votre clé `sk-ant-...`
3. Cliquer **Save**
4. Aller dans **Deployments** → **Redeploy**

### 5. ✅ Votre site est en ligne !

Vercel vous donne une URL du type :  
`https://probasolve-votreusername.vercel.app`

---

## 🔍 Référencer sur Google

1. Aller sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajouter votre URL Vercel comme propriété
3. Soumettre le sitemap : `votre-url/sitemap.xml`
4. Google indexe en 1 à 4 semaines

---

## 💻 Développement local

```bash
npm install
# Créer un fichier .env avec :
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```
