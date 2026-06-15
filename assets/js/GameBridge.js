/**
 * 게임 ↔ 외부(캔버스 밖) 연동 브릿지
 *
 * 사용 예 (index.html 또는 부모 페이지):
 *   GameBridge.onGameEnd((score) => {
 *     console.log('게임 종료, 점수:', score);
 *     ResultPopup.show(score); // 외부 팝업 표시
 *   });
 *
 *   // 또는 직접 팝업 호출
 *   ResultPopup.show(150);
 */
export class GameBridge {
  static _game = null;
  static _onGameEnd = null;
  static _defaultPopup = null;

  static init(game, { defaultPopup = null } = {}) {
    this._game = game;
    this._defaultPopup = defaultPopup;
  }

  /** 게임 종료 콜백 등록 */
  static onGameEnd(fn) {
    this._onGameEnd = fn;
  }

  /** 게임 종료 알림 (GameScene에서 호출) */
  static emitGameEnd(score) {
    const payload = { score, timestamp: Date.now() };

    // CustomEvent로도 전파 (외부 스크립트에서 addEventListener 가능)
    window.dispatchEvent(new CustomEvent('game:end', { detail: payload }));

    if (this._onGameEnd) {
      this._onGameEnd(score, payload);
    } else if (this._defaultPopup) {
      this._defaultPopup.show(score);
    }
  }

  /** 캔버스 내에서 강제로 결과 전달 (디버그/테스트용) */
  static forceGameEnd(score) {
    const gameScene = this._game?.scene?.getScene('GameScene');
    if (gameScene?.forceFinish) {
      gameScene.forceFinish(score);
      return;
    }
    this.emitGameEnd(score);
  }

  /** 다시하기 – StartScene으로 복귀 */
  static restartToStart() {
    const bgm = this._game?.scene?.getScene('BgmManager');
    bgm?.playBgm('bgm-main');
    this._game?.scene.stop('GameScene');
    this._game?.scene.start('StartScene');
  }

  static getGame() {
    return this._game;
  }
}

window.GameBridge = GameBridge;
