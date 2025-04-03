
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;
let snake;
let food;
let score = 0;
let gameLoop;
let digesting = false;
let digestIndex = 0;

function restartGame() {
  document.location.reload();
}

function setup() {
  snake = new Snake();
  food = randomFood();
  score = 0;
  document.getElementById('score').innerText = `Score: ${score}`;
  gameLoop = window.setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.update();
    snake.draw();
    drawFood(food.x, food.y);

    if (snake.eat(food)) {
      food = randomFood();
      score++;
      digesting = true;
      digestIndex = 0;
      document.getElementById('score').innerText = `Score: ${score}`;
    }

    if (digesting) {
      drawDigest();
    }

    if (snake.checkCollision()) {
      endGame();
    }
  }, 150);
}

window.addEventListener('keydown', (evt) => {
  const direction = evt.key.replace('Arrow', '');
  snake.changeDirection(direction);
});

function randomFood() {
  return {
    x: Math.floor(Math.random() * columns) * scale,
    y: Math.floor(Math.random() * rows) * scale,
  };
}

function drawFood(x, y) {
  ctx.fillStyle = '#ff3c3c';
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 2);
  ctx.bezierCurveTo(x + 13, y - 5, x + 17, y - 5, x + 18, y + 2);
  ctx.bezierCurveTo(x + 22, y + 5, x + 19, y + 15, x + 10, y + 18);
  ctx.bezierCurveTo(x + 1, y + 15, x - 2, y + 5, x + 2, y + 2);
  ctx.bezierCurveTo(x + 3, y - 5, x + 7, y - 5, x + 10, y + 2);
  ctx.fill();
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(x + 8, y - 3, 4, 6);
}

function drawAlienHead(x, y) {
  ctx.fillStyle = '#7eff2f';
  ctx.fillRect(x, y, scale, scale);

  ctx.fillStyle = 'black';
  ctx.fillRect(x + 4, y + 6, 4, 4);
  ctx.fillRect(x + 12, y + 6, 4, 4);

  ctx.fillStyle = '#ff3c3c';
  ctx.fillRect(x + 8, y - 8, 4, 8);
  ctx.fillRect(x + 6, y - 10, 2, 2);
  ctx.fillRect(x + 12, y - 10, 2, 2);
}

function drawDigest() {
  if (digestIndex < snake.tail.length) {
    const part = snake.tail[digestIndex];
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(part.x + scale / 2, part.y + scale / 2, 4, 0, 2 * Math.PI);
    ctx.fill();
    digestIndex++;
  } else {
    digesting = false;
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
      ctx.lineWidth = 1;
      ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
      ctx.strokeRect(this.tail[i].x, this.tail[i].y, scale, scale);
    }
    drawAlienHead(this.x, this.y);
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
    if (this.x >= canvas.width || this.x < 0 || this.y >= canvas.height || this.y < 0) {
      return true;
    }
    return false;
  };
}

function endGame() {
  clearInterval(gameLoop);
  document.getElementById('game-over').classList.remove('hidden');
}

setup();
