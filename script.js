'use strict';

/* Provakar Exam Hub — vanilla JavaScript, no external dependency */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const APP = $('#app');
const TODAY = () => new Date().toISOString().slice(0, 10);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const attr = value => encodeURIComponent(String(value ?? ''));
const unattr = value => { try { return decodeURIComponent(value || ''); } catch { return ''; } };
const slugify = value => String(value).toLowerCase().replace(/[^a-z0-9াঅ-৿]+/gi, '-').replace(/^-|-$/g, '');
const dayOfYear = () => { const now = new Date(); const start = new Date(now.getFullYear(), 0, 0); return Math.floor((now - start) / 86400000); };

const chapterSeed = {
  bn: [
    ['bn-ch1','পদ পরিচয়','🔤','বিশেষ্য, সর্বনাম, বিশেষণ, ক্রিয়া ও অব্যয়—বাক্যের প্রতিটি শব্দকে চিনুন।','55 মিনিট',2],
    ['bn-ch2','সন্ধি','🔗','দুই ধ্বনির মিল, সূত্র, সন্ধিবিচ্ছেদ ও পরীক্ষার শর্টকাট একসাথে।','70 মিনিট',3],
    ['bn-ch3','সমাস','🧩','ব্যাসবাক্য দেখে দ্বন্দ্ব, তৎপুরুষ, কর্মধারয় ও বহুব্রীহি নির্ণয় করুন।','80 মিনিট',4],
    ['bn-ch4','কারক ও বিভক্তি','🧭','ক্রিয়ার সঙ্গে পদের সম্পর্ক ও বিভক্তি চিহ্ন সহজ ধাপে শিখুন।','55 মিনিট',3],
    ['bn-ch5','প্রকৃতি ও प्रत्यয়','🌱','শব্দের মূল ও শেষে যুক্ত অংশ বুঝে শব্দ গঠন আয়ত্ত করুন।','55 মিনিট',3],
    ['bn-ch6','শব্দভাণ্ডার','📚','এক কথায় প্রকাশ, বিপরীতার্থক, বাগধারা ও তৎসম-তদ্ভব ঝালিয়ে নিন।','90 মিনিট',3],
    ['bn-ch7','বাক্য পরিবর্তন ও সংশোধন','✍️','সরল-জটিল-যৌগিক রূপান্তর ও ভুল বাক্য শোধরানোর কৌশল।','65 মিনিট',4],
    ['bn-ch8','সাহিত্য','🪶','কবি, ছদ্মনাম, গ্রন্থ, চরিত্র ও বাংলা সাহিত্যের প্রথম তথ্য।','70 মিনিট',2],
    ['bn-ch9','বোধপরীক্ষণ','🔎','অনুচ্ছেদ পড়ে কম সময়ে সঠিক উত্তর বাছার অভ্যাস করুন।','60 মিনিট',3]
  ],
  en: [
    ['en-ch1','Parts of Speech','🔤','Identify noun, pronoun, adjective, verb and every word’s job.','65 min',3],
    ['en-ch2','Tenses — The Complete System','⏳','All twelve tenses, formulas, signals and exam-ready corrections.','105 min',5],
    ['en-ch3','Articles (a, an, the)','🅰️','Use articles by sound, sense and familiar WB exam patterns.','75 min',4],
    ['en-ch4','Voice — Active & Passive','🔄','Change active sentences into clear passive forms tense by tense.','80 min',4],
    ['en-ch5','Narration — Direct & Indirect','💬','Master reporting verbs, tense shifts, pronouns and expressions.','85 min',4],
    ['en-ch6','Vocabulary Treasury','💎','Build scoring vocabulary: synonyms, antonyms, idioms and phrasal verbs.','100 min',3],
    ['en-ch7','Sentence Correction & Transformation','🛠️','Spot errors quickly and transform sentences without changing meaning.','85 min',4],
    ['en-ch8','Reading Comprehension','📖','Read smartly, locate clues and answer accurately under time pressure.','65 min',3],
    ['en-ch9','Gender, Number & Degree','⚖️','Plural rules, gender pairs and degree transformations made simple.','60 min',3],
    ['en-ch10','Question Tags, Conditionals & Modals','❓','Get tags, if-clauses and modal choices right in every question.','90 min',4],
    ['en-ch11','Spelling, Punctuation & Word Order','✒️','Write accurately with correct spelling, punctuation and sentence order.','70 min',3]
  ]
};
const chapterColors = { bn:['#00f5ff','#ff00e5','#39ff14','#ffd700','#ff6600','#bf00ff','#ff0080','#00ffcc','#ffcc00'], en:['#00b4ff','#ff007f','#ffd700','#bf00ff','#39ff14','#ff6600','#00ffcc','#ff4444','#00f5ff','#ffaa00','#ff00e5'] };
const makeChapter = (seed, hub, index) => ({ id:seed[0], hub, number:index + 1, title:seed[1], icon:seed[2], description:seed[3], time:seed[4], difficulty:seed[5], color:chapterColors[hub][index], sections:[], quiz:[], flashcards:[] });

