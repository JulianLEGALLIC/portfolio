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




