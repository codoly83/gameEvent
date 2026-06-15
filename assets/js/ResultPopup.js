import { getResultByScore, RESULT_ASSETS, SCORE_SEPS } from './ResultData.js';
import { pop2Opener } from './Common.js';
import { GameBridge } from './GameBridge.js';

/**
 * 캔버스(#root) 밖에 표시되는 결과 팝업
 */
export class ResultPopup {
  constructor(rootEl = document.getElementById('result-popup-root')) {
    this.root = rootEl;
    this._confettiTimers = [];
    this._build();
  }

  _build() {
    this.root.innerHTML = `
      <div class="result-popup__dimmed"></div>
      <img class="result-popup__popper-bg" src="${RESULT_ASSETS.popper}" alt="" draggable="false">
      <button type="button" class="result-popup__close" aria-label="닫기">
        <img src="${RESULT_ASSETS.close}" alt="" draggable="false">
      </button>
      <div class="result-popup__panel">
        <div class="result-popup__deco">
          <img class="result-popup__icon" src="" alt="" draggable="false">
        </div>
        <h2 class="result-popup__title">순발력으로 보는<br>나의 신체나이는?</h2>
        <p class="result-popup__age"></p>
        <p class="result-popup__content"></p>
        <div class="result-popup__actions">
          <div class="result-popup__go-wrap">
            <div class="result-popup__neon"></div>
            <button type="button" class="result-popup__go">
              <img src="${RESULT_ASSETS.goBtn}" alt="건강Age 확인하기" draggable="false">
            </button>
          </div>
          <button type="button" class="result-popup__replay">
            <img src="${RESULT_ASSETS.replayBtn}" alt="다시하기" draggable="false">
          </button>
        </div>
      </div>
      <div class="result-popup__confetti"></div>
    `;

    this.dimmed = this.root.querySelector('.result-popup__dimmed');
    this.panel = this.root.querySelector('.result-popup__panel');
    this.icon = this.root.querySelector('.result-popup__icon');
    this.ageEl = this.root.querySelector('.result-popup__age');
    this.contentEl = this.root.querySelector('.result-popup__content');
    this.confettiLayer = this.root.querySelector('.result-popup__confetti');
    this.goWrap = this.root.querySelector('.result-popup__go-wrap');
    this.goBtn = this.root.querySelector('.result-popup__go');
    this.replayBtn = this.root.querySelector('.result-popup__replay');

    this.root.querySelector('.result-popup__close').addEventListener('click', () => this.hide());
    this.goBtn.addEventListener('click', () => pop2Opener('goCA', window.openerUrl));
    this.replayBtn.addEventListener('click', () => {
      this.hide();
      pop2Opener('reset', window.openerUrl);
      GameBridge.restartToStart();
    });
  }

  /** @param {number} score */
  show(score) {
    this._clearConfetti();
    const result = getResultByScore(score);
    this._score = score;

    this.icon.src = result.icon;
    this.ageEl.textContent = result.age;
    this.contentEl.innerHTML = result.content.replace(/\n/g, '<br>');

    this.root.hidden = false;
    requestAnimationFrame(() => {
      this.root.classList.add('is-open');
      this.panel.classList.add('is-pop');
    });

    this.icon.style.transform = 'scaleY(0.6)';
    setTimeout(() => {
      this.icon.style.transform = 'scaleY(1)';
      this.icon.style.transition = 'transform 0.16s cubic-bezier(0.34,1.56,0.64,1)';
    }, 200);

    if (score > SCORE_SEPS[1]) this._spawnConfetti();
  }

  hide() {
    this.root.classList.remove('is-open');
    this.panel.classList.remove('is-pop');
    this._clearConfetti();
    setTimeout(() => { this.root.hidden = true; }, 250);
  }

  _spawnConfetti() {
    const spawn = () => {
      const img = document.createElement('img');
      img.src = RESULT_ASSETS.particles[Math.floor(Math.random() * 6)];
      img.className = 'result-popup__confetti-piece';
      img.style.left = `${Math.random() * 100}%`;
      img.style.animationDuration = `${8 + Math.random() * 4}s`;
      this.confettiLayer.appendChild(img);
      setTimeout(() => img.remove(), 12000);
    };
    spawn();
    const id = setInterval(spawn, 1200 + Math.random() * 600);
    this._confettiTimers.push(id);
  }

  _clearConfetti() {
    this._confettiTimers.forEach(clearInterval);
    this._confettiTimers = [];
    this.confettiLayer.innerHTML = '';
  }
}

window.ResultPopup = ResultPopup;
