// Menu mobile toggle
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

function toggleNav(){
  const isOpen = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

if(navToggle && primaryNav){
  navToggle.addEventListener('click', toggleNav);
  // Close menu when a nav link is clicked (mobile)
  primaryNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    if(primaryNav.classList.contains('open')) toggleNav();
  }));
}

// Insert current year in footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = new Date().getFullYear();
const yearCv = document.getElementById('year-cv');
if(yearCv) yearCv.textContent = new Date().getFullYear();

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
  anchor.addEventListener('click', function(e){
    const target = document.querySelector(this.getAttribute('href'));
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
});

// Expand/collapse project cards when the button is clicked
document.querySelectorAll('button.card-link').forEach(btn => {
  btn.addEventListener('click', () => {
    const details = btn.nextElementSibling;
    if(!details || !details.classList.contains('card-details')) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    if(expanded){
      details.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'En savoir plus';
    } else {
      details.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Voir moins';
    }
  });
});

// RSS feed loader (fetch + display items)
const rssState = new WeakMap();

function formatDate(dateString){
  try{
    const dt = new Date(dateString);
    if(isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('fr-FR', {year:'numeric',month:'short',day:'numeric'});
  }catch(e){
    return '';
  }
}

function createItemElement(title, link, date, source){
  const li = document.createElement('li');
  li.className = 'rss-entry';
  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = title || link;
  li.appendChild(a);
  const meta = document.createElement('div');
  meta.style.fontSize = '0.85rem';
  meta.style.color = 'var(--muted)';
  meta.style.marginTop = '0.25rem';
  meta.textContent = `${formatDate(date)} — ${source}`.trim();
  li.appendChild(meta);
  return li;
}

async function fetchRSS(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);
    return items.map(item => ({
      title: item.querySelector('title')?.textContent?.trim() || '',
      link: item.querySelector('link')?.textContent?.trim() || item.querySelector('link')?.getAttribute('href') || url,
      date: item.querySelector('pubDate')?.textContent?.trim() || '',
    }));
  }catch(err){
    console.warn('RSS fetch error', url, err);
    throw err;
  }
}

async function loadRSSFeeds(){
  document.querySelectorAll('.rss-feed').forEach(async feed => {
    const url = feed.dataset.feedUrl;
    const entriesContainer = feed.querySelector('.rss-entries');
    const sourceLink = feed.querySelector('.rss-source a')?.href || url;
    if(!url || !entriesContainer) return;

    const state = rssState.get(feed) || {seen: new Set()};
    rssState.set(feed, state);

    const setLoading = (text) => {
      entriesContainer.innerHTML = `<p class="rss-loading">${text}</p>`;
    };

    setLoading('Chargement des dernières actualités…');

    try{
      const items = await fetchRSS(url);
      if(items.length === 0){
        setLoading('Aucun article trouvé.');
        return;
      }

      entriesContainer.innerHTML = '';
      items.forEach(item => {
        if(state.seen.has(item.link)) return;
        state.seen.add(item.link);
        entriesContainer.appendChild(createItemElement(item.title, item.link, item.date, sourceLink));
      });
    }catch(err){
      setLoading('Impossible de charger le flux (CORS possible).');
    }
  });
}

// Initial RSS load + refresh every 5 minutes
window.addEventListener('load', () => {
  loadRSSFeeds();
  setInterval(loadRSSFeeds, 1000 * 60 * 5);
});

