
import BaseScene from './BaseScene.js';
import { pop2Opener } from '../Common.js';
import { GameBridge } from '../GameBridge.js';

export default class StartScene extends BaseScene {
  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.scale;

    // bg
    const bg = this.add.image(width / 2, height / 2, 'bg');
    
    // title
    const title = this.add.image(width / 2, height * 0.14, 'title');

    // piggy bank
    const piggyBank = this.add.image((width / 2) * 1.05, height * 0.38, 'piggy_bank');
    const coin = this.add.image(width / 2, height * 0.35, 'coin1').setScale(0, 0.8);
    const piggyBankUpper = this.add.image((width / 2) * 1.05, height * 0.38, 'piggy_bank_upper');

    this.tweens.add({
      targets: coin,
      y: height * 0.27,
      alpha: 1,
      scaleX: 0.8,
      duration: 1000,
      delay: 650,
      ease: 'Expo.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: coin,
          y: '+=12',
          rotation: '+=0.03',
          duration: 1400,
          ease: 'Sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }
    });

    // instructions
    const text = this.add.image(width / 2, height * 0.51, 'instruction_text');
    const scoreBoard = this.add.image(width / 2, height * 0.69, 'instruction_score');
	
    // btn
    const startBtn = this.add.image(width / 2, height * 0.88 + 15, 'start_btn').setInteractive({ cursor: 'pointer' });
    
    startBtn.enabled = true;

    startBtn.on('pointerup', () => { 


      if(startBtn.enabled === false) return;

      startBtn.enabled = false;
		
		pop2Opener('reset', openerUrl);
		
       this.sound.play('click');
      this.elasticReverse(startBtn, 1.1, 700, () => { 

          this.scene.start('GameScene') 
        
      })

      
    
    
    
    });

	
	const closeBtn = this.add.sprite(width - 20,20, 'close').setInteractive({ cursor: 'pointer' }).setOrigin(1,0)//this.add.text(20,20,'닫기', { color: '#000', font: '700 40px Pretendard' }).setInteractive({ cursor: 'pointer' });
	
	closeBtn.on('pointerup', () => { 
		pop2Opener('close', openerUrl);
	})



     this.tweens.add({
          targets: startBtn,
          y:height * 0.88 - 15,
          ease: 'Quad.easeInOut',
          yoyo:true,
          duration:1500,
          repeat  :-1,
      });

    this.createDebugButtons();

  }

  createDebugButtons() {
    const tests = [
      { label: '50점 (43세)', score: 50 },
      { label: '150점 (29세)', score: 150 },
      { label: '250점 (17세)', score: 250 },
    ];
    tests.forEach((item, i) => {
      const btn = this.add.text(16, 70 + i * 42, `[TEST] ${item.label}`, {
        font: '22px Pretendard',
        color: '#fff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      }).setInteractive({ cursor: 'pointer' }).setDepth(200).setOrigin(0, 0);
      btn.on('pointerup', () => GameBridge.emitGameEnd(item.score));
    });
  }
}