// Referências do Player e variáveis de estado
const audioPlayer = document.getElementById('audioPlayer');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressSlider = document.getElementById('progressSlider');
const progressIndicator = document.getElementById('progressIndicator');

const volumeBtn = document.getElementById('volumeBtn');
const volumeSliderContainer = document.getElementById('volumeSliderContainer');
const volumeSlider = document.getElementById('volumeSlider');
const volumeProgress = document.getElementById('volumeProgress');
const volumeIndicator = document.getElementById('volumeIndicator');

const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Canvas de fogos
const fireworksCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fireworksCanvas ? fireworksCanvas.getContext('2d') : null;
let fwParticles = [];
let fwAnimationId = null;
let fwActiveUntil = 0;

function resizeFireworksCanvas() {
  if (!fireworksCanvas) return;
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFireworksCanvas);
resizeFireworksCanvas();

let playing = false;
let isMuted = false;
let previousVolume = 0.7;
let heartInterval = null;

function sim() {
    exibirMensagem("Não tem como explicar a alegria que estou sentindo agora. O coração não cabe no peito e a felicidade é gigante! Que seja o começo de uma linda história, cheia de amor, risadas e muitos momentos inesquecíveis ao seu lado.");
    startFireworks(4000); // 4s de fogos
}

// Removida a posição fixa inicial: os botões começam centralizados via CSS

function desvia(btn) {
    // Garante que o botão pode se mover livremente pela tela
    if (getComputedStyle(btn).position !== 'fixed') {
        const rect = btn.getBoundingClientRect();
        btn.style.position = 'fixed';
        btn.style.left = rect.left + 'px';
        btn.style.top = rect.top + 'px';
    }

    const padding = 10; // margem de segurança das bordas
    const minX = padding;
    const minY = padding;
    const maxX = window.innerWidth - btn.offsetWidth - padding;
    const maxY = window.innerHeight - btn.offsetHeight - padding;

    const randX = minX + Math.random() * (maxX - minX);
    const randY = minY + Math.random() * (maxY - minY);

    btn.style.left = randX + 'px';
    btn.style.top = randY + 'px';
    console.log("Você não pode recusar!");
}

// Função para exibir mensagem na tela
function exibirMensagem(mensagem) {
    const resultado = document.getElementById('mensagem');
    if (resultado) {
        resultado.textContent = mensagem;
    }
}

// Fogos de artifício ------------------------------------------------------
function startFireworks(durationMs = 3000) {
  if (!fwCtx || !fireworksCanvas) return;
  fwActiveUntil = Date.now() + durationMs;

  // Lança rajadas iniciais
  for (let i = 0; i < 6; i++) {
    setTimeout(() => launchBurst(), i * 200);
  }

  // Garante loop rodando
  if (!fwAnimationId) animateFireworks();
}

function launchBurst(x, y, color) {
  const w = fireworksCanvas.width;
  const h = fireworksCanvas.height;
  const cx = x != null ? x : (w * (0.25 + Math.random() * 0.5));
  const cy = y != null ? y : (h * (0.25 + Math.random() * 0.5));
  const hue = color != null ? color : Math.floor(Math.random() * 360);
  const count = 32 + Math.floor(Math.random() * 24);
  const speed = 2.5 + Math.random() * 2.5;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const vx = Math.cos(angle) * (speed * (0.6 + Math.random() * 0.8));
    const vy = Math.sin(angle) * (speed * (0.6 + Math.random() * 0.8));
    fwParticles.push({
      x: cx,
      y: cy,
      vx,
      vy,
      life: 1,
      decay: 0.012 + Math.random() * 0.02,
      color: `hsl(${hue}, 90%, 60%)`
    });
  }
}

function animateFireworks() {
  if (!fwCtx) return;
  fwAnimationId = requestAnimationFrame(animateFireworks);

  // Fade transparente do frame anterior sem escurecer o site
  const w = fireworksCanvas.width;
  const h = fireworksCanvas.height;
  fwCtx.globalCompositeOperation = 'destination-out';
  fwCtx.fillStyle = 'rgba(0,0,0,0.20)'; // apaga suavemente as partículas anteriores
  fwCtx.fillRect(0, 0, w, h);
  // Desenhar partículas com adição de luz (sem fundo preto)
  fwCtx.globalCompositeOperation = 'lighter';

  // Atualiza e desenha partículas
  for (let i = fwParticles.length - 1; i >= 0; i--) {
    const p = fwParticles[i];
    // Física simples com gravidade e desaceleração leve
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.vy += 0.03; // gravidade
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) {
      fwParticles.splice(i, 1);
      continue;
    }

    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    fwCtx.fillStyle = p.color;
    fwCtx.globalAlpha = Math.max(0, p.life);
    fwCtx.fill();
    fwCtx.globalAlpha = 1;
  }

  // Enquanto ativo, lança novas explosões aleatórias
  if (Date.now() < fwActiveUntil) {
    if (Math.random() < 0.06) launchBurst();
  } else if (fwParticles.length === 0) {
    // Para o loop quando termina
    cancelAnimationFrame(fwAnimationId);
    fwAnimationId = null;
    // Limpa canvas
    fwCtx.globalCompositeOperation = 'source-over';
    fwCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  }
}

// Atualiza posição da bolinha de progresso conforme o tempo atual
function updateProgressIndicator() {
  if (!progressIndicator || !progressBar || !audioPlayer || !audioPlayer.duration) return;
  const percent = Math.max(0, Math.min(100, (audioPlayer.currentTime / audioPlayer.duration) * 100));
  progressIndicator.style.left = percent + '%';
}

