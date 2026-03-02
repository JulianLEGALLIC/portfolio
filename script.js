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
  let prevCell = {c:-1, r:-1};
  let commandsGrid = [];

  function fillGrid(){
    const cols = Math.floor((asciiCanvas.width/dpr) / 80);
    const rows = Math.floor((asciiCanvas.height/dpr) / 30);
    commandsGrid = [];
    for(let r=0;r<rows;r++){
      commandsGrid[r] = [];
      for(let c=0;c<cols;c++){
        commandsGrid[r][c] = commands[Math.floor(Math.random()*commands.length)];
      }
    }
  }

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    const cell = {c: Math.floor(mouse.x/80), r: Math.floor(mouse.y/30)};
    if(cell.c !== prevCell.c || cell.r !== prevCell.r){
      prevCell = cell;
      fillGrid();
    }
  });
  window.addEventListener('touchmove', e => {
    if(e.touches && e.touches[0]){
      mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY;
      const cell = {c: Math.floor(mouse.x/80), r: Math.floor(mouse.y/30)};
      if(cell.c !== prevCell.c || cell.r !== prevCell.r){
        prevCell = cell;
        fillGrid();
      }
    }
  }, {passive:true});

  function animate(){
    ctx.clearRect(0,0,asciiCanvas.width/dpr, asciiCanvas.height/dpr);
    const cols = Math.floor((asciiCanvas.width/dpr) / 80);
    const rows = Math.floor((asciiCanvas.height/dpr) / 30);
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const x = c * 80 + 10;
        const y = r * 30 + 20;
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        if(Math.hypot(dx,dy) < 80) continue;
        const cmd = (commandsGrid[r] && commandsGrid[r][c]) || '';
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = 'rgba(150,160,190,0.6)';
        ctx.font = '14px monospace';
        ctx.fillText(cmd, x, y);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  fillGrid();
  animate();
}




