import React, { useEffect, useState, useRef } from 'react';
import {StyleSheet, View,  Text as RNText, Dimensions, Animated, Alert,Image, Platform, BackHandler, ToastAndroid, TouchableNativeFeedback} from 'react-native';
import { PanGestureHandler, State ,TapGestureHandler, TouchableWithoutFeedback, TouchableOpacity } from 'react-native-gesture-handler';
import Svg,{ Path, G, TSpan, Text, Circle } from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import { snap } from '@popmotion/popcorn';
import RestAPI from './src/Utils/RestAPI';
import Constants from './src/Utils/Constant';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { InterstitialAd, BannerAdSize, RewardedAd, BannerAd, TestIds,AdEventType } from '@react-native-firebase/admob';
import admob, { MaxAdContentRating } from '@react-native-firebase/admob';

const { width } = Dimensions.get('screen');

const numberOfSegments = 14; //조각수
const wheelSize = width * 1.3; //휠 넓이
const fontSize = 18;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments; // 한조각 각도
const angleOffset = angleBySegment / 2;  //한조각 각도 / 2 

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === 'android' ?'ca-app-pub-4921379670898015/7026721358' : 'ca-app-pub-4921379670898015/6276197724';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

export default function App (extra){

  useEffect(()=>{
    admob()
    .setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
    })
    .then(() => {
      // Request config successfully set!
    });
  },[])
const [enabled , setEnabled] = useState(true);
const [finished , setFinished] = useState(false);
const arrow = useRef();
const [wheeldata,setWheeldata] = useState('');
const [loaded, setLoaded] = useState(false);
const [tum,setTum] = useState(0);
const [result,setResult] = useState();
const [platform,setPlatform] = useState();
const [start,setStart] = useState(false);
const [count,setCount] = useState(0);
const [arc,setArc] = useState();
const [ad,setAd] =useState();
const [no,setNo] = useState();
const [newangle,setNewangle] = useState();
let ready1 = false;
let ready2 = false;
let trigger = false;
let speed1 , speed2 ,speed3 , speed4 ;
angle = 0;
// const [angle, setAngle] = useState(0);
//  animated.value 애니메니션 초기화.
const genre = [
  {title:'일상',value:1},
  {title:'개그',value:2},
  {title:'드라마',value:3},
  {title:'액션',value:4},
  {title:'판타지',value:5},
  {title:'로맨스',value:6},
  {title:'감성',value:7},
  {title:'스릴러',value:8},
  {title:'시대극',value:9},
  {title:'스포츠',value:10},
  {title:'GL‧BL',value:11},
  {title:'SF',value:13},
  {title:'느와르',value:14},
  {title:'무협',value:15}
]
const _angle = useRef(new Animated.Value(0)).current;
// const _angle = useState(()=> new Animated.Value(0));



useEffect(()=>{
  setWheeldata(makeWheel(shuffleArray(genre)));
},[])

useEffect(() => {

  const eventListener = interstitial.onAdEvent((type,error) => {
    setAd(type);
    console.log(type,"type");
    if (type === AdEventType.LOADED) {
      setLoaded(true);
      // console.log("load");
    }else{
      setLoaded(false);
    }
    console.log(error,"error")
  });

  // Start loading the interstitial straight away
  interstitial.load();

  if(count%5==0 && loaded && count!=0 && (ad != 'opened' || ad != 'closed')){
    interstitial.show();
    console.log("광고 시작");
    setEnabled(false);
    setFinished(false);
  }
  // Unsubscribe from events on unmount
  return () => {
    eventListener();
  };
}, [count,loaded]);

