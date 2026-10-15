// Created: 2026-10-06. 1:1 color/decode probe; no independent editorial timing authority.
import React from 'react';
import {AbsoluteFill, Composition, OffthreadVideo, registerRoot, staticFile} from 'remotion';

const HandoffProbe: React.FC<{source: string}> = ({source}) => <AbsoluteFill>
  <OffthreadVideo src={staticFile(source)} muted transparent toneMapped={false} durationInFrames={90} style={{width: 1280, height: 720}}/>
</AbsoluteFill>;

registerRoot(() => <Composition id="FormHandoffProbe" component={HandoffProbe} width={1280} height={720}
  fps={30} durationInFrames={90} defaultProps={{source: 'plate.mp4'}}/>);
