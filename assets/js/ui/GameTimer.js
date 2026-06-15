/** timer-bg.png 659×83, 내부 게이지바 543×50 */
const GAUGE = {
  width: 543,
  height: 45,
  notch: 4,
};

const LAYOUT = {
  border: 12,
  padX: 7,
  fontSize: 54,
  textYOffset: -2.5,
  colors: {
    fill: 0xe52d27,
    track: 0xd9d9d9,
    text: "#333333",
    notch: 0xffffff,
  },
};

function drawGaugeNotches(g, x, y, w, h, color, ends = "both") {
  const n = GAUGE.notch;
  g.fillStyle(color, 1);
  if (ends === "left" || ends === "both") {
    g.fillRect(x, y, n, n);
    g.fillRect(x, y + h - n, n, n);
  }
  if (ends === "right" || ends === "both") {
    g.fillRect(x + w - n, y, n, n);
    g.fillRect(x + w - n, y + h - n, n, n);
  }
}

/**
 * 픽셀 스타일 게임 타이머 (timer-bg + 게이지 + 초 표시)
 * fillProgress: 0(빈 상태) → 1(가득 참)
 */
export class GameTimer {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.config = { ...LAYOUT, ...options };

    const bg = scene.add.image(0, 0, "timer-bg").setOrigin(0, 0);
    this.width = bg.width;
    this.height = bg.height;

    const anchor = options.anchor ?? "left";
    const containerX = anchor === "left" ? x : x - this.width / 2;

    this.container = scene.add.container(containerX, y).setDepth(100);
    this.gaugeGfx = scene.add.graphics();
    this.timeText = scene.add
      .text(0, 0, "0", {
        font: `${this.config.fontSize}px DOSIyagi`,
        color: this.config.colors.text,
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    this.container.add([bg, this.gaugeGfx, this.timeText]);
    this._computeMetrics();
    this.update(0, options.totalSeconds ?? 0);
  }

  get centerY() {
    return this.container.y + this.height / 2;
  }

  get rightX() {
    return this.container.x + this.width;
  }

  _computeMetrics() {
    const { border, padX, textYOffset } = this.config;
    const innerH = this.height - border * 2;
    const gaugeX = border + padX;
    const gaugeY = border + Math.floor((innerH - GAUGE.height) / 2);

    const textZoneLeft = gaugeX + GAUGE.width;
    const textZoneRight = this.width - border;
    const textZoneW = textZoneRight - textZoneLeft;
    const textX = textZoneLeft + textZoneW / 2;
    const textY = this.height / 2 + textYOffset;

    this.metrics = {
      gaugeX,
      gaugeY,
      gaugeW: GAUGE.width,
      gaugeH: GAUGE.height,
      textX,
      textY,
      textZoneW,
    };
  }

  update(fillProgress, seconds) {
    const p = Phaser.Math.Clamp(fillProgress, 0, 1);
    const { colors } = this.config;
    const { gaugeX, gaugeY, gaugeW, gaugeH, textX, textY, textZoneW } =
      this.metrics;

    this.gaugeGfx.clear();

    this.gaugeGfx.fillStyle(colors.track, 1);
    this.gaugeGfx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);
    drawGaugeNotches(
      this.gaugeGfx,
      gaugeX,
      gaugeY,
      gaugeW,
      gaugeH,
      colors.notch,
      "both",
    );

    const fillW = Math.max(0, Math.round(gaugeW * p));
    if (fillW > 0) {
      this.gaugeGfx.fillStyle(colors.fill, 1);
      this.gaugeGfx.fillRect(gaugeX, gaugeY, fillW, gaugeH);
      drawGaugeNotches(
        this.gaugeGfx,
        gaugeX,
        gaugeY,
        fillW,
        gaugeH,
        colors.notch,
        "left",
      );
    }

    this.timeText
      .setPosition(textX, textY)
      .setFixedSize(textZoneW, 0)
      .setText(`${Math.max(0, Math.ceil(seconds))}`);
  }

  setY(y) {
    this.container.setY(y);
  }
}
