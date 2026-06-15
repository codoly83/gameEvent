export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    /*
  // 화면 배경 흰색
	this.cameras.main.setBackgroundColor('#ffffff');

	const { width, height } = this.cameras.main;

	// 바 크기 설정
	const barWidth = Math.min(600, width * 0.7); // 화면 너비에 맞게
	const barHeight = 48;
	const x = (width - barWidth) / 2;
	const y = (height - barHeight) / 2;

	// 외곽선(회색)과 내부(노란색) 그래픽
	const border = this.add.graphics();
	border.lineStyle(2, 0xcccccc);
	border.strokeRoundedRect(x - 2, y - 2, barWidth + 4, barHeight + 4, 6);

	const progressBar = this.add.graphics();
	const progressBox = this.add.graphics();
	progressBox.fillStyle(0xffffff, 0.001); // 투명 박스(클릭 방지 등 필요 시)
	progressBox.fillRoundedRect(x, y, barWidth, barHeight, 6);

	// 퍼센트 텍스트
	const percentText = this.add.text(width/2, y + barHeight/2, '0%', {
	  font: '18px Arial',
	  fill: '#000000'
	}).setOrigin(0.5);

	// 설명 텍스트 (옵션)
	const loadingText = this.add.text(width/2, y - 30, 'Loading...', {
	  font: '20px Arial',
	  fill: '#000000'
	}).setOrigin(0.5);

	// 실제 로드 진행에 따라 바 채우기
	this.load.on('progress', (value) => {
	  progressBar.clear();
	  // 노란색 채우기
	  progressBar.fillStyle(0xe00842, 1); // 노란색 (#FFD400)
	  const w = Math.floor(barWidth * value);
	  // 약간 둥근 모서리로 그리기
	  progressBar.fillRoundedRect(x, y, w, barHeight, 6);
	  percentText.setText(Math.round(value * 100) + '%');
	});
	*/
    this.load.on("progress", (value) => {
      if (value == 1) {
        document.getElementById("loading-screen").style.display = "none";
        document.querySelector(".cover").style.display = "none";
      }
    });

    this.load.image("bg", "./assets/images/bg.png");
    this.load.image("title", "./assets/images/title.png");
    this.load.image("piggy_bank", "./assets/images/piggy_bank.png");
    this.load.image("piggy_bank_upper", "./assets/images/piggy_bank_upper.png");
    this.load.image("character", "./assets/images/character.png");
    this.load.image("character_plus", "./assets/images/character_plus.png");
    this.load.image("character_minus", "./assets/images/character_minus.png");
    this.load.image("coin", "./assets/images/coin.png");
    this.load.image("plus1", "./assets/images/plus-1.png");
    this.load.image("plus2", "./assets/images/plus-2.png");
    this.load.image("plus3", "./assets/images/plus-3.png");
    this.load.image("plus4", "./assets/images/plus-4.png");
    this.load.image("minus1", "./assets/images/minus-1.png");
    this.load.image("minus2", "./assets/images/minus-2.png");
    this.load.image("minus3", "./assets/images/minus-3.png");
    this.load.image("arrow", "./assets/images/arrow.png");
    this.load.image("popper", "./assets/images/party_popper_30deg.png");
    this.load.image("instruction_text", "./assets/images/instruction-text.png");
    this.load.image(
      "instruction_text_2",
      "./assets/images/instruction-text-2.png",
    );
    this.load.image(
      "instruction_score",
      "./assets/images/new/instruction-score.png",
    );
    this.load.image("start_btn", "./assets/images/start-btn.png");
    this.load.image("go_btn", "./assets/images/go-btn-2.png");
    this.load.image("replay_btn", "./assets/images/replay-btn.png");
    this.load.spritesheet("cdn", "./assets/images/countdown-sprite.png", {
      frameWidth: 282,
      frameHeight: 365,
      endFrame: 2,
    });

    this.load.image("particle1", "./assets/images/particle1.png");
    this.load.image("particle2", "./assets/images/particle2.png");
    this.load.image("particle3", "./assets/images/particle3.png");
    this.load.image("particle4", "./assets/images/particle4.png");
    this.load.image("particle5", "./assets/images/particle5.png");
    this.load.image("particle6", "./assets/images/particle6.png");

    this.load.image("guide_text", "./assets/images/guide_text.png");
    this.load.image("timer-bg", "./assets/images/timer-bg.png");
    this.load.image("START", "./assets/images/START.png");

    this.load.image("bad_icon", "./assets/images/new/bad_icon.png");
    this.load.image("good_icon", "./assets/images/new/good_icon.png");
    this.load.image("cloud1", "./assets/images/new/cloud 1.png");
    this.load.image("cloud2", "./assets/images/new/cloud 2.png");
    this.load.image("cloud3", "./assets/images/new/cloud 3.png");
    this.load.image("cloud4", "./assets/images/new/cloud 4.png");

    this.load.audio("coin", "assets/sounds/coin.mp3");
    this.load.audio("wrong", "assets/sounds/wrong.mp3");
    this.load.audio("bgm-ingame", "assets/sounds/bgm-ingame.mp3");
  }

  async create() {
    try {
      await Promise.all([
        document.fonts.load('38px "DOSIyagi"'),
        document.fonts.load('42px "DOSIyagi"'),
        document.fonts.load('53px "DOSIyagi"'),
        document.fonts.load('700 50px "DOSIyagi"'),
      ]);
    } catch (e) {}

    this.scene.start("StartScene");
  }
}
