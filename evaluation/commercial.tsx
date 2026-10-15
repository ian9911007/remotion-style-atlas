// Created: 2026-10-06. Original FORM study; media/shot authority is the bound edit_plan.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Easing, Img, OffthreadVideo, Sequence,
  cancelRender, continueRender, delayRender, interpolate, registerRoot, staticFile,
  useCurrentFrame, useVideoConfig} from 'remotion';

type Framing = {fit: 'cover' | 'contain'; position: [number, number]; scale: [number, number];
  playback: 'hold' | 'source-range'; color: string};
type Scene = {clip_id: string; role: string; source_id: string; start: number; duration: number;
  source_in: number; source_out: number; content: {kicker: string; title: string; detail: string; framing: Framing}};
export type CommercialProps = {projectId: string; variantId: string; locale: string;
  scenes: Scene[]; assets: Record<string, {file: string; kind: 'image' | 'video'}>;
  design: {font_family: string; paper: string; ink: string; accent: string; direction: 'aperture' | 'material-grid';
    envelope: {min_font_size: number}}; delivery: {width: number; height: number; audio: boolean; alpha: string};
  durationInFrames: number; fps: number; styleframe?: boolean};

const progress = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1],
  {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.22, 1, .36, 1)});
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function FontReady({family}: {family: string}) {
  const [handle] = useState(() => delayRender('FORM installed-font readiness'));
  useEffect(() => {
    document.fonts.load(`600 80px "${family}"`, 'FORM Light in motion').then(() => {
      if (!document.fonts.check(`600 80px "${family}"`, 'FORM Light in motion')) throw new Error('FORM_FONT_UNAVAILABLE');
      continueRender(handle);
    }).catch(cancelRender);
  }, [family, handle]);
  return null;
}

function LayoutGate({frame, floor}: {frame: number; floor: number}) {
  useEffect(() => {
    const handle = delayRender('FORM readable-state bounds');
    let released = false;
    const release = () => {if (!released) {released = true; continueRender(handle);}};
    document.fonts.ready.then(() => {
      for (const el of document.querySelectorAll<HTMLElement>('[data-readable]')) {
        if (Number(getComputedStyle(el).opacity) < .99) continue;
        const r = el.getBoundingClientRect();
        if (parseFloat(getComputedStyle(el).fontSize) < floor || el.scrollWidth > el.clientWidth + 1 ||
          r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) {
          throw new Error(`FORM_LAYOUT:${el.dataset.readable}:frame=${frame}`);
        }
      }
      release();
    }).catch(cancelRender);
    return release;
  }, [frame, floor]);
  return null;
}

const Media: React.FC<{scene: Scene; asset: CommercialProps['assets'][string]; scale?: number}> = ({scene, asset, scale = 1}) => {
  const local = useCurrentFrame();
  const framing = scene.content.framing;
  const zoom = mix(framing.scale[0], framing.scale[1], progress(local, 0, scene.duration - 1)) * scale;
  const style: React.CSSProperties = {position: 'absolute', width: '100%', height: '100%', objectFit: framing.fit,
    objectPosition: `${framing.position[0] * 100}% ${framing.position[1] * 100}%`, scale: zoom};
  if (asset.kind === 'video') return <OffthreadVideo name="Native material plate" src={staticFile(asset.file)}
    trimBefore={scene.source_in} durationInFrames={scene.source_out - scene.source_in} muted transparent toneMapped={false} style={style}/>;
  return <Img name="Native material still" src={staticFile(asset.file)} style={style}/>;
};

const Wordmark: React.FC<{size: number; ink: string; ringColor: string; reveal: number}> = ({size, ink, ringColor, reveal}) =>
  <div aria-label="FORM" style={{display: 'flex', alignItems: 'center', color: ink, gap: size * .018,
    fontSize: size, lineHeight: .82, fontWeight: 600, letterSpacing: '-.085em'}}>
    <span style={{display: 'block', translate: `0 ${mix(size * .3, 0, reveal)}px`, opacity: reveal}}>F</span>
    <span data-form-counter style={{display: 'block', width: size * .68, height: size * .74, flexShrink: 0,
      border: `${size * .09}px solid ${ringColor}`, borderRadius: '50%', scale: mix(.9, 1, reveal), opacity: reveal}}/>
    <span style={{display: 'block', translate: `0 ${mix(size * .45, 0, reveal)}px`, opacity: reveal}}>RM</span>
  </div>;

