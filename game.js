// 游戏状态管理
let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    levelUpShown: {},
    isGameOver: false,
    isPaused: false,
    currentMonster: null,
    currentProblem: null,
    cannonballs: [],
    gameInterval: null,
    spawnInterval: null,
    countdownInterval: null
};

// 关卡配置
const levelConfig = {
    1: { maxSum: 10, maxNum: 9, name: '第一关' },
    2: { maxSum: 20, maxNum: 19, name: '第二关' },
    3: { maxSum: 100, maxNum: 99, name: '第三关' }
};

// 怪物表情数组
const monsterEmojis = ['👾', '👻', '👽', '🤖', '🦄', '🐸', '🐯', '🦁', '🐸', '🦊'];

// 音频控制函数
const audioManager = {
    bgMusic: null,
    hitSound: null,
    errorSound: null,
    levelUpSound: null,
    gameCompleteSound: null,
    urgentSound: null,
    gameOverSound: null,
    
    init() {
        this.bgMusic = document.getElementById('bgMusic');
        this.hitSound = document.getElementById('hitSound');
        this.errorSound = document.getElementById('errorSound');
        this.levelUpSound = document.getElementById('levelUpSound');
        this.gameCompleteSound = document.getElementById('gameCompleteSound');
        this.urgentSound = document.getElementById('urgentSound');
        this.gameOverSound = document.getElementById('gameOverSound');
    },
    
    playBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.volume = 0.3;
            this.bgMusic.play().catch(e => console.log('背景音乐播放失败:', e));
        }
    },
    
    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
    },
    
    playHitSound() {
        if (this.hitSound) {
            this.hitSound.currentTime = 0;
            this.hitSound.play().catch(e => console.log('击中音效播放失败:', e));
        }
    },
    
    playErrorSound() {
        if (this.errorSound) {
            this.errorSound.currentTime = 0;
            this.errorSound.play().catch(e => console.log('错误音效播放失败:', e));
        }
    },
    
    playLevelUpSound() {
        if (this.levelUpSound) {
            this.levelUpSound.currentTime = 0;
            this.levelUpSound.play().catch(e => console.log('升级音效播放失败:', e));
        }
    },
    
    playGameCompleteSound() {
        if (this.gameCompleteSound) {
            this.gameCompleteSound.currentTime = 0;
            this.gameCompleteSound.play().catch(e => console.log('通关音效播放失败:', e));
        }
    },
    
    playUrgentSound() {
        if (this.urgentSound) {
            this.urgentSound.currentTime = 0;
            this.urgentSound.play().catch(e => console.log('紧迫音效播放失败:', e));
        }
    },
    
    playGameOverSound() {
        if (this.gameOverSound) {
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play().catch(e => console.log('失败音效播放失败:', e));
        }
    }
};

// 初始化游戏
function initGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.isGameOver = false;
    gameState.currentMonster = null;
    gameState.currentProblem = null;
    gameState.cannonballs = [];
    
    // 初始化音频管理器
    audioManager.init();
    
    updateScoreDisplay();
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('countdownNumber').textContent = '--';
    document.getElementById('answerInput').value = '';
    
    // 清除游戏区域
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    
    // 添加背景云朵
    addClouds();
    
    // 播放背景音乐
    audioManager.playBackgroundMusic();
    
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