// 장르에 따른 결과 가져오기
const Genre = (value) => {
  RestAPI.getGenre(value).then(res => {
          setResult(res)
          setPlatform(res.platform.split(','));
          // console.log(res,"결과")
  }).catch(err => {
      Alert.alert('로딩 오류', '문제가 발생했습니다. 잠시 후 다시 시도하십시오.', [{ text: '확인' }])
  }).finally(() => { })      
}
// 랜덤으로 섞기
const shuffleArray = (array) => {
  let i = array.length - 1;
  for (; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// 타원 만들기 
const makeWheel = (arr) => {
  // console.log("makeWheel");
  const data = Array.from({ length : numberOfSegments}).fill(1); // array numberOfSegments 갯수만큼 만들고 1로 다 채움
  let newdata = [];
  if(arr){
        for (let i = 0; i < data.length; i ++) {
          newdata.push({
            "name" : arr[i].title,
            "number" : 1,
            "value" : arr[i].value
          });
      }
  }

  // const arcs = d3Shape.pie()(newdata);
  const arcs = d3Shape.pie().value(function(d){return d.number})(newdata);
  const colors = ['#fff',"#006543"];
  setArc(arcs);
  return arcs.map((arc, index) => {
    // padAngle 칸 간격 사이 공간 , innerRadius 가운데 공간.
    const instance = d3Shape
      .arc()
      .padAngle(0)
      .outerRadius(width / 2)
      .innerRadius(0);

    return {
      path: instance(arc),
      color: colors[index%2],
      value: arr[index], 
      centroid: instance.centroid(arc)
    };
  }); 
}

const _getWinnerIndex = () => {

  if(angle < 0) {
    const deg = Math.abs(((angle / angleBySegment) * angleBySegment)) + 0.1 ;
      for(let i=0; i<arc.length; i++){
        const start = arc[i].startAngle * 180 / Math.PI
        const end = arc[i].endAngle * 180 / Math.PI
        if(start<= deg && deg < end){
            return i
          }
     }
  }else{
    const deg = ((numberOfSegments - (angle / angleBySegment)) % numberOfSegments) * angleBySegment + 0.1;  

    for(let i=0; i<arc.length; i++){
        const start = arc[i].startAngle * 180 / Math.PI
        const end = arc[i].endAngle * 180 / Math.PI
        // console.log(start,"start");
        // console.log(end,"end");
        if(start<= deg && deg < end){
         return i
        }
     }
  }
}
const stop = () => {
  console.log('stop');
  console.log(enabled,"enabled");
  setTum(0);
  setNo(true);
  if(!enabled){
  _angle.stopAnimation(()=>{
    console.log(angle,"stop angle");
  })
 }
}

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: true
};
const _startPan = ({nativeEvent}) => {
  const { velocityY } = nativeEvent;
 if(nativeEvent.state === State.ACTIVE){
  setStart(false);
  // console.log("startpan ACTIVE");
  _angle.setValue(nativeEvent.translationX % oneTurn);

  const snapTo = snap(oneTurn / numberOfSegments);
    Animated.timing(_angle, {
      toValue: snapTo(angle),
      duration: 100,
      useNativeDriver: true
    }).start(() => {
        // setNo(false);
    });
  }
}
const _onPan = ({nativeEvent}) => {
  if (nativeEvent.state === State.END) {
    // console.log("onPan END?");
    const { velocityY } = nativeEvent;
    if(Math.abs(velocityY)<300){
      return
    }else{
      console.log("count1");
      setStart(true);
      setCount(count + 1);
      console.log("count2");
  // 점점 감쇄 초기 속도에서 0으로 값을 애니메이션.
    Animated.decay(_angle, {
      velocity: velocityY / 1000,
      deceleration: 0.999,
      useNativeDriver: true
    }).start(() => {
      console.log("count3");
      _angle.setValue(angle % oneTurn);
      // console.log(angle % oneTurn);
      // snap 제공된 배열에서 가장 가까운순자 또는 일정한 간격으로 숫자를 스냅하는 함수를 만든다
      const snapTo = snap(oneTurn / numberOfSegments);
      Animated.timing(_angle, {
        toValue: snapTo(angle),
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        // console.log('_onPan2');
        setTum(0);
        // console.log(angle,"_onPan2 angle");
        ReactNativeHapticFeedback.trigger("impactLight", options);
        const winnerIndex = _getWinnerIndex();
        setEnabled(true);
        setFinished(true);
        setStart(false);
        // console.log(wheeldata[winnerIndex].value.title ,"장르");
        // console.log(wheeldata[winnerIndex].value.value ,"value");
        Genre(wheeldata[winnerIndex].value.value);
      });
      // do something here;
    });
  }
  }else if(nativeEvent.state === State.ACTIVE){
    // console.log(nativeEvent,"nativeenvet")
  }
}
// 화살표 이미지
const _renderKnob = () => {

  const knobSize = 30;

  const YOLO = Animated.modulo(
    Animated.divide(
      Animated.modulo(Animated.subtract(_angle, angleOffset), oneTurn),
      new Animated.Value(angleBySegment)
    ),
    1
  );

  return (
    <Animated.View
      ref={arrow}
      style={{
        width: knobSize,
        height: knobSize * 2,
        alignItems:'center',
        alignSelf:'center',
        zIndex: 1000,
        position:'absolute',
        top:-60,
        transform: [
          {
            rotate: YOLO.interpolate({
              inputRange: [-1, -0.5, -0.0001, 0.0001, 0.5, 1],
              outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg']
            })
          }
        ]
      }}
    >
      {/* 화살표 */}
      <Svg version="1.0"  width="20" height="50"  viewBox={`0 0 57 100`}>
        <G>
          <Path d="M52.5,31c0,13.8-11.2,61-25,61s-25-47.2-25-61s11.2-25,25-25S52.5,17.2,52.5,31z" fill="#052900"/>
        </G>
        <Circle cx="27.5" cy="29.5" r="16.5" fill="#FFFFFF"/>
      </Svg>
    </Animated.View>
  ); 
}

useEffect(()=>{

  if(tum == 100){
    const haptic = setInterval(()=>{
       ReactNativeHapticFeedback.trigger("impactLight", options);
    },100)
    return () => {
      clearInterval(haptic)
    };
  }else if(tum == 500){
    const haptic = setInterval(()=>{
      ReactNativeHapticFeedback.trigger("impactLight", options);
  },300)
  return () => {
    clearInterval(haptic)
  };
  }else if(tum == 1000){
    const haptic = setInterval(()=>{
      ReactNativeHapticFeedback.trigger("impactLight", options);
  },500)
  return () => {
    // console.log("clear3");
    clearInterval(haptic)
  };
  }else if(tum == 0){
    return ;
  }

  },[tum])

useEffect(()=>{

    _angle.addListener(event => {
      if(start == true && (count%5!=0 || ad == 'error' )){
      if(enabled){
        setEnabled(false);
        setFinished(false);
      }
        angle = event.value;
      if(angle < 0) {
        const deg = Math.floor(Math.abs(((angle / angleBySegment) * angleBySegment))) ;
        if(0 == deg || 25 ==  deg || 51 == deg || 77 == deg || 102 == deg || 128 == deg || 154 == deg || 180 == deg || 205 == deg || 231 == deg || 257 == deg || 282 == deg || 308 == deg || 334 == deg || 360 == deg){
          ReactNativeHapticFeedback.trigger("impactLight", options);
        }
      }else{
        const deg = Math.abs(Math.floor(((numberOfSegments - (angle / angleBySegment)) % numberOfSegments) * angleBySegment));  
        if(0 == deg || 25 ==  deg || 51 == deg || 77 == deg || 102 == deg || 128 == deg || 154 == deg || 180 == deg || 205 == deg || 231 == deg || 257 == deg || 282 == deg || 308 == deg || 334 == deg || 360 == deg){
          ReactNativeHapticFeedback.trigger("impactLight", options);
        }
      }

      let num = Math.round(Math.abs(event.value));
      if(ready1 == false){
        speed1 = num; 
        ready1 = true;
        ready2 = true;
      }

      if(ready1 == true && ready2 == true){
        setTimeout(()=>{
          speed2 = num;
          speed3 = Math.abs(speed1 - speed2);
          ready2 = false;
          ready1 = false;
          if(Math.abs(speed3)<=0){
            trigger = false;
          }else{
            trigger = true;
          }
        },500)
      } 

      if(trigger == false){   
          if(Math.round(angle)/3==0 || Math.round(angle)%5==0|| Math.round(angle)%7==0){
            ReactNativeHapticFeedback.trigger("impactLight", options);
          }
          speed4 = true;
      }else{
        if(speed3!=null){
          if(speed4 == true){
            if(speed3>100){
              ReactNativeHapticFeedback.trigger("impactLight", options);
            }else if(speed3<100 && speed3>=50){
              setTum(100);
            }else if(speed3<50 && speed3>=20){
              setTum(500);
            }else if(speed3<20 && speed3>=10){
              setTum(1000);
            }else if(speed3<=9){
              setTum(0);
              speed4 = false; // 이되면 다시 trigger가 실행 안되게.
            }
          }
        }
      }      
     }else{
      angle = event.value;
     }
    //  console.log(angle,"angle");
    });
    return () => {
      _angle.removeAllListeners();
    }
    },[start])

    const onBackPress = () => {
          setTimeout(() => {
              setExitApp(0);
            }, 2000); // 2 seconds to tap second-time
            ToastAndroid.show('한번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
            return true;
      }

    useEffect(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
      BackHandler.removeEventListener("hardwareBackPress",onBackPress);
    }, []);


  return (
    <View style={{flex:1,backgroundColor:'#016242'}}>
      <View style={styles.container_top}>
        <Image source={require('./assets/bg_img.png')} style={{width:'100%',height:'100%'}}/>
        <View style={{position:'absolute',top:'10%',width:'100%',height:'100%'}}>
          <Image source={require('./assets/logo.png')} style={{width:183,height:29,alignSelf:'center'}}/>
          {
            result!=null?
          <Animated.View
              style={{
                margin: 0,
                flex:1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
          >
            <View style={{
                width:Constants.WINDOW_WIDTH*0.7,
                height:250,
                borderRadius:10,
                overflow: 'hidden',
                top:-40            
            }}>
              <View style={styles.result_top}>
                <Image 
                  source={{uri:'https://picktoon.com'+result.img}}
                  style={{
                    width:'100%',
                    height:'100%',
                    zIndex:1,
                    alignItems: 'center',
                    backgroundColor:'#000',
                    justifyContent: 'center' }}/>

                <View style={{height:30,overflow:"hidden",position:'absolute',left:10,bottom:10,zIndex:100,flexDirection:'row'}}>
                 {
                    platform ? platform.map((item,index)=>{
                      return(
      
                        item == 'naver' ? 
                        <View key={`img_${index}`} style={{width:30,height:30,overflow:"hidden",borderRadius:5,marginRight:5}}>
                          <Image source={ require('./assets/naver.png')}style={{width:30,height:30}}/> 
                        </View>  
                        :
                        item == 'daum' ?
                        <View key={`img_${index}`} style={{width:30,height:30,overflow:"hidden",borderRadius:5,marginRight:5}}>
                         <Image source={ require('./assets/daum.png')}style={{width:30,height:30}}/> 
                        </View> 
                        :
                        item == 'lezhin' ? 
                        <View key={`img_${index}`} style={{width:30,height:30,overflow:"hidden",borderRadius:5,marginRight:5}}>
                          <Image source={ require('./assets/lezhin.png')}style={{width:30,height:30}}/> 
                        </View>
                        :
                        item == 'kakao' ?  
                        <View key={`img_${index}`} style={{width:30,height:30,overflow:"hidden",borderRadius:5,marginRight:5}}>
                          <Image source={ require('./assets/kakao.png')}style={{width:30,height:30}}/>
                        </View>  
                        : null
                       )
                      }) : null
                 } 
                </View>
              </View>
              <View style={styles.result_bottom}>
                  <View style={{width:'100%',alignItems:'flex-start',marginBottom:5}}>
                    <RNText style={{fontSize:14,color:'#232323',fontWeight:'bold'}} numberOfLines={1}>{result.title}</RNText>
                  </View>
                  <View style={{width:'100%',alignItems:'flex-start',marginBottom:5}}>
                    <RNText style={{fontSize:12,color:'#6f6f6f'}} numberOfLines={1}>{result.author}</RNText>
                  </View>
                  <View style={{width:'100%', height:50}}>
                    <RNText style={{fontSize:14,color:'#6f6f6f'}} numberOfLines={Platform.OS == 'ios' ? 3 :2}>
                      {result.story.replace('<br/>','\n').replace('<br/>','\n').replace('<br/>','\n')}
                    </RNText>
                  </View>  
              </View>
            </View>
          </Animated.View> :
          <Image source={require('./assets/main.png')} style={{width:'84%',height:Constants.WINDOW_HEIGHT*0.34,alignSelf:'center',resizeMode:'contain',marginTop:30}}/>
      }
        </View>
      </View>
      <View style={styles.container_bottom}>
        {/* <TouchableWithoutFeedback 
          style={{position:'relative',top:0,left:0,overflow:'hidden'}}
        > */}
        <View style={{position:'relative'}}> 
        <_renderKnob/>
        <View style={{position:'absolute',alignSelf:'center',top:-30,zIndex:-1}}>
          <Svg
            width={wheelSize+20}
            height={wheelSize+20}
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: [{ rotate: `-${angleOffset}deg` }] ,position:'absolute',justifyContent:'center',alignContent:'center',alignItems:'center',alignSelf:'center',zIndex:-2}}
          >

            <G y={width / 2} x={width / 2}>  

              { wheeldata ? wheeldata.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.title;
                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path} fill={arc.color=='#fff'? "#006543" : "#fff"}/>
                  </G>
                );
              }) :
              null
            }
            </G>
          </Svg> 
        </View>
        <View style={{position:'absolute',alignSelf:'center',top:-20}}> 
          <PanGestureHandler
          onHandlerStateChange={_onPan}
          onGestureEvent={_startPan}
          enabled={enabled}
        >
          {/* 뒤에 원형 */}
            <View style={styles.container}>
              {/* 룰렛판 */}
              <Animated.View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [
                    {
                      rotate: _angle.interpolate({
                        inputRange: [-oneTurn, 0, oneTurn],
                        outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`]
                      })
                    }
                  ]
                }}
              > 
              <Svg
                width={wheelSize}
                height={wheelSize}
                viewBox={`0 0 ${width} ${width}`}
                style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}
              >
                {/* G  다른 svg 요소를 그룹화 하는데 사용되는 컨테이너 */}
                <G y={width / 2} x={width / 2}>  
  
                  { wheeldata ? wheeldata.map((arc, i) => {
                    const [x, y] = arc.centroid;
                    const number = arc.value.title;
                    return (

                      <G key={`arc-${i}`}>
                        <Path d={arc.path} fill={arc.color}/>
                        <G
                          rotation={(i * oneTurn) / numberOfSegments + angleOffset}
                          origin={`${x}, ${y}`}
                        >
                            <Text
                              x={x}
                              y={y-70}
                              fill={arc.color=='#fff'? "#023926" : "#fff"}
                              textAnchor="middle"
                              fontSize={fontSize}
                              fontWeight="bold"
                            >
                              {Array.from({ length: number.length }).map((_, j) => {
                                return (
                                  <TSpan
                                    x={x}
                                    dy={fontSize}
                                    key={`arc-${i}-slice-${j}`}
                                  >
                                    {number.charAt(j)}
                                  </TSpan>
                                );
                              })}
                            </Text>
                        </G>
                      </G>
                    );
                  }) :
                  null
                }
                </G>
              </Svg>
            </Animated.View>
              <TouchableNativeFeedback>
                <Image source={require('./assets/gobtn.png')} style={{position:'absolute',width:80,height:80,resizeMode:'contain',alignItems:'center',alignSelf:'center'}}/>
              </TouchableNativeFeedback>
              {/* <Image source={require('./assets/gobtn.png')} style={{position:'absolute',width:80,height:80,resizeMode:'contain',alignItems:'center',alignSelf:'center'}}/> */}
            </View>    
          </PanGestureHandler>
        </View>
        <View style={{position:'absolute',alignSelf:'center',top:-36,zIndex:-2}}>
            <Image style={styles.backCircle} source={require('./assets/bg.png')}/>   
        </View>
        </View>
        {/* </TouchableWithoutFeedback>      */}
      </View>
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf:'center',
    justifyContent: 'center',
    // zIndex:1000,
    // width:Constants.WINDOW_WIDTH*1.35,
    // height:Constants.WINDOW_WIDTH*1.35,
    // backgroundColor:'#023926',
    // borderRadius:Constants.WINDOW_WIDTH*1.35/2
  },
  winnerText: {
    fontSize: 32,
    backgroundColor:'#000'
  },
  container_top:{
    width : '100%',
    height:Constants.WINDOW_HEIGHT*0.6,
    flex:1
  },
  container_bottom:{
    width : '100%',
    height:Constants.WINDOW_HEIGHT*0.4,
    backgroundColor:'#024e34',
    overflow:'visible',
    position:'relative'
  },
  backCircle:{
    width:(Constants.WINDOW_WIDTH*1.3)+30,
    height:(Constants.WINDOW_WIDTH*1.3)+30,
    zIndex:-1,
  },
  result_top:{
    height:'60%'
  },
  result_bottom:{
    height:'40%',
    backgroundColor:'#fff',
    flexDirection:'column',
    paddingVertical:10,
    paddingHorizontal:10
  }

  
});

