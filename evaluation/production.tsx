// Created: 2026-10-06. Original synthetic evaluation, not an approved style library.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Easing, Html5Audio, Sequence, cancelRender,
  continueRender, delayRender, interpolate, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';

type Scene = {clip_id: string; role: string; start: number; duration: number; source_id: string;
  source_in: number; source_out: number; content: {title: string; kicker: string; detail: string;
    data?: {label: string; value: number}[]; baseline?: number; maximum?: number; unit?: string; source_label?: string}};
type Props = {projectId: string; variantId: string; locale: string; seed: number;
  design: {font_family: string; font_size: number; ink: string; paper: string; accent: string; envelope: {min_font_size:number}};
  scenes: Scene[]; captions: {start_ms: number; end_ms: number; text: string}[];
  captionDisplay: string; assets: Record<string, string>; delivery: {width: number; height: number; alpha: string; audio: boolean};
  durationInFrames: number; fps: number};

function FontReady({family}: {family: string}) {
  const [handle] = useState(() => delayRender('Verified system font readiness'));
  useEffect(() => {
    document.fonts.load(`600 32px "${family}"`, 'Clear 重點比較').then(() => {
      if (!document.fonts.check(`600 32px "${family}"`, 'Clear 重點比較')) throw new Error('FONT_NOT_READY');
      continueRender(handle);
    }).catch(cancelRender);
  }, [family, handle]);
  return null;
}

function LayoutGate({frame, readable, floor}: {frame:number; readable:boolean; floor:number}) {
  useEffect(()=>{
    if (!readable) return;
    const handle=delayRender('Reading-state layout bounds');
    let released=false;
    const release=()=>{if(!released){released=true;continueRender(handle);}};
    document.fonts.ready.then(()=>{
      for(const element of document.querySelectorAll<HTMLElement>('[data-primary-text]')) {
        if(parseFloat(getComputedStyle(element).fontSize)<floor) throw new Error(`READABILITY_FLOOR:frame=${frame}`);
      }
      const regions=Array.from(document.querySelectorAll<HTMLElement>('[data-bound]')).map(el=>({el,r:el.getBoundingClientRect()}));
      for(const {el,r} of regions){
        if(el.scrollWidth>el.clientWidth+1 || r.left < -1 || r.right > window.innerWidth+1 || r.top < -1 || r.bottom>window.innerHeight+1)
          throw new Error(`LAYOUT_OVERFLOW:${el.dataset.bound}:frame=${frame}`);
      }
      for(let a=0;a<regions.length;a++) for(let b=a+1;b<regions.length;b++) {
        const x=regions[a], y=regions[b];
        if(Math.min(x.r.right,y.r.right)-Math.max(x.r.left,y.r.left)>1 && Math.min(x.r.bottom,y.r.bottom)-Math.max(x.r.top,y.r.top)>.1)
          throw new Error(`LAYOUT_COLLISION:${x.el.dataset.bound}/${y.el.dataset.bound}:frame=${frame}`);
      }
      release();
    }).catch(cancelRender);
    return release;
  },[frame,readable,floor]);
  return null;
}

