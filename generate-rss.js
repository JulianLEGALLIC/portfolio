#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Récupération de la clé API via argument ou variable d'environnement
const API_KEY = process.argv[2] || process.env.NEWSAPI_KEY;

if (!API_KEY) {
  console.error('❌ Erreur: clé NewsAPI manquante. Ajoutez NEWSAPI_KEY dans vos secrets GitHub.');
  process.exit(1);
}

const feeds = {
  nvidia: {
    fileName: 'feed-nvidia.xml',
    keywords: ['NVIDIA RTX', 'NVIDIA GPU', 'NVIDIA AI'],
    title: 'NVIDIA Veille Technologique',
    description: 'Actualités cartes graphiques et IA NVIDIA'
  },
  amd: {
    fileName: 'feed-amd.xml',
    keywords: ['AMD Radeon', 'AMD Ryzen', 'AMD GPU'],
    title: 'AMD Veille Technologique',
    description: 'Actualités processeurs et graphismes AMD'
  },
  intel: {
    fileName: 'feed-intel.xml',
    keywords: ['Intel Arc', 'Intel GPU', 'Intel Core Ultra'],
    title: 'Intel Veille Technologique',
    description: 'Actualités cartes graphiques et CPU Intel'
  }
};

/**
 * Nettoie le texte pour le format XML
 */
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Récupère les articles depuis NewsAPI
 */
async function fetchArticles(keyword) {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: keyword,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 15, // On en prend un peu plus pour filtrer après
        apiKey: API_KEY
      },
      timeout: 10000 // Sécurité : 10 secondes max
    });

    if (response.data && response.data.articles) {
      // On filtre les articles supprimés par NewsAPI
      return response.data.articles.filter(a => a.title && a.title !== '[Removed]');
    }
    return [];
  } catch (error) {
    console.warn(`⚠️  Erreur NewsAPI pour "${keyword}":`, error.response?.data?.message || error.message);
    return [];
  }
}

function generateRSSItem(article) {
  const title = escapeXml(article.title);
  // Nettoyage sommaire pour éviter de couper au milieu d'une balise
  const rawDescription = article.description || article.content || 'No description available';
  const description = escapeXml(rawDescription.substring(0, 400) + '...');
  const link = article.url;
  const pubDate = new Date(article.publishedAt).toUTCString();
  const source = article.source?.name || 'Unknown Source';

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <author>${escapeXml(source)}</author>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
}

function generateRSS(articles, title, description) {
  const now = new Date().toUTCString();
  const items = articles
    .slice(0, 15) // On garde les 15 meilleurs
    .map(generateRSSItem)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://julianlegallic.github.io/portfolio/</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

async function main() {
  console.log('🚀 Démarrage de la génération des flux RSS...');

  for (const [key, config] of Object.entries(feeds)) {
    console.log(`\n📡 Recherche pour : ${config.title}`);
    let allArticles = [];

    for (const keyword of config.keywords) {
      const articles = await fetchArticles(keyword);
      allArticles = allArticles.concat(articles);
      // Petit délai pour respecter les limites de l'API gratuite
      await new Promise(r => setTimeout(r, 1000));
    }

    // Déduplication par URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.url, a])).values()
    ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const rssContent = generateRSS(uniqueArticles, config.title, config.description);
    const filePath = path.join(process.cwd(), config.fileName);
    
    fs.writeFileSync(filePath, rssContent);
    console.log(`   ✅ Fichier créé : ${config.fileName} (${uniqueArticles.length} articles)`);
  }

  console.log('\n✨ Terminé !');
}

main().catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});