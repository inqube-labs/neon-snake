
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;
let snake;
let food;
let score = 0;
let gameLoop;
let glowIndex = 0;
let glowActive = false;
let nextDirection = null;
let isDying = false;
let deathIndex = 0;

function setDirection(dir) {
  nextDirection = dir;
}

function restartGame() {
  document.location.reload();
}

function setup() {
  snake = new Snake();
  food = randomFood();
  score = 0;
  document.getElementById('score').innerText = `Score: ${score}`;
  gameLoop = window.setInterval(() => {
    if (nextDirection && !isDying) {
      snake.changeDirection(nextDirection);
      nextDirection = null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.update();
    snake.draw();
    drawFood(food.x, food.y);

    if (snake.eat(food)) {
      food = randomFood();
      score++;
      glowActive = true;
      glowIndex = 0;
      document.getElementById('score').innerText = `Score: ${score}`;
    }

    if (glowActive) drawGlow();

    if (!isDying && snake.checkCollision()) {
      isDying = true;
      clearInterval(gameLoop);
      animateDeath();
    }
  }, 150);
}

function animateDeath() {
  const deathAnim = setInterval(() => {
    if (deathIndex < snake.tail.length) {
      const part = snake.tail[snake.tail.length - 1 - deathIndex];
      ctx.clearRect(part.x, part.y, scale, scale);
      deathIndex++;
    } else {
      ctx.clearRect(snake.x, snake.y, scale, scale);
      clearInterval(deathAnim);
      document.getElementById('game-over').classList.remove('hidden');
    }
  }, 100);
}

window.onload = () => {
  setup();
  initSwipe();
};

window.addEventListener('keydown', (evt) => {
  const direction = evt.key.replace('Arrow', '');
  nextDirection = direction;
});

function initSwipe() {
  let startX, startY;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  });

  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      nextDirection = dx > 0 ? 'Right' : 'Left';
    } else {
      nextDirection = dy > 0 ? 'Down' : 'Up';
    }
  });
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * columns) * scale,
    y: Math.floor(Math.random() * rows) * scale,
  };
}

function drawFood(x, y) {
  ctx.fillStyle = '#ff4d4d';
  ctx.beginPath();
  ctx.arc(x + scale / 2, y + scale / 2, scale / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(x + 8, y - 4, 4, 6);
}


function drawGlow() {
  if (glowIndex < snake.tail.length) {
    for (let i = 0; i < snake.tail.length; i++) {
      const part = snake.tail[i];
      ctx.fillStyle = i === glowIndex ? 'rgba(255,255,255,0.5)' : '#8800ff';
      ctx.fillRect(part.x, part.y, scale, scale);
    }
    glowIndex++;
  } else {
    glowActive = false;
    glowIndex = 0;
  }
}


function Snake() {
  this.x = 0;
  this.y = 0;
  this.xSpeed = scale;
  this.ySpeed = 0;
  this.tail = [];

  this.draw = function () {
    for (let i = 0; i < this.tail.length; i++) {
      ctx.fillStyle = '#8800ff';
      ctx.strokeStyle = '#cc99ff';
      ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
    }

    const mouthOpen = Math.abs(this.x - food.x) <= scale && Math.abs(this.y - food.y) <= scale;
    ctx.fillStyle = '#7eff2f';
    ctx.fillRect(this.x, this.y, scale, scale);

    ctx.fillStyle = 'black';
    ctx.fillRect(this.x + 4, this.y + 6, 4, 4);
    ctx.fillRect(this.x + 12, this.y + 6, 4, 4);

    if (mouthOpen) {
      ctx.fillStyle = '#ff3c3c';
      ctx.fillRect(this.x + 6, this.y + 14, 8, 4);
    }

    ctx.fillStyle = '#ff3c3c';
    ctx.fillRect(this.x + 8, this.y - 8, 4, 8);
    ctx.fillRect(this.x + 6, this.y - 10, 2, 2);
    ctx.fillRect(this.x + 12, this.y - 10, 2, 2);
  };

  this.update = function () {
    for (let i = this.tail.length - 1; i > 0; i--) {
      this.tail[i] = { ...this.tail[i - 1] };
    }
    if (this.tail.length) {
      this.tail[0] = { x: this.x, y: this.y };
    }
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  };

  this.changeDirection = function (direction) {
    switch (direction) {
      case 'Up':
        if (this.ySpeed === 0) {
          this.xSpeed = 0;
          this.ySpeed = -scale;
        }
        break;
      case 'Down':
        if (this.ySpeed === 0) {
          this.xSpeed = 0;
          this.ySpeed = scale;
        }
        break;
      case 'Left':
        if (this.xSpeed === 0) {
          this.xSpeed = -scale;
          this.ySpeed = 0;
        }
        break;
      case 'Right':
        if (this.xSpeed === 0) {
          this.xSpeed = scale;
          this.ySpeed = 0;
        }
        break;
    }
  };

  this.eat = function (food) {
    if (this.x === food.x && this.y === food.y) {
      this.tail.push({});
      return true;
    }
    return false;
  };

  this.checkCollision = function () {
    for (let i = 0; i < this.tail.length; i++) {
      if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
        return true;
      }
    }
    return this.x < 0 || this.y < 0 || this.x >= canvas.width || this.y >= canvas.height;
  };
}
