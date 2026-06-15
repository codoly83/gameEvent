export default class BaseScene extends Phaser.Scene {

    
  elastic(o, rate, duration, onComplete){

     this.tweens.add({
        targets: o,
        scaleX: 1 + 0.1 * rate,
        scaleY: 1 + 0.15 * rate,
        duration: duration * 0.3,
        ease: 'Back.easeOut',
        onComplete: () => {
            this.tweens.add({
                targets: o,
                scaleX: 1 - 0.06 * rate,
                scaleY: 1 - 0.09 * rate,
                duration: duration * 0.16,
                ease: 'Back.easeOut',
                
                onComplete: () => {
                    this.tweens.add({
                        targets: o,
                        scaleX: 1.0 * rate,
                        scaleY: 1.0 * rate,
                        duration: duration * 0.13,
                        ease: 'Back.easeOut',
                        onComplete: onComplete
                    });
                }
                
            });
        }

    });

  }


  elasticReverse(o, rate, duration, onComplete){

     this.tweens.add({
        targets: o,
        scaleX: 1 - 0.16 * rate,
        scaleY: 1 - 0.22 * rate,
        duration: duration * 0.15,
        ease: 'Back.easeOut',
        onComplete: () => {
            this.tweens.add({
                targets: o,
                scaleX: 1 + 0.13 * rate,
                scaleY: 1 + 0.18 * rate,
                duration: duration * 0.4,
                ease: 'Back.easeOut',
                
                onComplete: () => {
                    this.tweens.add({
                        targets: o,
                        scaleX: 1.0 * rate,
                        scaleY: 1.0 * rate,
                        duration: duration * 0.3,
                        ease: 'Back.easeOut',
                        onComplete: onComplete
                    });
                }
                
            });
        }

    });

  }

}