// 生成数学题（根据当前关卡）
function generateMathProblem() {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const config = levelConfig[gameState.level];
    let num1, num2, answer;
    
    if (operation === '+') {
        // 加法：两个数相加不超过当前关卡最大和
        num1 = Math.floor(Math.random() * (config.maxNum + 1));
        num2 = Math.floor(Math.random() * (config.maxSum - num1 + 1));
        answer = num1 + num2;
    } else {
        // 减法：确保结果非负
        num1 = Math.floor(Math.random() * (config.maxNum + 1));
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
    // 清除之前的倒计时
    if (gameState.countdownInterval) {
        clearInterval(gameState.countdownInterval);
    }
    
    // 初始化倒计时显示
    updateCountdownDisplay();
    
    // 每秒更新倒计时
    gameState.countdownInterval = setInterval(() => {
        if (!gameState.currentMonster || gameState.isGameOver || gameState.isPaused) {
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
    const countdownNumber = document.getElementById('countdownNumber');
    
    if (!gameState.currentMonster) {
        countdownNumber.textContent = '--';
        return;
    }
    
    const remainingTime = gameState.currentMonster.remainingTime;
    countdownNumber.textContent = remainingTime;
    
    // 当时间少于5秒时，播放紧迫音效
    if (remainingTime <= 5 && remainingTime > 4) {
        audioManager.playUrgentSound();
    }
}

// 开始怪物降落
function startMonsterDescent() {
    if (!gameState.currentMonster) return;
    
    gameState.gameInterval = setInterval(() => {
        if (gameState.isGameOver || gameState.isPaused || !gameState.currentMonster) {
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
        document.getElementById('countdownNumber').textContent = '--';
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
        
        // 播放击中音效
        audioManager.playHitSound();
        
        // 显示得分动画
        showScorePopup(gameState.currentMonster.x, gameState.currentMonster.y);
        
        // 移除怪物和炮弹
        removeCurrentMonster();
        cannonball.remove();
        
        // 增加分数
        gameState.score += 10;
        updateScoreDisplay();
        
        // 检查是否需要升级关卡
        checkLevelUp();
    } else {
        // 答案错误，炮弹消失，显示气泡消息
        cannonball.remove();
        showBubbleMessage(gameState.currentMonster.x, gameState.currentMonster.y, '小朋友，答案不对哦');
        
        // 播放错误音效
        audioManager.playErrorSound();
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

// 暂停游戏
function pauseGame() {
    gameState.isPaused = true;
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.countdownInterval);
}

// 恢复游戏
function resumeGame() {
    gameState.isPaused = false;
    
    // 移除当前怪物（如果有）
    if (gameState.currentMonster) {
        removeCurrentMonster();
    }
    
    // 重新开始生成怪物
    startSpawningMonsters();
}

// 检查是否需要升级关卡
function checkLevelUp() {
    const nextLevel = gameState.level + 1;
    
    // 检查是否通关（第三关达到300分）
    if (gameState.level === 3 && gameState.score >= 300 && !gameState.levelUpShown['completed']) {
        gameState.levelUpShown['completed'] = true;
        showGameCompletedModal();
        return;
    }
    
    // 检查是否有下一关、分数达到升级要求且该关卡升级提示未显示过
    if (nextLevel <= 3 && gameState.score >= gameState.level * 100 && !gameState.levelUpShown[nextLevel]) {
        gameState.levelUpShown[nextLevel] = true;
        showLevelUpModal(nextLevel);
    }
}

// 显示关卡升级弹窗
function showLevelUpModal(nextLevel) {
    // 暂停游戏
    pauseGame();
    
    // 播放升级音效
    audioManager.playLevelUpSound();
    
    const modal = document.createElement('div');
    modal.className = 'level-up-modal';
    modal.innerHTML = `
        <div class="level-up-content">
            <h2>🎉 恭喜升级！🎉</h2>
            <p>你已经获得 ${gameState.score} 分！</p>
            <p>准备好进入 ${levelConfig[nextLevel].name} 了吗？</p>
            <p class="level-info">难度：${levelConfig[nextLevel].maxSum} 以内的加减法</p>
            <div class="level-up-buttons">
                <button class="level-up-btn" id="confirmLevelUp">🚀 开始新关卡</button>
                <button class="stay-btn" id="stayCurrentLevel">🎮 留在当前关卡</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 绑定按钮事件
    document.getElementById('confirmLevelUp').addEventListener('click', () => {
        gameState.level = nextLevel;
        updateScoreDisplay();
        modal.remove();
        // 恢复游戏并生成新题目
        resumeGame();
    });
    
    document.getElementById('stayCurrentLevel').addEventListener('click', () => {
        // 清零分数
        gameState.score = 0;
        updateScoreDisplay();
        
        // 重置当前关卡的升级提示标记，允许再次触发
        gameState.levelUpShown[gameState.level + 1] = false;
        
        modal.remove();
        // 恢复游戏并生成新题目
        resumeGame();
    });
}

// 显示通关弹窗
function showGameCompletedModal() {
    // 暂停游戏
    pauseGame();
    
    // 播放通关音效
    audioManager.playGameCompleteSound();
    
    // 停止背景音乐
    audioManager.stopBackgroundMusic();
    
    const modal = document.createElement('div');
    modal.className = 'game-completed-modal';
    modal.innerHTML = `
        <div class="game-completed-content">
            <h2>🏆 恭喜通关！🏆</h2>
            <p>你已经完成了所有关卡！</p>
            <p>最终得分: ${gameState.score} 分</p>
            <p class="achievement">你真棒！🌟</p>
            <div class="completed-buttons">
                <button class="restart-btn-large" id="restartGameBtn">🔄 重新开始</button>
                <button class="exit-btn" id="exitGameBtn">🚪 退出游戏</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 绑定按钮事件
    document.getElementById('restartGameBtn').addEventListener('click', () => {
        modal.remove();
        restartGame();
    });
    
    document.getElementById('exitGameBtn').addEventListener('click', () => {
        exitGame();
    });
}

// 退出游戏
function exitGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.countdownInterval);
    
    // 移除所有弹窗
    const modals = document.querySelectorAll('.level-up-modal, .game-completed-modal');
    modals.forEach(modal => modal.remove());
    
    // 显示退出游戏提示
    const exitMessage = document.createElement('div');
    exitMessage.className = 'exit-message';
    exitMessage.innerHTML = `
        <h2>👋 感谢游玩！👋</h2>
        <p>下次再见！</p>
    `;
    document.body.appendChild(exitMessage);
}

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = levelConfig[gameState.level].name;
}

// 结束游戏
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.countdownInterval);
    
    // 播放游戏失败音效
    audioManager.playGameOverSound();
    
    // 停止背景音乐
    audioManager.stopBackgroundMusic();
    
    // 显示游戏结束弹窗
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOverModal').style.display = 'flex';
}

// 重新开始游戏
function restartGame() {
    gameState.levelUpShown = {};
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
