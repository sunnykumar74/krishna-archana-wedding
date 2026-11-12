import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChevronDown,
  Copy,
  Flower2,
  Heart,
  MapPin,
  Menu,
  Music2,
  Phone,
  Share2,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { hasSupabaseConfig, supabase } from "./lib/supabase";
import {
  assetUrl,
  CONTACT_PHONE,
  CONTENT,
  EVENTS,
  GALLERY_ITEMS,
  MAP_QUERY,
} from "./data/weddingData";
import Countdown from "./components/Countdown";
import CouplePhoto from "./components/CouplePhoto";
import GalleryLightbox from "./components/GalleryLightbox";
import AdminModal from "./components/AdminModal";

function App() {
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("hi");
  const [rsvpState, setRsvpState] = useState({
    name: "",
    phone: "",
    guests: "2",
    attending: "yes",
    note: "",
  });
  const [rsvpMessage, setRsvpMessage] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [brokenGalleryIds, setBrokenGalleryIds] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const audioRef = useRef(null);
  const toastTimerRef = useRef(null);
  const userMutedRef = useRef(false);

  const t = CONTENT[lang];
  const inviteUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const locked = !opened || adminOpen || galleryIndex !== null;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, adminOpen, galleryIndex]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const tryAutoPlay = () => {
      if (userMutedRef.current || !audio.paused) return;
      audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => {});
    };

    tryAutoPlay();

    const onFirstInteraction = (e) => {
      if (e.target instanceof Element && e.target.closest("[data-music-toggle]")) {
        return;
      }
      tryAutoPlay();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
    window.addEventListener("keydown", onFirstInteraction);
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(""), 3500);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast(t.toasts.copied);
    } catch {
      showToast(inviteUrl);
    }
  };

  const shareWhatsApp = () => {
    const message = `${t.blessings.whatsappMessagePrefix} ${inviteUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleOpenInvitation = () => {
    setOpened(true);
    const audio = audioRef.current;
    if (audio && !userMutedRef.current) {
      audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => {});
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      userMutedRef.current = true;
      audio.pause();
      setMusicOn(false);
    } else {
      userMutedRef.current = false;
      try {
        await audio.play();
        setMusicOn(true);
      } catch {
        setMusicOn(false);
        showToast(t.toasts.musicMissing);
      }
    }
  };

  const submitRsvp = async (e) => {
    e.preventDefault();
    const cleanedPhone = rsvpState.phone.trim();
    if (cleanedPhone.length < 8 || cleanedPhone.length > 16) {
      setRsvpMessage({ type: "error", text: t.rsvp.invalidPhone });
      return;
    }

    setSubmitting(true);
    setRsvpMessage({ type: "", text: "" });

    const payload = {
      name: rsvpState.name.trim(),
      phone: cleanedPhone,
      guests: Number(rsvpState.guests),
      attending: rsvpState.attending === "yes",
      note: rsvpState.note.trim() || null,
    };

    try {
      if (!hasSupabaseConfig || !supabase) {
        throw new Error(t.rsvp.missingDbError);
      }
      const { error } = await supabase.from("rsvps").insert(payload);
      if (error) throw error;
      setRsvpMessage({ type: "success", text: t.rsvp.successMsg });
      setRsvpState({
        name: "",
        phone: "",
        guests: "2",
        attending: "yes",
        note: "",
      });
    } catch (err) {
      setRsvpMessage({
        type: "error",
        text: err?.message || t.rsvp.genericError,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-ink overflow-x-clip">
      <audio
        ref={audioRef}
        id="wedding-audio"
        src={assetUrl("music/wedding-music.mp3")}
        loop
        preload="auto"
        onPlay={() => setMusicOn(true)}
        onPause={() => setMusicOn(false)}
      />

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] bg-ink text-ivory text-xs sm:text-sm px-5 py-3 rounded-full shadow-lg border border-champagne/40 max-w-[90vw] text-center"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!opened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            className="fixed inset-0 z-[100] bg-[#f7f1e7] flex items-center justify-center p-5 overflow-hidden"
          >
            <div className="absolute inset-4 sm:inset-5 border border-champagne/70 pointer-events-none" />
            <div className="absolute inset-7 sm:inset-8 border border-champagne/30 pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 text-center max-w-lg px-2"
            >
              <Flower2
                className="mx-auto text-rose mb-5"
                size={34}
                strokeWidth={1}
              />
              <p className="eyebrow">{t.envelope.eyebrow}</p>
              <div className="my-8">
                <div className="font-serif text-4xl sm:text-6xl leading-tight">
                  {t.envelope.groomName}
                </div>
                <div className="font-serif text-xl text-rose my-2">&amp;</div>
                <div className="font-serif text-4xl sm:text-6xl leading-tight">
                  {t.envelope.brideName}
                </div>
              </div>
              <p className="font-hindi text-sm sm:text-base text-ink/70 leading-8">
                {t.envelope.subtextLine1}
                <br />
                {t.envelope.subtextLine2}
              </p>
              <button
                type="button"
                onClick={handleOpenInvitation}
                className="gold-button mt-8"
              >
                {t.envelope.openBtn} <ArrowUpRight size={16} />
              </button>
              <p className="mt-5 text-[10px] tracking-[.22em] uppercase text-ink/45">
                {t.envelope.footerDate}
              </p>
            </motion.div>
            <div className="petal petal-one" />
            <div className="petal petal-two" />
            <div className="petal petal-three" />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-xl border-b border-champagne/30">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#home" className="font-serif text-xl tracking-wide">
            K <span className="text-rose">&amp;</span> A
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {t.nav.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-music-toggle="true"
              onClick={toggleMusic}
              className="icon-button"
              aria-label={musicOn ? "Pause music" : "Play music"}
              title={musicOn ? "Pause music" : "Play music"}
            >
              {musicOn ? <Volume2 size={17} /> : <Music2 size={17} />}
            </button>
            <button
              type="button"
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              className="text-xs tracking-widest border border-champagne/70 rounded-full px-3 py-2 hover:bg-white/50 transition"
              aria-label="Switch language"
            >
              {lang === "hi" ? "EN" : "हिंदी"}
            </button>
            <button
              type="button"
              className="md:hidden icon-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden px-5 pb-4 flex flex-col gap-3 border-t border-champagne/20 pt-3"
            >
              {t.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="nav-link py-1"
                >
                  {item.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main id="home">
        <section className="relative min-h-[690px] flex items-center justify-center text-center px-5 py-24 hero-pattern">
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/20 via-ivory/45 to-ivory" />
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="eyebrow mb-4">{t.hero.eyebrow}</p>
              <p className="font-hindi text-rose tracking-[.22em] text-sm mb-3">
                {t.hero.invocation}
              </p>
              <p className="font-hindi text-xs sm:text-sm text-ink/60 leading-6 mb-7 max-w-xl mx-auto">
                {t.hero.shlokaLine1}
                <br />
                {t.hero.shlokaLine2}
              </p>
              <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl leading-[1.2]">
                {t.hero.groomShort}{" "}
                <span className="text-rose">&amp;</span>
                <br />
                {t.hero.brideShort}
              </h1>
              <div className="ornament my-8">
                <span>✦</span>
              </div>
              <p className="font-hindi text-base sm:text-xl leading-9 text-ink/75 max-w-2xl mx-auto">
                {t.hero.inviteLine1}
                <br className="hidden sm:inline" /> {t.hero.inviteLine2}
              </p>
              <p className="mt-8 tracking-[.24em] uppercase text-xs text-ink/60 flex items-center justify-center gap-2">
                <CalendarDays size={14} className="text-rose" />
                {t.hero.dateLine}
              </p>
              <a href="#events" className="gold-button mt-8">
                {t.hero.cta} <ChevronDown size={16} />
              </a>
            </motion.div>
          </div>
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[.3em] text-ink/40 uppercase whitespace-nowrap">
            {t.hero.scrollCue}
          </span>
        </section>

        <section className="section-wrap text-center">
          <p className="eyebrow">{t.countdown.eyebrow}</p>
          <h2 className="section-title mt-3 mb-8">{t.countdown.heading}</h2>
          <Countdown
            units={t.countdown.units}
            completedLabel={t.countdown.completed}
          />
          <p className="font-hindi text-sm text-ink/60 mt-6">
            {t.countdown.subtitle}
          </p>
        </section>

        <section id="couple" className="section-wrap bg-white/45">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="eyebrow">{t.couple.eyebrow}</p>
              <h2 className="section-title mt-3">{t.couple.heading}</h2>
              <p className="font-hindi text-ink/60 mt-3">{t.couple.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-4xl mx-auto">
              <div className="text-center">
                <CouplePhoto
                  src={assetUrl("images/groom.jpg")}
                  alt={t.couple.groomTitle}
                  label={t.hero.groomShort}
                  side={t.couple.groomSide}
                  uploadHint={t.couple.photoPlaceholderHint}
                  uploadSubHint={t.couple.photoUploadSubHint}
                  lang={lang}
                />
                <h3 className="font-serif text-2xl sm:text-3xl mt-6">
                  {t.couple.groomTitle}
                </h3>
                <p className="font-hindi text-sm leading-7 mt-3 text-ink/70">
                  {t.couple.groomParents}
                </p>
              </div>
              <div className="text-rose flex justify-center">
                <Heart size={36} strokeWidth={1} />
              </div>
              <div className="text-center">
                <CouplePhoto
                  src={assetUrl("images/bride.jpg")}
                  alt={t.couple.brideTitle}
                  label={t.hero.brideShort}
                  side={t.couple.brideSide}
                  uploadHint={t.couple.photoPlaceholderHint}
                  uploadSubHint={t.couple.photoUploadSubHint}
                  lang={lang}
                />
                <h3 className="font-serif text-2xl sm:text-3xl mt-6">
                  {t.couple.brideTitle}
                </h3>
                <p className="font-hindi text-sm leading-7 mt-3 text-ink/70">
                  {t.couple.brideParents}
                </p>
                <p className="text-xs sm:text-sm font-hindi text-ink/55 mt-2">
                  {t.couple.brideAddress}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="section-wrap">
          <div className="text-center mb-14">
            <p className="eyebrow">{t.events.eyebrow}</p>
            <h2 className="section-title mt-3">{t.events.heading}</h2>
            <p className="text-ink/55 mt-3 text-sm">{t.events.subtitle}</p>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="timeline-line" />
            {EVENTS.map((event, i) => (
              <motion.div
                key={event.date}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex gap-5 sm:gap-8 mb-8 ${
                  i % 2 ? "md:flex-row-reverse md:text-right" : ""
                }`}
              >
                <div className="timeline-dot">
                  <span>{event.date}</span>
                </div>
                <div className="event-card flex-1">
                  <p className="eyebrow">
                    {event.day[lang]} · {event.month[lang]}
                  </p>
                  <h3 className="font-hindi text-xl sm:text-2xl mt-2">
                    {event.title[lang]}
                  </h3>
                  <p className="font-hindi text-sm text-ink/65 mt-2">
                    {event.time[lang]}
                  </p>
                  <span className="inline-block mt-4 text-[10px] tracking-widest uppercase text-rose">
                    {event.kind[lang]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="venue" className="section-wrap bg-[#eee8dc]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="eyebrow">{t.venue.eyebrow}</p>
              <h2 className="section-title mt-3">{t.venue.heading}</h2>
              <div className="mt-8 flex gap-4">
                <MapPin className="text-rose shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="font-hindi text-xl">{t.venue.venueTitle}</h3>
                  <p className="font-hindi text-ink/70 mt-2 leading-8">
                    {t.venue.venueText}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <MapPin className="text-rose shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="font-hindi text-xl">
                    {t.venue.senderAddressTitle}
                  </h3>
                  <p className="font-hindi text-ink/70 mt-2 leading-8">
                    {t.venue.senderAddressLines[0]}
                    <br />
                    {t.venue.senderAddressLines[1]}
                  </p>
                </div>
              </div>
              <a
                className="gold-button mt-8"
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.venue.directionsBtn} <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="map-card">
              <div className="map-grid" />
              <MapPin size={42} className="text-rose relative z-10" />
              <p className="font-hindi text-lg relative z-10 mt-3">
                {t.venue.venueText}
              </p>
              <a
                className="relative z-10 text-xs underline mt-3"
                href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.venue.mapOpenLink}
              </a>
              <p className="relative z-10 text-[11px] text-ink/55 mt-5 max-w-xs leading-5">
                {t.venue.mapPinNote}
              </p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto mt-12 bg-white/65 border border-champagne/40 rounded-2xl p-6 sm:p-8 text-center">
            <p className="eyebrow">{t.venue.baraatEyebrow}</p>
            <p className="font-hindi leading-8 mt-4">
              {t.venue.baraatPrefix}
              <br />
              <strong>{t.venue.baraatVenue}</strong>
              <br />
              {t.venue.baraatSuffix}
            </p>
          </div>
        </section>

        <section id="gallery" className="section-wrap">
          <div className="text-center mb-10">
            <p className="eyebrow">{t.gallery.eyebrow}</p>
            <h2 className="section-title mt-3">{t.gallery.heading}</h2>
            <p className="text-sm text-ink/60 mt-3">{t.gallery.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {GALLERY_ITEMS.map((item, idx) => {
              const isBroken = Boolean(brokenGalleryIds[item.id]);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGalleryIndex(idx)}
                  className="gallery-tile group text-left"
                >
                  {isBroken ? (
                    <div className="gallery-placeholder">
                      <Camera size={26} strokeWidth={1.3} />
                      <span className="text-sm px-4 text-center">
                        {item.caption[lang]} {t.gallery.addPhotoSuffix}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title[lang]}
                      onError={() =>
                        setBrokenGalleryIds((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }))
                      }
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="gallery-caption">{item.caption[lang]}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="rsvp" className="section-wrap bg-white/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="eyebrow">{t.rsvp.eyebrow}</p>
              <h2 className="section-title mt-3">{t.rsvp.heading}</h2>
              <p className="font-hindi text-ink/60 mt-3">{t.rsvp.subtitle}</p>
            </div>
            <form
              onSubmit={submitRsvp}
              className="rsvp-card grid sm:grid-cols-2 gap-5"
            >
              <label className="field-label">
                {t.rsvp.nameLabel}
                <input
                  required
                  value={rsvpState.name}
                  onChange={(e) =>
                    setRsvpState({ ...rsvpState, name: e.target.value })
                  }
                  placeholder={t.rsvp.namePlaceholder}
                />
              </label>
              <label className="field-label">
                {t.rsvp.phoneLabel}
                <input
                  required
                  inputMode="tel"
                  pattern="[0-9+\s\-]{8,16}"
                  value={rsvpState.phone}
                  onChange={(e) =>
                    setRsvpState({ ...rsvpState, phone: e.target.value })
                  }
                  placeholder={t.rsvp.phonePlaceholder}
                />
              </label>
              <label className="field-label">
                {t.rsvp.guestsLabel}
                <select
                  value={rsvpState.guests}
                  onChange={(e) =>
                    setRsvpState({ ...rsvpState, guests: e.target.value })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                {t.rsvp.attendingLabel}
                <select
                  value={rsvpState.attending}
                  onChange={(e) =>
                    setRsvpState({ ...rsvpState, attending: e.target.value })
                  }
                >
                  <option value="yes">{t.rsvp.attendingYes}</option>
                  <option value="no">{t.rsvp.attendingNo}</option>
                </select>
              </label>
              <label className="field-label sm:col-span-2">
                {t.rsvp.noteLabel}
                <textarea
                  rows="3"
                  value={rsvpState.note}
                  onChange={(e) =>
                    setRsvpState({ ...rsvpState, note: e.target.value })
                  }
                  placeholder={t.rsvp.notePlaceholder}
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="gold-button sm:col-span-2 justify-center disabled:opacity-50"
              >
                {submitting ? t.rsvp.submitBusy : t.rsvp.submitIdle}{" "}
                <Heart size={16} />
              </button>
              {rsvpMessage.text && (
                <p
                  role="status"
                  className={`sm:col-span-2 text-center text-sm ${
                    rsvpMessage.type === "success"
                      ? "text-emerald-800"
                      : "text-rose"
                  }`}
                >
                  {rsvpMessage.text}
                </p>
              )}
              {!hasSupabaseConfig && (
                <p className="sm:col-span-2 text-center text-xs text-ink/50">
                  {t.rsvp.setupNote}
                </p>
              )}
            </form>
          </div>
        </section>

        <section className="section-wrap text-center">
          <p className="eyebrow">{t.blessings.eyebrow}</p>
          <h2 className="section-title mt-3">{t.blessings.heading}</h2>
          <p className="font-hindi text-sm sm:text-base text-ink/65 mt-4 leading-7 max-w-2xl mx-auto">
            {t.blessings.blessingCouplet1}
            <br />
            {t.blessings.blessingCouplet2}
          </p>
          <div className="ornament my-8">
            <span>✦</span>
          </div>

          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-5 text-left font-hindi">
            <div className="event-card">
              <p className="eyebrow">{t.blessings.senderLabel}</p>
              <p className="text-xl text-ink mt-2">{t.blessings.senderName}</p>
              <p className="text-sm text-ink/65 mt-2 leading-7">
                {t.blessings.senderAddress}
              </p>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="inline-flex items-center gap-2 text-sm text-rose hover:underline mt-3"
              >
                <Phone size={14} /> {t.blessings.phoneLabel}: {CONTACT_PHONE}
              </a>
            </div>

            <div className="event-card">
              <p className="eyebrow">{t.blessings.hostsLabel}</p>
              <p className="text-xl text-ink mt-2">{t.blessings.hostsName}</p>
              <p className="text-sm text-ink/75 mt-3">
                <span className="text-ink/55">{t.blessings.welcomersLabel}: </span>
                {t.blessings.welcomersName}
              </p>
              <p className="text-sm text-ink/65 mt-2 leading-6">
                <span className="text-ink/55">{t.blessings.darshanLabel}: </span>
                {t.blessings.darshanNames}
              </p>
            </div>
          </div>

          <div className="max-w-xl mx-auto mt-6 bg-white/70 border border-champagne/60 rounded-2xl px-6 py-5 font-hindi">
            <p className="eyebrow flex items-center justify-center gap-1.5">
              <Sparkles size={12} className="text-rose" />{" "}
              {t.blessings.childInviteLabel}
            </p>
            <p className="text-sm sm:text-base text-ink/80 mt-3 leading-7">
              {t.blessings.childVerse1}
              <br />
              {t.blessings.childVerse2}
            </p>
            <p className="text-sm text-rose font-semibold mt-2">
              {t.blessings.childName}
            </p>
          </div>

          <p className="mt-8 font-hindi text-rose text-xl">
            {t.blessings.closingMantra}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button type="button" onClick={shareWhatsApp} className="gold-button">
              <Share2 size={16} /> {t.blessings.shareWhatsApp}
            </button>
            <button type="button" onClick={copyLink} className="outline-button">
              <Copy size={16} /> {t.blessings.copyLink}
            </button>
          </div>
          <div className="mt-10 inline-block bg-white p-4 rounded-2xl shadow-soft">
            <QRCodeSVG
              value={inviteUrl || "https://your-wedding-site.example"}
              size={116}
              fgColor="#493735"
            />
            <p className="text-[10px] tracking-widest mt-2 text-ink/50">
              {t.blessings.qrCaption}
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-ink text-ivory px-5 py-8 text-center">
        <div className="font-serif text-2xl">
          K <span className="text-champagne">&amp;</span> A
        </div>
        <p className="font-hindi text-sm mt-2 text-ivory/75">
          {t.footer.couple}
        </p>
        <p className="text-[11px] tracking-[.18em] mt-3 text-ivory/45">
          {t.footer.tagline}
        </p>
        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          className="mt-5 text-[11px] text-ivory/40 hover:text-ivory/85 underline-offset-4 hover:underline"
        >
          {t.footer.adminBtn}
        </button>
      </footer>

      <GalleryLightbox
        items={GALLERY_ITEMS}
        activeIndex={galleryIndex}
        onClose={() => setGalleryIndex(null)}
        onSelect={setGalleryIndex}
        lang={lang}
        t={t.gallery}
      />

      <AdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        t={t.admin}
      />
    </div>
  );
}

export default App;
