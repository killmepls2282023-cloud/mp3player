// ====== ТВОИ ТРЕКИ ======
const colorThief = new ColorThief();
const tracks = [
  { title: 'Название 1', artist: 'Артист 1', src: 'music/track1.mp3', cover: 'image/cover1.png' },
  { title: 'Название 2', artist: 'Артист 2', src: 'music/track2.mp3', cover: 'image/cover2.png' },
  { title: 'Название 3', artist: 'Артист 3', src: 'music/track3.mp3', cover: 'image/cover3.png' },
  { title: 'Название 4', artist: 'Артист 4', src: 'music/track4.mp3', cover: 'image/cover4.png' },
  { title: 'Название 5', artist: 'Артист 5', src: 'music/track5.mp3', cover: 'image/cover5.png' },
  { title: 'Название 6', artist: 'Артист 6', src: 'music/track6.mp3', cover: 'image/cover6.png' },
  { title: 'Название 7', artist: 'Артист 7', src: 'music/track7.mp3', cover: 'image/cover7.png' },
  { title: 'Название 8', artist: 'Артист 8', src: 'music/track8.mp3', cover: 'image/cover8.png' },
  { title: 'Название 9', artist: 'Артист 9', src: 'music/track9.mp3', cover: 'image/cover9.png' },
  { title: 'Название 10', artist: 'Артист 10', src: 'music/track10.mp3', cover: 'image/cover10.png' },
];

// ====== ЭЛЕМЕНТЫ ======
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progress-fill');
const playlist = document.getElementById('playlist');
const equalizer = document.getElementById('equalizer');
const currentTimeEl = document.getElementById('current-time'); // Новое
const totalTimeEl = document.getElementById('total-time');     // Новое

let currentIndex = 0;

// ====== ФОРМАТИРОВАНИЕ ВРЕМЕНИ ======
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// ====== ЗАГРУЗКА ТРЕКА ======
function loadTrack(index) {
  currentIndex = index;
  const track = tracks[index];
  
  audio.src = track.src;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  
  if (track.cover) {
    coverEl.src = track.cover;
    
    // Сброс таймингов при смене трека
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';
    progress.value = 0;

    coverEl.onload = () => {
      try {
        const dominantColor = colorThief.getColor(coverEl);
        const [r, g, b] = dominantColor;
        const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        document.querySelector('.player').style.setProperty('--theme-color', rgbaColor);
      } catch (e) {
        console.warn('Цвет не извлечен:', e);
      }
    };
  }

  [...playlist.children].forEach((li, i) => {
    li.classList.toggle('active', i === index);
  });
}

// ====== РЕНДЕР ПЛЕЙЛИСТА ======
function renderPlaylist() {
  tracks.forEach((track, i) => {
    const li = document.createElement('li');
    li.textContent = `${track.title} — ${track.artist}`;
    li.addEventListener('click', () => {
      loadTrack(i);
      audio.play();
      playBtn.classList.add('is-playing');
      equalizer.classList.remove('paused');
    });
    playlist.appendChild(li);
  });
}

// ====== КНОПКИ ======
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.classList.add('is-playing');
    equalizer.classList.remove('paused');
  } else {
    audio.pause();
    playBtn.classList.remove('is-playing');
    equalizer.classList.add('paused');
  }
});

prevBtn.addEventListener('click', () => {
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
  audio.play();
  playBtn.classList.add('is-playing');
  equalizer.classList.remove('paused');
});

nextBtn.addEventListener('click', () => {
  loadTrack((currentIndex + 1) % tracks.length);
  audio.play();
  playBtn.classList.add('is-playing');
  equalizer.classList.remove('paused');
});

// ====== ОБНОВЛЕНИЕ ПРОГРЕССА И ТАЙМИНГОВ ======
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    // Прогресс-бар
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.value = percent;
    progressFill.style.width = percent + '%';
    
    // Тайминги
    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalTimeEl.textContent = formatTime(audio.duration);
  }
});

// Перемотка
progress.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
    progressFill.style.width = progress.value + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime); // Обновляем время при перемотке
  }
});

// Показываем общее время, когда трек загружен (но еще не играет)
audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

// ====== АВТОПЕРЕХОД ======
audio.addEventListener('ended', () => nextBtn.click());

// ====== ПЕРЕТАСКИВАНИЕ СПИСКА ======
let isDown = false;
let startY;
let scrollTop;

playlist.addEventListener('mousedown', (e) => {
  isDown = true;
  playlist.style.cursor = 'grabbing';
  startY = e.pageY - playlist.offsetTop;
  scrollTop = playlist.scrollTop;
});

playlist.addEventListener('mouseleave', () => {
  isDown = false;
  playlist.style.cursor = 'grab';
});

playlist.addEventListener('mouseup', () => {
  isDown = false;
  playlist.style.cursor = 'grab';
});

playlist.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const y = e.pageY - playlist.offsetTop;
  const walk = (y - startY) * 1.5;
  playlist.scrollTop = scrollTop - walk;
});

// ====== ИНИЦИАЛИЗАЦИЯ ======
renderPlaylist();
loadTrack(0);

// =========================================
// ===== ДОБАВЛЕНИЕ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ =====
// =========================================

// Переменные для тач-событий
let touchStartY = 0;
let touchScrollTop = 0;
let isTouchDown = false;
let touchMoved = false;

// 1. Начало касания
playlist.addEventListener('touchstart', (e) => {
  isTouchDown = true;
  touchMoved = false; // Сбрасываем флаг движения
  touchStartY = e.touches[0].pageY - playlist.offsetTop;
  touchScrollTop = playlist.scrollTop;
}, { passive: true });

// 2. Движение пальцем
playlist.addEventListener('touchmove', (e) => {
  if (!isTouchDown) return;
  const y = e.touches[0].pageY - playlist.offsetTop;
  const walk = (y - touchStartY) * 1.5; // Коэффициент скорости
  
  // Если палец сдвинулся больше чем на 5 пикселей, значит это скролл, а не клик
  if (Math.abs(walk) > 5) {
    touchMoved = true;
  }
  
  playlist.scrollTop = touchScrollTop - walk;
}, { passive: true });

// 3. Отрыв пальца
playlist.addEventListener('touchend', () => {
  isTouchDown = false;
});

// 4. Блокировка клика при скролле
// Перехватываем клик на фазе погружения (capture: true), чтобы он не дошел до твоего li
playlist.addEventListener('click', (e) => {
  if (touchMoved) {
    e.preventDefault();
    e.stopPropagation();
    touchMoved = false; // Сбрасываем после блокировки
  }
}, true);