const expandCards = (pairs, count, prefix) => Array.from({ length:count }, (_, index) => { const pair = pairs[index % pairs.length]; return { id:`${prefix}-${index + 1}`, front:pair[0], back:pair[1] }; });
const makeExamples = (items, count) => Array.from({ length:count }, (_, index) => items[index % items.length]);
const commonGuide = chapter => ({
  id:'study-route', title:'পড়ার রুটিন / Study route', definition:`<b>${escapeHTML(chapter.title)}</b> পড়তে আগে সংজ্ঞা বুঝুন, তারপর উদাহরণে দাগ দিন, শেষে ছোট কুইজে নিজের ভুল ধরুন।`,
  support:chapter.hub === 'en' ? 'মনে রাখো: ছোট ছোট ধাপে নিয়ম ধরলে English grammar আর মুখস্থের বোঝা থাকে না।' : '',
  groups:[{ title:'আজকের ৫ ধাপ', rule:'১) শিরোনাম পড়ো ২) মূল শব্দ আলাদা করো ৩) উদাহরণ জোরে পড়ো ৪) ভুল-সঠিক মিলাও ৫) কুইজ দাও।', examples:['একবারে বেশি পড়বে না; 25 মিনিট মন দিয়ে পড়ো।','প্রতিটি নতুন শব্দ নিজের একটি বাক্যে ব্যবহার করো।','ভুল উত্তরকে লাল দাগ নয়—পরের জয়ের সূত্র ভাবো।','শেষে দুই মিনিট চোখ বন্ধ করে নিয়মটি মনে করো।','পরের বার এই পাঁচ ধাপেই পুনরাবৃত্তি করো।'] }],
  tip:'শর্টকাট: নিয়মের নামের সঙ্গে একটি নিজের উদাহরণ জুড়ে দাও—পরীক্ষার হলে সেটিই মনে পড়বে।',
  memory:'পড়ি বুঝে, লিখি ধীরে; ভুল ধরলেই নম্বর ঘিরে।',
  mistakes:[['শুধু পড়ে রেখে দেওয়া','পড়ে একটি প্রশ্নের উত্তর নিজে লেখা'],['একদিন অনেক পড়া','প্রতিদিন অল্প করে পুনরাবৃত্তি']],
  exam:[`এই অধ্যায়ে আগে সংজ্ঞা-ভিত্তিক MCQ, পরে উদাহরণ-ভিত্তিক MCQ দেখো।`,`চারটি বিকল্পের মধ্যে যে উত্তরটি নিয়ম ও অর্থ—দুই দিক থেকেই ঠিক, সেটিই বেছে নাও।`]
});

/* ---------- Data Preparation & Core Setup ---------- */
const DATA = {
  bengali:{ chapters:chapterSeed.bn.map((seed,index) => makeChapter(seed,'bn',index)), quizBank:[], flashcards:[] },
  english:{ chapters:chapterSeed.en.map((seed,index) => makeChapter(seed,'en',index)), quizBank:[], flashcards:[], wordOfDay:[], dailyChallenges:[] }
};

