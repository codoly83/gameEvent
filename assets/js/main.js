import BootScene from './scenes/BootScene.js?v=251124';
import StartScene from './scenes/StartScene.js';
import GameScene from './scenes/GameScene.js';
import BgmManager from './BgmManager.js';
import { GameBridge } from './GameBridge.js';
import { ResultPopup } from './ResultPopup.js';

window.openerUrl = "";

const initPop = function(){
	// 메시지 수신 대기
	window.addEventListener('message', event => {
		console.log('오프너에서 받은 데이터 : ', event.data);
		console.log('Received opener origin ::: ', event.data.openerOrigin);
		console.log('Received opener URL ::: ', event.data.openerUrl);
		// openerUrl 받으면 저장하고 있다가 오프너 동작 제어에 활용 필요
		
		window.openerUrl =  event.data.openerUrl;
	});// 게임팝업 온로드 후, 준비된 상태임을 오프너(브로드캐스트)로 보내기 > 이후 오프너(AIA+)에서 openerUrl 및 origin 던져줌 > 동작 제어시 필요
	
	window.parent.postMessage({ready:true},'*');
}

const config = {
  type: Phaser.AUTO,
  parent: 'root',
  width: 1080,
  height: 1920,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 300 }, debug: false }
  },
  backgroundColor: '#fff',
  antialias: true,
  scene: [BootScene, StartScene, GameScene, BgmManager]
};

initPop();

const resultPopup = new ResultPopup();
const game = new Phaser.Game(config);

GameBridge.init(game, { defaultPopup: resultPopup });

/**
 * 게임 종료 콜백 – 외부에서 팝업을 직접 제어하려면 이 함수를 수정하세요.
 * @param {number} score
 */
GameBridge.onGameEnd((score) => {
  console.log('[GameBridge] 게임 종료, 점수:', score);
  resultPopup.show(score);
});

// 외부 호출용: ResultPopup.show(150) 또는 GameBridge.forceGameEnd(150)
window.resultPopup = resultPopup;