// Atualiza posição da bolinha de volume conforme o volume atual
function updateVolumeIndicator() {
  if (!volumeIndicator || !volumeSliderContainer || !audioPlayer) return;
  const percent = Math.max(0, Math.min(100, audioPlayer.volume * 100));
  volumeIndicator.style.left = percent + '%';
}

// --- O restante do código do player de música permanece igual ---
audioPlayer.addEventListener('loadeddata', () => {
  if (audioPlayer.duration) {
    totalTimeSpan.textContent = formatTime(audioPlayer.duration);
    updateProgressIndicator();
  }
});

// Additional event listeners for better compatibility
audioPlayer.addEventListener('loadedmetadata', () => {
  if (audioPlayer.duration) {
    totalTimeSpan.textContent = formatTime(audioPlayer.duration);
    updateProgressIndicator();
  }
});

audioPlayer.addEventListener('canplay', () => {
  if (audioPlayer.duration) {
    totalTimeSpan.textContent = formatTime(audioPlayer.duration);
  }
});

// Volume control functions
function updateVolumeDisplay() {
  const volumePercent = Math.round(audioPlayer.volume * 100);
  volumeProgress.style.width = volumePercent + '%';
  volumeSlider.value = volumePercent;
  
  // Update volume button icon based on volume level
  updateVolumeIcon();
  updateVolumeIndicator();
}

function updateVolumeIcon() {
  const volume = audioPlayer.volume;
  const volumeIcon = volumeBtn.querySelector('svg');
  
  if (volume === 0 || isMuted) {
    // Muted icon
    volumeIcon.innerHTML = `
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (volume < 0.5) {
    // Low volume icon
    volumeIcon.innerHTML = `
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.54 8.46C16.4774 9.39764 16.4774 10.9024 15.54 11.84" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else {
    // High volume icon
    volumeIcon.innerHTML = `
      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.07 4.93C20.9447 6.80528 20.9447 9.89472 19.07 11.77" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.54 8.46C16.4774 9.39764 16.4774 10.9024 15.54 11.84" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }
}

// Volume slider event listener
volumeSlider.addEventListener('input', (e) => {
  const volume = e.target.value / 100;
  audioPlayer.volume = volume;
  isMuted = false;
  updateVolumeDisplay();
});

// Volume button click (mute/unmute)
volumeBtn.addEventListener('click', () => {
  if (isMuted || audioPlayer.volume === 0) {
    // Unmute
    audioPlayer.volume = previousVolume;
    isMuted = false;
  } else {
    // Mute
    previousVolume = audioPlayer.volume;
    audioPlayer.volume = 0;
    isMuted = true;
  }
  updateVolumeDisplay();
});

// Corrigido: função para formatar tempo em mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Corrigido: função para atualizar ícone do botão play/pause
function updatePlayPauseIcon() {
  const svg = playPauseBtn.querySelector('svg');
  
  if (playing) {
    // Ícone de pause
    svg.innerHTML = `
      <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
      <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
    `;
  } else {
    // Ícone de play
    svg.innerHTML = `
      <polygon points="5,3 19,12 5,21" stroke="currentColor" stroke-width="2" fill="currentColor"/>
    `;
  }
}

// Corrigido: atualizar barra de progresso
function updateProgress() {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        progressSlider.value = progressPercent;
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        updateProgressIndicator();
    }
}

// Event listeners para o áudio
audioPlayer.addEventListener('loadedmetadata', () => {
  totalTimeSpan.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', updateProgress);

// Sincronizar com autoplay
audioPlayer.addEventListener('play', () => {
  playing = true;
  updatePlayPauseIcon();
  // Iniciar animação dos corações
  if (!heartInterval) {
    heartInterval = setInterval(createFloatingHeart, 200);
  }
});

audioPlayer.addEventListener('pause', () => {
  playing = false;
  updatePlayPauseIcon();
  // Parar animação dos corações
  if (heartInterval) {
    clearInterval(heartInterval);
    heartInterval = null;
  }
  // Limpar corações existentes gradualmente
  setTimeout(clearAllHearts, 1000);
});

// Verificar se o áudio está tocando ao carregar a página (para autoplay)
audioPlayer.addEventListener('canplaythrough', () => {
  if (!audioPlayer.paused) {
    playing = true;
    updatePlayPauseIcon();
    if (!heartInterval) {
      heartInterval = setInterval(createFloatingHeart, 200);
    }
  }
});

// Progress slider event listener
progressSlider.addEventListener('input', (e) => {
  const time = (e.target.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = time;
});

// Play/Pause button functionality
playPauseBtn.addEventListener("click", () => {
  if (playing) {
    audioPlayer.pause();
  } else {
    audioPlayer.play().catch((error) => {
      console.log("Erro ao reproduzir áudio:", error);
    });
  }
});

// Botões anterior e próximo (funcionalidade básica)
prevBtn.addEventListener('click', () => {
  audioPlayer.currentTime = 0;
});

nextBtn.addEventListener('click', () => {
  // Para uma única música, reinicia do começo
  audioPlayer.currentTime = 0;
  if (!playing) {
    playing = true;
    updatePlayPauseIcon();
    audioPlayer.play();
    heartInterval = setInterval(createFloatingHeart, 200);
  }
});

// Inicializações
window.addEventListener('load', () => {
  // Volume inicial
  if (typeof audioPlayer.volume === 'number') {
    if (previousVolume != null) audioPlayer.volume = previousVolume;
    updateVolumeDisplay();
  }
  updateProgressIndicator();
});
