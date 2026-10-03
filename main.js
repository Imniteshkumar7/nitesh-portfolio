import Lenis from 'lenis';

// Configuration
const TOTAL_FRAMES = 240;
const FRAME_PATH = (index) => `/frames/frame_${String(index).padStart(6, '0')}.png`;

// DOM Elements
const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const ringProgress = document.getElementById('ringProgress');
const loaderPercent = document.getElementById('loaderPercent');
const loaderBarFill = document.getElementById('loaderBarFill');
const loaderSubText = document.getElementById('loaderSubText');

// Project Modal Elements
const projectModal = document.getElementById('projectModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalImg = document.getElementById('modalImg');
const modalNum = document.getElementById('modalNum');
const modalTitle = document.getElementById('modalTitle');
const modalCat = document.getElementById('modalCat');
const modalDesc = document.getElementById('modalDesc');
const modalProblem = document.getElementById('modalProblem');
const modalSolution = document.getElementById('modalSolution');
const modalFeatures = document.getElementById('modalFeatures');
const modalTags = document.getElementById('modalTags');

// State Variables
const images = [];
let loadedCount = 0;
let currentFrameIndex = 0;
let targetFrameIndex = 0;
let fitMode = 'cover';

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1.0,
});

lenis.on('scroll', ({ scroll }) => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) {
    const scrollPct = Math.max(0, Math.min(1, scroll / maxScroll));
    targetFrameIndex = scrollPct * (TOTAL_FRAMES - 1);
  }
});

function updateLenis(time) {
  lenis.raf(time);
  requestAnimationFrame(updateLenis);
}
requestAnimationFrame(updateLenis);

// Resize Canvas
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  renderFrame(Math.round(currentFrameIndex));
}
window.addEventListener('resize', resizeCanvas);

// Render Frame onto Canvas
function renderFrame(index) {
  let frameImg = images[index];

  // Fallback to nearest loaded frame if current frame is still downloading
  if (!frameImg || !frameImg.complete) {
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = images[index - offset];
      if (prev && prev.complete) { frameImg = prev; break; }
      const next = images[index + offset];
      if (next && next.complete) { frameImg = next; break; }
    }
  }

  if (!frameImg || !frameImg.complete) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);

  const imgWidth = frameImg.width;
  const imgHeight = frameImg.height;
  const imgAspect = imgWidth / imgHeight;
  const canvasAspect = width / height;

  let drawWidth, drawHeight, drawX, drawY;

  if (fitMode === 'cover') {
    if (canvasAspect > imgAspect) {
      drawWidth = width;
      drawHeight = width / imgAspect;
    } else {
      drawHeight = height;
      drawWidth = height * imgAspect;
    }
  } else {
    if (canvasAspect > imgAspect) {
      drawHeight = height;
      drawWidth = height * imgAspect;
    } else {
      drawWidth = width;
      drawHeight = width / imgAspect;
    }
  }

  drawX = (width - drawWidth) / 2;
  drawY = (height - drawHeight) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(frameImg, drawX, drawY, drawWidth, drawHeight);
}

// Animation & LERP Physics Loop
function animationLoop() {
  const lerpFactor = 0.15;
  const diff = targetFrameIndex - currentFrameIndex;

  if (Math.abs(diff) > 0.001) {
    currentFrameIndex += diff * lerpFactor;
    renderFrame(Math.round(currentFrameIndex));
  }

  requestAnimationFrame(animationLoop);
}

let preloaderDismissed = false;

function dismissPreloader() {
  if (preloaderDismissed) return;
  preloaderDismissed = true;
  if (loader) loader.classList.add('fade-out');
  resizeCanvas();
  requestAnimationFrame(animationLoop);
}

// Preload Images
function preloadImages() {
  const circleLength = 276.46;
  let currentPercent = 0;

  // Smooth interval that guarantees percentage counts continuously to 100%
  const progressInterval = setInterval(() => {
    // Target percentage based on actual loaded frames (minimum steady progress over time)
    const rawLoadedPct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
    
    // Allow progress to steadily advance towards 100%
    if (currentPercent < 100) {
      // Step size calculation: advance steadily, speed up as frames arrive
      const targetPct = Math.max(rawLoadedPct, currentPercent + 2);
      const step = Math.max(1, Math.ceil((targetPct - currentPercent) * 0.3));
      currentPercent = Math.min(100, currentPercent + step);

      const offset = circleLength * (1 - (currentPercent / 100));
      if (ringProgress) ringProgress.style.strokeDashoffset = offset;
      if (loaderPercent) loaderPercent.textContent = `${currentPercent}%`;
      if (loaderBarFill) loaderBarFill.style.width = `${currentPercent}%`;
    }

    // Once 100% is reached, stop interval and dismiss preloader smoothly
    if (currentPercent >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        dismissPreloader();
      }, 250);
    }
  }, 35);

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = FRAME_PATH(i);
    
    img.onload = () => {
      loadedCount++;
    };

    img.onerror = () => {
      loadedCount++;
    };

    images.push(img);
  }
}

