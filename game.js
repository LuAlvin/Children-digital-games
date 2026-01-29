// 游戏状态管理
let gameState = {
    score: 0,
    lives: 3,
    isGameOver: false,
    currentMonster: null,
    currentProblem: null,
    cannonballs: [],
    gameInterval: null,
    spawnInterval: null,
    countdownInterval: null
};

// 怪物表情数组
const monsterEmojis = ['👾', '👻', '👽', '🤖', '🦄', '🐸', '🐯', '🦁', '🐸', '🦊'];

// 初始化游戏
function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.isGameOver = false;
    gameState.currentMonster = null;
    gameState.currentProblem = null;
    gameState.cannonballs = [];
    
    updateScoreDisplay();
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('countdownDisplay').querySelector('.countdown-text').textContent = '等待怪物出现...';
    document.getElementById('answerInput').value = '';
    
    // 清除游戏区域
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    
    // 添加背景云朵
    addClouds();
    
    // 开始生成怪物
    startSpawningMonsters();
}

// 添加背景云朵
function addClouds() {
    const gameArea = document.getElementById('gameArea');
    for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.textContent = '☁️';
        cloud.style.top = Math.random() * 100 + 'px';
        cloud.style.animationDelay = Math.random() * 20 + 's';
        gameArea.appendChild(cloud);
    }
}

// 开始生成怪物
function startSpawningMonsters() {
    spawnMonster();
    gameState.spawnInterval = setInterval(() => {
        if (!gameState.isGameOver && !gameState.currentMonster) {
            spawnMonster();
        }
    }, 3000);
}

// 生成怪物
function spawnMonster() {
    const gameArea = document.getElementById('gameArea');
    const monster = document.createElement('div');
    monster.className = 'monster';
    
    // 随机选择怪物表情
    const randomMonster = monsterEmojis[Math.floor(Math.random() * monsterEmojis.length)];
    monster.textContent = randomMonster;
    
    // 随机水平位置（留出边距）
    const maxX = gameArea.clientWidth - 100;
    const randomX = Math.random() * maxX + 50;
    monster.style.left = randomX + 'px';
    monster.style.top = '-100px';
    
    // 创建降落伞
    const parachute = document.createElement('div');
    parachute.className = 'parachute';
    parachute.innerHTML = `
        <div class="parachute-canvas"></div>
        <div class="parachute-strings"></div>
    `;
    parachute.style.left = randomX + 'px';
    parachute.style.top = '-150px';
    
    // 生成数学题
    const problem = generateMathProblem();
    gameState.currentProblem = problem;
    
    // 显示数学题在怪物旁边
    const problemDisplay = document.createElement('div');
    problemDisplay.className = 'math-problem-display';
    problemDisplay.textContent = problem.text;
    problemDisplay.style.left = randomX + 'px';
    
    // 添加到游戏区域
    gameArea.appendChild(parachute);
    gameArea.appendChild(monster);
    gameArea.appendChild(problemDisplay);
    
    // 计算落地时间（固定为12秒）
    const startY = -100;
    const groundLevel = gameArea.clientHeight - 80;
    const totalDistance = groundLevel - startY;
    const totalTime = 12; // 固定12秒落地
    const speed = totalDistance / (totalTime * 1000 / 50); // 根据时间计算速度
    
    // 保存当前怪物信息
    gameState.currentMonster = {
        element: monster,
        parachute: parachute,
        problemDisplay: problemDisplay,
        y: startY,
        x: randomX,
        speed: speed,
        totalTime: totalTime,
        remainingTime: totalTime
    };
    
    // 开始倒计时
    startCountdown();
    
    // 开始降落
    startMonsterDescent();
}