function setupImageLightbox(){
  const overlay = document.createElement('div');
  overlay.id = 'lightboxOverlay';
  const img = document.createElement('img');
  let currentScale = 1;
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  let lastTranslateX = 0;
  let lastTranslateY = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  overlay.appendChild(img);
  overlay.addEventListener('click', event => {
    if (event.target !== overlay) return;
    overlay.classList.remove('active');
    currentScale = 1;
    currentTranslateX = 0;
    currentTranslateY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    img.style.transform = 'scale(1) translate(0px, 0px)';
    overlay.classList.remove('grabbing');
  });
  overlay.addEventListener('wheel', e => {
    if(!overlay.classList.contains('active')) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    currentScale = Math.min(3, Math.max(1, currentScale + delta));
    img.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    img.style.cursor = currentScale > 1 ? 'zoom-out' : 'zoom-in';
  }, {passive: false});
  
  const updateLightboxTransform = () => {
    img.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
  };

  img.addEventListener('pointerdown', e => {
    if(currentScale <= 1) return;
    e.preventDefault();
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    overlay.classList.add('grabbing');
    img.setPointerCapture(e.pointerId);
  });

  img.addEventListener('dragstart', e => e.preventDefault());

  img.addEventListener('pointermove', e => {
    if(!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    currentTranslateX = lastTranslateX + dx / currentScale;
    currentTranslateY = lastTranslateY + dy / currentScale;
    updateLightboxTransform();
  });

  const finishPan = () => {
    if(!isPanning) return;
    isPanning = false;
    lastTranslateX = currentTranslateX;
    lastTranslateY = currentTranslateY;
    overlay.classList.remove('grabbing');
  };

  img.addEventListener('pointerup', finishPan);
  img.addEventListener('pointercancel', finishPan);
  document.body.appendChild(overlay);

  const targets = document.querySelectorAll('.preuve-image img, .preuve-gallery img');
  targets.forEach(element => {
    element.style.cursor = 'zoom-in';
    element.addEventListener('click', () => {
      const src = element.dataset.full || element.src;
      const preloader = new Image();
      preloader.onload = () => {
        img.src = src;
        img.alt = element.alt || '';
        overlay.classList.add('active');
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
        updateLightboxTransform();
        img.style.cursor = 'zoom-in';
      };
      preloader.src = src;
    });
  });
}

window.addEventListener('load', setupImageLightbox);


/* ASCII background that follows the cursor */
const asciiCanvas = document.getElementById('asciiCanvas');
if(asciiCanvas){
  const ctx = asciiCanvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  function resizeCanvas(){
    dpr = window.devicePixelRatio || 1;
    asciiCanvas.width = Math.floor(window.innerWidth * dpr);
    asciiCanvas.height = Math.floor(window.innerHeight * dpr);
    asciiCanvas.style.width = window.innerWidth + 'px';
    asciiCanvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // command list for linux, windows, cisco
  const commands = [
    'ls', 'cd /var/www', 'sudo apt update', 'chmod +x script.sh',
    'ifconfig', 'ip addr show', 'grep -i error', 'tail -f /var/log/syslog',
    'ps aux', 'mkdir new_folder', 'rm -rf /tmp/*',
    'dir', 'ipconfig /all', 'netstat -an', 'ping 8.8.8.8', 'tracert example.com',
    'tasklist', 'cls',
    'show ip route', 'show interfaces', 'configure terminal', 'enable',
    'interface GigabitEthernet0/1', 'no shutdown', 'write memory',
    'reload', 'copy running-config startup-config'
  ];

  let mouse = {x:-1000, y:-1000};
  const chars = ['@','#','$','%','&','*','+','=','-','.','/','?','~'];
  const particles = [];

  function spawn(x,y){
    particles.push({
      x: x,
      y: y,
      vx: (Math.random()-0.5) * 0.6,
      vy: - (1 + Math.random() * 1.2),
      life: 60 + Math.floor(Math.random()*40),
      char: chars[Math.floor(Math.random()*chars.length)],
      size: 10 + Math.random()*10
    });
  }

  window.addEventListener('mousemove', e => spawn(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => { if(e.touches && e.touches[0]) spawn(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});

  function animate(){
    ctx.clearRect(0,0,asciiCanvas.width/dpr, asciiCanvas.height/dpr);
    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity-like slow down
      p.life--;
      const alpha = Math.max(0, p.life / 100);
      ctx.globalAlpha = alpha * 0.95;
      ctx.fillStyle = 'rgba(150,160,190,0.95)';
      ctx.font = `${p.size}px monospace`;
      ctx.fillText(p.char, p.x, p.y);
      if(p.life <= 0) particles.splice(i,1);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}




