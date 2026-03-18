#!/usr/bin/env node

/**
 * Script pour générer les flux RSS en cherchant des articles avec NewsAPI
 * Installation: npm install axios
 * Usage: node generate-rss.js <YOUR_NEWSAPI_KEY>
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = process.argv[2] || process.env.NEWSAPI_KEY;
if (!API_KEY) {
  console.error('❌ Erreur: clé NewsAPI manquante');
  console.error('Usage: node generate-rss.js YOUR_NEWSAPI_KEY');
  console.error('   ou: NEWSAPI_KEY=... node generate-rss.js');
  process.exit(1);
}

const feeds = {
  nvidia: {
    fileName: 'feed-nvidia.xml',
    keywords: ['NVIDIA RTX', 'NVIDIA GPU', 'NVIDIA graphics'],
    title: 'NVIDIA Veille Technologique',
    description: 'Actualités cartes graphiques NVIDIA'
  },
  amd: {
    fileName: 'feed-amd.xml',
    keywords: ['AMD Radeon', 'AMD graphics', 'AMD GPU'],
    title: 'AMD Veille Technologique',
    description: 'Actualités cartes graphiques AMD'
  },
  intel: {
    fileName: 'feed-intel.xml',
    keywords: ['Intel Arc', 'Intel GPU', 'Intel graphics'],
    title: 'Intel Veille Technologique',
    description: 'Actualités cartes graphiques Intel'
  }
};

async function fetchArticles(keyword) {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: keyword,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 10,
        apiKey: API_KEY
      }
    });
    return response.data.articles || [];
  } catch (error) {
    console.warn(`⚠️  Erreur pour "${keyword}":`, error.message);
    return [];
  }
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSSItem(article) {
  const title = escapeXml(article.title);
  const description = escapeXml((article.description || article.content || '').substring(0, 500));
  const link = article.url;
  const pubDate = new Date(article.publishedAt).toUTCString();
  const source = article.source.name;

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <author>${escapeXml(source)}</author>
      <pubDate>${pubDate}</pubDate>
      <source url="${link}">${escapeXml(source)}</source>
    </item>`;
}

function generateRSS(articles, title, description) {
  const now = new Date().toUTCString();
  const items = articles
    .slice(0, 10)
    .map(generateRSSItem)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://julianlegallic.github.io/veille%20techno.html</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

async function main() {
  console.log('🚀 Génération des flux RSS...\n');

  for (const [key, config] of Object.entries(feeds)) {
    console.log(`📡 ${config.title}...`);
    const allArticles = [];

    for (const keyword of config.keywords) {
      const articles = await fetchArticles(keyword);
      allArticles.push(...articles);
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    }

    // Déduplique par URL
    const unique = Array.from(
      new Map(allArticles.map(a => [a.url, a])).values()
    );

    const rss = generateRSS(unique, config.title, config.description);
    const filePath = path.join(__dirname, config.fileName);
    fs.writeFileSync(filePath, rss);
    console.log(`   ✅ ${config.fileName} (${unique.length} articles)\n`);
  }

  console.log('✨ Génération terminée ! Les fichiers RSS sont prêts.');
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
