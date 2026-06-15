import { GameBridge } from './GameBridge.js';

const DEFAULT_ACTIONS = [
  { id: 'start', label: '게임 시작', variant: 'primary', handler: () => GameBridge.startGame(), closeOnClick: true },
  { id: 'score-50', label: '50점 결과 (43세)', handler: () => GameBridge.emitGameEnd(50), closeOnClick: true },
  { id: 'score-150', label: '150점 결과 (29세)', handler: () => GameBridge.emitGameEnd(150), closeOnClick: true },
  { id: 'score-250', label: '250점 결과 (17세)', handler: () => GameBridge.emitGameEnd(250), closeOnClick: true },
  { id: 'restart', label: '시작 화면으로', handler: () => GameBridge.restartToStart(), closeOnClick: true },
];

/**
 * 캔버스(#root) 외부 이벤트 버튼 패널
 */
export class EventButtons {
  constructor(rootEl = document.getElementById('event-buttons-root')) {
    this.root = rootEl;
    this._actions = [...DEFAULT_ACTIONS];
    this._build();
  }

  _build() {
    this.root.innerHTML = `
      <div class="event-buttons__dimmed"></div>
      <div class="event-buttons__panel">
        <button type="button" class="event-buttons__close" aria-label="닫기">×</button>
        <h2 class="event-buttons__title">이벤트 테스트</h2>
        <p class="event-buttons__desc">외부에서 게임 이벤트를 실행할 수 있습니다.</p>
        <div class="event-buttons__list"></div>
      </div>
    `;

    this.panel = this.root.querySelector('.event-buttons__panel');
    this.list = this.root.querySelector('.event-buttons__list');
    this.root.querySelector('.event-buttons__close').addEventListener('click', () => this.hide());
    this.root.querySelector('.event-buttons__dimmed').addEventListener('click', () => this.hide());

    this._renderButtons();
  }

  _renderButtons() {
    this.list.innerHTML = '';
    this._actions.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `event-buttons__btn${item.variant === 'primary' ? ' is-primary' : ''}`;
      btn.textContent = item.label;
      btn.dataset.id = item.id;
      btn.addEventListener('click', () => {
        item.handler?.();
        if (item.closeOnClick) this.hide();
      });
      this.list.appendChild(btn);
    });
  }

  /** @param {Array<{id?: string, label: string, handler: Function, variant?: string, closeOnClick?: boolean}>} actions */
  setActions(actions) {
    this._actions = actions;
    this._renderButtons();
  }

  show() {
    this.root.hidden = false;
    requestAnimationFrame(() => {
      this.root.classList.add('is-open');
      this.panel.classList.add('is-pop');
    });
  }

  hide() {
    this.root.classList.remove('is-open');
    this.panel.classList.remove('is-pop');
    setTimeout(() => { this.root.hidden = true; }, 250);
  }
}

window.EventButtons = EventButtons;