// 生成20以内的数学题
function generateMathProblem() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    if (operation === '+') {
        // 加法：两个数相加不超过20
        num1 = Math.floor(Math.random() * 11);
        num2 = Math.floor(Math.random() * (11 - num1));
        answer = num1 + num2;
    } else {
        // 减法：确保结果非负
        num1 = Math.floor(Math.random() * 11);
        num2 = Math.floor(Math.random() * (num1 + 1));
        answer = num1 - num2;
    }
    
    return {
        text: `${num1} ${operation} ${num2} = ?`,
        answer: answer
    };
}

// 开始倒计时
function startCountdown() {
    const countdownElement = document.getElementById('countdownDisplay').querySelector('.countdown-text');
    
    // 清除之前的倒计时
    if (gameState.countdownInterval) {
        clearInterval(gameState.countdownInterval);
    }
    
    // 初始化倒计时显示
    updateCountdownDisplay();
    
    // 每秒更新倒计时
    gameState.countdownInterval = setInterval(() => {
        if (!gameState.currentMonster || gameState.isGameOver) {
            clearInterval(gameState.countdownInterval);
            return;
        }
        
        gameState.currentMonster.remainingTime--;
        updateCountdownDisplay();
        
        if (gameState.currentMonster.remainingTime <= 0) {
            clearInterval(gameState.countdownInterval);
        }
    }, 1000);
}

// 更新倒计时显示
function updateCountdownDisplay() {
    const countdownElement = document.getElementById('countdownDisplay').querySelector('.countdown-text');
    
    if (!gameState.currentMonster) {
        countdownElement.textContent = '等待怪物出现...';
        countdownElement.classList.remove('urgent');
        return;
    }
    
    const remainingTime = gameState.currentMonster.remainingTime;
    countdownElement.textContent = `⏰ 怪物落地倒计时: ${remainingTime} 秒`;
    
    // 当时间少于5秒时，显示紧急状态
    if (remainingTime <= 5) {
        countdownElement.classList.add('urgent');
    } else {
        countdownElement.classList.remove('urgent');
    }
}

// 开始怪物降落
function startMonsterDescent() {
    if (!gameState.currentMonster) return;
    
    gameState.gameInterval = setInterval(() => {
        if (gameState.isGameOver || !gameState.currentMonster) {
            clearInterval(gameState.gameInterval);
            return;
        }
        
        // 更新怪物位置
        gameState.currentMonster.y += gameState.currentMonster.speed;
        
        const monster = gameState.currentMonster.element;
        const parachute = gameState.currentMonster.parachute;
        const problemDisplay = gameState.currentMonster.problemDisplay;
        
        monster.style.top = gameState.currentMonster.y + 'px';
        parachute.style.top = (gameState.currentMonster.y - 50) + 'px';
        problemDisplay.style.top = (gameState.currentMonster.y + 100) + 'px';
        
        // 检查是否落地
        const gameArea = document.getElementById('gameArea');
        const groundLevel = gameArea.clientHeight - 80;
        
        if (gameState.currentMonster.y >= groundLevel) {
            // 怪物落地，游戏结束
            monsterLanded();
        }
    }, 50); // 每50毫秒更新一次位置
}

// 怪物落地处理
function monsterLanded() {
    clearInterval(gameState.gameInterval);
    
    // 显示爆炸效果
    showExplosion(gameState.currentMonster.x, gameState.currentMonster.y);
    
    // 移除怪物
    removeCurrentMonster();
    
    // 扣除生命值
    gameState.lives--;
    updateScoreDisplay();
    
    // 检查游戏是否结束
    if (gameState.lives <= 0) {
        endGame();
    }
}

