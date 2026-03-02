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


















