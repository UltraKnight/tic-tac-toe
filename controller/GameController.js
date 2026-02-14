import { GameState, POWERS } from '../model/GameState.js';
import { GameView } from '../view/GameView.js';

export class GameController {
  constructor() {
    this.state = new GameState();
    this.view = new GameView({
      onCellClick: this.handleMove.bind(this),
      onUsePower: this.handleUsePower.bind(this),
      onGameOver: this.handleGameOver.bind(this),
      onPlayAgain: this.handlePlayAgain.bind(this),
      onDocumentHidden: this.pauseGame.bind(this),
      onDocumentVisible: this.resumeGame.bind(this),
      onStartGame: this.startGame.bind(this),
      playAudio: () => this.playAudio(this.state.getMusic('bg'), 0.5),
    });
  }

  playAudio(audio, volume = 1) {
    audio.volume = volume;
    audio.paused && audio.play();
  }

  pauseAudio(audio) {
    !audio.paused && audio.pause();
  }

  handleUsePower(powerId) {
    if (this.state.isBoardEmpty()) return;

    const { isActive, affectedPositions, redraw, canHaveWinner } = this.state.usePower(powerId);
    if (isActive) {
      switch (powerId) {
        case POWERS.bomb: {
          const explosionSfx = this.state.getMusic('explosion');
          this.playAudio(explosionSfx);
          affectedPositions.forEach(({ row, col, replacer }) => {
            this.view.updateBoard(row, col, replacer, { className: 'explode', transitionalValue: '🔥' });
          });
          break;
        }
        case POWERS.change:
          affectedPositions.forEach(({ row, col, replacer }) => {
            this.view.updateBoard(row, col, replacer, { className: 'animate', transitionalValue: replacer });
          });
          break;
        case POWERS.shuffle:
        default:
          break;
      }

      redraw && this.view.render(this.state.getBoard(), false);
      this.view.updatePowersRow(powerId, isActive);

      if (canHaveWinner) {
        const { result: winResult, winner } = this.state.checkWinConditionOnBoard();
        if (winResult) {
          this.state.setWinner(winner);
          this.handleGameOver(winResult);
          const newScore = this.state.updateScore(winner.symbol);
          this.view.updateScore(winner.symbol, newScore);
        } else {
          this.handleSwitchPlayer();
          this.view.updateRoundCounter(this.state.currentRound);
        }
      } else {
        this.handleSwitchPlayer();
        this.view.updateRoundCounter(this.state.currentRound);
      }
    }
  }

  handlePlayAgain() {
    this.startGame(false);
  }

  handleMove(row, col) {
    this.state.updateBoardByIndexes(row, col);
    const currPlayer = this.state.getCurrPlayer();
    this.view.updateBoard(row, col, currPlayer.symbol);
    const WIN_POS = this.state.checkWinConditionOnMove(row, col);

    if (WIN_POS) {
      this.state.setWinner(currPlayer);
      this.handleGameOver(WIN_POS);
      const newScore = this.state.updateScore(currPlayer.symbol);
      this.view.updateScore(currPlayer.symbol, newScore);
    } else if (this.state.isBoardFull()) {
      this.state.setWinner(null);
      this.handleGameOver();
    } else {
      this.handleSwitchPlayer();
      this.view.updateRoundCounter(this.state.currentRound);
    }

    if (this.state.currentRound === 1 && this.state.currPlayer.symbol === 'X') {
      this.view.enablePowers();
    }
  }

  handleSwitchPlayer() {
    this.state.switchPlayer();
    this.view.togglePlayerArrow();
  }

  handleGameOver(winPosition) {
    const gameOverMusic = this.state.getMusic('gameOver');
    this.pauseAudio(this.state.getMusic('bg'));
    this.playAudio(gameOverMusic);
    this.view.showGameOver(this.state.getWinner(), winPosition);
    this.view.unbindEvents();
  }

  startGame(clearScore = true) {
    this.state.reset();
    this.view.render(this.state.getBoard(), true);
    this.view.bindEvents();
    if (clearScore) {
      const players = this.state.resetScore();
      this.view.resetScore(players);
    }
  }

  pauseGame() {
    this.state.pauseAllAudios();
  }

  resumeGame() {
    this.state.resumeAllAudios();
  }
}
