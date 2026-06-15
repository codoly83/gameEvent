/**
 * 게임 ↔ 외부(캔버스 밖) 연동 브릿지
 *
 * 사용 예 (index.html 또는 부모 페이지):
 *   GameBridge.onGameEnd((score) => {
 *     console.log('게임 종료, 점수:', score);
 *     ResultPopup.show(score); // 외부 팝업 표시
 *   });
 *
 *   // 게임 시작 (시작 화면·결과 팝업 등 어디서든 호출 가능)
 *   GameBridge.startGame();
 *
   *   // 이벤트 버튼 패널 표시
   *   GameBridge.showEventButtons();
   *   iframe.contentWindow.postMessage({ action: 'showEventButtons' }, '*');
 *
 *   // 또는 직접 팝업 호출
 *   ResultPopup.show(150);
 */
import { pop2Opener } from './Common.js';

export class GameBridge {
  static _game = null;
  static _onGameEnd = null;
  static _onGameStart = null;
  static _defaultPopup = null;
  static _eventButtons = null;

  static init(game, { defaultPopup = null, eventButtons = null } = {}) {
    this._game = game;
    this._defaultPopup = defaultPopup;
    this._eventButtons = eventButtons;
  }

  /** 게임 종료 콜백 등록 */
  static onGameEnd(fn) {
    this._onGameEnd = fn;
  }

  /** 게임 시작 콜백 등록 */
  static onGameStart(fn) {
    this._onGameStart = fn;
  }

  /** 게이트 화면 숨김 */
  static hideGameGate() {
    const gate = document.querySelector('.game-gate');
    if (gate) gate.style.display = 'none';
  }

  /** 외부에서 게임 시작 */
  static startGame() {
    const game = this._game;
    if (!game) {
      console.warn('[GameBridge] startGame: game not initialized');
      return false;
    }

    const nicknameInput = document.getElementById('gameGateInput');
    const nickname = nicknameInput?.value?.trim() ?? '';
    if (!nickname) {
      alert('닉네임을 입력하세요');
      nicknameInput?.focus();
      return false;
    }

    if (game.scene.isActive('BootScene')) {
      console.warn('[GameBridge] startGame: assets still loading');
      return false;
    }

    this.hideGameGate();
    this._defaultPopup?.hide?.();
    this._eventButtons?.hide?.();
    pop2Opener('reset', window.openerUrl);

    if (game.scene.isActive('GameScene')) {
      game.scene.stop('GameScene');
    }
    if (game.scene.isActive('StartScene')) {
      game.scene.stop('StartScene');
    }

    game.scene.start('GameScene');

    const payload = { timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent('game:start', { detail: payload }));

    if (this._onGameStart) {
      this._onGameStart(payload);
    }

    return true;
  }

  /** 이벤트 버튼 패널 표시 */
  static showEventButtons() {
    this._eventButtons?.show();
    return true;
  }

  /** 이벤트 버튼 패널 숨김 */
  static hideEventButtons() {
    this._eventButtons?.hide();
    return true;
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
    bgm?.stopBgm();
    this._game?.scene.stop('GameScene');
    this._game?.scene.start('StartScene');
  }

  static getGame() {
    return this._game;
  }
}
