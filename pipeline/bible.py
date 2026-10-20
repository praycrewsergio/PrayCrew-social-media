"""Verbatim verse lookup from public-domain USFX Bibles (open-bibles)."""
import re, xml.etree.ElementTree as ET

BOOKS = {"Psalm": "PSA", "Proverbs": "PRO", "Isaiah": "ISA", "Jeremiah": "JER", "Lamentations": "LAM",
         "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Romans": "ROM",
         "1 Corinthians": "1CO", "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP",
         "Colossians": "COL", "1 Thessalonians": "1TH", "1 Timothy": "1TI", "Hebrews": "HEB",
         "James": "JAS", "1 Peter": "1PE", "1 John": "1JN", "Revelation": "REV"}
SKIP = {"f", "x", "s", "d", "fe", "rq", "ms", "mt", "h", "toc", "id", "ide", "rem", "fig", "cl"}


def load(path):
    """Return {(BOOK, ch, v): text}. Text only between <v/> and <ve/>; headings/notes skipped."""
    root = ET.parse(path).getroot()
    out, cur = {}, {"b": None, "c": None, "v": None}

    def add(t):
        if t and cur["v"] is not None:
            k = (cur["b"], cur["c"], cur["v"]); out[k] = out.get(k, "") + t

    def walk(el):
        tag = el.tag.split("}")[-1]
        if tag == "book": cur["b"] = el.get("id"); cur["c"] = cur["v"] = None
        elif tag == "c": cur["c"] = int(el.get("id")); cur["v"] = None
        elif tag == "v": cur["v"] = int(re.match(r"\d+", el.get("id")).group())
        elif tag == "ve": cur["v"] = None
        if tag in SKIP or (tag == "p" and el.get("sfm") == "r"):
            pass
        else:
            add(el.text)
            for ch in el:
                walk(ch)
        add(el.tail)

    walk(root)
    return {k: re.sub(r"\s+", " ", v).strip() for k, v in out.items()}


def parse_ref(ref):
    book, cv = ref.replace("–", "-").rsplit(" ", 1)
    ch, vs = cv.split(":")
    a, _, b = vs.partition("-")
    return BOOKS[book], int(ch), int(a), int(b or a)


def passage(bible, ref):
    b, c, v1, v2 = parse_ref(ref)
    parts = [bible[(b, c, v)] for v in range(v1, v2 + 1)]
    return " ".join(parts)


CAPS = re.compile(r"[¡¿]?(?:[A-ZÁÉÍÓÚÑ] )?[A-ZÁÉÍÓÚÑÜ]{2,}")


def clean_es(text, verse_num, is_psalm):
    """RV1909 fixes: drop Psalm superscription merged into v1, un-caps the chapter's opening word,
    modernize the 1909 accent on one-letter words (á/ó/é/ú -> a/o/e/u). Wording is unchanged."""
    if verse_num == 1:
        m = CAPS.search(text)
        if m:
            if is_psalm:
                text = text[m.start():]
                m = CAPS.search(text)
            run = m.group(0)
            low = run.lower()
            if m.start() == 0:  # sentence start: capitalize first letter after ¡/¿
                i = 1 if low[0] in "¡¿" else 0
                low = low[:i] + low[i].upper() + low[i + 1:]
            text = text[:m.start()] + low + text[m.end():]
    text = re.sub(r"(?<![\wÁÉÍÓÚÑáéíóúñü])([áóéú])(?![\wáéíóúñü])",
                  lambda m: {"á": "a", "ó": "o", "é": "e", "ú": "u"}[m.group(1)], text)
    text = re.sub(r"(?<![\w])Á(?![\w])", "A", text)
    return text


def passage_es(bible, ref):
    b, c, v1, v2 = parse_ref(ref)
    return " ".join(clean_es(bible[(b, c, v)], v, b == "PSA") for v in range(v1, v2 + 1))

ACROSTIC = re.compile(r"^(ALEPH|BETH|GIMEL|DALETH|HE|VAU|ZAIN|CHETH|TETH|JOD|CAPH|LAMED|MEM|NUN|SAMECH|AIN|PE|TZADDI|COPH|RESH|SIN|TAU)\.?\s+")
