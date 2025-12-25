const CHANNELS_URL = 'channels.json';

// small cache for nameSvg fetches
const nameSvgCache = new Map();

async function loadChannels(){
  try{
    const res = await fetch(CHANNELS_URL, {cache: 'no-store'});
    if(!res.ok) throw new Error('Failed to load channels');
    const data = await res.json();
    renderChannels(data.channels || []);
  }catch(err){
    console.error(err);
    const cached = await caches.match(CHANNELS_URL);
    if(cached){
      const data = await cached.json();
      renderChannels(data.channels || []);
    }else{
      showOfflineMessage();
    }
  }
}

function showOfflineMessage(){
  const root = document.getElementById('channels');
  root.innerHTML = '<div class="desc">Unable to load channels. You appear offline.</div>';
}

function renderChannels(list){
  const root = document.getElementById('channels');
  const tpl = document.getElementById('channel-template');
  root.innerHTML = '';
  list.forEach(ch => {
    const node = tpl.content.cloneNode(true);
    const nameEl = node.querySelector('.name');
    nameEl.textContent = ch.name;
    node.querySelector('.number').textContent = ch.number;
    const img = node.querySelector('img.icon');
    img.src = ch.icon || '/icons/default.svg';
    img.alt = `${ch.name} icon`;
    const desc = node.querySelector('.desc');
    desc.textContent = ch.desc || 'No schedule configured';

    // handle nameSvg primary label with text fallback
    const wrap = node.querySelector('.channel');
    const svgHolder = node.querySelector('.name-svg');
    if(ch.nameSvg){
      loadNameSvg(ch.nameSvg).then(svgContent =>{
        if(svgContent){
          svgHolder.innerHTML = svgContent;
          wrap.classList.add('has-name-svg');
        }else{
          svgHolder.innerHTML = '';
          wrap.classList.remove('has-name-svg');
        }
      }).catch(()=>{ wrap.classList.remove('has-name-svg'); });
    } else {
      svgHolder.innerHTML = '';
      wrap.classList.remove('has-name-svg');
    }

    root.appendChild(node);
  });
}

async function loadNameSvg(url){
  try{
    if(nameSvgCache.has(url)) return nameSvgCache.get(url);
    const res = await fetch(url, {cache: 'force-cache'});
    if(!res.ok) throw new Error('svg not found');
    const text = await res.text();
    const trimmed = text.trim();
    if(!trimmed.startsWith('<svg')) return null;
    nameSvgCache.set(url, trimmed);
    return trimmed;
  }catch(err){
    console.warn('Failed to load nameSvg', url, err);
    nameSvgCache.set(url, null);
    return null;
  }
}

// search
const searchEl = document.getElementById('search');
searchEl.addEventListener('input', debounce(e=>{
  const q = e.target.value.toLowerCase().trim();
  const channels = Array.from(document.querySelectorAll('.channel'));
  channels.forEach(el=>{
    const name = el.querySelector('.name').textContent.toLowerCase();
    const num = el.querySelector('.number').textContent.toLowerCase();
    el.style.display = (name.includes(q) || num.includes(q)) ? '' : 'none';
  });
}, 200));

function debounce(fn, wait=150){
  let t;
  return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait)};
}

// register service worker
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').then(reg=>{
    console.log('SW registered',reg.scope);
  }).catch(err=>console.warn('SW failed',err));
}

// refresh button wiring
const refreshBtn = document.getElementById('refresh');
if(refreshBtn){
  refreshBtn.addEventListener('click', async ()=>{
    refreshBtn.disabled = true;
    const old = refreshBtn.textContent;
    refreshBtn.textContent = '⟳';
    try{ await loadChannels(); }catch(e){}
    refreshBtn.textContent = old;
    refreshBtn.disabled = false;
  });
}

loadChannels();
