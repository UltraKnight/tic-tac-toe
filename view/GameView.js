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
    this.roundCounterEl = document.querySelector('.round-counter');
    this.startDialog = document.getElementById('start-dialog');
    this.gameOverDialog = document.getElementById('gameover-dialog');
    this.helpDialog = document.getElementById('help-dialog');
    this.startGameButtons = document.querySelectorAll('.start-button');
    this.playAgainButton = document.getElementById('play-again-button');
    this.helpButton = document.getElementById('help-button');
    this.leftArrowEl = document.getElementById('left-arrow');
    this.rightArrowEl = document.getElementById('right-arrow');
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
    this.openHelpDialog = this.openHelpDialog.bind(this);
    this.closeHelpDialog = this.closeHelpDialog.bind(this);

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

  updateRoundCounter(round) {
    this.roundCounterEl.textContent = `Turn ${round}`;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.onDocumentHidden();
    } else {
      this.onDocumentVisible();
    }
  }

  bindPermanentEvents() {
    const closeHelpDialogButton = this.helpDialog.querySelector('button');

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

    this.helpButton.addEventListener('click', this.openHelpDialog);
    closeHelpDialogButton.addEventListener('click', this.closeHelpDialog);
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

  // disabled by default on first round
  disablePowers() {
    this.powersEl.querySelectorAll('img').forEach((img) => {
      img.classList.remove('active');
    });
  }

  enablePowers() {
    this.powersEl.querySelectorAll('img').forEach((img) => {
      img.classList.add('active');
    });
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
    this.boardEl.innerHTML = '';
    board.forEach((row, r) => {
      const tr = document.createElement('tr');
      row.forEach((value, c) => {
        tr.appendChild(document.createElement('td'));
        const cell = tr.lastChild;
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.textContent = value ?? '';
        cell.className = '';
        if (value === Players.O || value === Players.X) {
          requestAnimationFrame(() => {
            const playerClassName = value === Players.O ? PLAYER_1_CELL_CLASS : PLAYER_2_CELL_CLASS;
            cell.className = `${playerClassName} animate`;
          });
        }
      });
      this.boardEl.appendChild(tr);
    });

    if (isNewGame) {
      document.querySelector('button').setAttribute('style', 'display: none');
      this.disablePowers();
      this.gameOverDialog.close();
      this.winnerMarkerEl.className = 'winner-marker';
      this.leftArrowEl.classList.remove('hidden');
      this.rightArrowEl.classList.add('hidden');
      this.roundCounterEl.textContent = 'Turn 1';
      this.winnerMarkerEl.style.visibility = 'hidden';
      this.winnerMarkerEl.removeAttribute('style');
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
    let message = winner ? `${winnerName} Won!` : 'Draw!';

    return message;
  }

  showGameOver(winner, winPosition) {
    /**
     *
     * @param {string} position - the position of the board, the available values are:
     * main-diagonal, secondary-diagonal, col-n, row-n
     * @returns {Array} - an array containing the data-attribute name and value to find the starting cell for drawing the winner marker
     */
    const parseWinPosition = (position) => {
      if (position.endsWith('diagonal')) {
        // for the secondary diagonal, we will start drawing the winner marker from the top right corner (last column), so we need to get the last row index
        return position === 'main-diagonal'
          ? ['data-row', 0]
          : ['data-row', this.boardEl.querySelectorAll('tr').length - 1];
      } else {
        const [type, index] = position.split('-');
        return [`data-${type}`, index];
      }
    };

    const winnerEl = this.gameOverDialog.querySelector('.winner');
    winnerEl.textContent = this.getWinMessage(winner);
    
    if (winner) {
      this.winnerMarkerEl.style.visibility = 'visible';
      const [dataAttr, dataValue] = parseWinPosition(winPosition);
      const startDrawingCell = this.boardEl.querySelector(`td[${dataAttr}="${dataValue}"]`);
      const cellRect = startDrawingCell.getBoundingClientRect();
      const boardRect = this.boardEl.getBoundingClientRect();

      if (winPosition.startsWith('row')) {
        // get middle left-middle point of the cell
        const markerY = cellRect.top - boardRect.top + cellRect.height / 2;
        this.winnerMarkerEl.style.transform = 'translateY(-50%)';
        this.winnerMarkerEl.style.left = '0px';
        this.winnerMarkerEl.style.top = `${markerY}px`;
        this.winnerMarkerEl.style.width = `100%`;
      } else if (winPosition.startsWith('col')) {
        const markerX = cellRect.left - boardRect.left + cellRect.width / 2;
        this.winnerMarkerEl.style.transform = 'translateX(-50%)';
        this.winnerMarkerEl.style.left = `${markerX}px`;
        this.winnerMarkerEl.style.top = '0px';
        this.winnerMarkerEl.style.height = `100%`;
      } else if (winPosition === 'main-diagonal') {
        this.winnerMarkerEl.style.left = '0px';
        this.winnerMarkerEl.style.top = '0px';
        this.winnerMarkerEl.style.transformOrigin = 'top left';
        this.winnerMarkerEl.style.transform = 'translateY(-50%) rotate(45deg)';
        this.winnerMarkerEl.style.width = `${100 * Math.sqrt(2)}%`; // 100% * sqrt(2) to cover the diagonal of the square board
      } else if (winPosition === 'secondary-diagonal') {
        this.winnerMarkerEl.style.right = '0px';
        this.winnerMarkerEl.style.top = '0px';
        this.winnerMarkerEl.style.transformOrigin = 'top right';
        this.winnerMarkerEl.style.transform = 'translateY(-50%) rotate(-45deg)';
        this.winnerMarkerEl.style.width = `${100 * Math.sqrt(2)}%`;
      }
    }

    setTimeout(
      () => {
        this.gameAreaEl.classList.add('hidden');
        this.gameOverDialog.showModal();
      },
      winner ? 1500 : 100,
    );
  }

  openHelpDialog() {
    this.helpDialog.showModal();
  }

  closeHelpDialog() {
    this.helpDialog.close();
  }
}
