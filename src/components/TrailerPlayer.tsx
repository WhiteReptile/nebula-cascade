type TrailerPlayerProps = {
  videoId: string;
  title?: string;
};

const buildEmbedSrc = (videoId: string) => {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    cc_load_policy: '0',
    disablekb: '1',
    fs: '0',
    playsinline: '1',
    loop: '1',
    playlist: videoId,
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const TrailerPlayer = ({ videoId, title = 'Official Trailer' }: TrailerPlayerProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl shadow-black/70 backdrop-blur-sm sm:rounded-2xl">
      <div className="relative aspect-video w-full bg-black">
        <iframe
          className="pointer-events-none absolute left-1/2 top-[46%] h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 border-0"
          src={buildEmbedSrc(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-black via-black/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-black/70 to-transparent"
        />
      </div>
    </div>
  );
};

export default TrailerPlayer;
