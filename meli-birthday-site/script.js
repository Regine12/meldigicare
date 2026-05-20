// --- LOCAL STORAGE HELPERS ---
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch(e) { return fallback } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
}
function escapeHtml(s) { return String(s).replaceAll('&','&').replaceAll('<','<').replaceAll('>','>') }

// --- PLAYLIST & SPOTIFY EMBED ---
const songForm = document.getElementById('song-form');
const playlistList = document.getElementById('playlist-list');

let songs = store.get('meli_songs_final', [
  {title: 'Ta meilleure amie', artist: 'Lorie', url: 'https://open.spotify.com/intl-fr/track/4FL6ttDXeXjgxXLII24wEX?si=4b9bf8b20dd441e9', memory: 'Our anthem!'}
]);

function renderSongs() {
  playlistList.innerHTML = '';
  songs.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = 'song-item list li'; 
    el.style.padding = "12px"; el.style.borderBottom = "1px solid #f0f0f5"; el.style.background = "#fff";
    el.innerHTML = `
      <div class="song-meta">
        <strong>${escapeHtml(s.title || 'Untitled')}</strong> <span class="muted">${escapeHtml(s.artist||'')}</span>
        <div class="song-memory">${escapeHtml(s.memory||'')}</div>
      </div>
      <div class="song-controls">
        <button class="btn danger" onclick="deleteSong(${idx})">Remove</button>
      </div>
    `;
    playlistList.appendChild(el);
  });
  updatePlayerEmbed();
}

window.deleteSong = (idx) => { songs.splice(idx, 1); store.set('meli_songs_final', songs); renderSongs(); };

songForm.addEventListener('submit', e => {
  e.preventDefault();
  songs.push({
    title: document.getElementById('song-title').value,
    artist: document.getElementById('song-artist').value,
    url: document.getElementById('song-url').value,
    memory: document.getElementById('song-memory').value
  });
  store.set('meli_songs_final', songs);
  songForm.reset(); renderSongs();
});