const SceneView: React.FC<{scene: Scene; design: Props['design']; alpha: boolean}> = ({scene, design, alpha}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const narrow = height > width;
  const margin = width * .075;
  const enter = interpolate(frame, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.22, 1, .36, 1)});
  const accent = interpolate(frame, [8, 35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.22, 1, .36, 1)});
  const textStyle: React.CSSProperties = {margin: 0, whiteSpace: 'pre-line', fontWeight: 600, letterSpacing: '-.035em', lineHeight: 1.04};
  if (alpha) return <AbsoluteFill style={{justifyContent: 'flex-end', padding: margin, paddingBottom: height * .12}}>
    <div data-bound="lower-third" style={{background: design.ink, color: design.paper, borderLeft: `8px solid ${design.accent}`,
      padding: '20px 28px', opacity: enter, transform: `translateX(${(1-enter)*-26}px)`}}>
      <div style={{fontSize: 16, letterSpacing: '.12em', marginBottom: 10}}>{scene.content.kicker}</div>
      <h1 data-primary-text style={{...textStyle, fontSize: 40}}>{scene.content.title}</h1>
    </div>
  </AbsoluteFill>;
  return <AbsoluteFill style={{padding: margin, color: design.ink, background: design.paper}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: narrow ? 21 : 18, letterSpacing: '.12em'}}>
      <span>{scene.content.kicker}</span><span>{scene.role === 'chart' ? '02' : scene.role === 'cta' ? '03' : '01'} / 03</span>
    </div>
    {scene.role === 'chart' ? <>
      <h1 data-bound="title" data-primary-text style={{...textStyle, fontSize: narrow ? 62 : 46, marginTop: narrow ? 86 : 40,
        opacity: enter, transform: `translateY(${(1-enter)*28}px)`}}>{scene.content.title}</h1>
      <div data-bound="chart" style={{marginTop: narrow ? 70 : 30, display: 'grid', gap: narrow ? 28 : 17}}>
        {scene.content.data!.map((row, index) => <div key={row.label} data-primary-text style={{display:'grid',gridTemplateColumns:narrow?'110px 1fr 78px':'110px 1fr 80px',gap:14,alignItems:'center',fontSize:narrow?26:24}}>
          <span>{row.label}</span><div style={{height:narrow?42:29,background:'#DDDCD0',position:'relative'}}>
            <div data-value={row.value} style={{position:'absolute',left:0,top:0,bottom:0,width:`${row.value/scene.content.maximum!*100}%`,background:index===2?design.accent:design.ink,
              clipPath:`inset(0 ${(1-accent)*100}% 0 0)`}}/>
          </div><span style={{fontVariantNumeric:'tabular-nums'}}>{row.value}{scene.content.unit}</span>
        </div>)}
        <div style={{fontSize:narrow?20:16,opacity:.8}}>0 — {scene.content.maximum}{scene.content.unit} · {scene.content.source_label}</div>
      </div>
    </> : <>
      <div style={{marginTop:narrow?130:40}}>
        {scene.content.title.split('\n').map((line, index)=><div key={index} style={{overflow:'hidden',paddingBottom:'.12em'}}>
          <h1 data-bound="title" data-primary-text style={{...textStyle,fontSize:narrow?82:78,transform:`translateY(${(1-enter)*115}%)`}}>{line}</h1>
        </div>)}
      </div>
      <div style={{height:narrow?12:9,width:`${(narrow?190:240)*accent}px`,background:design.accent,marginTop:narrow?58:24}}/>
      <div data-bound="detail" data-primary-text style={{fontSize:narrow?30:24,lineHeight:1.45,whiteSpace:'pre-line',marginTop:narrow?44:14,opacity:accent,maxWidth:narrow?width*.76:width*.78}}>{scene.content.detail}</div>
    </>}
    <div data-bound="divider" style={{position:'absolute',left:margin,right:margin,bottom:narrow?150:98,height:1,background:design.ink,opacity:.28}}/>
  </AbsoluteFill>;
};

export const Production: React.FC<Props> = (props) => {
  const frame=useCurrentFrame();
  const {width,height,fps}=useVideoConfig();
  const alpha=props.delivery.alpha!=='none';
  const cue=props.captions.find(c=>frame/fps*1000>=c.start_ms && frame/fps*1000<c.end_ms);
  const active=props.scenes.find(s=>frame>=s.start && frame<s.start+s.duration);
  return <AbsoluteFill style={{fontFamily:`"${props.design.font_family}"`,background:alpha?'transparent':props.design.paper}}>
    <FontReady family={props.design.font_family}/>
    <LayoutGate frame={frame} readable={!!active && frame-active.start>=35} floor={props.design.envelope.min_font_size}/>
    {props.scenes.map(scene=><Sequence key={scene.clip_id} from={scene.start} durationInFrames={scene.duration} name={scene.clip_id}>
      <SceneView scene={scene} design={props.design} alpha={alpha}/>
      {props.delivery.audio && props.assets[scene.source_id] ? <Html5Audio src={props.assets[scene.source_id]} trimBefore={scene.source_in} trimAfter={scene.source_out}/> : null}
    </Sequence>)}
    {!alpha && props.captionDisplay==='BURNED' && cue ? <div data-bound="caption" data-primary-text style={{position:'absolute',left:width*.075,right:width*.075,bottom:height>width?58:30,
      fontSize:height>width?28:24,lineHeight:1.35,textAlign:'left',whiteSpace:'pre-line',color:props.design.ink}}>{cue.text}</div>:null}
  </AbsoluteFill>;
};

const defaults: Props = {projectId:'evaluation',variantId:'preview',locale:'en',seed:17,
  design:{font_family:'Helvetica Neue',font_size:26,ink:'#163C33',paper:'#F3F0E7',accent:'#D45432',envelope:{min_font_size:24}},
  scenes:[],captions:[],captionDisplay:'CLEAN',assets:{},delivery:{width:960,height:540,alpha:'none',audio:false},durationInFrames:360,fps:30};
const Root = () => <Composition id="ProductionEvaluation" component={Production} width={960} height={540} fps={30} durationInFrames={360}
  defaultProps={defaults} calculateMetadata={({props}: {props: Props})=>({width:props.delivery.width,height:props.delivery.height,fps:props.fps,durationInFrames:props.durationInFrames})}/>;
registerRoot(Root);
