"""Shared helpers for the audio tools. normalize() must match sayKey() in site/js/audio.js."""
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
AUDIO = SITE / "audio"
CLIPS = AUDIO / "clips"
EXTS = {".mp3", ".m4a", ".ogg", ".wav", ".webm"}

_STRIP = re.compile(r"[?!.,;:\"'“”‘’()\[\]/\\*<>|…።፣፤፡፥፦፧፨]")
ETHIOPIC = re.compile(r"[ሀ-᎟ⶀ-⷟꬀-꬯]")


def normalize(text: str) -> str:
    """The key a clip is filed under: punctuation turned into spaces, spaces collapsed."""
    text = unicodedata.normalize("NFC", text)
    text = _STRIP.sub(" ", text)
    return re.sub(r"\s+", " ", text).strip()


def existing_clips() -> dict:
    """Map of key -> path relative to site/audio/ for every clip on disk."""
    out = {}
    if not CLIPS.exists():
        return out
    for f in sorted(CLIPS.rglob("*")):
        if f.is_file() and f.suffix.lower() in EXTS and f.stat().st_size > 0:
            key = normalize(f.stem)
            if key:
                out.setdefault(key, f.relative_to(AUDIO).as_posix())
    return out
