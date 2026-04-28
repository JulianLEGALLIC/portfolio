#!/usr/bin/env node

/**
 * Script RSS basé sur Google Alerts (flux RSS)
 * Installation: npm install axios
 * Usage: node generate-rss.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ==========================
// 🔧 CONFIG : Google Alerts RSS
// Ajoute ici toutes tes URLs
// ==========================
const GOOGLE_ALERTS = {
  nvidia: {
    fileName: 'feed-nvidia.xml',
    title: 'NVIDIA Veille Technologique',
    category: 'NVIDIA',
    description: 'Actualités NVIDIA via Google Alerts',
    urls: [

      'https://www.google.fr/alerts/feeds/15955729447839907319/10025015555276546206',
      'https://www.google.fr/alerts/feeds/15955729447839907319/17571464887161054714',
      'https://www.google.fr/alerts/feeds/15955729447839907319/14237373615953816840',
      'https://www.google.fr/alerts/feeds/15955729447839907319/5930211667150726528',
      'https://www.google.fr/alerts/feeds/15955729447839907319/519687823423872395',
      'https://www.google.fr/alerts/feeds/15955729447839907319/2797858628840067913',
      'https://www.google.fr/alerts/feeds/15955729447839907319/4288683417305133022',
      'https://www.google.fr/alerts/feeds/15955729447839907319/10025015555276547675',
      'https://www.google.fr/alerts/feeds/15955729447839907319/17099266174249803966'
    ]
  },
  amd: {
    fileName: 'feed-amd.xml',
    title: 'AMD Veille Technologique',
    category: 'AMD',
    description: 'Actualités AMD via Google Alerts',
    urls: [
      'https://www.google.fr/alerts/feeds/15955729447839907319/17931349496702565194',
      'https://www.google.fr/alerts/feeds/15955729447839907319/8800012594127565664'
    ]
  },
  intel: {
    fileName: 'feed-intel.xml',
    title: 'Intel Veille Technologique',
    category: 'Intel',
    description: 'Actualités Intel via Google Alerts',
    urls: [
      'https://www.google.com/alerts/feeds/AAAAAAAAAAAA'
    ]
  }
};

async function fetchRSS(url) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.warn(`⚠️ Erreur RSS: ${url} -> ${err.message}`);
    return null;
  }
}

function extractItems(xml) {
  if (!xml) return [];

  const items = [];
  const blocks = xml.split('<item>');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('</item>')[0];

    const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
    const desc = (block.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';

    items.push({ title, link, description: desc, pubDate });
  }

  return items;
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

function generateItem(item) {
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description).substring(0, 500)}</description>
      <pubDate>${item.pubDate}</pubDate>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ''}
    </item>`;
}

function generateRSS(items, title, description, category) {
  const now = new Date().toUTCString();

  const content = items
    .slice(0, 15)
    .map(generateItem)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://example.com</link>
    <description>${escapeXml(description)}</description>
    ${category ? `<category>${escapeXml(category)}</category>` : ''}
    <lastBuildDate>${now}</lastBuildDate>
${content}
  </channel>
</rss>`;
}

async function main() {
  console.log('🚀 Génération RSS depuis Google Alerts...\n');

  for (const [key, config] of Object.entries(GOOGLE_ALERTS)) {
    console.log(`📡 ${config.title}`);

    let allItems = [];

    for (const url of config.urls) {
      const xml = await fetchRSS(url);
      const items = extractItems(xml);
      allItems = allItems.concat(items);
    }

    // Déduplication
    const unique = Array.from(
      new Map(allItems.map(i => [i.link, i])).values()
    );

    const itemsWithCategory = unique.map(item => ({ ...item, category: config.category }));
    const rss = generateRSS(itemsWithCategory, config.title, config.description, config.category);
    const filePath = path.join(__dirname, config.fileName);

    fs.writeFileSync(filePath, rss);

    console.log(`   ✅ ${config.fileName} (${unique.length} items)`);
  }

  console.log('\n✨ Terminé');
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
