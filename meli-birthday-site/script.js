// Simple local storage helpers
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch(e) { return fallback } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
}

// Playlist
const songForm = document.getElementById('song-form')
const songTitle = document.getElementById('song-title')
const songArtist = document.getElementById('song-artist')
const songUrl = document.getElementById('song-url')
const songMemory = document.getElementById('song-memory')
const playlistList = document.getElementById('playlist-list')
let songs = store.get('meli_songs', [])

function renderSongs() {
  playlistList.innerHTML = ''
  if (!songs.length) { playlistList.innerHTML = '<p class="muted">No songs yet — add a few memories.</p>'; return }
  songs.forEach((s, idx) => {
    const el = document.createElement('div')
    el.className = 'song-item'
    const spotifyLink = (s.url && s.url.includes('open.spotify.com')) ? `<a class="btn" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">Open</a>` : ''
    el.innerHTML = `
      <div class="song-meta">
        <strong>${escapeHtml(s.title || 'Untitled')}</strong> <span class="muted">${escapeHtml(s.artist||'')}</span>
        <div class="song-memory">${escapeHtml(s.memory||'')}</div>
        ${s.url && !s.url.includes('open.spotify.com') ? `<audio controls src="${escapeHtml(s.url)}" preload="none"></audio>` : ''}
      </div>
      <div class="song-controls">
        ${spotifyLink}
        <button class="btn danger" data-idx="${idx}" data-action="del"><i class="fa-solid fa-trash"></i></button>
      </div>
    `
    playlistList.appendChild(el)
  })
}

songForm.addEventListener('submit', e => {
  e.preventDefault()
  songs.push({title: songTitle.value || 'Untitled', artist: songArtist.value || '', url: songUrl.value || '', memory: songMemory.value||''})
  store.set('meli_songs', songs)
  songForm.reset(); renderSongs()
})

playlistList.addEventListener('click', e => {
  const btn = e.target.closest('button')
  if (!btn) return
  const idx = Number(btn.dataset.idx)
  const action = btn.dataset.action
  if (action === 'del') { songs.splice(idx,1); store.set('meli_songs', songs); renderSongs() }
})

renderSongs()

// Simple jokes list
const jokeForm = document.getElementById('joke-form')
const jokeText = document.getElementById('joke-text')
const jokeList = document.getElementById('joke-list')
let jokes = store.get('meli_jokes', [])

function renderJokes(){
  jokeList.innerHTML = ''
  if (!jokes.length) { jokeList.innerHTML = '<li class="muted">No inside jokes yet. Add one!</li>'; return }
  jokes.forEach((j, i) => {
    const li = document.createElement('li')
    li.innerHTML = `<span>${escapeHtml(j)}</span> <button class="btn danger" data-i="${i}"><i class="fa-solid fa-xmark"></i></button>`
    jokeList.appendChild(li)
  })
}

jokeForm.addEventListener('submit', e => { e.preventDefault(); jokes.unshift(jokeText.value||''); store.set('meli_jokes', jokes); jokeForm.reset(); renderJokes() })
jokeList.addEventListener('click', e => { const btn = e.target.closest('button'); if (!btn) return; const i = Number(btn.dataset.i); jokes.splice(i,1); store.set('meli_jokes', jokes); renderJokes() })
renderJokes()

// Timeline placeholder: nothing interactive yet

// Map (Leaflet) pins saved in localStorage
const mapCanvas = document.getElementById('map-canvas')
const map = L.map(mapCanvas).setView([0,0],2)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
let pins = store.get('meli_pins', [])

function renderPins(){
  // clear existing layer group
  if (window._pinLayer) { window._pinLayer.clearLayers() }
  window._pinLayer = L.layerGroup().addTo(map)
  pins.forEach(p => {
    const mk = L.marker([p.lat,p.lng]).addTo(window._pinLayer)
    mk.bindPopup(`<strong>${escapeHtml(p.title||'Place')}</strong><p>${escapeHtml(p.note||'')}</p>`)
  })
}

map.on('click', e => {
  const title = prompt('Title for this place (placeholder allowed):', 'Dream place')
  if (title === null) return
  const note = prompt('Short note or memory for this pin:', '')
  const p = { lat: e.latlng.lat, lng: e.latlng.lng, title: title || 'Place', note: note || '' }
  pins.push(p); store.set('meli_pins', pins); renderPins()
})

renderPins()

document.getElementById('export-pins').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(pins, null, 2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'meli-pins.json'; a.click()
  URL.revokeObjectURL(url)
})

document.getElementById('clear-pins').addEventListener('click', () => { if (!confirm('Clear all pins?')) return; pins = []; store.set('meli_pins', pins); renderPins() })

// Small helper
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// Placeholder: add a few starter entries to guide filling in personal content
(function seedPlaceholders(){
  if (!store.get('meli_seeded', false)){
    jokes = ['Placeholder: "Remember the purple umbrella"', 'Placeholder: "Our 3am study sessions"']
    songs = [{title:'Placeholder Song', artist:'Artist', url:'', memory:'Write a note why this song matters.'}]
    pins = [{lat:48.8566,lng:2.3522,title:'Paris (Placeholder)',note:'We should visit someday — picnics and museums.'}]
    store.set('meli_jokes', jokes); store.set('meli_songs', songs); store.set('meli_pins', pins); store.set('meli_seeded', true)
    // re-render
    renderJokes(); renderSongs(); renderPins()
  }
})()