// 显示爆炸效果
function showExplosion(x, y) {
    const gameArea = document.getElementById('gameArea');
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.textContent = '💥';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    gameArea.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

// 移除当前怪物
function removeCurrentMonster() {
    if (gameState.currentMonster) {
        gameState.currentMonster.element.remove();
        gameState.currentMonster.parachute.remove();
        gameState.currentMonster.problemDisplay.remove();
        gameState.currentMonster = null;
        gameState.currentProblem = null;
        
        // 清除倒计时
        if (gameState.countdownInterval) {
            clearInterval(gameState.countdownInterval);
        }
        
        // 重置倒计时显示
        const countdownElement = document.getElementById('countdownDisplay').querySelector('.countdown-text');
        countdownElement.textContent = '等待怪物出现...';
        countdownElement.classList.remove('urgent');
    }
}

// 发射炮弹
function fireCannonball() {
    if (gameState.isGameOver || !gameState.currentProblem) {
        return;
    }
    
    const answerInput = document.getElementById('answerInput');
    const playerAnswer = parseInt(answerInput.value);
    
    if (isNaN(playerAnswer)) {
        alert('请输入数字答案！');
        return;
    }
    
    // 创建炮弹
    const gameArea = document.getElementById('gameArea');
    const cannonball = document.createElement('div');
    cannonball.className = 'cannonball';
    
    // 炮弹起始位置（大炮位置）
    const startX = gameArea.clientWidth / 2 - 15;
    const startY = gameArea.clientHeight - 30;
    
    cannonball.style.left = startX + 'px';
    cannonball.style.top = startY + 'px';
    
    gameArea.appendChild(cannonball);
    
    // 计算目标位置（如果有怪物，瞄准怪物；否则向上发射）
    let targetX, targetY;
    if (gameState.currentMonster) {
        targetX = gameState.currentMonster.x;
        targetY = gameState.currentMonster.y;
    } else {
        targetX = startX;
        targetY = 0;
    }
    
    // 发射炮弹动画
    animateCannonball(cannonball, startX, startY, targetX, targetY, playerAnswer);
    
    // 清空输入框
    answerInput.value = '';
}

// 炮弹动画
function animateCannonball(cannonball, startX, startY, targetX, targetY, answer) {
    const duration = 500; // 0.5秒到达目标（加快速度）
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 线性插值
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;
        
        cannonball.style.left = currentX + 'px';
        cannonball.style.top = currentY + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 炮弹到达目标
            checkHit(cannonball, answer);
        }
    }
    
    animate();
}

// 检查是否击中怪物
function checkHit(cannonball, answer) {
    if (!gameState.currentMonster) {
        cannonball.remove();
        return;
    }
    
    // 检查答案是否正确
    if (answer === gameState.currentProblem.answer) {
        // 答案正确，击中怪物
        clearInterval(gameState.gameInterval);
        
        // 显示得分动画
        showScorePopup(gameState.currentMonster.x, gameState.currentMonster.y);
        
        // 移除怪物和炮弹
        removeCurrentMonster();
        cannonball.remove();
        
        // 增加分数
        gameState.score += 10;
        updateScoreDisplay();
    } else {
        // 答案错误，炮弹消失，显示气泡消息
        cannonball.remove();
        showBubbleMessage(gameState.currentMonster.x, gameState.currentMonster.y, '小朋友，答案不对哦');
    }
}

// 显示得分动画
function showScorePopup(x, y) {
    const gameArea = document.getElementById('gameArea');
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+10';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    gameArea.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// 显示气泡消息
function showBubbleMessage(x, y, message) {
    const gameArea = document.getElementById('gameArea');
    const bubble = document.createElement('div');
    bubble.className = 'bubble-message';
    bubble.textContent = message;
    bubble.style.left = x + 'px';
    bubble.style.top = (y - 60) + 'px';
    gameArea.appendChild(bubble);
    
    setTimeout(() => {
        bubble.remove();
    }, 2000);
}

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// 结束游戏
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.countdownInterval);
    
    // 显示游戏结束弹窗
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOverModal').style.display = 'flex';
}

// 重新开始游戏
function restartGame() {
    initGame();
}

// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 发射按钮点击事件
    document.getElementById('fireBtn').addEventListener('click', fireCannonball);
    
    // 回车键发射
    document.getElementById('answerInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fireCannonball();
        }
    });
    
    // 重新开始按钮
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // 初始化游戏
    initGame();
});
