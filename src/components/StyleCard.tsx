import { useEffect, useRef, useState } from "react";
import { Heart, Plus, Check, Play, ImageOff } from "lucide-react";
import type { StyleSpec } from "../catalog/schema";
import { familyLabels } from "../catalog/schema";
import { mediaUrl, PlaybackScheduler } from "../lib/playback";
export function StyleCard({
  style,
  scheduler,
  favorite,
  selected,
  onOpen,
  onFavorite,
  onSelect,
}: {
  style: StyleSpec;
  scheduler: PlaybackScheduler;
  favorite: boolean;
  selected: boolean;
  onOpen: () => void;
  onFavorite: () => void;
  onSelect: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  useEffect(() => {
    if (!video.current) return;
    return scheduler.register(
      style.id,
      video.current,
      mediaUrl(style.preview.gallery),
      () => setFailed(true),
    );
  }, [style, scheduler]);
  return (
    <article
      className={`style-card ${selected ? "is-selected" : ""}`}
      data-style-id={style.id}
      onMouseEnter={() => scheduler.interact(style.id)}
      onMouseLeave={() => scheduler.interact(null)}
      onFocus={() => scheduler.interact(style.id)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget))
          scheduler.interact(null);
      }}
    >
      <button
        className="card-open"
        onClick={onOpen}
        aria-label={`檢視 ${style.name} ${style.id}`}
      >
        <div className="card-media">
          {!posterFailed ? (
            <img
              src={mediaUrl(style.preview.poster)}
              alt=""
              loading="lazy"
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <div className="poster-fallback">
              <ImageOff size={22} />
              <span>預覽影像暫時無法載入</span>
            </div>
          )}
          <video
            ref={video}
            muted
            playsInline
            loop
            preload="none"
            aria-hidden="true"
            onError={() => scheduler.mediaFailed(style.id)}
          />
          <span className="card-number">{style.id.replace("SA-", "")}</span>
          <span className="card-view">
            檢視風格 <span>↗</span>
          </span>
        </div>
        <div className="card-meta">
          <div className="card-title">
            <h2>{style.name}</h2>
            <span>{style.id}</span>
          </div>
          <p>
            {familyLabels[style.family]}
            <span> · </span>
            {style.moods[0]}
          </p>
        </div>
      </button>
      <div className="card-actions">
        <button
          className={favorite ? "favorited" : ""}
          aria-label={`${favorite ? "取消收藏" : "收藏"} ${style.name}`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart size={14} fill={favorite ? "currentColor" : "none"} />
        </button>
        <button
          aria-label={`${selected ? "移出選取" : "選取"} ${style.name}`}
          aria-pressed={selected}
          onClick={onSelect}
        >
          {selected ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>
      {failed && (
        <button
          className="media-retry"
          onClick={() => {
            setFailed(false);
            scheduler.retry(style.id);
          }}
        >
          <Play size={11} />
          重試預覽
        </button>
      )}
    </article>
  );
}
