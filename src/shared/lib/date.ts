// 오늘 날짜 구하기
const currentDate = new Date();

const year = currentDate.getFullYear();
const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
const day = ("0" + currentDate.getDate()).slice(-2);

const formattedDate = year + month + day;

// 기존 코드 (초단기실황조회용 - 30분마다 데이터 갱신)
// 현재 시간에서 -30분 시간 구하기 (30분마다 데이터 갱신)
// let hours = ("0" + currentDate.getHours()).slice(-2);
// let minutes = ("0" + (currentDate.getMinutes() - 30)).slice(-2);
// 만약 minutes가 30보다 작으면 hours에서 1을 빼주기
// if (currentDate.getMinutes() < 30) {
//   hours = ("0" + (currentDate.getHours() - 1)).slice(-2);
//   minutes = ("0" + (currentDate.getMinutes() + 30)).slice(-2);
// }
// const formattedTime = hours + minutes;

// 단기예보용 base_time 계산 (하루 8회 제공: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300)
// API 제공 시간은 base_time으로부터 10분 뒤
// 예: base_time이 1400이면 → API는 14:10부터 사용 가능
// 로직: 현재 시간이 base_time + 10분 이후인 가장 최근 base_time을 선택
// 예: 현재 14:15 → 14:15 >= 14:10? Yes → base_time: 1400
// 예: 현재 14:09 → 14:09 >= 14:10? No → 14:09 >= 11:10? Yes → base_time: 1100
// 예: 현재 02:05 → 02:05 >= 02:10? No → 02:05 >= 23:10? (전날) → base_time: 2300
const getFormattedTimeForVilageFcst = (): string => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // 현재 시간을 분 단위로 변환
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // base_time 목록 (하루 8회, 시간만)
  const baseTimeHours = [2, 5, 8, 11, 14, 17, 20, 23];

  // 현재 시간보다 작거나 같은 가장 최근의 API 제공 시작 시간 찾기
  // API 제공 시작 시간 = base_time + 10분
  let selectedBaseTimeHour = 2; // 기본값: 0200

  for (let i = baseTimeHours.length - 1; i >= 0; i--) {
    const baseTimeHour = baseTimeHours[i];
    const apiAvailableTime = baseTimeHour * 60 + 10; // base_time + 10분

    // 현재 시간이 API 제공 시작 시간 이후라면 해당 base_time 사용
    if (currentTimeInMinutes >= apiAvailableTime) {
      selectedBaseTimeHour = baseTimeHour;
      break;
    }
  }

  // 만약 현재 시간이 02:10 이전이면 전날 23:00 사용
  if (currentTimeInMinutes < 130) {
    // 130분 = 02:10
    selectedBaseTimeHour = 23;
  }

  return ("0" + selectedBaseTimeHour).slice(-2) + "00";
};

const formattedTime = getFormattedTimeForVilageFcst();

export { formattedDate, formattedTime };