function toQuestion(item, chapter, hub, index) { 
  return { id:`${chapter}-q${index + 1}`, question:item[0], options:item[1], answer:item[2], explanation:item[3], difficulty:item[4] || 'medium', chapter, hub }; 
}

const DEFAULTS = {
  peh_theme:'dark', peh_fontSize:'normal', peh_activeHub:'bn', peh_reducedMotion:false, peh_readingMode:'comfortable', peh_tablePageSize:50, peh_ttsRate:1, peh_showBackground:true, peh_showCursor:true, peh_autoBookmark:false, peh_xp:0, peh_level:'নবীন / Novice', peh_streak:{count:0,lastVisitDate:''}, peh_badges:[], peh_chaptersRead:[], peh_chapterProgress:{}, peh_quizScores:[], peh_mockScores:[], peh_flashcardStatus:{}, peh_bookmarks:[], peh_notes:'', peh_notesLastSaved:'', peh_pomodoro:{sessionsToday:0,totalSessions:0,lastSessionDate:'',customDuration:25}, peh_wotdLastDate:'', peh_wotdIndex:0, peh_dailyChallenge:{lastDate:'',streak:0,history:[]}, peh_searchHistory:[], peh_studyTime:{today:0,totalMinutes:0,lastDate:''}, peh_planner:[], peh_mistakes:[], peh_dictionary:[], peh_focusMode:false
};

const StorageManager = {
  pending:{}, timer:null,
  init() { Object.entries(DEFAULTS).forEach(([key,value]) => { if (this.get(key,null) === null) this.set(key,value); }); },
  get(key, fallback) { try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } },
  set(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* storage fallback */ } },
  batchSet(key,value) { this.pending[key] = value; if (!this.timer) this.timer = setTimeout(() => { Object.entries(this.pending).forEach(([pendingKey,pendingValue]) => this.set(pendingKey,pendingValue)); this.pending={}; this.timer=null; },700); }
};