// This comparison branch is intentionally one styleframe, not a second film.
const MaterialGrid: React.FC<CommercialProps> = (props) => {
  const {width, height} = useVideoConfig();
  const still = Object.values(props.assets).find((asset) => asset.kind === 'image')!;
  const margin = width * .055;
  return <AbsoluteFill style={{background: props.design.paper, color: props.design.ink, fontFamily: props.design.font_family}}>
    <div style={{position: 'absolute', left: margin, top: height * .085, fontSize: width * .14, lineHeight: .78, fontWeight: 600, letterSpacing: '-.08em'}}>FORM</div>
    <div style={{position: 'absolute', left: width * .53, top: height * .05, width: width * .42, height: height * .77, overflow: 'hidden'}}>
      <Img src={staticFile(still.file)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
    </div>
    <div style={{position: 'absolute', left: margin, top: height * .38, width: width * .36, height: height * .32, overflow: 'hidden'}}>
      <Img src={staticFile(still.file)} style={{width: '100%', height: '100%', objectFit: 'cover', scale: 2.9}}/>
    </div>
    <div style={{position: 'absolute', top: height * .84, left: margin, fontSize: width * .046, fontWeight: 500, letterSpacing: '-.035em'}}>Light in motion.</div>
    <div style={{position: 'absolute', left: width * .41, top: height * .29, width: width * .12, height: 7, background: props.design.accent}}/>
    <div style={{position: 'absolute', left: margin, top: height * .315, fontSize: 20, letterSpacing: '.1em'}}>OBJECTS / MATERIAL / PRESENCE</div>
  </AbsoluteFill>;
};

export const Commercial: React.FC<CommercialProps> = (props) => {
  const frame = useCurrentFrame();
  const {width: w, height: h} = useVideoConfig();
  const portrait = h > w;
  const {paper, ink, accent} = props.design;
  if (props.scenes.length !== 4) throw new Error('FORM_REQUIRES_BOUND_EDIT_PLAN');
  const [open, reveal, detail, end] = props.scenes;
  if (props.design.direction === 'material-grid') return <><FontReady family={props.design.font_family}/><MaterialGrid {...props}/></>;
  const m = w * (portrait ? .075 : .06);
  const scale = w / 1280;
  const openIn = progress(frame, 0, 22);
  const revealMove = progress(frame, reveal.start - 14, reveal.start + 18);
  const revealText = progress(frame, reveal.start + 7, reveal.start + 31);
  const detailMove = progress(frame, detail.start - 16, detail.start + 16);
  const detailText = progress(frame, detail.start + 10, detail.start + 30);
  const endMove = progress(frame, end.start - 18, end.start + 18);
  const endText = progress(frame, end.start + 8, end.start + 32);
  const wordSize = portrait ? w * .29 : w * .232;
  const wordX = m;
  const wordY = portrait ? h * .28 : h * .36;
  const counterX = wordX + wordSize * .865;
  const counterY = wordY + wordSize * .41;
  const heroSize = portrait ? w * .98 : h * 1.03;
  const heroX = portrait ? w * .52 : w * .745;
  const heroY = portrait ? h * .56 : h * .51;
  const revealSize = mix(wordSize * .51, heroSize, revealMove);
  const circleX = mix(counterX, heroX, revealMove);
  const circleY = mix(counterY, heroY, revealMove);
  const finalSize = portrait ? w * .67 : h * .69;
  const finalX = portrait ? w * .53 : w * .76;
  const finalY = portrait ? h * .40 : h * .46;
  const windowSize = mix(revealSize, Math.max(w, h) * 1.5, detailMove);
  const exitSize = mix(windowSize, finalSize, endMove);
  const windowX = mix(mix(circleX, w * .5, detailMove), finalX, endMove);
  const windowY = mix(mix(circleY, h * .5, detailMove), finalY, endMove);
  const apertureOpacity = progress(frame, reveal.start - 28, reveal.start - 20);
  const readable = {fontSize: portrait ? 25 : 21 * scale, lineHeight: 1.4, letterSpacing: '.015em'};
  return <AbsoluteFill style={{background: paper, color: ink, fontFamily: `"${props.design.font_family}"`, overflow: 'hidden'}}>
    <FontReady family={props.design.font_family}/>
    <LayoutGate frame={frame} floor={props.design.envelope.min_font_size}/>
    <div style={{position: 'absolute', left: m, top: portrait ? h * .06 : h * .07, right: m,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
      opacity: 1 - detailMove + endMove, color: ink}}>
      <div style={{fontSize: 20, letterSpacing: '.2em', fontWeight: 600}}>FORM / 01</div>
    </div>

    <div style={{position: 'absolute', left: wordX, top: wordY, opacity: 1 - revealMove, zIndex: 2}}>
      <Wordmark size={wordSize} ink={ink} ringColor={accent} reveal={openIn}/>
    </div>
    <div data-readable="opening" style={{position: 'absolute', left: m, top: portrait ? h * .47 : h * .72,
      fontSize: portrait ? 40 : 36 * scale, fontWeight: 400, letterSpacing: '-.025em',
      opacity: openIn * (1 - revealMove), translate: `0 ${mix(18, 0, openIn)}px`}}>{open.content.title}</div>

    <div data-media-aperture style={{position: 'absolute', left: windowX - exitSize / 2, top: windowY - exitSize / 2,
      width: exitSize, height: exitSize, borderRadius: '50%', overflow: 'hidden', opacity: apertureOpacity, zIndex: 3,
      background: paper, isolation: 'isolate'}}>
      <div style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <Sequence name="Opening image counter" from={0} durationInFrames={reveal.start} layout="none">
          <Media scene={open} asset={props.assets[open.source_id]}/>
        </Sequence>
        <Sequence name="Native full rotation" from={reveal.start} durationInFrames={reveal.duration} layout="none">
          <Media scene={reveal} asset={props.assets[reveal.source_id]}/>
        </Sequence>
        <Sequence name="Material detail still" from={detail.start} durationInFrames={detail.duration} layout="none">
          <Media scene={detail} asset={props.assets[detail.source_id]}/>
        </Sequence>
        <Sequence name="Resolved object still" from={end.start} durationInFrames={end.duration} layout="none">
          <Media scene={end} asset={props.assets[end.source_id]}/>
        </Sequence>
      </div>
    </div>

    <div style={{position: 'absolute', left: m, top: portrait ? h * .13 : h * .30, zIndex: 5,
      opacity: revealText * (1 - detailMove), translate: `0 ${mix(24, 0, revealText)}px`}}>
      <div style={{...readable, color: accent, marginBottom: portrait ? 20 : 24 * scale}}>{reveal.content.kicker}</div>
      <div data-readable="reveal" style={{fontSize: portrait ? 70 : 82 * scale, lineHeight: .98, whiteSpace: 'pre-line',
        letterSpacing: '-.055em', fontWeight: 500}}>{reveal.content.title}</div>
    </div>

    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: portrait ? h * .275 : h * .31,
      background: ink, zIndex: 6, translate: `0 ${mix(101, 0, detailMove)}%`, opacity: 1 - endMove}}/>
    <div style={{position: 'absolute', left: m, right: m, bottom: portrait ? h * .067 : h * .065, zIndex: 7,
      color: paper, opacity: detailText * (1 - endMove), translate: `0 ${mix(22, 0, detailText)}px`}}>
      <div style={{...readable, color: '#a4b2ff', marginBottom: portrait ? 18 : 12 * scale}}>{detail.content.kicker}</div>
      <div data-readable="detail" style={{fontSize: portrait ? 62 : 64 * scale, lineHeight: 1.03,
        letterSpacing: '-.045em', whiteSpace: 'pre-line'}}>{detail.content.title}</div>
    </div>

    <div style={{position: 'absolute', left: m, top: portrait ? h * .72 : h * .39, zIndex: 8,
      opacity: endText, translate: `0 ${mix(25, 0, endText)}px`}}>
      <div data-readable="end-title" style={{fontSize: portrait ? 112 : 146 * scale, fontWeight: 600,
        letterSpacing: '-.08em', lineHeight: .9}}>FORM</div>
      <div data-readable="end-line" style={{fontSize: portrait ? 36 : 36 * scale, lineHeight: 1.2,
        letterSpacing: '-.025em', marginTop: portrait ? 26 : 25 * scale}}>{end.content.title}</div>
    </div>
    <div style={{position: 'absolute', left: m, right: m, bottom: portrait ? h * .043 : h * .065,
      zIndex: 9, display: 'flex', flexDirection: portrait ? 'column' : 'row', justifyContent: 'space-between',
      gap: 10, opacity: endText, color: ink, fontSize: 20, lineHeight: 1.4}}>
      <span>{end.content.detail}</span><span>ORIGINAL DESIGN STUDY</span>
    </div>
  </AbsoluteFill>;
};

const Root = () => <Composition id="FormCommercial" component={Commercial} width={1280} height={720}
  fps={30} durationInFrames={360} defaultProps={{projectId: 'form-commercial', variantId: 'landscape', locale: 'en',
    scenes: [], assets: {}, design: {font_family: 'Helvetica Neue', paper: '#F1EFE8', ink: '#171C23', accent: '#244EE4',
      direction: 'aperture', envelope: {min_font_size: 20}}, delivery: {width: 1280, height: 720, audio: false, alpha: 'none'},
    durationInFrames: 360, fps: 30}} calculateMetadata={({props}: {props: CommercialProps}) =>
      ({width: props.delivery.width, height: props.delivery.height, fps: props.fps, durationInFrames: props.durationInFrames})}/>;
registerRoot(Root);
