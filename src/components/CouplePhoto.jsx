import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

export default function CouplePhoto({
  src,
  alt,
  label,
  side,
  uploadHint,
  uploadSubHint,
  lang,
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const showImage = Boolean(src) && !imageError;

  return (
    <div className="photo-frame group">
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f4e7dc] via-[#f9f3e9] to-[#e5e9df] text-ink/60 p-5 text-center">
          <Camera size={30} strokeWidth={1.2} />
          <span className="font-hindi text-sm mt-3">
            {lang === "hi"
              ? `${label} ${uploadHint}`
              : `${uploadHint} ${label}`}
          </span>
          <span className="text-[10px] mt-1 tracking-wider text-ink/50">
            {uploadSubHint}
          </span>
        </div>
      )}
      <span className="photo-tag">{side}</span>
    </div>
  );
}