// Factual Real Projects Case Study Data
const projectData = {
  dhansarthi: {
    num: '01',
    title: 'DHANSARTHI',
    category: 'AI-POWERED FINANCIAL ADVISORY APPLICATION',
    img: '/assets/project_dhansarthi.jpg',
    overview: 'DhanSarthi is an AI-powered financial advisory application designed to help users understand their income, expenses, loans, financial goals and risk profile, and receive personalized financial guidance.',
    problem: 'Users struggle to manage complex finances, track loans, understand risk profiles, and get intelligent, real-time personalized financial advice.',
    solution: 'A clean fintech web application powered by RAG architecture and LLM APIs to provide context-aware financial document analysis, savings planning, and automated advisory.',
    features: [
      'Personalized Financial Advisor',
      'Financial Document Analysis',
      'RAG-based AI Responses',
      'Budget & Expense Analysis',
      'Savings Goal Planning',
      'Risk-aware Recommendations'
    ],
    tags: ['React.js', 'FastAPI', 'PostgreSQL', 'FAISS', 'MiniLM', 'RAG', 'LLM API']
  },
  eventportal: {
    num: '02',
    title: 'STUDENT EVENT PORTAL',
    category: 'FULL STACK WEB APPLICATION',
    img: '/assets/project_event_portal.jpg',
    overview: 'A student event management platform with user login, event listing, debounced search, event details, and event creation.',
    problem: 'Students need a simple, centralized way to discover, search, and manage campus events and activities.',
    solution: 'A React.js + Node.js + Express.js application providing search filtering, event detail views, and event creation functionality.',
    features: [
      'User login and account management',
      'Event listing and category browsing',
      'Debounced search for instant filtering',
      'Detailed event view pages with React Router',
      'Event creation form connected to Express API',
      'Responsive React frontend with Axios HTTP requests'
    ],
    tags: ['React.js', 'Node.js', 'Express.js', 'Axios', 'React Router']
  },
  upcoming: {
    num: '03',
    title: 'IN DEVELOPMENT',
    category: 'REAL-WORLD APPLICATIONS',
    img: '/assets/laptop_workspace.jpg',
    overview: 'Currently developing new full-stack web applications featuring PostgreSQL databases, RESTful API integrations, and modern React interfaces.',
    problem: 'Continuous learning requires building practical digital products that solve real-world problems.',
    solution: 'Actively building software projects to deepen full-stack development and Data Structures & Algorithms proficiency.',
    features: [
      'Full Stack MERN & PostgreSQL architecture',
      'RESTful API design and backend routing',
      'Clean state management and component structure',
      'Optimized performance and UI responsiveness'
    ],
    tags: ['React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'C++', 'DSA']
  }
};

// Modal Trigger
document.querySelectorAll('.project-card').forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.getAttribute('data-project');
    const data = projectData[key];
    if (data && projectModal) {
      modalImg.src = data.img;
      modalNum.textContent = data.num;
      modalTitle.textContent = data.title;
      modalCat.textContent = data.category;
      modalDesc.textContent = data.overview;
      modalProblem.textContent = data.problem;
      modalSolution.textContent = data.solution;
      
      modalFeatures.innerHTML = data.features.map((f) => `<li><span class="check-mark">✓</span> ${f}</li>`).join('');
      modalTags.innerHTML = data.tags.map((t) => `<span class="skill-pill">${t}</span>`).join('');
      
      projectModal.classList.add('active');
    }
  });
});

function closeModal() {
  if (projectModal) projectModal.classList.remove('active');
}
if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

// Back To Top Button
const btnBackToTop = document.getElementById('btnBackToTop');
if (btnBackToTop) {
  btnBackToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Hero Resume Button Prompt
const btnHeroResume = document.getElementById('btnHeroResume');
if (btnHeroResume) {
  btnHeroResume.addEventListener('click', (e) => {
    const href = btnHeroResume.getAttribute('href');
    if (href === '[YOUR RESUME LINK]' || href.includes('YOUR RESUME')) {
      e.preventDefault();
      alert('To link your resume, update href="[YOUR RESUME LINK]" in index.html with your Google Drive or PDF link.');
    }
  });
}

// Newsletter Form Handler
const newsletterForm = document.getElementById('newsletterForm');
const newsletterSuccess = document.getElementById('newsletterSuccess');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput && emailInput.value) {
      if (newsletterSuccess) newsletterSuccess.classList.remove('hidden');
      emailInput.value = '';
      setTimeout(() => {
        if (newsletterSuccess) newsletterSuccess.classList.add('hidden');
      }, 5000);
    }
  });
}

// Smooth Anchor Navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Mobile Navigation Toggle
const btnMobileNav = document.getElementById('btnMobileNav');
const navMenu = document.getElementById('navMenu');

if (btnMobileNav && navMenu) {
  btnMobileNav.addEventListener('click', () => {
    btnMobileNav.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      btnMobileNav.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
}

// Start App
preloadImages();
