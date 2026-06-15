
import BaseScene from './BaseScene.js';
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
    const coin = this.add.image(width / 2, height * 0.35, 'plus1').setScale(0, 0.8);
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
		
      this.elasticReverse(startBtn, 1.1, 700, () => { 
        GameBridge.startGame();
      })

      
    
    
    
    });

	
     this.tweens.add({
          targets: startBtn,
          y:height * 0.88 - 15,
          ease: 'Quad.easeInOut',
          yoyo:true,
          duration:1500,
          repeat  :-1,
      });

  }
}