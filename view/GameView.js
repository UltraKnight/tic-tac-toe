// @name         Tic Tac Toe Game
// @version      1.0
// @description  A simple Tic Tac Toe game
// @author        Vanderlei Martins

import { Players } from '../model/GameState.js';
const PLAYER_1_CELL_CLASS = 'primary';
const PLAYER_2_CELL_CLASS = 'secondary';

export class GameView {
  constructor({
    onCellClick,
    onUsePower,
    onGameOver,
    onPlayAgain,
    onStartGame,
    playAudio,
    onDocumentVisible,
    onDocumentHidden,
  }) {
    this.gameAreaEl = document.querySelector('.game-area');
    this.boardEl = document.querySelector('tbody');
    this.powersEl = document.querySelector('.powers-row');
    this.winnerMarkerEl = document.querySelector('.winner-marker');
    this.p1InputEl = document.getElementById('player1-name');
    this.p2InputEl = document.getElementById('player2-name');
    this.p1LabelEl = document.getElementById('player1-label');
    this.p2LabelEl = document.getElementById('player2-label');
    this.startDialog = document.getElementById('start-dialog');
    this.gameOverDialog = document.getElementById('gameover-dialog');
    this.startGameButtons = document.querySelectorAll('.start-button');
    this.playAgainButton = document.getElementById('play-again-button');
    this.leftArrowEl = document.querySelector('#leftArrow');
    this.rightArrowEl = document.querySelector('#rightArrow');
    this.onCellClick = onCellClick;
    this.onUsePower = onUsePower;
    this.onGameOver = onGameOver;
    this.onPlayAgain = onPlayAgain;
    this.playAudio = playAudio;
    this.onStartGame = onStartGame;
    this.onDocumentHidden = onDocumentHidden;
    this.onDocumentVisible = onDocumentVisible;

    this.handleCellClick = this.handleCellClick.bind(this);
    this.usePower = this.usePower.bind(this);
    this.playAgain = this.playAgain.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

    this.bindPermanentEvents();
  }

  handleCellClick(e) {
    const cell = e.target.closest('td');
    if (!cell) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    if (cell.textContent) return;
    this.onCellClick(row, col);
  }

  togglePlayerArrow() {
    this.leftArrowEl.classList.toggle('hidden');
    this.rightArrowEl.classList.toggle('hidden');
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.onDocumentHidden();
    } else {
      this.onDocumentVisible();
    }
  }

  bindPermanentEvents() {
    this.p1InputEl.addEventListener('input', (e) => {
      this.p1LabelEl.textContent = `${e.target.value || 'O'}: 0`;
    });

    this.p2InputEl.addEventListener('input', (e) => {
      this.p2LabelEl.textContent = `${e.target.value || 'X'}: 0`;
    });

    this.startGameButtons.forEach((button) => {
      button.addEventListener('click', this.handleStartGame);
    });
    this.playAgainButton.addEventListener('click', this.playAgain);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
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

  updateBoard(rowIndex, colIndex, value, { className: animationClassName, transitionalValue } = {}) {
    const cell = this.boardEl.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);

    if (!cell) return;

    cell.textContent = transitionalValue ?? value ?? '';

    // is player movement
    if ((value === Players.X || value === Players.O) && !(transitionalValue || animationClassName)) {
      cell.classList.toggle(value === Players.O ? PLAYER_1_CELL_CLASS : PLAYER_2_CELL_CLASS);
      cell.classList.add('animate');
      cell.classList.remove('explode');
    } else if (animationClassName) {
      cell.className = '';
      value !== '' && cell.classList.add(value === Players.O ? PLAYER_1_CELL_CLASS : PLAYER_2_CELL_CLASS);

      requestAnimationFrame(() => {
        cell.classList.add(animationClassName);
      });

      // is powerup
      cell.addEventListener(
        'animationend',
        () => {
          cell.textContent = value || '';
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
        if (value === Players.O || value === Players.X) {
          requestAnimationFrame(() => {
            const playerClassName = value === Players.O ? PLAYER_1_CELL_CLASS : PLAYER_2_CELL_CLASS;
            cell.className = `${playerClassName} animate`;
          });
        }
      });
    });

    if (isNewGame) {
      document.querySelector('button').setAttribute('style', 'display: none');
      this.powersEl.querySelectorAll('img').forEach((img) => {
        img.classList.add('active');
      });
      this.gameOverDialog.close();
      this.winnerMarkerEl.className = 'winner-marker';
    }
  }

  handleStartGame() {
    console.log('Game::Start');
    this.startDialog.close();
    this.gameAreaEl.classList.remove('hidden');
    this.onStartGame();
  }

  playAgain() {
    this.gameAreaEl.classList.remove('hidden');
    this.onPlayAgain();
  }

  updateScore(player, score) {
    if (player === Players.O) {
      this.p1LabelEl.textContent = `${this.p1InputEl.value}: ${score}`;
    } else if (player === Players.X) {
      this.p2LabelEl.textContent = `${this.p2InputEl.value}: ${score}`;
    }

    const currentScoreEl = this.gameOverDialog.querySelector('.current-score');
    currentScoreEl.textContent = this.p1LabelEl.textContent + ' | ' + this.p2LabelEl.textContent;
  }

  resetScore(players) {
    this.p1LabelEl.textContent = `${this.p1InputEl.value}: ${players[Players.O].score}`;
    this.p2LabelEl.textContent = `${this.p2InputEl.value}: ${players[Players.X].score}`;
  }

  setWinnerMarkerClass = (classToAdd) => {
    this.winnerMarkerEl.classList.add(classToAdd);
  };

  getWinMessage(winner) {
    const winnerName = winner?.symbol === Players.O ? this.p1InputEl.value || 'O' : this.p2InputEl.value || 'X';
    let message = winner ? `${winnerName} venceu!` : 'Empate!';

    return message;
  }

  showGameOver(winner, winPosition) {
    const winnerEl = this.gameOverDialog.querySelector('.winner');
    winnerEl.textContent = this.getWinMessage(winner);
    this.setWinnerMarkerClass(winPosition);
    setTimeout(
      () => {
        this.gameAreaEl.classList.add('hidden');
        this.gameOverDialog.showModal();
      },
      winner ? 1500 : 100,
    );
  }
}