function updatePlayerEmbed() {
  const embed = document.getElementById('player-embed');
  if (!embed) return;
  embed.innerHTML = '';
  
  const validSongs = songs.filter(s => s.url && s.url.includes('spotify.com'));
  if (validSongs.length > 0) {
    const latestSong = validSongs[validSongs.length - 1];
    let embedUrl = latestSong.url;
    
    if (embedUrl.includes('/track/')) {
      embedUrl = embedUrl.replace('/track/', '/embed/track/').split('?')[0];
    }
    
    embed.innerHTML = `<iframe style="border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 15px;" src="${embedUrl}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
  }
}
renderSongs();

// --- MAP OF ADVENTURES ---
const mapCanvas = document.getElementById('map-canvas');
// Centers the map nicely between Germany and North Macedonia
const map = L.map(mapCanvas).setView([46.5, 15.5], 4); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

let pins = store.get('meli_pins_skopje', [
  {lat: 41.9981, lng: 21.4254, title: 'Skopje, North Macedonia', note: 'Where you are shining right now! ✨'},
  {lat: 51.1657, lng: 10.4515, title: 'Germany', note: 'Where I am, sending you all my love'},
  {lat: 52.3702, lng: 4.8952, title: 'Netherlands (Amsterdam)', note: 'Imagine canals and bikes; visit together and get to work in the same company :)'},
  {lat: 56.1304, lng: -106.3468, title: 'Canada', note: 'Dream: someday, in a distant future, living in the same city again'},
  {lat: 39.92077, lng: 32.85411, title: 'Turkey', note: 'Where we celebrated our scholarship acceptance, where the journey abroad began'}
]);

function renderPins() {
  if (window._pinLayer) window._pinLayer.clearLayers();
  window._pinLayer = L.layerGroup().addTo(map);
  const travelList = document.getElementById('travel-list');
  travelList.innerHTML = '';
  
  pins.forEach(p => {
    L.marker([p.lat, p.lng]).addTo(window._pinLayer)
      .bindPopup(`<strong>${escapeHtml(p.title)}</strong><p>${escapeHtml(p.note)}</p>`);
      
    const btn = document.createElement('button');
    btn.className = 'travel-pill';
    btn.textContent = p.title;
    btn.onclick = () => map.setView([p.lat, p.lng], 6, {animate: true});
    travelList.appendChild(btn);
  });
}

map.on('click', e => {
  const title = prompt('Title for this place:');
  if (!title) return;
  const note = prompt('Short note or memory:');
  pins.push({ lat: e.latlng.lat, lng: e.latlng.lng, title, note: note || '' });
  store.set('meli_pins_skopje', pins);
  renderPins();
});

document.getElementById('clear-pins').addEventListener('click', () => { if (confirm('Clear map?')) { pins = []; store.set('meli_pins_skopje', pins); renderPins(); } });
renderPins();

// --- JOKES & QUOTES ---
const jokeForm = document.getElementById('joke-form');
let jokes = store.get('meli_jokes_final', [
  "Knowing I'm the one (or one of, lol) person(s) you're allowed to fart in front of 😂",
  '<blockquote><em>“If you know where you are going to, you\'ll know how to get there”</em></blockquote>'
]);

function renderJokes() {
  const jokeList = document.getElementById('joke-list');
  jokeList.innerHTML = '';
  jokes.forEach((j, i) => {
    // allow basic HTML for a joke if it starts with '<' (eg. <em>...</em>), otherwise escape
    const content = String(j).trim().startsWith('<') ? j : escapeHtml(j);
    jokeList.innerHTML += `<li style="display:flex; justify-content:space-between; align-items:center; background:#fff; margin-bottom:8px;">
      <span style="flex:1;">${content}</span>
      <button class="btn danger" style="padding: 4px 8px; font-size:12px; margin-left:10px;" onclick="delJoke(${i})">X</button>
    </li>`;
  });
}
window.delJoke = (i) => { jokes.splice(i,1); store.set('meli_jokes_final', jokes); renderJokes(); };
jokeForm.addEventListener('submit', e => { e.preventDefault(); const v = document.getElementById('joke-text').value; if (!v) return; jokes.unshift(v); store.set('meli_jokes_final', jokes); jokeForm.reset(); renderJokes(); });
renderJokes();

// --- EXACT IMAGE FILE LOGIC ---
const balloonPics = [
  "Mel with 25 numbers.jpg", "Mel with 25 numbers2.jpg", "Mel with 25 numbers3.jpg",
  "Mel with 25 numbers4.jpg", "Mel with 25 numbers5.jpg", "Mel with 25 numbers6.jpg",
  "Mel with 25 numbers7.jpg", "Mel with 25 numbers8.jpg", "mel_with_25 numbers.jpg"
].map(p => `pictures/${p}`);

const middlePics = [
  "_MG_8744.jpg", "_MG_8774.jpg", "_MG_8843.jpg", "_MG_8863.jpg", "_MG_8874.jpg",
  "_MG_8880.jpg", "_MG_8900.jpg", "_MG_8903.jpg", "_MG_9018.jpg", "_MG_9026.jpg",
  "_MG_9035.jpg", "_MG_9044.jpg", "_MG_9047.jpg", "_MG_9077.jpg"
];
middlePics.sort(() => Math.random() - 0.5);

const carouselPhotos = [
  "pictures/let this be the first.jpg",
  ...middlePics.map(p => `pictures/${p}`),
  "pictures/Last one.png"
];

let photoIndex = 0;

function renderCarousel() {
  const stage = document.getElementById('carousel-stage');
  const thumbs = document.getElementById('thumbnails');
  stage.innerHTML = ''; thumbs.innerHTML = '';
  
  stage.style.backgroundColor = '#111111';
  
  if (!carouselPhotos.length) return;
  
  // Left Image
  const img1 = document.createElement('img');
  img1.src = carouselPhotos[photoIndex];
  img1.style.opacity = 0;
  
  // Right Image (calculates the next photo, looping back to 0 if at the end)
  const nextIndex = (photoIndex + 1) % carouselPhotos.length;
  const img2 = document.createElement('img');
  img2.src = carouselPhotos[nextIndex];
  img2.style.opacity = 0;
  
  stage.appendChild(img1);
  stage.appendChild(img2);
  
  // Fade them both in smoothly
  requestAnimationFrame(() => {
    img1.style.opacity = 1;
    img2.style.opacity = 1;
  });
  
  carouselPhotos.forEach((p, i) => {
    const t = document.createElement('img');
    t.src = p;
    // Highlight the thumbnail if it is either the left OR right image
    if (i === photoIndex || i === nextIndex) t.classList.add('active');
    t.onclick = () => { photoIndex = i; renderCarousel(); };
    thumbs.appendChild(t);
  });
}

function renderBalloons() {
  const container = document.getElementById('balloon-photos');
  container.innerHTML = '';
  balloonPics.forEach((p) => {
    const d = document.createElement('div');
    d.className = 'balloon';
    d.innerHTML = `<img src="${p}" alt="25 Birthday Celebration" style="width:100%; height:100%; object-fit:cover;">`;
    container.appendChild(d);
  });
}

document.getElementById('prev-photo').onclick = () => { photoIndex = (photoIndex - 1 + carouselPhotos.length) % carouselPhotos.length; renderCarousel(); };
document.getElementById('next-photo').onclick = () => { photoIndex = (photoIndex + 1) % carouselPhotos.length; renderCarousel(); };

let autoplay = setInterval(() => document.getElementById('next-photo').click(), 3000);
document.getElementById('toggle-autoplay').onclick = (e) => {
  if (autoplay) { clearInterval(autoplay); autoplay = null; e.target.classList.remove('autoplay-on'); } 
  else { autoplay = setInterval(() => document.getElementById('next-photo').click(), 3000); e.target.classList.add('autoplay-on'); }
};

renderCarousel();
renderBalloons();

// --- COUNTDOWN TIMER ---
function initCountdown() {
  const targetDate = new Date(2026, 4, 21, 0, 0, 0); 
  const elements = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].map(id => document.getElementById(id));
  
  let timer = setInterval(() => {
    let diff = targetDate - new Date();
    if (diff <= 0) { 
      clearInterval(timer); 
      celebrate(); 
      elements.forEach(el => el.textContent = '00');
      return; 
    }
    elements[0].textContent = Math.floor(diff / 86400000);
    elements[1].textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    elements[2].textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    elements[3].textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }, 1000);
}
initCountdown();

// --- LETTER EDITOR WITH THE NEW POEM ---
const defaultLetter = `<h3>Dear Imelda,</h3>
<p>Roses are red, violets are blue,<br>
I am truly blessed to have met someone like you<br>
From the day we met, till forever and always too,<br>
We’ll stay the best of friends, going through the ugly and the good</p>

<p>No matter how crazy life gets, or how much of a mess it can be,<br>
I know I can count on you, and you can always count on me ;) </p>

<p>Today, as you celebrate your 25th birthday,</p> 
<p>I celebrate too, because one of my favorite days is any day I get to see you happy </p>
<p>Living a linked fate, from when we first met until now completing our master's across the world from each other </p>
<p>Despite the distance, you are my constant 🙈 </p>

<p>I wish I could always show in acts how much I love, care, and cherish you </p> 
<p>I love you, Imelda❤️</p>
<p>PS: Cheers to 25 years of you 🥂 <br></p>
<p>With all my love,<br><h3>Regine</h3></p>`;

const letterEditor = document.getElementById('letter-editor');
if (store.get('meli_letter_final')) {
  letterEditor.innerHTML = store.get('meli_letter_final');
} else {
  letterEditor.innerHTML = defaultLetter;
}

document.getElementById('save-letter').onclick = () => { store.set('meli_letter_final', letterEditor.innerHTML); alert('Letter saved locally!'); };
document.getElementById('export-pdf').onclick = () => { html2pdf().set({ margin:0.8, filename:'Letter-for-Meli.pdf' }).from(letterEditor).save(); };

// --- VISUAL EFFECTS ---
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize); resize();
  
  const particles = Array.from({length: 50}).map(() => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: Math.random() * 5 + 1.5, vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 0.5 - 0.2
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(124, 77, 255, 0.15)'; 
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
initParticles();

function celebrate() {
  for (let i = 0; i < 50; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.top = (50 + Math.random() * 50) + 'vh'; 
    c.style.animationDelay = (Math.random() * 800) + 'ms'; 
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

document.querySelectorAll('section.card').forEach((s, idx) => {
  s.style.opacity = 0; s.style.transform = 'translateY(30px)';
  setTimeout(() => {
    s.style.transition = 'opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    s.style.opacity = 1; s.style.transform = 'translateY(0)';
  }, 100 + (150 * idx)); 
});