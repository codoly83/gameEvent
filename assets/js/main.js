import BootScene from "./scenes/BootScene.js?v=251124";
import StartScene from "./scenes/StartScene.js";
import GameScene from "./scenes/GameScene.js";
import BgmManager from "./BgmManager.js";
import { GameBridge } from "./GameBridge.js";
import { ResultPopup } from "./ResultPopup.js";
import { EventButtons } from "./EventButtons.js";

window.openerUrl = "";

const initPop = function () {
  // 메시지 수신 대기
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    console.log("오프너에서 받은 데이터 : ", data);
    if (data.openerOrigin)
      console.log("Received opener origin ::: ", data.openerOrigin);
    if (data.openerUrl) {
      console.log("Received opener URL ::: ", data.openerUrl);
      window.openerUrl = data.openerUrl;
    }

    if (data.action === "start" || data.startGame === true) {
      GameBridge.startGame();
    }
    if (data.action === "showEventButtons") {
      GameBridge.showEventButtons();
    }
    if (data.action === "hideEventButtons") {
      GameBridge.hideEventButtons();
    }
  }); // 게임팝업 온로드 후, 준비된 상태임을 오프너(브로드캐스트)로 보내기 > 이후 오프너(AIA+)에서 openerUrl 및 origin 던져줌 > 동작 제어시 필요

  window.parent.postMessage({ ready: true }, "*");
};

const config = {
  type: Phaser.AUTO,
  parent: "root",
  width: 1080,
  height: 1920,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 300 }, debug: false },
  },
  backgroundColor: "#fff",
  antialias: true,
  scene: [BootScene, StartScene, GameScene, BgmManager],
};

initPop();

const resultPopup = new ResultPopup();
const eventButtons = new EventButtons();
const game = new Phaser.Game(config);

function syncGameGate() {
  const gate = document.querySelector(".game-gate");
  const canvas = game.canvas;
  if (!gate || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  gate.style.width = `${rect.width}px`;
  gate.style.height = `${rect.height}px`;
  gate.style.left = `${rect.left}px`;
  gate.style.top = `${rect.top}px`;
  gate.style.fontSize = `${rect.width / 10}px`;
}

game.scale.on("resize", syncGameGate);
window.addEventListener("resize", syncGameGate);
game.events.once("ready", syncGameGate);
requestAnimationFrame(syncGameGate);

GameBridge.init(game, { defaultPopup: resultPopup, eventButtons });

/**
 * 게임 종료 콜백 – 외부에서 팝업을 직접 제어하려면 이 함수를 수정하세요.
 * @param {number} score
 */
GameBridge.onGameEnd((score) => {
  console.log("[GameBridge] 게임 종료, 점수:", score);
  resultPopup.show(score);
});

// index.html 등 외부 스크립트에서 GameBridge.startGame() 직접 호출 가능
window.GameBridge = GameBridge;
window.resultPopup = resultPopup;
window.eventButtons = eventButtons;

// 샘플: 페이지 로드 후 이벤트 버튼 패널 표시
// setTimeout(() => GameBridge.showEventButtons(), 600);
