"""Shared helpers for the audio tools. normalize() must match sayKey() in site/js/audio.js."""
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
AUDIO = SITE / "audio"
CLIPS = AUDIO / "clips"
# Clips in the male voice for the male speakers in dialogues, filed the same way in clips/m/.
MALE_DIR = "m"
EXTS = {".mp3", ".m4a", ".ogg", ".wav", ".webm"}

_STRIP = re.compile(r"[?!.,;:\"'“”‘’()\[\]/\\*<>|…።፣፤፡፥፦፧፨]")
ETHIOPIC = re.compile(r"[ሀ-᎟ⶀ-⷟꬀-꬯]")


def normalize(text: str) -> str:
    """The key a clip is filed under: punctuation turned into spaces, spaces collapsed."""
    text = unicodedata.normalize("NFC", text)
    text = _STRIP.sub(" ", text)
    return re.sub(r"\s+", " ", text).strip()


def existing_clips(male: bool = False) -> dict:
    """Map of key -> path relative to site/audio/ for every clip on disk.
    male=False: the main clips (everything except clips/m/). male=True: only the clips in clips/m/."""
    out = {}
    base = CLIPS / MALE_DIR if male else CLIPS
    if not base.exists():
        return out
    for f in sorted(base.rglob("*")):
        if not male and f.relative_to(CLIPS).parts[0] == MALE_DIR:
            continue
        if f.is_file() and f.suffix.lower() in EXTS and f.stat().st_size > 0:
            key = normalize(f.stem)
            if key:
                out.setdefault(key, f.relative_to(AUDIO).as_posix())
    return out
