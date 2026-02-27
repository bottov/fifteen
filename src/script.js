import { sdk } from '@farcaster/frame-sdk';

class PuzzleGame {
    constructor() {
        this.board = [];
        this.size = 4;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isPlaying = false;
        
        // DOM элементы
        this.gameBoard = document.getElementById('gameBoard');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        
        // Инициализация
        this.initializeBoard();
        this.setupEventListeners();
        
        // Автоматический запуск игры
        this.shuffleBoard();
    }
    
    initializeBoard() {
        this.board = Array.from({length: this.size * this.size}, (_, i) => i + 1);
        this.board[this.board.length - 1] = 0; // Пустая клетка
        this.renderBoard();
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.board.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = `tile ${value === 0 ? 'empty' : ''}`;
            tile.textContent = value || '';
            tile.dataset.index = index;
            this.gameBoard.appendChild(tile);
        });
    }
    
    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (!tile || tile.classList.contains('empty')) return;
            
            const index = parseInt(tile.dataset.index);
            if (this.canMove(index)) {
                this.moveTile(index);
                this.moves++;
                this.movesDisplay.textContent = this.moves;
                
                if (!this.isPlaying) {
                    this.startTimer();
                }
                
                if (this.checkWin()) {
                    this.handleWin();
                }
            }
        });
        
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.shuffleBtn.addEventListener('click', () => this.shuffleBoard());
    }
    
    canMove(index) {
        const emptyIndex = this.board.indexOf(0);
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        const emptyRow = Math.floor(emptyIndex / this.size);
        const emptyCol = emptyIndex % this.size;
        
        return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
               (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    }
    
    moveTile(index) {
        const emptyIndex = this.board.indexOf(0);
        [this.board[index], this.board[emptyIndex]] = [this.board[emptyIndex], this.board[index]];
        this.renderBoard();
    }
    
    shuffleBoard() {
        // Показываем индикатор загрузки
        this.gameBoard.innerHTML = '<div class="loading">Shuffling...</div>';
        
        // Даем время для отображения индикатора
        setTimeout(() => {
            for (let i = this.board.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
            }
            
            // Проверяем, что головоломка решаема
            if (!this.isSolvable()) {
                this.shuffleBoard();
                return;
            }
            
            this.renderBoard();
            this.moves = 0;
            this.movesDisplay.textContent = this.moves;
            this.resetTimer();
        }, 500);
    }
    
    isSolvable() {
        let inversions = 0;
        const boardWithoutEmpty = this.board.filter(x => x !== 0);
        
        for (let i = 0; i < boardWithoutEmpty.length - 1; i++) {
            for (let j = i + 1; j < boardWithoutEmpty.length; j++) {
                if (boardWithoutEmpty[i] > boardWithoutEmpty[j]) {
                    inversions++;
                }
            }
        }
        
        const emptyRow = Math.floor(this.board.indexOf(0) / this.size);
        return (this.size % 2 === 1) ? (inversions % 2 === 0) : ((inversions + emptyRow) % 2 === 0);
    }
    
    checkWin() {
        return this.board.every((value, index) => {
            if (index === this.board.length - 1) return value === 0;
            return value === index + 1;
        });
    }
    
    handleWin() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        this.gameBoard.classList.add('win');
        setTimeout(() => {
            alert(`Поздравляем! Вы решили головоломку за ${this.moves} ходов и ${this.formatTime(this.timer)}!`);
            this.gameBoard.classList.remove('win');
        }, 500);
    }
    
    startTimer() {
        this.isPlaying = true;
        this.timer = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    resetTimer() {
        clearInterval(this.timerInterval);
        this.timer = 0;
        this.updateTimerDisplay();
        this.isPlaying = false;
    }
    
    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.timer);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    startNewGame() {
        this.initializeBoard();
        this.moves = 0;
        this.movesDisplay.textContent = this.moves;
        this.resetTimer();
    }
}

// Запуск игры после полной загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    const game = new PuzzleGame();
    (async () => {
      await sdk.actions.ready();
    })();
}); 