// add suggested soundtrack
const suggestedList = document.getElementById('suggested-list')
const suggested = store.get('meli_suggested', [
  {title:'Ta meilleure amie', artist:'Lorie', url:'https://open.spotify.com/track/4FL6ttDXeXjgxXLII24wEX?si=9a1525ffe7b94232', prompt:'Simply — you are my best friend.'},
  {title:'Placeholder Song 1', artist:'Artist A', url:'', prompt:'A memory: where were you when this song played?'},
  {title:'Placeholder Song 2', artist:'Artist B', url:'', prompt:'Why this one reminds you of Meli.'}
])

function renderSuggested(){
  suggestedList.innerHTML = ''
  suggested.forEach((s, i) => {
    const el = document.createElement('div')
    el.className = 'suggested-item'
    el.innerHTML = `<div><strong>${escapeHtml(s.title)}</strong> <span class="muted">${escapeHtml(s.artist)}</span><div class="muted" style="font-size:13px">${escapeHtml(s.prompt||'')}</div></div><div><button class="btn" data-i="${i}">Add</button></div>`
    suggestedList.appendChild(el)
  })
}

suggestedList.addEventListener('click', e => {
  const btn = e.target.closest('button')
  if (!btn) return
  const i = Number(btn.dataset.i)
  const s = suggested[i]
  songs.push({title:s.title, artist:s.artist, url:s.url, memory:s.prompt})
  store.set('meli_songs', songs); renderSongs()
})

renderSuggested()

// Photo carousel functionality
const photoInput = document.getElementById('photo-input')
const carouselStage = document.getElementById('carousel-stage')
const prevPhoto = document.getElementById('prev-photo')
const nextPhoto = document.getElementById('next-photo')
const clearPhotos = document.getElementById('clear-photos')
let photos = store.get('meli_photos', [])
let photoIndex = 0

function renderCarousel(){
  carouselStage.innerHTML = ''
  if (!photos.length) { carouselStage.innerHTML = '<div class="muted">No photos yet — add one.</div>'; return }
  const img = document.createElement('img')
  img.src = photos[photoIndex]
  img.style.opacity = 0
  carouselStage.appendChild(img)
  requestAnimationFrame(()=> img.style.opacity = 1)
}

photoInput.addEventListener('change', e => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { photos.push(ev.target.result); store.set('meli_photos', photos); photoIndex = photos.length-1; renderCarousel() }
  reader.readAsDataURL(file)
})

prevPhoto.addEventListener('click', ()=>{ if (!photos.length) return; photoIndex = (photoIndex-1+photos.length)%photos.length; renderCarousel() })
nextPhoto.addEventListener('click', ()=>{ if (!photos.length) return; photoIndex = (photoIndex+1)%photos.length; renderCarousel() })
clearPhotos.addEventListener('click', ()=>{ if (!confirm('Clear all photos?')) return; photos = []; store.set('meli_photos', photos); renderCarousel() })
renderCarousel()

// Letter editor save/export
const letterEditor = document.getElementById('letter-editor')
const saveLetter = document.getElementById('save-letter')
const exportPdf = document.getElementById('export-pdf')
const resetLetter = document.getElementById('reset-letter')

function loadLetter(){
  const txt = store.get('meli_letter', null)
  if (txt) letterEditor.innerHTML = txt
}
loadLetter()
saveLetter.addEventListener('click', ()=>{ store.set('meli_letter', letterEditor.innerHTML); alert('Letter saved locally.') })
resetLetter.addEventListener('click', ()=>{ if (!confirm('Reset letter to default?')) return; store.set('meli_letter', null); location.reload() })

exportPdf.addEventListener('click', ()=>{
  const opt = { margin:0.6, filename:'Meli-letter.pdf', image:{type:'jpeg',quality:0.95}, html2canvas:{scale:2}, jsPDF:{unit:'in',format:'letter',orientation:'portrait'} }
  html2pdf().set(opt).from(letterEditor).save()
})

// Seed more personalized placeholders and travel pins
(function seedMore(){
  if (!store.get('meli_seeded_v2', false)){
    // add suggested seeds
    store.set('meli_suggested', suggested)
    // push a few travel pins
    pins = pins.concat([
      {lat:52.3702,lng:4.8952,title:'Netherlands (Amsterdam)',note:'Imagine canals and bikes — visit together.'},
      {lat:51.1657,lng:10.4515,title:'Germany',note:'A place we both spent time during CyberMACS.'},
      {lat:56.1304,lng:-106.3468,title:'Canada',note:'Dream: someday living in the same city again.'},
      {lat:39.92077,lng:32.85411,title:'Turkey (Ankara)',note:'Where we celebrated our scholarship acceptance.'}
    ])
    store.set('meli_pins', pins)
    // add a seeded song if not present
    songs.unshift({title:'Ta meilleure amie', artist:'Lorie', url:'https://open.spotify.com/track/4FL6ttDXeXjgxXLII24wEX?si=9a1525ffe7b94232', memory:'Simply: you are my best friend.'})
    store.set('meli_songs', songs)
    store.set('meli_seeded_v2', true)
    renderSongs(); renderPins(); renderSuggested()
  }
})()