const ThemeManager = { 
  init() { const saved=StorageManager.get('peh_theme',null); const theme=saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light':'dark'); this.applyTheme(theme); }, 
  applyTheme(theme) { document.documentElement.dataset.theme=theme; $('#theme-toggle').textContent=theme==='dark'?'☾':'☀'; $('#theme-toggle').setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode'); }, 
  toggle() { const next=document.documentElement.dataset.theme === 'dark' ? 'light':'dark'; StorageManager.set('peh_theme',next); this.applyTheme(next); } 
};

const FontSizeManager = { 
  init() { this.apply(StorageManager.get('peh_fontSize','normal')); }, 
  apply(size) { document.documentElement.dataset.fontSize=size; $$('.font-button').forEach(button => button.classList.toggle('is-selected',button.dataset.font===size)); }, 
  increase() { const order=['small','normal','large','xlarge']; const current=StorageManager.get('peh_fontSize','normal'); const value=order[Math.min(order.length-1,order.indexOf(current)+1)]; StorageManager.set('peh_fontSize',value); this.apply(value); }, 
  decrease() { const order=['small','normal','large','xlarge']; const current=StorageManager.get('peh_fontSize','normal'); const value=order[Math.max(0,order.indexOf(current)-1)]; StorageManager.set('peh_fontSize',value); this.apply(value); } 
};

const SettingsManager = {
  defaults:{readingMode:'comfortable',tablePageSize:50,ttsRate:1,showBackground:true,showCursor:true,reducedMotion:false,autoBookmark:false},
  init(){
    this.apply();
    this.syncUI();
    $('#settings-toggle')?.addEventListener('click',()=>this.open());
    $('#settings-scrim')?.addEventListener('click',()=>this.close());
  },
  get(){return {readingMode:StorageManager.get('peh_readingMode',this.defaults.readingMode),tablePageSize:Number(StorageManager.get('peh_tablePageSize',this.defaults.tablePageSize)),ttsRate:Number(StorageManager.get('peh_ttsRate',this.defaults.ttsRate)),showBackground:Boolean(StorageManager.get('peh_showBackground',this.defaults.showBackground)),showCursor:Boolean(StorageManager.get('peh_showCursor',this.defaults.showCursor)),reducedMotion:Boolean(StorageManager.get('peh_reducedMotion',this.defaults.reducedMotion)),autoBookmark:Boolean(StorageManager.get('peh_autoBookmark',this.defaults.autoBookmark))};},
  apply(){
    const prefs=this.get();
    document.documentElement.dataset.readingMode=prefs.readingMode;
    document.documentElement.dataset.reducedMotion=String(prefs.reducedMotion);
    document.documentElement.dataset.showCursor=String(prefs.showCursor);
    document.body.classList.toggle('minimal-background',!prefs.showBackground);
    if (typeof TTSEngine !== 'undefined') TTSEngine.setRate(prefs.ttsRate);
  },
  syncUI(){
    const prefs=this.get();
    const read=$('#setting-reading-mode'); const table=$('#setting-table-size'); const rate=$('#setting-tts-rate');
    if(read)read.value=prefs.readingMode;
    if(table)table.value=String(prefs.tablePageSize);
    if(rate)rate.value=String(prefs.ttsRate);
    const bg=$('#setting-background');const cursor=$('#setting-cursor');const motion=$('#setting-motion');const bookmark=$('#setting-autobookmark');
    if(bg)bg.checked=prefs.showBackground;
    if(cursor)cursor.checked=prefs.showCursor;
    if(motion)motion.checked=prefs.reducedMotion;
    if(bookmark)bookmark.checked=prefs.autoBookmark;
  },
  open(){const panel=$('#settings-panel');if(!panel)return;this.syncUI();panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');$('#settings-scrim').hidden=false;$('#settings-toggle')?.setAttribute('aria-expanded','true');},
  close(){const panel=$('#settings-panel');if(!panel)return;panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');$('#settings-scrim').hidden=true;$('#settings-toggle')?.setAttribute('aria-expanded','false');},
  reset(){
    StorageManager.set('peh_readingMode',this.defaults.readingMode);
    StorageManager.set('peh_tablePageSize',this.defaults.tablePageSize);
    StorageManager.set('peh_ttsRate',this.defaults.ttsRate);
    StorageManager.set('peh_showBackground',this.defaults.showBackground);
    StorageManager.set('peh_showCursor',this.defaults.showCursor);
    StorageManager.set('peh_reducedMotion',this.defaults.reducedMotion);
    StorageManager.set('peh_autoBookmark',this.defaults.autoBookmark);
    this.apply();this.syncUI();Router.loadView(location.hash||'#home');
  }
};

/* ---------- Navigation & Controls ---------- */
const NavigationControls = {
  init(){
    $('#history-back')?.addEventListener('click',()=>{if(history.length>1)history.back();else Router.navigate('#home');});
    $('#fullscreen-toggle')?.addEventListener('click',()=>this.toggleFullscreen());
    document.addEventListener('fullscreenchange',()=>this.updateFullscreenUI());
    this.updateFullscreenUI();
  },
  async toggleFullscreen(){
    try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{GamificationEngine.toast('Full screen is not available in this browser.');}
  },
  updateFullscreenUI(){const button=$('#fullscreen-toggle');if(!button)return;const active=Boolean(document.fullscreenElement);button.textContent=active?'⤢':'⛶';button.setAttribute('aria-label',active?'Exit full screen':'Enter full screen');button.title=active?'Exit full screen':'Full screen';}
};

const Preloader = { 
  init() { 
    setTimeout(() => { $('#preloader')?.classList.add('is-done'); }, 800); 
  } 
};

const CustomCursor = { 
  ringX:0,ringY:0,targetX:0,targetY:0,raf:null, 
  init() { 
    if (window.matchMedia('(hover: none),(pointer: coarse)').matches) return; 
    const dot=$('#cursor-dot'); const ring=$('#cursor-ring'); 
    if(!dot || !ring) return;
    document.addEventListener('pointermove',event => { 
      this.targetX=event.clientX; this.targetY=event.clientY; 
      dot.style.transform=`translate(${event.clientX}px,${event.clientY}px) translate(-50%,-50%)`; 
      if (!this.raf) this.animate(ring); 
    }); 
  }, 
  animate(ring) { 
    this.ringX += (this.targetX-this.ringX)*.12; 
    this.ringY += (this.targetY-this.ringY)*.12; 
    ring.style.transform=`translate(${this.ringX}px,${this.ringY}px) translate(-50%,-50%)`; 
    if (Math.abs(this.targetX-this.ringX)>.2 || Math.abs(this.targetY-this.ringY)>.2) this.raf=requestAnimationFrame(() => this.animate(ring)); 
    else this.raf=null; 
  } 
};

const HubSwitcher = {
  init() { this.apply(StorageManager.get('peh_activeHub','bn')); $$('.hub-switch').forEach(button => button.addEventListener('click',() => this.switchTo(button.dataset.hub))); },
  apply(hub) { document.body.classList.toggle('hub-bn',hub==='bn'); document.body.classList.toggle('hub-en',hub==='en'); document.documentElement.lang=hub==='bn'?'bn':'en'; $$('.hub-switch').forEach(button => { const active=button.dataset.hub===hub; button.classList.toggle('is-active',active); button.setAttribute('aria-selected',String(active)); }); this.renderSubnav(hub); },
  switchTo(hub) { StorageManager.set('peh_activeHub',hub); this.apply(hub); if (location.hash !== '#home') Router.navigate('#home'); else Router.loadView('#home'); },
  renderSubnav(hub) { const nav=$('#chapter-subnav'); const chapters=DATA[hub==='bn'?'bengali':'english'].chapters; if(nav) nav.innerHTML=chapters.map(chapter => `<a href="#${chapter.id}" data-route="#${chapter.id}">${chapter.number}. ${escapeHTML(chapter.title)}</a>`).join(''); const drawer=$('#drawer-chapters'); if(drawer) drawer.innerHTML=chapters.map(chapter => `<a href="#${chapter.id}" data-route="#${chapter.id}">${chapter.icon} ${chapter.number}. ${escapeHTML(chapter.title)}</a>`).join(''); }
};

/* ---------- Search Engine ---------- */
const SearchEngine = { 
  index:[],
  init(){
    this.buildIndex();
    const input=$('#global-search');
    if(input) {
      input.addEventListener('input',()=>this.renderResults(this.search(input.value)));
      input.addEventListener('focus',()=>this.renderResults(this.search(input.value)));
    }
  },
  buildIndex(){
    this.index=[];
    ['bengali','english'].forEach(group=>DATA[group].chapters.forEach(chapter=>{
      this.index.push({id:chapter.id,hub:chapter.hub,chapter:chapter.title,title:chapter.title,text:`${chapter.title} ${chapter.description}`});
      chapter.sections.forEach(section=>{
        this.index.push({id:chapter.id,anchor:section.id,hub:chapter.hub,chapter:chapter.title,title:section.title,text:`${section.title} ${section.definition.replace(/<[^>]*>/g,'')}`});
      });
    }));
  },
  search(query){
    const q=query.trim().toLowerCase();
    if(q.length<2) return [];
    return this.index.filter(item => item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q)).slice(0,10);
  },
  renderResults(results){
    const popover=$('#search-popover'), q=$('#global-search').value.trim();
    if(!popover) return;
    if(!q){ popover.hidden = true; return; }
    popover.hidden = false;
    const content = $('#search-results-content');
    const html = results.length ? results.map(r=>`<a class="search-result" href="#${r.id}" data-action="search-go" data-hub="${r.hub}" data-chapter="${r.id}" data-anchor="${attr(r.anchor||'')}"><small>${r.hub==='bn'?'📚 বাংলা হাব':'🇬🇧 English Hub'} · ${escapeHTML(r.chapter)}</small><br><b>${escapeHTML(r.title)}</b></a>`).join('') : '<p class="search-result">কোনো ফলাফল পাওয়া যায়নি</p>';
    if(content) content.innerHTML = html;
  },
  closeSearch(){
    const popover=$('#search-popover');
    if(popover) popover.hidden = true;
  },
  focusSearch(){ $('#global-search')?.focus(); },
  navigateToResult(hub,chapter,anchor){
    StorageManager.set('peh_activeHub',hub);
    HubSwitcher.apply(hub);
    this.closeSearch();
    Router.navigate(`#${chapter}`);
    if(anchor) {
      setTimeout(()=>{ document.getElementById(anchor)?.scrollIntoView({behavior:'smooth'}); }, 300);
    }
  }
};

/* ---------- Notes & Drawers ---------- */
const NotesManager = {
  init() {},
  open() { $('#notes-panel')?.classList.add('is-open'); $('#notes-panel')?.setAttribute('aria-hidden','false'); },
  close() { $('#notes-panel')?.classList.remove('is-open'); $('#notes-panel')?.setAttribute('aria-hidden','true'); }
};

function closeDrawer(){
  const drawer=$('#mobile-drawer');
  if(drawer) {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
  }
  $('#drawer-toggle')?.setAttribute('aria-expanded','false');
  const scrim = $('#drawer-scrim');
  if(scrim) scrim.hidden = true;
}

function openDrawer(){
  const drawer=$('#mobile-drawer');
  if(drawer) {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
  }
  $('#drawer-toggle')?.setAttribute('aria-expanded','true');
  const scrim = $('#drawer-scrim');
  if(scrim) scrim.hidden = false;
}

function showModal(html){
  const root=$('#modal-root');
  if(!root)return;
  root.innerHTML=html;
}

function closeModal(){
  const root=$('#modal-root');
  if(root) root.innerHTML='';
}

/* ---------- Global Event Hub ---------- */
function eventHub(){
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action],[data-route]');
    
    // Close search on outside click
    if(!event.target.closest('.search-wrap')) {
      SearchEngine.closeSearch();
    }

    if(!target) return;

    const action = target.dataset.action;

    if(target.dataset.route){
      event.preventDefault();
      Router.navigate(target.dataset.route);
      closeDrawer();
      return;
    }

    switch(action) {
      case 'close-modal': closeModal(); break;
      case 'close-search': SearchEngine.closeSearch(); break;
      case 'focus-search': SearchEngine.focusSearch(); break;
      case 'close-drawer': closeDrawer(); break;
      case 'close-settings': SettingsManager.close(); break;
      case 'settings-reset': SettingsManager.reset(); break;
      case 'open-notes': SettingsManager.close(); NotesManager.open(); break;
      case 'close-notes': NotesManager.close(); break;
      case 'search-go':
        event.preventDefault();
        SearchEngine.navigateToResult(target.dataset.hub, target.dataset.chapter, unattr(target.dataset.anchor));
        break;
      default: break;
    }
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape') {
      closeModal();
      closeDrawer();
      SettingsManager.close();
      NotesManager.close();
      SearchEngine.closeSearch();
    }
  });

  $('#drawer-toggle')?.addEventListener('click', () => {
    const drawer = $('#mobile-drawer');
    if(drawer && drawer.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  });

  $('#theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
}

/* ---------- Router & View Loader ---------- */
const Router = {
  init(){
    window.addEventListener('hashchange', () => this.loadView(location.hash));
    this.loadView(location.hash || '#home');
  },
  navigate(hash){ location.hash = hash; },
  loadView(hash){
    const route = hash || '#home';
    if(APP) {
      APP.innerHTML = `<div class="page-shell"><h2>${escapeHTML(route)} Page Loaded</h2></div>`;
    }
  }
};

/* ---------- App Initialization ---------- */
function init(){
  StorageManager.init();
  ThemeManager.init();
  FontSizeManager.init();
  HubSwitcher.init();
  Preloader.init();
  CustomCursor.init();
  SearchEngine.init();
  SettingsManager.init();
  NavigationControls.init();
  eventHub();
  Router.init();
}

document.addEventListener('DOMContentLoaded', init);
