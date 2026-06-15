import { GameBridge } from "../GameBridge.js";
import { GameTimer } from "../ui/GameTimer.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.gameMs = 60000;
    this.dropTypes = [
      "plus1",
      "plus2",
      "plus3",
      "plus4",
      "minus1",
      "minus2",
      "minus3",
    ];
    this.spawnCounts = {
      plus1: 16,
      plus2: 40,
      plus3: 20,
      plus4: 8,
      minus1: 20,
      minus2: 12,
      minus3: 10,
    };
    this.spawnEndBufferMs = 2000;
  }

  /* ------------------------------------------------
   * Init
   * ----------------------------------------------*/
  init() {
    // Game/UI
    this.totalScore = 0;
    this.combo = 0;
    this._finished = false;
    this.SCORES = {
      plus1: 0,
      plus2: 30,
      plus3: 50,
      plus4: 100,
      minus1: -10,
      minus2: -20,
      minus3: -30,
    };

    // Player hit state
    this.isHit = false;
    this.stunResetTimer = null;
    this.characterResetTimer = null;

    // Player
    this.controlsEnabled = false;
    this.dragging = false;
    this.targetX = null;
    this.minX = 40; // 화면 좌/우 마진
    this.maxX = null; // create에서 화면 너비로 계산
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // 숨겨질 때 현재 시간 기록
        this.hiddenAt = performance.now();
        this.time.timeScale = 0; //
      } else {
        // 다시 보일 때: 숨겨져 있던 시간만큼 startAt 보정
        if (this.hiddenAt) {
          console.log("bf:" + this.startAt);
          const hiddenDuration = performance.now() - this.hiddenAt;
          this.startAt += hiddenDuration; // startAt을 뒤로 미룸
          this.hiddenAt = null;

          //this._lastCapAt += hiddenDuration; // cap 스폰 타이밍도 보정

          setTimeout(() => {
            this.time.timeScale = 1; //
          }, 1);

          //this.time.timeScale = 1; //
        }
      }
    });

    this.scene.get("BgmManager").playBgm("bgm-ingame");
  }

  /* ------------------------------------------------
   * Create
   * ----------------------------------------------*/
  create() {
    const { width, height } = this.scale;
    this.maxX = width - this.minX;

    // bg
    const bg = this.add.image(width / 2, height / 2, "bg");

    // Clouds
    this.clouds = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const cloudKey = `cloud${Phaser.Math.Between(1, 4)}`;
      const cloud = this.clouds.create(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(50, 800),
        cloudKey,
      );
      cloud.body.setAllowGravity(false);
      cloud.setVelocityX(
        Phaser.Math.Between(20, 60) * (Math.random() > 0.5 ? 1 : -1),
      );
      cloud.setAlpha(0.8);
    }

    this.physics.world.setBounds(0, -200, width, height + 400);
    this.physics.world.gravity.y = 160;
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

    let offsetTop = 70;

    this.offsetTop = offsetTop;

    const HUD_LEFT = 60;
    const HUD_Y = 87;

    // timer (timer-bg.png, 왼쪽 정렬)
    this.timer = new GameTimer(this, HUD_LEFT, HUD_Y, {
      anchor: "left",
      totalSeconds: this.gameMs / 1000,
    });

    // 점수 (타이머와 같은 라인, 오른쪽)
    const scoreY = this.timer.centerY;
    this.scoreRight = width - 60;

    this.totalScoreSprite = this.add
      .image(this.scoreRight, scoreY, "coin")
      .setOrigin(1, 0.5)
      .setDepth(100);
    this.totalScoreText = this.add
      .text(0, scoreY, `${this.totalScore}`, {
        color: "#ffffff",
        font: "53px DOSIyagi",
      })
      .setOrigin(1, 0.5)
      .setDepth(100);
    this._layoutScoreHud();
    this.totalScoreGroup = this.add.group([
      this.totalScoreSprite,
      this.totalScoreText,
    ]);

    // character
    this.player = this.add
      .sprite(width / 2, height - 280, "character")
      .setOrigin(0.5, 1)
      .setDepth(100);
    this.playerBaseY = height - 280;
    this.player.setInteractive({ cursor: "pointer" });

    // 동전 캐치 센서
    this.catchSensor = this.add
      .zone(
        this.player.x,
        this.player.y - this.player.displayHeight + 40,
        280,
        40,
      )
      .setOrigin(0.5, 0.5);
    this.physics.add.existing(this.catchSensor, true);

    // input
    this.player.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerup", this.onPointerUp, this);
    this.input.on("pointerupoutside", this.onPointerUp, this);

    this.dropsGroup = Object.fromEntries(
      this.dropTypes.map((type) => [
        type,
        this.physics.add.group({ maxSize: 50 }),
      ]),
    );

    this.dropTypes.forEach((type) => {
      this.physics.add.overlap(
        this.catchSensor,
        this.dropsGroup[type],
        (_z, s) => this.onCollect(s, type),
      );
    });

    // countdown
    this.runCountdown({
      onComplete: async () => {
        await this.fadeOutInstructions(160);
        this.startGame();
      },
    });

    this.emitter = this.add
      .particles(0, 0, "particle1", {
        lifespan: 4000,
        speed: { min: 200, max: 350 },
        alpha: { start: 1, end: 0 },
        scale: { start: 0.7, end: 1.3 },
        rotate: { start: 0, end: 360 },
        gravityY: 200,
        emitting: false,
      })
      .setDepth(101);
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
      callback: () => this.updateTimer(),
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
    this.scene.get("BgmManager").stopBgm();

    this.time.delayedCall(300, () => {
      GameBridge.emitGameEnd(this.totalScore);
    });
  }

  /** 테스트용 – 지정 점수로 게임 종료 (GameBridge.forceGameEnd) */
  forceFinish(score) {
    this.totalScore = score;
    this.totalScoreText?.setText(`${this.totalScore}`);
    this._layoutScoreHud?.();
    this.finishGame();
  }

  async fadeOutInstructions(dur = 180) {
    if (!this.instructions) return;
    await new Promise((res) => {
      this.tweens.add({
        targets: this.instructions,
        alpha: 0,
        duration: dur,
        onComplete: () => {
          this.instructions.destroy();
          this.instructions = null;
          res();
        },
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

    const spr = this.add.sprite(cx, cy, "cdn", order[0]).setDepth(100);

    let i = 0;
    const cdnEvt = this.time.addEvent({
      delay: 1000,
      repeat: order.length - 1,
      callback: () => {
        i++;
        spr.setFrame(order[i]);

        if (i === order.length - 1) {
          cdnEvt.remove(false);

          this.time.delayedCall(1000, () => {
            spr.setTexture("START");
            spr.setScale(0.5);

            this.time.delayedCall(1000, () => {
              spr.destroy();
            });

            onComplete();
          });
        } else {
        }
      },
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cdnEvt.remove(false));
    this.events.once(Phaser.Scenes.Events.DESTROY, () => cdnEvt.remove(false));
  }

  _layoutScoreHud() {
    const gap = 12;
    this.totalScoreText.x = this.scoreRight;
    this.totalScoreSprite.x =
      this.scoreRight - this.totalScoreText.displayWidth - gap;
  }

  /* ------------------------------------------------
   * Timer UI
   * ----------------------------------------------*/
  updateTimer() {
    const elapsed = this.time.now - this.startAt;
    const remainingP = Phaser.Math.Clamp(1 - elapsed / this.gameMs, 0, 1);
    const fillP = Phaser.Math.Clamp(elapsed / this.gameMs, 0, 1);

    const sec = Math.max(0, Math.ceil((this.gameMs * remainingP) / 1000));
    this.timer.update(fillP, sec);

    if (remainingP <= 0) this.finishGame();
  }

  /* ------------------------------------------------
   * Spawn Plan & CAP X 계산
   * ----------------------------------------------*/
  makeSpawnPlan() {
    this.plan.length = 0;

    const entries = [];
    for (const type of this.dropTypes) {
      const n = this.spawnCounts[type] ?? 0;
      for (let i = 0; i < n; i++) entries.push(type);
    }
    if (entries.length === 0) return;

    const types = this._spreadTypes(entries);
    const spawnEnd = this.gameMs - this.spawnEndBufferMs;
    const interval = spawnEnd / types.length;

    types.forEach((type, i) => {
      this.plan.push({ t: i * interval + interval * 0.5, type });
    });
  }

  /** 동일 타입이 연속으로 몰리지 않게 라운드로빈 배치 */
  _spreadTypes(types) {
    const remaining = {};
    for (const type of types) {
      remaining[type] = (remaining[type] ?? 0) + 1;
    }

    const order = Object.keys(remaining).sort(
      (a, b) => remaining[b] - remaining[a],
    );
    const result = [];

    while (result.length < types.length) {
      for (const type of order) {
        if (remaining[type] > 0) {
          result.push(type);
          remaining[type]--;
        }
      }
      order.sort((a, b) => remaining[b] - remaining[a]);
    }

    return result;
  }

  getCapSpawnX() {
    const w = this.scale.width;
    const margin = 40;
    const now = this.time.now;

    const canAggro = now - this._lastCapAt >= this.capCooldownMs;
    const p = Math.min(
      this.capMaxP,
      this.capBaseP + this.combo * this.capPerCombo,
    );
    const doAggro = canAggro && Math.random() < p;

    let x;
    if (doAggro) {
      // 추적: 예측 + 지터 + 최소 이격
      // 목표 보간 예측: 현재 x → 현재 targetX 사이를 capLead 만큼
      const target =
        this.dragging && this.targetX != null
          ? Phaser.Math.Clamp(this.targetX, this.minX, this.maxX)
          : this.player.x;
      const t = Phaser.Math.Clamp(this.capLead, 0, 1);
      const predicted = Phaser.Math.Linear(this.player.x, target, t);

      // 예측점 주변으로 지터
      x = predicted + Phaser.Math.Between(-this.capJitterX, this.capJitterX);

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
    const w = this.scale.width;
    const margin = 40;

    let x;
    if (type.startsWith("minus")) {
      x = this.getCapSpawnX();
    } else {
      // 코인: 좌<->우 번갈이 + 지터
      this.spawnFlip *= -1;
      const sideX = this.spawnFlip < 0 ? margin : w - margin;
      x = Phaser.Math.Linear(sideX, w - sideX, Math.random());
      x += Phaser.Math.Between(-80, 80);
      x = Phaser.Math.Clamp(x, margin, w - margin);
    }

    // 시작 위치
    const y = -Phaser.Math.Between(90, 160);

    const grp = this.dropsGroup[type];
    const s = grp.get(x, y, type);
    if (!s) return;

    s.setActive(true).setVisible(true).setAlpha(1);
    s.setPosition(x, y);
    s.setDepth(10);
    s.setAngle(Phaser.Math.Between(-10, 10));

    if (s.body) {
      s.enableBody(true, x, y, true, true);
      s.body.reset(x, y);
      s.body.setAllowGravity(true);
      s.body.setVelocity(0, 0);
      s.body.setAngularVelocity(0);
    }

    // 낙하 느낌 (cap이 더 빠르고 회전도 조금 큼)
    if (type.startsWith("minus")) {
      s.setVelocity(
        Phaser.Math.Between(
          -s.x < this.scale.width / 2 ? -0 : -50,
          -s.x < this.scale.width / 2 ? 50 : 0,
        ),
        Phaser.Math.Between(70, 200),
      );
    } else {
      s.setVelocity(
        Phaser.Math.Between(
          -s.x < this.scale.width / 2 ? -0 : -40,
          -s.x < this.scale.width / 2 ? 40 : 0,
        ),
        Phaser.Math.Between(60, 170),
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
      if (sprite.active) sprite.disableBody(true, true);
      return;
    }

    sprite.disableBody(true, true);

    const isPlus = type.startsWith("plus");

    if (isPlus) {
      this.combo++;
      this.sound.play("coin", { volume: 0.4 });
      this.emitter.emitParticleAt(this.player.x, this.player.y - 200, 4);

      const delta = this.SCORES[type];
      this.totalScore += delta;
      this.setPlayerFace("character_plus", 500);
      this.emitScorePopup(
        this.player.x,
        this.player.y - this.player.displayHeight + 12,
        `+${delta}`,
        "#e00842",
      );
    } else {
      this.combo = 0;
      this.sound.play("wrong", { volume: 0.4 });

      const delta = this.SCORES[type];
      this.totalScore += delta;
      this.emitScorePopup(
        this.player.x,
        this.player.y - this.player.displayHeight + 12,
        `${delta}`,
        "#333d47",
      );

      // 스턴 효과 적용/재적용
      if (this.stunResetTimer) {
        this.stunResetTimer.remove(false);
      }
      if (this.characterResetTimer) {
        this.characterResetTimer.remove(false);
        this.characterResetTimer = null;
      }
      this.tweens.killTweensOf(this.player);

      this.isHit = true;
      this.player.setTexture("character_minus");
      this.player.setAlpha(1);
      this.player.y = this.playerBaseY;
      this.followK = 4;

      // 깜빡임
      this.tweens.add({
        targets: this.player,
        alpha: 0.3,
        duration: 200,
        ease: "Cubic.easeInOut",
        yoyo: true,
        repeat: 4,
      });

      this.stunResetTimer = this.time.delayedCall(2000, () => {
        this.isHit = false;
        this.player.setTexture("character");
        this.followK = 90;
        this.player.setAlpha(1);
        this.player.y = this.playerBaseY;
        this.stunResetTimer = null;
      });
    }

    // 점수 업데이트 (공통)
    if (this.totalScore < 0) this.totalScore = 0;
    this.totalScoreText.setText(`${this.totalScore}`);
    this._layoutScoreHud();
  }

  setPlayerFace(textureKey, duration = 0) {
    if (this.characterResetTimer) {
      this.characterResetTimer.remove(false);
      this.characterResetTimer = null;
    }

    if (!this.isHit) {
      this.player.setTexture(textureKey);
    }

    if (duration > 0 && !this.isHit) {
      this.characterResetTimer = this.time.delayedCall(duration, () => {
        if (!this.isHit) {
          this.player.setTexture("character");
        }
        this.characterResetTimer = null;
      });
    }
  }

  emitScorePopup(x, y, text, color) {
    const t = this.add
      .text(x, y, text, {
        font: "600 54px DOSIyagi",
        color: color,
      })
      .setOrigin(0, 0.5)
      .setDepth(105);

    this.tweens.add({
      targets: t,
      y: y - 80,
      alpha: 0,
      scale: 1.2,
      duration: 700,
      ease: "Cubic.Out",
      onComplete: () => t.destroy(),
    });
  }

  /* ------------------------------------------------
   * Input & Movement
   * ----------------------------------------------*/
  onPointerDown(pointer) {
    if (!this.controlsEnabled) return;
    this.dragging = true;
    this.targetX = pointer.worldX ?? pointer.x;
  }

  onPointerMove(pointer) {
    if (!this.controlsEnabled || !this.dragging) return;
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
    if (this.time.timeScale === 0) return; // 탭 비활성화될 때 튈 수 있음 방지

    const dt = Math.min(delta / 1000, 0.033); // 탭 비활성화될 때 튈 수 있음 방지

    if (this.controlsEnabled) {
      // 목표 있을 때만 x축 가속도 적용(스프링 + 감쇠)
      if (this.controlsEnabled) {
        if (this.dragging && this.targetX != null) {
          const desired = Phaser.Math.Clamp(this.targetX, this.minX, this.maxX);
          const dx = desired - this.player.x;
          const a = 1 - Math.exp(-this.followK * dt);
          this.player.x += dx * a;
          if (Math.abs(dx) < 0.3) this.player.x = desired; // 미세 스냅
        }

        // 경계
        this.player.x = Phaser.Math.Clamp(this.player.x, this.minX, this.maxX);
      }

      // catchSensor를 player와 동기화
      if (this.catchSensor) {
        this.catchSensor.setPosition(
          this.player.x,
          this.player.y - this.player.displayHeight + 20,
        );
        this.catchSensor.body.updateFromGameObject();
      }

      // 계획된 스폰 처리 (밀린 스폰은 프레임당 여러 개 catch-up)
      if (this.controlsEnabled && this.planIdx < this.plan.length) {
        const t = this.time.now - this.startAt;
        while (
          this.planIdx < this.plan.length &&
          t >= this.plan[this.planIdx].t
        ) {
          this.spawnOne(this.plan[this.planIdx].type);
          this.planIdx++;
        }
      }

      // 화면 밖으로 떨어진 낙하물 회수
      const h = this.scale.height;
      this.dropTypes.forEach((k) => {
        this.dropsGroup[k].children.iterate((s) => {
          if (s && s.active && s.y > h + 130) s.disableBody(true, true);
        });
      });

      // 구름 이동 처리
      const w = this.scale.width;
      this.clouds.children.iterate((cloud) => {
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
  shutdown() {
    this.timerEvt?.remove(false);
  }
  destroy() {
    this.timerEvt?.remove(false);
  }

  restartGame() {
    // 게임 씬 재시작
    this.scene.restart();
  }
}
