// ─────────────────────────────────────────────
// Configuração do Canvas (responsivo)
// ─────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const COLS = 20; // número de colunas fixo
const ROWS = 20; // número de linhas fixo
let CELL;        // tamanho de cada célula em px (calculado dinamicamente)

/**
 * Calcula o maior tamanho de célula que cabe no viewport,
 * respeitando o espaço ocupado pela UI ao redor do canvas.
 */
function calcCanvasSize() {
    const UI_HEIGHT = 180; // altura estimada de h1 + placar + controles + speed-info
    const maxW = Math.min(window.innerWidth - 24, 480);
    const maxH = Math.min(window.innerHeight - UI_HEIGHT, 480);
    const size = Math.max(200, Math.min(maxW, maxH));  // mínimo 200px
    CELL = Math.floor(size / COLS);                     // célula inteira para evitar borrão
    canvas.width = CELL * COLS;
    canvas.height = CELL * ROWS;
}

// ─────────────────────────────────────────────
// Estado do Jogo
// ─────────────────────────────────────────────
let snake, dir, nextDir, food, score, level, gameLoop, running;

let best = parseInt(localStorage.getItem('snakeBest') || '0');
document.getElementById('best').textContent = best;

// ─────────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────────
function init() {
    calcCanvasSize(); // recalcula canvas antes de começar
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    level = 1;
    running = true;
    placeFood();
    updateUI();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, getSpeed());
}

// ─────────────────────────────────────────────
// Velocidade (aumenta a cada level)
// ─────────────────────────────────────────────
function getSpeed() {
    return Math.max(80, 200 - (level - 1) * 20);
}

// ─────────────────────────────────────────────
// Posicionamento da Comida
// ─────────────────────────────────────────────
function placeFood() {
    do {
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
}

// ─────────────────────────────────────────────
// Loop Principal do Jogo (tick)
// ─────────────────────────────────────────────
function tick() {
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Colisão com paredes
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return die();

    // Colisão com o próprio corpo
    if (snake.some(s => s.x === head.x && s.y === head.y)) return die();

    snake.unshift(head);

    // Comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score++;

        // Atualiza recorde
        if (score > best) {
            best = score;
            localStorage.setItem('snakeBest', best);
        }

        // Sobe de nível a cada 5 pontos
        if (score % 5 === 0) {
            level++;
            clearInterval(gameLoop);
            gameLoop = setInterval(tick, getSpeed());
        }

        placeFood();
    } else {
        snake.pop();
    }

    updateUI();
    draw();
}

// ─────────────────────────────────────────────
// Fim de Jogo
// ─────────────────────────────────────────────
function die() {
    clearInterval(gameLoop);
    running = false;

    document.getElementById('overlay-title').textContent = 'GAME OVER';
    document.getElementById('overlay-sub').textContent = 'SUA PONTUAÇÃO FINAL';
    document.getElementById('overlay-score').textContent = score;
    document.getElementById('overlay-score').style.display = 'block';
    document.getElementById('start-btn').textContent = 'JOGAR NOVAMENTE';
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('best').textContent = best;
}

// ─────────────────────────────────────────────
// Atualização do Placar (HUD)
// ─────────────────────────────────────────────
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('best').textContent = best;
    document.getElementById('level').textContent = level;
}

// ─────────────────────────────────────────────
// Renderização (Canvas 2D)
// ─────────────────────────────────────────────
function draw() {
    // Fundo
    ctx.fillStyle = '#070d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade decorativa
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(canvas.width, j * CELL); ctx.stroke();
    }

    // Comida com efeito de brilho (glow)
    ctx.shadowColor = '#ff4466';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff4466';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Corpo da cobra (gradiente + brilho na cabeça)
    snake.forEach((seg, i) => {
        const ratio = 1 - i / snake.length;
        const g = ctx.createLinearGradient(
            seg.x * CELL, seg.y * CELL,
            seg.x * CELL + CELL, seg.y * CELL + CELL
        );
        g.addColorStop(0, `rgba(0,255,136,${0.4 + ratio * 0.6})`);
        g.addColorStop(1, `rgba(0,204,255,${0.4 + ratio * 0.6})`);

        ctx.shadowColor = i === 0 ? '#00ff88' : 'transparent';
        ctx.shadowBlur = i === 0 ? 12 : 0;
        ctx.fillStyle = g;
        ctx.beginPath();
        const radius = Math.max(2, Math.floor(CELL * 0.2)); // bordas arredondadas proporcionais
        ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, radius);
        ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Olhos na cabeça
    const h = snake[0];
    const eyeR = Math.max(1.5, CELL * 0.1);
    ctx.fillStyle = '#000';
    const ex = dir.x !== 0 ? 0.3 : 0.2;
    const ey = dir.y !== 0 ? 0.3 : 0.2;
    ctx.beginPath();
    ctx.arc(h.x * CELL + CELL * (0.5 + dir.x * 0.2 - dir.y * ex),
        h.y * CELL + CELL * (0.5 + dir.y * 0.2 - dir.x * ey), eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(h.x * CELL + CELL * (0.5 + dir.x * 0.2 + dir.y * ex),
        h.y * CELL + CELL * (0.5 + dir.y * 0.2 + dir.x * ey), eyeR, 0, Math.PI * 2);
    ctx.fill();
}

// ─────────────────────────────────────────────
// Redimensionamento da janela
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
    calcCanvasSize();
    // Redesenha o estado atual (fundo ou jogo em andamento)
    if (running) {
        draw();
    } else {
        ctx.fillStyle = '#070d14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
});

// ─────────────────────────────────────────────
// Controles — Teclado
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (!running) return;
    if (e.key === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 };
    // Previne scrollbar das setas no mobile
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
});

// ─────────────────────────────────────────────
// Controles — Botões Mobile (touch)
// ─────────────────────────────────────────────
document.getElementById('btn-up').addEventListener('click', () => { if (running && dir.y !== 1) nextDir = { x: 0, y: -1 }; });
document.getElementById('btn-down').addEventListener('click', () => { if (running && dir.y !== -1) nextDir = { x: 0, y: 1 }; });
document.getElementById('btn-left').addEventListener('click', () => { if (running && dir.x !== 1) nextDir = { x: -1, y: 0 }; });
document.getElementById('btn-right').addEventListener('click', () => { if (running && dir.x !== -1) nextDir = { x: 1, y: 0 }; });

// ─────────────────────────────────────────────
// Swipe no Canvas (mobile)
// ─────────────────────────────────────────────
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
    if (!running) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // tap sem movimento

    if (Math.abs(dx) > Math.abs(dy)) {
        // movimento horizontal
        if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
        if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
    } else {
        // movimento vertical
        if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
        if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
    }
    e.preventDefault();
}, { passive: false });

// ─────────────────────────────────────────────
// Botão Iniciar / Reiniciar
// ─────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('overlay-score').style.display = 'none';
    init();
    draw();
});

// ─────────────────────────────────────────────
// Desenho inicial (tela de espera)
// ─────────────────────────────────────────────
calcCanvasSize();
ctx.fillStyle = '#070d14';
ctx.fillRect(0, 0, canvas.width, canvas.height);
