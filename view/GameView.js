// @name         Tic Tac Toe Game
// @version      1.0
// @description  A simple Tic Tac Toe game
// @author        Vanderlei Martins

import { Players } from '../model/GameState.js';

export class GameView {
  constructor({ onCellClick, onUsePower, onGameOver, onPlayAgain, playAudio }) {
    this.boardEl = document.querySelector('tbody');
    this.powersEl = document.querySelector('.powers-row');
    this.gameOverEl = document.querySelector('.gameover');
    this.winnerMarkerEl = document.querySelector('.winner-marker');
    this.onCellClick = onCellClick;
    this.onUsePower = onUsePower;
    this.onGameOver = onGameOver;
    this.onPlayAgain = onPlayAgain;
    this.playAudio = playAudio;
    this.handleCellClick = this.handleCellClick.bind(this);
    this.usePower = this.usePower.bind(this);
    this.playAgain = this.playAgain.bind(this);
  }

  handleCellClick(e) {
    const cell = e.target.closest('td');
    if (!cell) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (cell.textContent) return;
    this.onCellClick(row, col);
  }

  bindEvents() {
    this.powersEl.addEventListener('click', this.usePower);
    this.boardEl.addEventListener('click', this.handleCellClick);
    this.boardEl.addEventListener('click', this.playAudio, { once: true });
  }

  unbindEvents() {
    this.powersEl.removeEventListener('click', this.usePower);
    this.boardEl.removeEventListener('click', this.handleCellClick);
  }

  updateBoard(rowIndex, colIndex, value) {
    const cell = this.boardEl.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);

    if (!cell) return;

    cell.textContent = value ?? '';

    // is player movement
    if (value === Players.X || value === Players.O) {
      cell.classList.toggle(value === Players.X ? 'primary' : 'secondary');
      cell.classList.add('animate');
      cell.classList.remove('explode');
    } else {
      cell.classList.remove('primary', 'secondary', 'animate');
      cell.classList.add('explode');
      // is powerup
      cell.addEventListener(
        'animationend',
        () => {
          cell.textContent = '';
        },
        { once: true },
      );
    }
  }

  usePower(e) {
    const powerEl = e.target.closest('img');
    this.onUsePower(powerEl?.id);
  }

  updatePowersRow(powerId, isActive) {
    const powerEl = this.powersEl.querySelector(`#${powerId}`);
    if (powerEl) {
      if (isActive) {
        powerEl.classList.remove('active');
      } else {
        powerEl.classList.add('active');
      }
    }
  }

  render(board, isNewGame) {
    board.forEach((row, r) => {
      row.forEach((value, c) => {
        const cell = this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        cell.textContent = value ?? '';
        cell.className = '';
      });
    });

    if (isNewGame) {
      document.querySelector('button').setAttribute('style', 'display: none');
      this.powersEl.querySelectorAll('img').forEach((img) => {
        img.classList.add('active');
      });
      this.gameOverEl.classList.add('hidden');
      this.winnerMarkerEl.className = 'winner-marker';
    }
  }

  playAgain() {
    const playAgainBtn = document.querySelector('button');
    playAgainBtn.removeEventListener('click', this.playAgain);
    this.onPlayAgain();
  }

  setWinnerMarkerClass = (classToAdd) => {
    this.winnerMarkerEl.classList.add(classToAdd);
  };

  showGameOver(winner, winPosition) {
    const winnerEl = this.gameOverEl.lastElementChild;
    this.gameOverEl.classList.remove('hidden');
    winnerEl.textContent = winner ? `Jogador ${winner} venceu!` : 'EMPATE!';
    const playAgainBtn = document.querySelector('button');
    playAgainBtn.setAttribute('style', 'display: block');
    playAgainBtn.addEventListener('click', this.playAgain);
    this.setWinnerMarkerClass(winPosition);
  }
}
