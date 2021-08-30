// 기타 함수 및 상수정의 부분
import { Dimensions, Platform, StatusBar } from 'react-native';

const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height, width } = Dimensions.get('window');

export const isIPhoneX = () => Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? width === X_WIDTH && height === X_HEIGHT || width === XSMAX_WIDTH && height === XSMAX_HEIGHT
    : false;

export const StatusBarHeight = Platform.select({
    ios: isIPhoneX() ? 40 : 20,
    android: StatusBar.currentHeight,
    default: 0
})


export function isIOS() {
    return Platform.OS == 'ios' ? true : false;
}

export function getCurUserIx() {
    if (global.curUser) {
        return global.curUser.user_ix
    } else {
        return ''
    }
}

export function topPadding() {
    return Platform.OS == 'ios' ? 0 : StatusBar.currentHeight;
}

export function selTabToStr(index) {
    let tabStr = ''
    if (index == 0) tabStr = 'random'
    else if (index == 1) tabStr = 'genre'
    else if (index == 2) tabStr = 'platform'
    return tabStr
}

export function NumToDay(num) {
    let day = '';
    if (num == 0) day = '월'
    else if (num == 1) day = '화'
    else if (num == 2) day = '수'
    else if (num == 3) day = '목'
    else if (num == 4) day = '금'
    else if (num == 5) day = '토'
    else if (num == 6) day = '일'
    else if (num == 7) day = '완결'
    return day
}

export function NumToPlatform(num) {
    let platform = '';
    if (num == 0) platform = 'naver'
    else if (num == 1) platform = 'daum'
    else if (num == 2) platform = 'lezhin'
    return platform
}

export function zeroArray(length) {
    let data = []
    for (let i = 0; i < length; i++) {
        data.push(0)
    }
    return data
}

export function getDayName() {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let now = new Date()
    return days[now.getDay()]
}

export function convertDayToNum(day) {
    let num = 0
    switch(day) {
        case 'Sunday':
            num = 6;
            break;
        case 'Monday':
            num = 0;
            break;
        case 'Tuesday':
            num = 1;
            break;
        case 'Wednesday':
            num = 2;
            break;
        case 'Thursday':
            num = 3;
            break;
        case 'Friday':
            num = 4;
            break;
        case 'Saturday':
            num = 5;
            break;
    }

    return num
}

// "image": "./assets/splash.png",
// "resizeMode": "contain",

const Constants = {
    restApiKey: "435d5eaf7d353b5843a07c8b59d4084e",
    NaverClientID: 'gATUCDrb7TiwdMtzmTLi',
    NaverClientSecret: 'bi4Xqt_Xuo',
    NaverState: '',

    WINDOW_WIDTH: Dimensions.get('window').width,
    WINDOW_HEIGHT: Dimensions.get('window').height,
    HeaderHeight: Platform.OS == 'ios' ? isIPhoneX() ? 90 : 70 : 65,
    BottomHeight: Platform.OS == 'ios' ? isIPhoneX() ? 70 : 60 : 50,

    TitleList: ['전체', '장르별', '플랫폼별'],
    GenreList: ['일상', '개그', '드라마', '액션', '판타지', '로맨스', '감성', '스릴러', '시대극', '스포츠'],
    PlatformList: ['네이버', '다음', '레진'],
    FilterListAppr: ['전체', '평점순', '가나다순'],
    FilterListPick: ['전체', '가나다순', '최신순'],
    WeekList: ['월', '화', '수', '목', '금', '토', '일','완\n결'],
    WeekListDay: ['월', '화', '수', '목', '금', '토', '일','완결'],
    AccountList: ['닉네임 변경', '비밀번호 변경', '탈퇴하기'],
    ClientList: ['1:1 문의', '문의내역', 'FAQ공지'],
    ContactList: [
        { label: '서비스 문의', value: '서비스 문의' },
        { label: '회원 문의', value: '회원문의' },
        { label: '제휴 문의', value: '제휴문의' },
        { label: '기타 문의', value: '기타문의' },
    ],
    FaqList: [
        {
            question: '픽툰은 어떤 서비스 인가요?',
            answer: '픽툰은 AI를 통해 개인의 웹툰 취향을 분석하고 웹툰을 추천하는 큐레이션 서비스입니다. 기존 장르, 작가 위주의 추천에서 그림체를 분석하여 취향에 반영하였습니다.'

        },
        {
            question: '추천된 웹툰이 마음에 들지 않아요.',
            answer: '추천 알고리즘은 꾸준히 업데이트를 하고 있습니다. 어떤 점이 별로였는지 알려주시면 반영하여 서비스를 더욱 발전시킬 수 있습니다!'
        },
        {
            question: '제가 보는 웹툰 플랫폼이 없어요.',
            answer: '웹툰 플랫폼은 꾸준히 업데이트 하고 있습니다. 원하는 플랫폼이 있으실 경우 1:1 문의하기로 문의해주시면 업데이트 때 반영하겠습니다.'
        },
        {
            question: '픽툰은 무료인가요?',
            answer: '네 픽툰에서 사용하시는 모든 추천서비스는 무료입니다.'
        }

    ],


    style: {
        defaultShadow: {
            elevation: 5,
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.2,
        }
    },

    mainColor: '#2e2e2e',
    darkColor: '#2e2e2e',
    starColor: '#FDCC0D',
}

export default Constants;