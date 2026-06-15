import BaseScene from './BaseScene.js';
import { pop2Opener } from '../Common.js';

let score_seps = [120,219]

export default class ResultScene extends BaseScene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
	  
	this.scene.get('BgmManager').playBgm('bgm-ending');
        // PlayScene에서 전달한 데이터
        this.score = data.score;
  }

  getResultText(){

    if(this.score <= score_seps[0]){

      this.sound.play('fail_result');

        return ["[43세]",
"조금 아쉬운 순발력이네요😢\r\n\r\n\
지금이 딱 점검할 타이밍!\r\n\
건강과 보장을 확인해 보세요!"];


    } else if(this.score <= score_seps[1]){

      
      this.sound.play('normal_result');

        return ["[29세]",
"살짝 아쉽지만 괜찮은 반사신경이에요😊\r\n\
\r\n\
순발력 만큼 건강과 보장도\r\n\
상위권인지 확인해 보세요!"];

    } else {

      
      this.sound.play('success_result');

        return ["[17세]",
"집중력과 민첩성이 아주 뛰어나요👏\r\n\
\r\n\
건강과 보장도 신체 나이만큼\r\n\
젊고 튼튼한지 체크해 보세요!"];
    }           

  }

  create() { 

    
    this.dimmed = this.add.graphics();

    this.dimmed.fillStyle(0x000000, 0.7);
    this.dimmed.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 100, 'popper').setScale(0.5);

    this.dimmed.alpha = 0;

    this.tweens.add({
        targets: this.dimmed,
        alpha: 1,
        duration: 200,
        ease: 'Linear'
    });

    let [age, content] = this.getResultText();
	
	const closeBtn = this.add.sprite(this.sys.game.config.width - 20,20, 'close').setInteractive({ cursor: 'pointer' }).setDepth(2000).setOrigin(1,0)//this.add.text(20,20,'닫기', { color: '#000', font: '700 40px Pretendard' }).setInteractive({ cursor: 'pointer' });
	
	closeBtn.on('pointerup', () => { 
	
		pop2Opener('close', openerUrl);
	})
	
	

    this.popup = this.add.container(this.sys.game.config.width / 2, this.sys.game.config.height / 2);
    this.popup.scale = 0;

    // this.popup.x = this.sys.game.config.width / 2;
    // this.popup.y = this.sys.game.config.height / 2;

    this.popupBack = this.add.graphics();
	
	let offset = 320
	
    this.popupBack.fillStyle(0xFFFFFF, 1);
    this.popupBack.fillRoundedRect(-this.sys.game.config.width / 2 + 100, -this.sys.game.config.height / 2 + 560 - offset, 874, 1148 + offset, 48);


    this.popup.title = this.add.text(0, -280, "순발력으로 보는\r\n나의 신체나이는?", {align: 'center', font: 'bold 72px Pretendard', lineSpacing: 8,
      

      // fontFamily: 'Pretendard', 
      // fontSize: '72pt', 
      // fontWeight:700, 
      
      color: '#000000',

      wordWrap: { width: 720, useAdvancedWrap: true } // 너비 200px 안에서 줄바꿈


     }).setOrigin(0.5);
	 
	 
    this.popup.age = this.add.text(0, -80, age, {align: 'center', font: 'bold 90px Pretendard', lineSpacing: 8,
      

      // fontFamily: 'Pretendard', 
      // fontSize: '72pt', 
      // fontWeight:700, 
      
      color: '#000000',

      wordWrap: { width: 720, useAdvancedWrap: true } // 너비 200px 안에서 줄바꿈


     }).setOrigin(0.5);
	 
	 


    //this.popup.content = this.add.text(0,  - 35, content, {align: 'center', fontFamily: 'Pretendard', fontSize: '46px', color: '#000000', wordWrap: { width: 600, useAdvancedWrap: true } }).setOrigin(0.5);
    
    this.popup.content = this.createAutoResizeText(0,  175, content, {align: 'center', font: '500 45px Pretendard', lineSpacing: 6, color: '#000000'}, 46, 680, 245);

	this.popup.startBtnGroup = this.add.container(0, 414);
	
    this.popup.startBtn = this.add.image(0, 0, 'go_btn').setOrigin(0.5).setInteractive({cursor:'pointer'});
    this.popup.replayBtn = this.add.image(0, 624, 'replay_btn').setOrigin(0.5).setInteractive({cursor:'pointer'});
	
    this.popup.startBtnGroup.alpha = 0;
    this.popup.replayBtn.alpha = 0;
	
	 // --- Neon Glow Effect ---
    const btnWidth = this.popup.startBtn.width;
    const btnHeight = this.popup.startBtn.height;
    const radius = 8;//btnHeight / 2;

    const neonGlow = this.add.graphics();
    neonGlow.lineStyle(20, 0xd4003b, 0.2); // White glow, 4px thick, full alpha

    // Draw the rounded rectangle (pill shape)
    // x, y, width, height, radius
    neonGlow.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, radius);
	
	// 안쪽 또렷한 부분 (작은 width + alpha 1)
	neonGlow.lineStyle(30, 0xd4003b, 0.1);
	neonGlow.strokeRoundedRect(-btnWidth / 2 - 2.5, -btnHeight / 2 - 2.5, btnWidth+5, btnHeight+5, radius);


	// 안쪽 또렷한 부분 (작은 width + alpha 1)
	neonGlow.lineStyle(40, 0xd4003b, 0.07);
	neonGlow.strokeRoundedRect(-btnWidth / 2 - 5, -btnHeight / 2 - 5, btnWidth+10, btnHeight+10, radius);
	neonGlow.alpha = 0;
	
    this.popup.add(neonGlow);
    neonGlow.setDepth(this.popup.startBtn.depth + 2); // Above button and particles

    // Animate the glow
    this.tweens.add({
        targets: neonGlow,
        alpha: { from: 0, to: 1 }, // Fade in and out
        duration: 700,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
	
	this.popup.startBtn.alpha = 1;
	this.popup.startBtnGroup.add(this.popup.startBtn);
	this.popup.startBtnGroup.add(neonGlow);

    this.popup.deco = this.add.container(0, -this.sys.game.config.height / 2 + 480 - offset + 160);
    
    let resultIcon = 'popper';
    if (this.score <= score_seps[0]) {
      resultIcon = 'bad_icon';
    } else if (this.score <= score_seps[1]) {
      resultIcon = 'good_icon';
    }
    
    this.popup.deco.real = this.add.image(0, 220, resultIcon).setOrigin(0.5);
     this.popup.deco.real.setOrigin(0.5, 1);

     this.popup.deco.add(this.popup.deco.real);


    this.popup.add(this.popupBack);
    this.popup.add(this.popup.title);
    this.popup.add(this.popup.age);
    this.popup.add(this.popup.content);
    this.popup.add(this.popup.startBtnGroup);
    this.popup.add(this.popup.replayBtn);
    this.popup.add(this.popup.deco); 

     this.popup.startBtn.enabled = true;

    this.popup.startBtn.on('pointerdown', () => {
      //this.scene.start('StartScene');

      if(this.popup.startBtn.enabled === false) return;

      this.popup.startBtn.enabled = false;

      this.elasticReverse(this.popup.startBtnGroup, 1.1, 700, () => { 

          
        
          // window.parent.postMessage(
            // {
              // funcName: 'frameCont',
              // params: [this.score]
            // },
            // '*'
          // );
		  
          pop2Opener('goCA', openerUrl); 
		  
          this.popup.startBtn.enabled = true;
        
      })



    });

     this.popup.replayBtn.enabled = true;

    this.popup.replayBtn.on('pointerdown', () => {
      //this.scene.start('GameScene');

        
        if(this.popup.replayBtn.enabled === false) return;

        this.popup.replayBtn.enabled = false;

       this.sound.play('click');
       // ResultScene 종료
        this.scene.stop();
		
		
		pop2Opener('reset', openerUrl);
		
        // GameScene 재시작
        //this.scene.get('GameScene').scene.restart();
	this.scene.get('BgmManager').playBgm('bgm-main');
    this.scene.stop('GameScene');
    this.scene.start('StartScene');

        
    }); 

     // 초기 상태: 20도 찌그러짐
      this.popup.deco.setRotation(Phaser.Math.DegToRad(-30)); // -20도



      setTimeout(()=> {


    this.tweens.add({
            targets: this.popup.deco.real,
            //rotation: 0,          // 원래 회전
            scaleX: 1,            // 원래 크기
            scaleY: 0.6,
            duration: 200,        // 0.5초
            onComplete: () => {

                  // 2️⃣ 빵빠레 튀어나오는 애니메이션
                this.tweens.add({
                    targets: this.popup.deco.real,
                    //rotation: 0,          // 원래 회전
                    scaleX: 1,            // 원래 크기
                    scaleY: 1,
                    ease: 'Back.easeOut', // 튀어나오는 느낌
                    duration: 160,        // 0.5초
                    onComplete: () => {
                    }
                });
            }
        });

       
        if(this.score > score_seps[1])
        {
           // 3️⃣ 1초 뒤 꽃가루 효과
          this.time.delayedCall(0, () => {
              this.spawnConfetti();
          });
          
        }
       
        


      }, 200)



     

      this.popOpen();

  }

  popOpen(){
      this.elastic(this.popup, 1, 1000, () => {


         this.tweens.add({
              targets: this.popup.startBtnGroup,
              y: 434,
              alpha: 1,
              duration: 800,
              ease: 'Linear',
              onComplete: () => {
                this.playButtonFx(this.popup.startBtnGroup);
              }
          });


          this.tweens.add({
              targets: this.popup.replayBtn,
              alpha: 1,
              duration: 800,
              ease: 'Linear'
          });

     })
     

  }

  playButtonFx(button) {
    // --- Initial pop scaling ---
    this.tweens.add({
        targets: button,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        ease: 'Power1',
        yoyo: true,
    });

	
	 // --- Neon Glow Effect ---
    const btnWidth = this.popup.startBtn.width;
    const btnHeight = this.popup.startBtn.height;

    // --- Particle burst (below button, spread out) ---
    const emitZoneRectWidth = btnWidth * 1; // 80% of button width
    const emitZoneRectHeight = btnHeight; // A small height for spread
    const emitZoneRectY = 0; // 10 pixels below button's bottom edge

    const particles = this.add.particles(0, 0, 'particle1', {
        emitZone: {
            type: 'random', // Emit randomly within this rectangle
            source: new Phaser.Geom.Rectangle(
                -emitZoneRectWidth / 2, // Centered horizontally
                -emitZoneRectHeight / 2,
                emitZoneRectWidth,
                emitZoneRectHeight
            ),
            quantity: 50 // Sample points within the zone
        },
        speed: { min: 100, max: 400 },
        angle: { min: 0, max: 360 }, // Primarily downwards
        scale: { start: 2, end: 0 },
        lifespan: 800,
        emitting: false
    });
    //this.popup.addAt(particles,2);
	this.popup.startBtnGroup.addAt(particles,0);
    particles.setDepth(button.depth -1);

    // Manually emit particles for a burst
    particles.emitParticleAt(0, 0, 50); // Emit from emitter's origin, distributed by emitZone

    // Clean up the particle emitter
    this.time.delayedCall(1500, () => {
        particles.destroy();
    });

    // --- Continuous scaling tween ---
    /*this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 700,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: 300
    });*/
  }


   spawnConfetti() {

       // 파티클 매니저 (빈 상태로)
        const particles = this.add.particles();

        // 각각의 텍스처에 emitter를 만들어도 되지만,
        // 하나의 emitter를 직접 제어하는 게 더 깔끔
        const textures = ['particle1', 'particle2', 'particle3', 'particle4', 'particle5', 'particle6'];

        for(let i=0; i<textures.length; i++){

             const emitter1 = this.add.particles(this.sys.game.config.width / 2, -100, 'particle' + (i+1), {
              lifespan: 12000,
              x: { min: -this.sys.game.config.width/2, max: this.sys.game.config.width },
              speed: 100,
              scale: { min: 0.9, max: 1.3 },
              angle: { min: 0, max: 360 },rotate: { min: 0, max: 360 },  // 👈 랜덤 회전
              gravityY: 120,
              frequency: 1200,
              emitting:false
          });

                    
          // 랜덤 간격으로 emit 시키기
          this.time.addEvent({
              delay: Phaser.Math.Between(1200, 1800), // 0.2~0.8초 사이 랜덤 간격
              loop: true,
              callback: () => {
                  emitter1.emitParticleAt(
                      // Phaser.Math.Between(100, 700),  // x 위치
                      // Phaser.Math.Between(50, 300),   // y 위치
                      // Phaser.Math.Between(1, 3)       // 한 번에 몇 개 뿌릴지 랜덤

                  );
                  
                 
              }
          });
          
        }


        
    }
    

  createAutoResizeText( x, y, content, style, fontSize, maxWidth, maxHeight) {
  
    const text = this.add.text(x, y, content, Object.assign(style, { wordWrap: { width: maxWidth } })).setOrigin(0.5);

    while (text.height > maxHeight && fontSize > 10) { // 최소 폰트 10px
        fontSize--;
        text.setStyle({ fontSize: fontSize + 'px' });
    }

    return text;
}



}