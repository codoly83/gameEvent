/** 점수 구간 및 결과 데이터 (캔버스 내부/외부 공용) */
export const SCORE_SEPS = [120, 219];

export const RESULT_ASSETS = {
  badIcon: './assets/images/new/bad_icon.png',
  goodIcon: './assets/images/new/good_icon.png',
  popper: './assets/images/party_popper_30deg.png',
  goBtn: './assets/images/go-btn-2.png',
  replayBtn: './assets/images/replay-btn.png',
  close: './assets/images/close5.png',
  particles: [
    './assets/images/particle1.png',
    './assets/images/particle2.png',
    './assets/images/particle3.png',
    './assets/images/particle4.png',
    './assets/images/particle5.png',
    './assets/images/particle6.png',
  ],
};

/** @returns {{ tier: 'fail'|'normal'|'success', age: string, content: string, icon: string }} */
export function getResultByScore(score) {
  if (score <= SCORE_SEPS[0]) {
    return {
      tier: 'fail',
      age: '[43세]',
      content: '조금 아쉬운 순발력이네요😢\n\n지금이 딱 점검할 타이밍!\n건강과 보장을 확인해 보세요!',
      icon: RESULT_ASSETS.badIcon,
    };
  }
  if (score <= SCORE_SEPS[1]) {
    return {
      tier: 'normal',
      age: '[29세]',
      content: '살짝 아쉽지만 괜찮은 반사신경이에요😊\n\n순발력 만큼 건강과 보장도\n상위권인지 확인해 보세요!',
      icon: RESULT_ASSETS.goodIcon,
    };
  }
  return {
    tier: 'success',
    age: '[17세]',
    content: '집중력과 민첩성이 아주 뛰어나요👏\n\n건강과 보장도 신체 나이만큼\n젊고 튼튼한지 체크해 보세요!',
    icon: RESULT_ASSETS.popper,
  };
}
