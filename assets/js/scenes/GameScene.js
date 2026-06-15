

import { pop2Opener } from '../Common.js';
import { GameBridge } from '../GameBridge.js';


export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameMs = 30000;//30000;
    this.spawnDrops = [
      { start: 0, end: 10000, counts: { coin1: 3, coin2: 15, cap: 12 } },
      { start: 10000, end: 20000, counts: { coin1: 4, coin2: 20, cap: 20 } },
      { start: 20000, end: 28200, counts: { coin1: 8, coin2: 30, cap: 34 } }
    ];
  }

  /* ------------------------------------------------
   * Init
   * ----------------------------------------------*/
  init() {
    // Game/UI
    this.totalScore = 0;
    this.combo = 0;
    this._finished = false;
    this.SCORES = { coin1: 10, coin2: 1, cap: -5 };

    // Player hit state
    this.isHit = false;
    this.stunResetTimer = null;

    // Player
    this.controlsEnabled = false;
    this.dragging = false;
    this.targetX = null;
    this.minX = 40; // 화면 좌/우 마진
    this.maxX = null; // create에서 화면 너비로 계산
    this.lastX = null; // flip 판정용
    this.followK = 90; // 클수록 빠르게 목표에 수렴

    // Spawn
    this.plan = [];
    this.planIdx = 0;
    this.spawnFlip = Math.random() < 0.5 ? -1 : 1;
    
    // CAP Spawn 정책
    this.capBaseP = 0.55; // 기본 추적 확률 55%
    this.capPerCombo = 0.01; // 콤보 1당 1%p 계산 (최대치는 아래 clamp)
    this.capMaxP = 0.9; // 추적 확률 상한
    this.capLead = 0.5; // 목표로 가는 길 중 앞선 지점 비율
    this.capJitterX = 80; // 예측점 주변 가로 지터(px)
    this.capMinDX = 90; // 플레이어 바로 위 금지 거리(px)
    this.capCooldownMs = 600; // cap 스폰 간 최소 간격(ms)
    this._lastCapAt = -Infinity; // 직전 cap 스폰 시각

    // Timer
    this.startAt = 0;
    this.timerEvt = null;
    this._finished = false;

    // 마지막으로 페이지가 숨겨졌을 때 시점
    this.hiddenAt = null;
    
     // 페이지 가시성 이벤트 등록
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 숨겨질 때 현재 시간 기록
            this.hiddenAt = performance.now();
            this.time.timeScale = 0; // 
        } else {
            // 다시 보일 때: 숨겨져 있던 시간만큼 startAt 보정
            if (this.hiddenAt) {
                console.log("bf:"+this.startAt)
                const hiddenDuration =performance.now() - this.hiddenAt;
                this.startAt += hiddenDuration; // startAt을 뒤로 미룸
                this.hiddenAt = null;

                //this._lastCapAt += hiddenDuration; // cap 스폰 타이밍도 보정
                
                setTimeout(() => {  
                  this.time.timeScale = 1; // 
                }, 1)
            
              //this.time.timeScale = 1; // 
            }
        }
    });
	
	this.scene.get('BgmManager').playBgm('bgm-ingame2');

  }

  /* ------------------------------------------------
   * Create
   * ----------------------------------------------*/
  create() {
    const { width, height } = this.scale;
    this.maxX = width - this.minX;
    
    // bg
    const bg = this.add.image(width / 2, height / 2, 'bg');

    // Clouds
    this.clouds = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const cloudKey = `cloud${Phaser.Math.Between(1, 4)}`;
      const cloud = this.clouds.create(Phaser.Math.Between(0, width), Phaser.Math.Between(50, 800), cloudKey);
      cloud.body.setAllowGravity(false);
      cloud.setVelocityX(Phaser.Math.Between(20, 60) * (Math.random() > 0.5 ? 1 : -1));
      cloud.setAlpha(0.8);
    }
	
	
	
	
	
	const closeBtn = this.add.sprite(width - 20,20, 'close').setOrigin(1,0).setInteractive({ cursor: 'pointer' }).setDepth(102)//this.add.text(20,20,'닫기', { color: '#000', font: '700 40px Pretendard' }).setInteractive({ cursor: 'pointer' });
	
	closeBtn.on('pointerup', () => { 
		pop2Opener('close', openerUrl);
	})
	
	
	
	
	

    this.physics.world.setBounds(0, -200, width, height + 400);
    // this.physics.world.on('worldbounds', (body) => {
    //   const s = body.gameObject;
    //   if (!s || !s.active) return;

    //   // 좌/우에 부딪혔으면 더 나가지 않게 수평속도 제거(또는 아주 작게)
    //   if (body.blocked.left || body.blocked.right) {
    //     body.setVelocityX(0);
    //     // 벽을 긁고 회전이 과도해지는 걸 약간 완화
    //     body.setAngularVelocity(body.angularVelocity * 0.5);
    //   }
    // }, this);


	let offsetTop = 70
	
	this.offsetTop = offsetTop;
	
    // timer
    const timerBg = this.add.image(width / 2, height * 0.064 + offsetTop, 'bg_timer');
    this.timerGraphicsBg = this.add.graphics().setDepth(5);
    this.timerGraphicsBg.fillStyle(0xd6d8da, 1);
    this.timerGraphicsBg.fillRoundedRect(105, 110 + offsetTop, 781, 25, 12);
    this.timerGraphics = this.add.graphics().setDepth(10);
    this.timerGraphics.fillStyle(0xe00842, 1);
    this.timerGraphics.fillRoundedRect(105, 110 + offsetTop, 781, 25, 12);
    this.timeLeft = this.add.text(945, 125 + offsetTop, `${this.gameMs / 1000}`, { color: '#000', font: '700 50px Pretendard' }).setOrigin(0.5, 0.5);
    this.timerGroup = this.add.group([timerBg, this.timerGraphicsBg, this.timerGraphics, this.timeLeft]).setDepth(100);

    // 누적 score
    this.totalScoreSprite = this.add.image(885, 245 + offsetTop, 'coin1').setScale(0.46).setOrigin(1, 0.5);
    this.totalScoreText = this.add.text(1005, 245 + offsetTop, `${this.totalScore}점`, { color: '#e00842', font: '700 60px Pretendard' }).setOrigin(1, 0.5);
    this.totalScoreGroup = this.add.group([this.totalScoreSprite, this.totalScoreText]);

    // combo (기본 설정만)
    this.comboText = this.add.text(1005, 315 + offsetTop, `${this.combo} COMBO`, { color: '#333d47', font: '600 40px Pretendard' }).setOrigin(1, 0.5).setVisible(false);

    // character
    this.player = this.add.sprite(width / 2, height - 140, 'pig_guide').setOrigin(0.5, 1).setDepth(100);
    this.player.setInteractive({ cursor: 'pointer' });
    this.player.setFlipX(false);
    this.lastX = this.player.x;

    // 동전 캐치 센서
    this.catchSensor = this.add.zone(this.player.x, this.player.y - this.player.displayHeight + 40, 140, 40).setOrigin(0.5, 0.5);
    this.physics.add.existing(this.catchSensor, true);

    // input
    this.player.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointerupoutside', this.onPointerUp, this);

    // 캐릭터 무빙 안내 UI
    this.instructions = this.makeInstructions(this.player);

    // coins (기본 설정만)
    this.dropsGroup = {
      coin1: this.physics.add.group({ maxSize: 9 }),
      coin2: this.physics.add.group({ maxSize: 45 }),
      cap: this.physics.add.group({ maxSize: 36 })
    };

    // overlap
    this.physics.add.overlap(this.catchSensor, this.dropsGroup.coin1, (_z, s) => this.onCollect(s, 'coin1'));
    this.physics.add.overlap(this.catchSensor, this.dropsGroup.coin2, (_z, s) => this.onCollect(s, 'coin2'));
    this.physics.add.overlap(this.catchSensor, this.dropsGroup.cap, (_z, s) => this.onCollect(s, 'cap'));

    // countdown
    this.runCountdown({
      onComplete: async () => {
        await this.fadeOutInstructions(160);
		this.player.setTexture("pig")
        this.startGame();
      }
    });
	
	
	
	
	
	
	 this.emitter = this.add.particles(0, 0, 'particle1', {
            lifespan: 4000,
            speed: { min: 200, max: 350 },
            alpha: { start: 1, end: 0 },
            scale: { start: 0.7, end: 1.3 },
            rotate: { start: 0, end: 360 },
            gravityY: 200,
            emitting: false
     }).setDepth(101);

  }

  /* ------------------------------------------------
   * Game Lifecycle
   * ----------------------------------------------*/
  startGame() {
    this.controlsEnabled = true;
    this.startAt = this.time.now;

    // 타이머 시작
    this.timerEvt = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => this.updateTimer()
    });

    // 코인 스폰
    this.makeSpawnPlan();
    this.planIdx = 0;
  }

  finishGame() {
    if (this._finished) return;
    this._finished = true;
    this.controlsEnabled = false;
    this.timerEvt?.remove(false);

    this.time.delayedCall(300, () => {
      GameBridge.emitGameEnd(this.totalScore);
    });
  }

  /** 테스트용 – 지정 점수로 게임 종료 (GameBridge.forceGameEnd) */
  forceFinish(score) {
    this.totalScore = score;
    this.totalScoreText?.setText(`${this.totalScore}점`);
    this.finishGame();
  }

  /* ------------------------------------------------
   * Instructions
   * ----------------------------------------------*/
  makeInstructions(anchor) {
    const group = this.add.container(0, 0).setDepth(60).setPosition(anchor.x, anchor.y);
    
    const leftArrow = this.add.image(-230, -96, 'arrow').setOrigin(0.5, 1);
    const rightArrow = this.add.image(200, -96, 'arrow').setOrigin(0.5, 1);
	
    const guideTxt = this.add.image(0, -260, 'guide_text').setOrigin(0.5, 1);
	
    rightArrow.flipX = true;

    const text = this.add.image(0, 30, 'instruction_text_2');

    group.add([leftArrow, rightArrow, text, guideTxt]);

    return group;
  }

  async fadeOutInstructions(dur = 180) {
    if(!this.instructions) return;
    await new Promise(res => {
      this.tweens.add({
        targets: this.instructions,
        alpha: 0,
        duration: dur,
        onComplete: () => {
          this.instructions.destroy();
          this.instructions = null;
          res();
        }
      });
    });
  }

  /* ------------------------------------------------
   * Countdown
   * ----------------------------------------------*/
  runCountdown({ x, y, onComplete = () => {} } = {}) {
    const order = [0, 1, 2];
    const cx = x ?? this.scale.width / 2;
    const cy = y ?? this.scale.height / 2;

    const spr = this.add.sprite(cx, cy, 'cdn', order[0]).setDepth(100);

    this.sound.play('cd');

    let i = 0;
    const cdnEvt = this.time.addEvent({
      delay: 1000,
      repeat: order.length - 1,
      callback: () => {
        
        i++;
        spr.setFrame(order[i]);
        this.sound.play('cd');

        if(i === order.length - 1) {

          cdnEvt.remove(false)
		  
		  
          this.time.delayedCall(1000, () => { 

            
		  spr.setTexture("START")
		  spr.setScale(0.5);
		  
		   this.time.delayedCall(1000, () => { 

            
			  spr.destroy();

          });
		  
		  
		  
          this.sound.play('start');
           onComplete(); 

          });
        }
        else {
          
          
        } 
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cdnEvt.remove(false));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => cdnEvt.remove(false));
  }

  /* ------------------------------------------------
   * Timer UI
   * ----------------------------------------------*/
  updateTimer() {
    const elapsed = this.time.now - this.startAt;
    const p = Phaser.Math.Clamp(1 - (elapsed / this.gameMs), 0, 1);

    const sec = Math.max(0, Math.ceil((this.gameMs * p) / 1000));
    this.timeLeft.setText(`${sec}`);

    this.drawTimerBar(p);

    if(p <= 0) this.finishGame();
  }

  drawTimerBar(p) {
    const fullW = 781, x = 105, y = 110, h = 25, baseR = 12;
    const w = Math.max(0, Math.round(fullW * p));

    this.timerGraphics.clear();
    if(w <= 0) return;

    this.timerGraphics.fillStyle(0xe00842, 1);
    const r = Math.min(baseR, Math.floor(w / 2));
    this.timerGraphics.fillRoundedRect(x, y + this.offsetTop, w, h, r);
  }

  /* ------------------------------------------------
   * Spawn Plan & CAP X 계산
   * ----------------------------------------------*/
  makeSpawnPlan() { // 구간을 동등 분할한 뒤 각 슬롯 중앙에서 +-25% 정도 지터 추가
    const mkTimes = (n, start, end) => {
      if(n <= 0) return [];
      const dt = (end - start) / n;
      return Array.from({ length: n }, (_, i) => {
        const base = start + i * dt + dt * 0.5; // i번째 칸의 정중앙 시각
        const jitter = Phaser.Math.Between(-dt * 0.25, dt * 0.25);
        return Math.max(start, Math.min(end - 1, base + jitter));
      });
    };

    this.plan.length = 0;
    for(const win of this.spawnDrops) {
      ['coin1', 'coin2', 'cap'].forEach(type => {
        mkTimes(win.counts[type], win.start, win.end)
          .forEach(t => this.plan.push({ t, type }));
      });
    }
    this.plan.sort((a, b) => a.t - b.t);
  }

  getCapSpawnX() {
    const w = this.scale.width;
    const margin = 40;
    const now = this.time.now;

    const canAggro = (now - this._lastCapAt) >= this.capCooldown;
    const p = Math.min(this.capMaxP, this.capBaseP + this.combo * this.capPerCombo);
    const doAggro = canAggro && Math.random() < p;

    let x;
    if (doAggro) {
      // 추적: 예측 + 지터 + 최소 이격
      // 목표 보간 예측: 현재 x → 현재 targetX 사이를 capLead 만큼
      const target = (this.dragging && this.targetX != null)
        ? Phaser.Math.Clamp(this.targetX, this.minX, this.maxX)
        : this.player.x;
      const t = Phaser.Math.Clamp(this.capLead, 0, 1);
      const predicted = Phaser.Math.Linear(this.player.x, target, t);

      // 예측점 주변으로 지터
      x = predicted + Phaser.Math.Between(-this.capJitter, this.capJitter);

      // 최소 이격 (플레이어의 바로 위 금지, 왼/오로 밀어내기)
      const dx = x - this.player.x;
      if (Math.abs(dx) < this.capMinDX) {
        const dir = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
        x = this.player.x + dir * this.capMinDX;
      }
    } else {
      // 비추적: 플레이어 반대 절반의 1/3 영역
      const onRight = this.player.x >= w * 0.5;
      const leftRange = [margin, Math.floor(w * 0.33)];
      const rightRange = [Math.floor(w * 0.67), w - margin];
      const [lo, hi] = onRight ? leftRange : rightRange;
      x = Phaser.Math.Between(lo, hi);
    }

    x = Phaser.Math.Clamp(x, margin, w - margin);
    this._lastCapAt = now;
    return x;
  }

  /* ------------------------------------------------
   * Spawn One
   * ----------------------------------------------*/
  spawnOne(type) {
    console.log("spawnOne:"+type)
    const w = this.scale.width;
    const margin = 40;

    let x;
    if(type === 'cap') {
      x = this.getCapSpawnX();
    } else {
      // 코인: 좌<->우 번갈이 + 지터
      this.spawnFlip *= -1;
      const sideX = this.spawnFlip < 0 ? margin : (w - margin);
      x = Phaser.Math.Linear(sideX, w - sideX, Math.random());
      x += Phaser.Math.Between(-80, 80);
      x = Phaser.Math.Clamp(x, margin, w - margin);
    }

    // 시작 위치
    const y = -Phaser.Math.Between(90, 160);

    const grp = this.dropsGroup[type];
    // 풀에서 꺼내 활성화
    const s = grp.get(x, y, type);
    if(!s) return;
    s.setActive(true).setVisible(true).setPosition(x, y).setDepth(10).setAngle(Phaser.Math.Between(-10, 10));

    // 낙하 느낌 (cap이 더 빠르고 회전도 조금 큼)
    s.body.setAllowGravity(true);
    if(type === 'cap') {
      s.setVelocity(
        Phaser.Math.Between((-s.x < this.scale.width/2 ? -0 : -80), (-s.x < this.scale.width/2 ? 80 : 0)),
        Phaser.Math.Between(200, 600)
      );
    } else {
      s.setVelocity(
        Phaser.Math.Between((-s.x < this.scale.width/2 ? -0 : -60), (-s.x < this.scale.width/2 ? 60 : 0)),
        Phaser.Math.Between(160, 520)
      );
    }
    s.setAngularVelocity(Phaser.Math.Between(-120, 120));
    s.setCollideWorldBounds(false);
  }

  /* ------------------------------------------------
   * Score
   * ----------------------------------------------*/
    onCollect(sprite, type) {
    // 게임 종료 후 처리
    if (!this.controlsEnabled) {
      if(sprite.active) sprite.disableBody(true, true);
      return;
    }

    sprite.disableBody(true, true);

    const isCoin = (type === 'coin1' || type === 'coin2');

    if (isCoin) {
      // 코인 로직
      this.combo++;
      this.sound.play('coin');
      this.emitter.emitParticleAt(this.player.x, this.player.y-200, 4);

      let delta = this.SCORES[type];
      const c = this.combo;
      let bonus = 0;
      if(c >= 21) bonus = 5;
      else if(c >= 16) bonus = 4;
      else if(c >= 11) bonus = 3;
      else if(c >= 6) bonus = 2;
      else if(c >= 1) bonus = 1;
      delta += bonus;

      this.totalScore += delta;
      this.emitScorePopup(this.player.x, this.player.y - this.player.displayHeight + 12, `+${delta}`, '#259e03');

    } else { // cap 로직
      this.combo = 0;
      this.sound.play('hit');
      
      this.totalScore += this.SCORES[type];
      this.emitScorePopup(this.player.x, this.player.y - this.player.displayHeight + 12, `${this.SCORES[type]}`, '#e32155');

      // 스턴 효과 적용/재적용
      if (this.stunResetTimer) {
        this.stunResetTimer.remove(false);
      }
      this.tweens.killTweensOf(this.player);

      this.isHit = true;
      this.player.setTexture('pig_hole_purple');
      this.player.setAlpha(1); // 이전 트윈에서 알파가 이상하게 남아있을 수 있으므로 초기화
      this.followK = 4;

      // 깜빡임
      this.tweens.add({
          targets: this.player,
          alpha: 0.3,
          duration: 200,
          ease: 'Cubic.easeInOut',
          yoyo: true,
          repeat: 4
      });

      // 진동
      this.tweens.add({
          targets: this.player,
          y: this.player.y - 10,
          duration: 100,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: 9
      });

      this.stunResetTimer = this.time.delayedCall(2000, () => {
          this.isHit = false;
          this.player.setTexture('pig');
          this.followK = 90;
          this.player.setAlpha(1);
          this.player.y = this.scale.height - 140;
          this.stunResetTimer = null;
      });
    }

    // 점수 및 콤보 텍스트 업데이트 (공통)
    if(this.totalScore < 0) this.totalScore = 0;
    this.totalScoreText.setText(`${this.totalScore}점`);
    this.totalScoreSprite.x = this.totalScoreText.x - this.totalScoreText.displayWidth - 28;
    
    this.comboText.setVisible(this.combo > 0);
    this.comboText.setText(`${this.combo} COMBO`);
  }

  emitScorePopup(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      font: '600 54px Pretendard',
      color: color,
    }).setOrigin(0, 0.5).setDepth(105);

    this.tweens.add({
      targets: t, y: y - 80, alpha: 0, scale: 1.2, duration: 700, ease: 'Cubic.Out',
      onComplete: () => t.destroy()
    });
  }

  /* ------------------------------------------------
   * Input & Movement
   * ----------------------------------------------*/
  onPointerDown(pointer) {
    if(!this.controlsEnabled) return;
    this.dragging = true;
    this.targetX = pointer.worldX ?? pointer.x;
  }

  onPointerMove(pointer) {
    if(!this.controlsEnabled || !this.dragging) return;
    this.targetX = pointer.worldX ?? pointer.x;
  }

  onPointerUp() {
    this.dragging = false;
    this.targetX = null;
  }

  /* ------------------------------------------------
   * Update
   * ----------------------------------------------*/
  update(_time, delta) {
    if(this.time.timeScale === 0) return; // 탭 비활성화될 때 튈 수 있음 방지

    const dt = Math.min(delta / 1000, 0.033);  // 탭 비활성화될 때 튈 수 있음 방지

    if(this.controlsEnabled) {
      // 목표 있을 때만 x축 가속도 적용(스프링 + 감쇠)
      if(this.controlsEnabled) {
        if(this.dragging && this.targetX != null) {
          const desired = Phaser.Math.Clamp(this.targetX, this.minX, this.maxX);
          const dx = desired - this.player.x;
          const a = 1 - Math.exp(-this.followK * dt);
          this.player.x += dx * a;
          if(Math.abs(dx) < 0.3) this.player.x = desired; // 미세 스냅
        }

        // 경계
        this.player.x = Phaser.Math.Clamp(this.player.x, this.minX, this.maxX);

        // character flip
        const moved = this.player.x - this.lastX;
        if(Math.abs(moved) > 0.1) this.player.setFlipX(moved > 0);
        this.lastX = this.player.x;
      }
        
      // catchSensor를 player와 동기화
      if(this.catchSensor) {
        this.catchSensor.setPosition(this.player.x, this.player.y - this.player.displayHeight + 20);
        this.catchSensor.body.updateFromGameObject();
      }

      // 계획된 스폰 처리(인덱스 스텝)
      if (this.controlsEnabled && this.planIdx < this.plan.length) {
        const t = this.time.now - this.startAt;
        while (this.planIdx < this.plan.length && t >= this.plan[this.planIdx].t) {
          this.spawnOne(this.plan[this.planIdx].type);
          this.planIdx++;
        }
      }

      // 화면 밖으로 떨어진 낙하물 회수
      const h = this.scale.height;
      ['coin1', 'coin2', 'cap'].forEach(k => {
        this.dropsGroup[k].children.iterate(s => {
          if(s && s.active && s.y > h + 130) s.disableBody(true, true);
        });
      });

      // 구름 이동 처리
      const w = this.scale.width;
      this.clouds.children.iterate(cloud => {
        if (cloud.x > w + cloud.width) {
          cloud.x = -cloud.width;
        } else if (cloud.x < -cloud.width) {
          cloud.x = w + cloud.width;
        }
      });
    }
  }

  /* ------------------------------------------------
   * Cleanup
   * ----------------------------------------------*/
  shutdown() { this.finishGame(); }
  destroy()  { this.finishGame(); }


  restartGame() {
        // 게임 씬 재시작
        this.scene.restart();
  }


}