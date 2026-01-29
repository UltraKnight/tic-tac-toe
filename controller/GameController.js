import { GameState } from '../model/GameState.js';
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
      playAudio: () => this.playAudio(this.state.getMusic('bg')),
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

    const { isActive, affectedPositions } = this.state.usePower(powerId);
    if (isActive) {
      const explosionSfx = this.state.getMusic('explosion');
      this.playAudio(explosionSfx);
      affectedPositions.forEach(({ row, col }) => {
        this.view.updateBoard(row, col, '🔥');
      });
      this.view.updatePowersRow(powerId, isActive);
    }
  }

  handlePlayAgain() {
    this.startGame(false);
  }

  handleMove(row, col) {
    this.state.updateBoardByIndexes(row, col);
    const currPlayer = this.state.getCurrPlayer();
    this.view.updateBoard(row, col, currPlayer.symbol);
    const WIN_POS = this.state.checkWinCondition(row, col);

    if (WIN_POS) {
      this.state.setWinner(currPlayer);
      this.handleGameOver(WIN_POS);
      const newScore = this.state.updateScore(currPlayer.symbol);
      this.view.updateScore(currPlayer.symbol, newScore);
    } else if (this.state.isBoardFull()) {
      this.state.setWinner(null);
      this.handleGameOver();
    } else {
      this.state.switchPlayer();
    }
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
    this.view.render(this.state.board, true);
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
