// BgmManager.js
export default class BgmManager extends Phaser.Scene {
  constructor() {
    super({ key: 'BgmManager', active: true }); // always active
  }

  create() {
    this.currentKey = null;
    this.currentBgm = null;
  }

  playBgm(key) {
    if (this.currentKey === key) return; // already playing this one

    // Stop old BGM smoothly
    if (this.currentBgm && this.currentBgm.isPlaying) {
      this.tweens.add({
        targets: this.currentBgm,
        volume: 0,
        duration: 800,
        onComplete: () => {
          this.currentBgm.stop();
          this.startNewBgm(key);
        },
      });
    } else {
      this.startNewBgm(key);
    }
  }

  startNewBgm(key) {
    this.currentKey = key;
    this.currentBgm = this.sound.add(key, { loop: true, volume: 0 });
    this.currentBgm.play();

    // Fade in
    this.tweens.add({
      targets: this.currentBgm,
      volume: 0.5,
      duration: 800,
    });
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm = null;
      this.currentKey = null;
    }
  }
}