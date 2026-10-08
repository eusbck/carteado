#!/usr/bin/env python3
"""Local MTG archive. Python 3.10+, standard library only; no login or upload."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
import csv
import gzip
import hashlib
import html
import io
import json
import os
from pathlib import Path
import re
import struct
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import zlib
from datetime import datetime, timezone

VERSION = "1.0.3"
ROOT = Path(__file__).resolve().parent
MOX = "https://api2.moxfield.com"
SCRY = "https://api.scryfall.com"
RULES_PAGE = "https://magic.wizards.com/en/rules"
ZONES = ("commanders", "mainboard", "sideboard", "companions", "signatureSpells", "maybeboard", "attractions", "contraptions", "planes", "schemes", "stickers")


class ArchiveError(Exception):
    pass


@contextmanager
def archive_lock(root):
    """The OS releases this lock even after Ctrl+C or a process crash."""
    root = Path(root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    with (root / ".collector.lock").open("a+b") as handle:
        handle.seek(0, os.SEEK_END)
        if not handle.tell():
            handle.write(b"0")
            handle.flush()
        handle.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as exc:
            raise ArchiveError("Já existe um coletor executando nesta pasta. Encerre essa execução antes de iniciar outra.") from exc
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == "nt":
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def describe_error(exc, http=None):
    """Keep source URLs even when an HTTP error was wrapped in another error."""
    current, seen = exc, set()
    url, code = None, None
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        if isinstance(current, urllib.error.HTTPError):
            url, code = current.url, current.code
            break
        current = current.__cause__
    url = url or getattr(http, "last_request_url", None)
    detail = str(exc)
    if url and url not in detail:
        detail += f"; URL: {url}"
    return {"detail": detail, "url": url, "http_status": code}


def now():
    return datetime.now(timezone.utc).isoformat()


def log(message):
    print(message, flush=True)


def slug(value, limit=65):
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-zA-Z0-9_-]+", "-", value).strip("-._")[:limit] or "sem-nome"
    if value.upper() in {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(10)), *(f"LPT{i}" for i in range(10))}:
        value = "_" + value
    return value


def digest_file(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp.replace(path)


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def iter_array(path, chunk_size=262144):
    """Parse a plain or gzip JSON array without loading the bulk file into RAM."""
    with Path(path).open("rb") as raw:
        compressed = raw.read(2) == b"\x1f\x8b"
        raw.seek(0)
        stream = gzip.GzipFile(fileobj=raw) if compressed else raw
        with io.TextIOWrapper(stream, encoding="utf-8-sig") as f:
            decoder, buffer, pos = json.JSONDecoder(), "", 0
            state = "start"
            while True:
                if pos > chunk_size:
                    buffer, pos = buffer[pos:], 0
                while pos < len(buffer) and buffer[pos].isspace():
                    pos += 1
                if pos >= len(buffer):
                    chunk = f.read(chunk_size)
                    if not chunk:
                        if state == "done":
                            return
                        raise ArchiveError("Arquivo bulk JSON truncado.")
                    buffer, pos = buffer[pos:] + chunk, 0
                    continue
                ch = buffer[pos]
                if state == "start":
                    if ch != "[":
                        raise ArchiveError("O arquivo bulk deve ser um array JSON.")
                    pos += 1
                    state = "first"
                elif state in ("first", "value"):
                    if ch == "]" and state == "first":
                        pos += 1
                        state = "done"
                        continue
                    try:
                        value, after = decoder.raw_decode(buffer, pos)
                    except json.JSONDecodeError as exc:
                        chunk = f.read(chunk_size)
                        if not chunk:
                            raise ArchiveError("Objeto bulk JSON incompleto ou inválido.") from exc
                        buffer = buffer[pos:] + chunk
                        pos = 0
                        continue
                    if not isinstance(value, dict):
                        raise ArchiveError("Objeto não reconhecido no arquivo bulk.")
                    pos = after
                    state = "separator"
                    yield value
                elif state == "separator":
                    if ch == ",":
                        pos += 1
                        state = "value"
                    elif ch == "]":
                        pos += 1
                        state = "done"
                    else:
                        raise ArchiveError("Separador inválido no arquivo bulk.")
                else:
                    raise ArchiveError("Conteúdo inesperado depois do array bulk.")


def iter_bulk(path, chunk_size=262144):
    """Stream current JSONL exports and legacy JSON arrays, plain or gzip."""
    path = Path(path)
    try:
        with path.open("rb") as raw:
            compressed = raw.read(2) == b"\x1f\x8b"
            raw.seek(0)
            stream = gzip.GzipFile(fileobj=raw) if compressed else raw
            with io.TextIOWrapper(stream, encoding="utf-8-sig") as text:
                first = text.read(1)
                while first and first.isspace():
                    first = text.read(1)
                if not first:
                    raise ArchiveError(f"Arquivo bulk vazio: {path.name}")
                legacy_array = first == "["
                if not legacy_array:
                    text.seek(0)
                    for number, line in enumerate(text, 1):
                        if not line.strip():
                            continue
                        try:
                            value = json.loads(line)
                        except json.JSONDecodeError as exc:
                            raise ArchiveError(f"JSONL inválido ou truncado em {path.name}, linha {number}: {exc.msg}") from exc
                        if not isinstance(value, dict):
                            raise ArchiveError(f"Registro não reconhecido em {path.name}, linha {number}; esperado um objeto JSON.")
                        yield value
        if legacy_array:
            yield from iter_array(path, chunk_size)
    except (gzip.BadGzipFile, EOFError, UnicodeError) as exc:
        raise ArchiveError(f"Arquivo bulk corrompido ou gzip incompleto: {path.name}: {exc}") from exc


class Http:
    def __init__(self, root, refresh=False, offline=False):
        self.root, self.refresh, self.offline = Path(root), refresh, offline
        self.last = {}
        self.sources = {}
        self.last_request_url = None
        self.enumeration_details = {}

    def open(self, url, accept="application/json", compressed=False):
        self.last_request_url = url
        if self.offline:
            raise ArchiveError(f"Arquivo ausente no cache local; modo offline não acessa a rede: {url}")
        host = urllib.parse.urlparse(url).hostname or ""
        delay = 0.65 if host == "api.scryfall.com" else 0.35 if host.endswith("moxfield.com") else 0
        for attempt in range(4):
            wait = delay - (time.monotonic() - self.last.get(host, 0))
            if wait > 0:
                time.sleep(wait)
            self.last[host] = time.monotonic()
            headers = {"User-Agent": "PrivateMTGDeckArchive/1.0 (personal offline archive)", "Accept": accept, "Accept-Encoding": "gzip" if compressed else "identity"}
            try:
                return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=90)
            except urllib.error.HTTPError as exc:
                exc.close()
                if exc.code in (401, 403):
                    raise ArchiveError(f"Acesso recusado (HTTP {exc.code}) em {url}. Nenhum bloqueio será contornado. Use exportações locais se necessário.") from exc
                if exc.code == 404:
                    raise
                if exc.code not in (429, 500, 502, 503, 504) or attempt == 3:
                    raise ArchiveError(f"HTTP {exc.code} em {url}") from exc
                try:
                    retry_after = float(exc.headers.get("Retry-After", "0"))
                except ValueError:
                    retry_after = 60
                time.sleep(max(60 if exc.code == 429 else 2 ** (attempt + 1), retry_after))
            except (urllib.error.URLError, OSError) as exc:
                if attempt == 3:
                    raise ArchiveError(f"Falha de conexão com {url}: {exc}") from exc
                time.sleep(2 ** attempt)

    def json(self, url):
        self.last_request_url = url
        key = hashlib.sha256(url.encode()).hexdigest()
        path = self.root / ".cache" / "json" / (key + ".json")
        if path.exists() and not self.refresh and (self.offline or time.time() - path.stat().st_mtime < 86400):
            cached = read_json(path)
            self.sources[url] = cached["retrieved_at"]
            return cached["data"]
        with self.open(url) as response:
            body = response.read()
            if response.headers.get("Content-Encoding") == "gzip":
                body = gzip.decompress(body)
            try:
                value = json.loads(body)
            except (ValueError, UnicodeDecodeError) as exc:
                raise ArchiveError(f"A resposta de {url} não é JSON; pode ser uma página de bloqueio.") from exc
        retrieved = now()
        write_json(path, {"source_url": url, "retrieved_at": retrieved, "data": value})
        self.sources[url] = retrieved
        return value

    def download(self, url, path, accept="*/*", compressed=False, force=False):
        self.last_request_url = url
        path = Path(path)
        meta_path = path.with_suffix(path.suffix + ".source.json")
        if path.exists() and meta_path.exists() and not self.refresh and not force:
            metadata = read_json(meta_path)
            if metadata.get("source_url") == url and metadata.get("sha256") == digest_file(path):
                self.sources[url] = metadata["retrieved_at"]
                return metadata
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".part")
        log(f"Baixando {path.name} ...")
        started = last_progress = time.monotonic()
        size = 0
        with self.open(url, accept, compressed) as response, temporary.open("wb") as output:
            expected = response.headers.get("Content-Length")
            encoding = response.headers.get("Content-Encoding")
            for chunk in iter(lambda: response.read(1024 * 1024), b""):
                output.write(chunk)
                size += len(chunk)
                if time.monotonic() - last_progress > 20:
                    log(f"  {path.name}: {size / 1024**2:.1f} MB ({time.monotonic() - started:.0f}s)")
                    last_progress = time.monotonic()
        if not size or (expected is not None and size != int(expected)):
            raise ArchiveError(f"Download incompleto: {path.name}; {size} bytes, esperado {expected}.")
        metadata = {"source_url": url, "retrieved_at": now(), "bytes": size, "sha256": digest_file(temporary), "content_encoding": encoding}
        temporary.replace(path)
        write_json(meta_path, metadata)
        self.sources[url] = metadata["retrieved_at"]
        return metadata


def public_id(deck):
    ident = deck.get("publicId") or deck.get("public_id")
    if not ident and deck.get("publicUrl"):
        ident = urllib.parse.urlparse(deck["publicUrl"]).path.rstrip("/").split("/")[-1]
    if not ident:
        raise ArchiveError("Deck sem publicId/publicUrl na resposta do Moxfield.")
    return str(ident)


def summary_authors(summary):
    authors = [summary.get("createdByUser"), *(summary.get("authors") or [])]
    return {author["userName"].casefold() for author in authors if isinstance(author, dict) and isinstance(author.get("userName"), str)}


def profile_page_url(username, number, route="search"):
    parameters = {"pageNumber": number, "pageSize": 100}
    if route == "search":
        parameters.update(authorUserNames=username, sortType="updated", sortDirection="descending", showIllegal="true", includePinned="true")
        path = "/v2/decks/search"
    else:
        path = f"/v2/users/{urllib.parse.quote(username, safe='')}/decks"
    return MOX + path + "?" + urllib.parse.urlencode(parameters)


def enumerate_decks(http, username):
    result, paged_ids, expected, route = {}, set(), None, "search"
    for number in range(1, 10001):
        url = profile_page_url(username, number, route)
        log(f"Consultando perfil: página {number} ({route}).")
        try:
            page = http.json(url)
        except urllib.error.HTTPError as exc:
            exc.close()
            if exc.code != 404 or number != 1 or route != "search":
                raise
            log("A rota de busca retornou 404; verificando a rota de perfil.")
            route = "user"
            url = profile_page_url(username, number, route)
            try:
                page = http.json(url)
            except urllib.error.HTTPError as alternate:
                alternate.close()
                if alternate.code != 404:
                    raise
                raise ArchiveError(f"O Moxfield retornou 404 nas duas consultas do perfil '{username}'. Busca: {exc.url}; perfil: {alternate.url}. As rotas ou o nome do perfil precisam ser verificados.") from alternate
        rows = page if isinstance(page, list) else page.get("data", page.get("decks")) if isinstance(page, dict) else None
        if not isinstance(rows, list):
            raise ArchiveError(f"Formato desconhecido da lista de decks em {url}. Resposta preservada no cache.")
        pinned = (page.get("pinned") or []) if isinstance(page, dict) else []
        if not isinstance(pinned, list):
            raise ArchiveError(f"Lista de decks fixados não reconhecida em {url}.")
        if isinstance(page, dict):
            total = page.get("totalResults", page.get("totalCount", page.get("total")))
            if total is not None:
                if expected is not None and int(total) != expected:
                    raise ArchiveError("O total de decks mudou durante a coleta; execute novamente.")
                expected = int(total)
                if expected < 0:
                    raise ArchiveError(f"Total de decks inválido em {url}.")
        added = 0
        for row in rows:
            owners = summary_authors(row)
            if owners and username.casefold() not in owners:
                raise ArchiveError(f"A busca filtrada por '{username}' retornou um deck de outro usuário em {url}; coleta interrompida para verificar o filtro.")
            ident = public_id(row)
            if ident not in paged_ids:
                paged_ids.add(ident)
                added += 1
            result[ident] = row
        for row in pinned:
            owners = summary_authors(row)
            if owners and username.casefold() not in owners:
                continue
            result.setdefault(public_id(row), row)
        http.enumeration_details = {"route": route, "pages_read": number, "api_total_results": expected, "paged_decks": len(paged_ids), "unique_decks_including_pinned": len(result)}
        log(f"Perfil: página {number}, {len(result)} decks públicos identificados.")
        if expected is not None and len(paged_ids) >= expected:
            if len(paged_ids) != expected:
                raise ArchiveError("Contagem de decks não coincide com o total publicado.")
            http.enumeration_details["total_results_basis"] = "paged_data"
            return list(result.values()), len(result)
        total_pages = page.get("totalPages") if isinstance(page, dict) else None
        if total_pages is not None and number >= int(total_pages):
            if expected is not None and expected not in (len(paged_ids), len(result)):
                raise ArchiveError("A última página declarada não reuniu o total de decks publicado.")
            http.enumeration_details["total_results_basis"] = "including_pinned" if expected is not None and expected == len(result) else "declared_pages"
            return list(result.values()), len(result)
        if not rows:
            if expected is not None and expected not in (len(paged_ids), len(result)):
                raise ArchiveError("A paginação terminou antes de reunir todos os decks.")
            http.enumeration_details["total_results_basis"] = "including_pinned" if expected is not None and expected == len(result) else "empty_last_page"
            return list(result.values()), len(result)
        if not added:
            raise ArchiveError("O Moxfield repetiu uma página; a coleta de todos os decks não foi confirmada.")
    raise ArchiveError("Limite de paginação excedido.")


def normalize_deck(raw, fallback_id=None):
    ident = public_id(raw) if raw.get("publicId") or raw.get("publicUrl") else fallback_id
    if not ident:
        raise ArchiveError("Identificador do deck ausente.")
    boards = raw.get("boards")
    if not isinstance(boards, dict):
        boards = {zone: raw[zone] for zone in ZONES if zone in raw}
    if not boards:
        raise ArchiveError(f"Deck {ident}: nenhum board reconhecido; não será tratado como um deck vazio.")
    entries = []
    for zone, board in boards.items():
        if board is None:
            continue
        cards = board.get("cards", board) if isinstance(board, dict) else board
        rows = list(cards.values()) if isinstance(cards, dict) else cards
        if not isinstance(rows, list):
            raise ArchiveError(f"Deck {ident}: estrutura não reconhecida em {zone}.")
        for position, item in enumerate(rows):
            if not isinstance(item, dict) or not isinstance(item.get("card"), dict):
                raise ArchiveError(f"Deck {ident}: carta não reconhecida em {zone}.")
            quantity = item.get("quantity")
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                raise ArchiveError(f"Deck {ident}: quantidade inválida em {zone}.")
            card = item["card"]
            if not card.get("name"):
                raise ArchiveError(f"Deck {ident}: carta sem nome.")
            entries.append({"zone": zone, "position": position, "quantity": quantity, "name": card["name"], "requested_scryfall_id": card.get("scryfall_id") or card.get("scryfallId"), "requested_oracle_id": card.get("oracle_id") or card.get("oracleId"), "requested_set": card.get("set") or card.get("setCode"), "requested_collector_number": card.get("cn") or card.get("collector_number") or card.get("collectorNumber"), "requested_language": card.get("lang") or card.get("language"), "finish": item.get("finish"), "is_foil": item.get("isFoil"), "is_proxy": item.get("isProxy"), "is_alter": item.get("isAlter"), "tags": item.get("tags", []), "entry_metadata": {k: v for k, v in item.items() if k != "card"}, "source_card": card})
    counts = {zone: sum(e["quantity"] for e in entries if e["zone"] == zone) for zone in boards}
    return {"id": str(ident), "name": raw.get("name", str(ident)), "format": raw.get("format"), "description": raw.get("description"), "source_url": raw.get("publicUrl") or (f"https://moxfield.com/decks/{ident}" if not fallback_id else None), "counts": counts, "entries": entries, "source_metadata": {k: v for k, v in raw.items() if k not in {*boards, "boards", "tokens"}}, "source_tokens": raw.get("tokens", [])}


def import_text(path):
    boards, zone = {"mainboard": []}, "mainboard"
    aliases = {"deck": "mainboard", "mainboard": "mainboard", "main deck": "mainboard", "sideboard": "sideboard", "commander": "commanders", "commanders": "commanders", "companion": "companions", "maybeboard": "maybeboard", "signature spells": "signatureSpells"}
    for number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.strip("[]:").lower() in aliases:
            zone = aliases[line.strip("[]:").lower()]
            boards.setdefault(zone, [])
            continue
        match = re.fullmatch(r"(\d+)\s+(.+)", line)
        if not match:
            raise ArchiveError(f"{path.name}:{number}: linha não reconhecida: {line}")
        quantity, name = int(match[1]), match[2]
        marker = re.search(r"\s+\*CMDR\*", name, re.I)
        row_zone = "commanders" if marker else zone
        finish = "etched" if re.search(r"\*E\*", name, re.I) else "foil" if re.search(r"\*F\*", name, re.I) else None
        name = re.sub(r"\s+\*(?:CMDR|F|E)\*", "", name, flags=re.I).strip()
        edition = re.fullmatch(r"(.+)\s+\(([^()]+)\)\s+(\S+)", name)
        card = {"name": edition[1] if edition else name}
        if edition:
            card.update(set=edition[2].lower(), collector_number=edition[3])
        boards.setdefault(row_zone, []).append({"quantity": quantity, "card": card, "finish": finish})
    ident = "import-" + hashlib.sha256(path.name.encode()).hexdigest()[:12]
    return {"name": path.stem, "boards": boards}, ident


def card_names(card):
    return {name.casefold() for name in [card.get("name", ""), card.get("printed_name", ""), *[f.get("name", "") for f in card.get("card_faces", [])]] if name}


def oracle_key(card):
    if card.get("oracle_id"):
        return card["oracle_id"]
    faces = card.get("card_faces", [])
    return "faces:" + "+".join(f.get("oracle_id", f.get("name", "")) for f in faces) if faces else "printing:" + card["id"]


def scan_bulk(path, names, ids):
    names = {n.casefold() for n in names if n}
    selected = {}
    for number, card in enumerate(iter_bulk(path), 1):
        if card.get("id") in ids or (card.get("lang") in ("en", "pt") and card_names(card) & names):
            selected[card["id"]] = card
        if number % 100000 == 0:
            log(f"Lendo banco local: {number:,} registros; {len(selected)} edições candidatas (a seleção final vem depois).")
    return selected


def printing_score(card, preferred=None):
    preferred = preferred or {}
    return (card.get("set") == preferred.get("set") and card.get("collector_number") == preferred.get("collector_number"), card.get("set") == preferred.get("set"), not card.get("digital", False), "paper" in card.get("games", []), card.get("highres_image", False), card.get("image_status") == "highres_scan", card.get("released_at", ""), card.get("id", ""))


def resolve_entry(entry, candidates):
    requested = entry.get("requested_scryfall_id")
    if requested:
        if requested not in candidates:
            raise ArchiveError(f"Edição exata ausente: {entry['name']} / {requested}")
        return candidates[requested], "scryfall_id"
    matching = [c for c in candidates.values() if entry["name"].casefold() in card_names(c)]
    if entry.get("requested_oracle_id"):
        matching = [c for c in matching if oracle_key(c) == entry["requested_oracle_id"]]
    if entry.get("requested_set") and entry.get("requested_collector_number"):
        exact = [c for c in matching if c.get("set", "").lower() == str(entry["requested_set"]).lower() and str(c.get("collector_number")) == str(entry["requested_collector_number"])]
        if not exact:
            raise ArchiveError(f"Edição ausente: {entry['name']} ({entry['requested_set']}) {entry['requested_collector_number']}")
        preferred_lang = entry.get("requested_language") or "en"
        local = [c for c in exact if c.get("lang") == preferred_lang]
        if entry.get("requested_language") and not local:
            raise ArchiveError(f"Idioma da edição ausente: {entry['name']} / {preferred_lang}")
        return max(local or exact, key=printing_score), "set_collector_number"
    if len({oracle_key(c) for c in matching}) > 1:
        raise ArchiveError(f"Nome ambíguo: {entry['name']}; informe uma edição ou Scryfall ID.")
    english = [c for c in matching if c.get("lang") == "en"]
    if not matching:
        raise ArchiveError(f"Carta ausente no banco: {entry['name']}")
    return max(english or matching, key=printing_score), "name_only_edition_unknown"


def images_for(card):
    if card.get("image_uris"):
        return [("front", card["image_uris"])]
    return [("front" if i == 0 else "back" if i == 1 else f"face-{i + 1}", face["image_uris"]) for i, face in enumerate(card.get("card_faces", [])) if face.get("image_uris")]


def validate_image(path, kind):
    path = Path(path)
    with path.open("rb") as f:
        if kind != "png":
            signature = f.read(3)
            if path.stat().st_size < 4 or signature != b"\xff\xd8\xff":
                raise ArchiveError(f"JPEG inválido: {path.name}")
            f.seek(-2, os.SEEK_END)
            if f.read(2) != b"\xff\xd9":
                raise ArchiveError(f"JPEG truncado: {path.name}")
            return None, None
        if f.read(8) != b"\x89PNG\r\n\x1a\n":
            raise ArchiveError(f"PNG inválido: {path.name}")
        width = height = None
        seen_data = False
        while True:
            length = f.read(4)
            if len(length) != 4:
                raise ArchiveError(f"PNG truncado: {path.name}")
            length = int.from_bytes(length, "big")
            if length > 100 * 1024 * 1024:
                raise ArchiveError(f"Chunk PNG inválido: {path.name}")
            chunk_type, data, crc = f.read(4), f.read(length), f.read(4)
            if len(chunk_type) != 4 or len(data) != length or len(crc) != 4 or zlib.crc32(chunk_type + data) & 0xffffffff != int.from_bytes(crc, "big"):
                raise ArchiveError(f"PNG incompleto ou corrompido: {path.name}")
            if width is None and chunk_type != b"IHDR":
                raise ArchiveError(f"PNG sem cabeçalho: {path.name}")
            if chunk_type == b"IHDR":
                if length != 13 or width is not None:
                    raise ArchiveError(f"Cabeçalho PNG inválido: {path.name}")
                width, height = struct.unpack(">II", data[:8])
                if not width or not height:
                    raise ArchiveError(f"Dimensões PNG inválidas: {path.name}")
            seen_data |= chunk_type == b"IDAT"
            if chunk_type == b"IEND":
                if length or not seen_data or f.read(1):
                    raise ArchiveError(f"Final PNG inválido: {path.name}")
                return width, height


def bulk_file(http, kind):
    metadata = http.json(f"{SCRY}/bulk-data/{kind}")
    if not isinstance(metadata, dict):
        raise ArchiveError(f"Metadados bulk não reconhecidos: {kind}; esperado um objeto JSON.")
    download_url = metadata.get("jsonl_download_uri") or metadata.get("download_uri")
    if not isinstance(download_url, str) or not download_url.startswith("https://"):
        raise ArchiveError(f"Metadados bulk sem endereço de download: {kind}; campos recebidos: {', '.join(metadata)}")
    if metadata.get("type") and metadata["type"] != kind:
        raise ArchiveError(f"Banco bulk incorreto: solicitado {kind}, recebido {metadata['type']}")
    jsonl = bool(metadata.get("jsonl_download_uri"))
    log(f"Banco {kind}: {'JSONL' if jsonl else 'JSON'}{' gzip' if download_url.endswith('.gz') else ''}.")
    if metadata.get("compressed_size"):
        log(f"Tamanho comprimido informado pelo Scryfall: {metadata['compressed_size'] / 1000000:.1f} MB.")
    stamp = hashlib.sha256(download_url.encode()).hexdigest()[:16]
    path = http.root / ".cache" / f"{kind}-{stamp}.data"
    # .jsonl.gz files are already compressed; request identity to avoid a second layer.
    http.download(download_url, path, "application/gzip,application/x-ndjson,application/json,*/*", compressed=not download_url.endswith(".gz"))
    return path, metadata


def fetch_deck(http, ident):
    encoded = urllib.parse.quote(ident, safe="")
    try:
        return http.json(f"{MOX}/v3/decks/all/{encoded}")
    except urllib.error.HTTPError as exc:
        exc.close()
        if exc.code != 404:
            raise
        return http.json(f"{MOX}/v2/decks/all/{encoded}")


def language_variants(original, candidates):
    matching = [c for c in candidates.values() if oracle_key(c) == oracle_key(original)]
    return {lang: (max(options, key=lambda c: printing_score(c, original))["id"] if (options := [c for c in matching if c.get("lang") == lang]) else None) for lang in ("en", "pt")}


def auxiliary_kind(card):
    """Moxfield's `tokens` also contains ordinary spells; don't trust the field name."""
    layout, types = card.get("layout"), card.get("type_line", "")
    if layout in ("token", "double_faced_token") or types.startswith("Token"):
        return "token"
    if layout == "emblem" or types.startswith("Emblem"):
        return "emblem"
    if layout == "dungeon" or types.startswith("Dungeon"):
        return "dungeon"
    if types == "Card":
        return "marker"
    return None


def symbol_filename(symbol):
    label = slug(symbol.strip("{}").replace("/", "-"))
    return label + "--" + hashlib.sha256(symbol.encode("utf-8")).hexdigest()[:10] + ".svg"


def forward_support_parts(card):
    # all_parts is bidirectional. Never walk from a token back to its creators,
    # or from one meld half to another playable card absent from the deck.
    if auxiliary_kind(card):
        return []
    return [part for part in card.get("all_parts", []) if part.get("id") and part.get("component") in ("token", "meld_result")]


def validate_scope(decks, printings):
    """Rebuild the permitted set from deck entries and direct auxiliary links."""
    expected = set()

    def variants(base, mapping):
        for lang, sid in mapping.items():
            if not sid:
                continue
            if sid not in printings or printings[sid].get("lang") != lang or oracle_key(printings[sid]) != oracle_key(printings[base]):
                raise ArchiveError(f"Variante de idioma fora do escopo: {base} / {lang} / {sid}")
            expected.add(sid)

    for deck in decks:
        primary = {e["printing_id"] for e in deck["entries"] if e.get("printing_id")}
        if primary - printings.keys():
            raise ArchiveError(f"Edição do deck ausente no plano: {deck['name']}")
        declared = set(deck.get("declared_support_printing_ids", []))
        for sid in declared:
            if sid not in printings or not auxiliary_kind(printings[sid]):
                raise ArchiveError(f"Carta comum apresentada como ficha auxiliar: {deck['name']} / {sid}")
        linked = {p["id"]: p for sid in primary for p in forward_support_parts(printings[sid])}
        support = set(deck.get("support_printing_ids", []))
        if support - (declared | linked.keys()) or support & primary:
            raise ArchiveError(f"Relação auxiliar fora do escopo: {deck['name']}")
        for sid in support:
            if sid not in printings:
                raise ArchiveError(f"Ficha auxiliar ausente no plano: {deck['name']} / {sid}")
            if sid not in declared and linked[sid]["component"] == "token" and not auxiliary_kind(printings[sid]):
                raise ArchiveError(f"Vínculo token aponta para carta comum: {sid}")
        expected.update(primary | support | declared)
        for entry in deck["entries"]:
            sid = entry.get("printing_id")
            if sid:
                if entry.get("requested_scryfall_id") and entry["requested_scryfall_id"] != sid:
                    raise ArchiveError(f"Edição original alterada: {deck['name']} / {entry['name']}")
                variants(sid, entry.get("language_variants", {}))
        for sid, mapping in deck.get("support_language_variants", {}).items():
            if sid not in support:
                raise ArchiveError(f"Variante de ficha sem vínculo com o deck: {sid}")
            variants(sid, mapping)
    if expected != printings.keys():
        raise ArchiveError(f"Plano contém edições sem vínculo autorizado: {sorted(printings.keys() - expected)}")


def gameplay_index(printings):
    gameplay = {}
    for card in printings.values():
        key = oracle_key(card)
        if key not in gameplay or (card.get("lang") == "en" and gameplay[key].get("reference_language") != "en"):
            fields = ("name", "oracle_text", "mana_cost", "cmc", "type_line", "colors", "color_identity", "keywords", "power", "toughness", "loyalty", "defense", "layout", "legalities", "card_faces", "all_parts")
            gameplay[key] = {"id": key, "oracle_id": card.get("oracle_id"), "reference_language": card.get("lang"), **{k: card.get(k) for k in fields}, "printing_ids": []}
    for sid, card in printings.items():
        gameplay[oracle_key(card)]["printing_ids"].append(sid)
    return gameplay


def cached_card_images(root, card):
    images = []
    for face, uris in images_for(card):
        kind = "png" if uris.get("png") else "large"
        path = root / "assets" / "cards" / card["id"] / (face + (".png" if kind == "png" else ".jpg"))
        meta_path = path.with_suffix(path.suffix + ".source.json")
        if not path.is_file() or not meta_path.is_file():
            continue
        try:
            meta = read_json(meta_path)
            if meta.get("source_url") != uris.get(kind) or meta.get("sha256") != digest_file(path):
                continue
            width, height = validate_image(path, kind)
            images.append({"face": face, "path": path.relative_to(root).as_posix(), "source_url": uris[kind], "sha256": meta["sha256"], "bytes": path.stat().st_size, "width": width, "height": height})
        except (ArchiveError, OSError, ValueError, KeyError):
            continue
    return images


def download_plan(decks, printings):
    planned = {}
    for sid, card in printings.items():
        cached_faces = {img["face"] for img in card["local_images"]}
        images = []
        for face, uris in images_for(card):
            kind = "png" if uris.get("png") else "large"
            images.append({"face": face, "url": uris.get(kind), "path": f"assets/cards/{sid}/{face}" + (".png" if kind == "png" else ".jpg"), "cached": face in cached_faces})
        planned[sid] = {"name": card["name"], "language": card.get("lang"), "card_id": oracle_key(card), "reasons": card["archive_reasons"], "images": images}
    return {"schema_version": 1, "collector_version": VERSION, "created_at": now(), "policy": "deck_printings_and_direct_auxiliaries_with_en_pt_variants", "deck_card_instances": sum(e["quantity"] for d in decks for e in d["entries"]), "deck_printings": len({e["printing_id"] for d in decks for e in d["entries"] if e.get("printing_id")}), "selected_printings": len(printings), "images_expected": sum(len(p["images"]) for p in planned.values()), "images_cached": sum(i["cached"] for p in planned.values() for i in p["images"]), "printings": planned}


def quarantine_extras(root, selected_ids):
    """Move stale downloads within this archive. Never delete card assets."""
    root = Path(root).resolve()
    extra_paths = []
    asset_dir = root / "assets" / "cards"
    if asset_dir.exists():
        extra_paths.extend(p for p in asset_dir.iterdir() if p.is_dir() and p.name not in selected_ids)
    raw_dir = root / "raw" / "scryfall"
    if raw_dir.exists():
        extra_paths.extend(p for p in raw_dir.glob("*.json") if p.stem not in selected_ids)
    if not extra_paths:
        return None
    recovery = root / ".recovery" / ("outside-scope-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ"))
    report = {"created_at": now(), "reason": "Downloads fora do plano validado; preservados para recuperação.", "moves": []}
    for source in sorted(extra_paths):
        destination = recovery / source.relative_to(root)
        # Verify both resolved absolute paths before moving a directory tree.
        if source.is_symlink() or not source.resolve().is_relative_to(root) or not destination.resolve().is_relative_to(root):
            raise ArchiveError(f"Caminho inseguro para reorganização: {source}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        source.rename(destination)
        report["moves"].append({"from": source.relative_to(root).as_posix(), "to": destination.relative_to(root).as_posix()})
        write_json(recovery / "manifest.json", report)
    log(f"Arquivos fora do escopo preservados em {recovery.relative_to(root).as_posix()} ({len(extra_paths)} itens).")
    return {"manifest": (recovery / "manifest.json").relative_to(root).as_posix(), "items_moved": len(extra_paths)}


def write_decks(root, decks, printings):
    fields = ["zone", "quantity", "name", "card_id", "printing_id", "edition", "collector_number", "language", "finish", "image_front", "image_back", "resolution_method"]
    for deck in decks:
        directory = root / "decks" / (slug(deck["name"]) + "--" + slug(deck["id"], 30))
        directory.mkdir(parents=True, exist_ok=True)
        deck["local_path"] = directory.relative_to(root).as_posix()
        write_json(directory / "deck.json", deck)
        lines = []
        with (directory / "cartas.csv").open("w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for zone in deck["counts"]:
                lines.extend([f"[{zone}]", ""])
                for entry in deck["entries"]:
                    if entry["zone"] != zone:
                        continue
                    printing = printings.get(entry.get("printing_id"), {})
                    images = {img["face"]: img["path"] for img in printing.get("local_images", [])}
                    row = {k: entry.get(k) for k in fields}
                    row.update(edition=printing.get("set"), collector_number=printing.get("collector_number"), language=printing.get("lang"), image_front=images.get("front"), image_back=images.get("back"))
                    # Protect human-readable CSVs from formula evaluation in Excel.
                    writer.writerow({k: ("'" + v if isinstance(v, str) and v.startswith(("=", "+", "-", "@")) else v) for k, v in row.items()})
                    edition = f" ({printing['set'].upper()}) {printing.get('collector_number', '')}" if printing.get("set") else ""
                    lines.append(f"{entry['quantity']} {entry['name']}{edition}")
                lines.append("")
        (directory / "lista.txt").write_text("\n".join(lines), encoding="utf-8")
        (directory / "descricao.txt").write_text(str(deck.get("description") or "Sem descrição pública do autor.") + "\n", encoding="utf-8")
    write_json(root / "data" / "decks.json", decks)


def write_gallery(root, decks, printings, manifest):
    payload = json.dumps({"decks": decks, "printings": printings, "status": manifest["status"]}, ensure_ascii=False).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    template = (ROOT / "catalogo.template.html").read_text(encoding="utf-8")
    (root / "catalogo.html").write_text(template.replace("__ARCHIVE_DATA__", payload), encoding="utf-8")


def run(root, username="nvvvm", imports=None, refresh=False, http=None, plan_only=False):
    root = Path(root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    http = http or Http(root, refresh)
    state = {"schema_version": 1, "collector_version": VERSION, "profile_url": f"https://moxfield.com/users/{username}", "started_at": now(), "status": "collecting", "step": "profile", "profile_enumeration_complete": False, "decks_expected": None, "decks_saved": 0, "errors": [], "warnings": [], "sources": {}}

    def save():
        state["sources"] = http.sources
        write_json(root / "manifest.json", state)

    def error(kind, **details):
        state["errors"].append({"kind": kind, **details})

    save()
    try:
        decks = []
        if imports:
            paths = sorted(p for p in Path(imports).resolve().iterdir() if p.suffix.lower() in (".json", ".txt"))
            if not paths:
                raise ArchiveError("Não há exportações .json/.txt na pasta de importação.")
            state["collection_mode"] = "local_exports"
            state["warnings"].append("Exportações locais não comprovam que todos os decks públicos do perfil foram incluídos.")
            state["decks_expected"] = len(paths)
            for path in paths:
                raw, ident = import_text(path) if path.suffix.lower() == ".txt" else (read_json(path), "import-" + hashlib.sha256(path.name.encode()).hexdigest()[:12])
                deck = normalize_deck(raw, ident)
                deck["source_import_file"] = path.name
                write_json(root / "raw" / "moxfield" / (slug(deck["id"]) + ".json"), raw)
                decks.append(deck)
        else:
            rows, expected = enumerate_decks(http, username)
            state.update(collection_mode="public_profile", profile_enumeration_complete=True, decks_expected=expected, profile_pagination=getattr(http, "enumeration_details", {}))
            write_json(root / "raw" / "moxfield" / "profile-decks.json", {"retrieved_at": now(), "expected_total": expected, "decks": rows})
            save()
            state["step"] = "deck_lists"
            for i, row in enumerate(rows, 1):
                ident = public_id(row)
                log(f"Deck {i}/{len(rows)}: {row.get('name', ident)}")
                raw = fetch_deck(http, ident)
                write_json(root / "raw" / "moxfield" / (slug(ident) + ".json"), raw)
                deck = normalize_deck(raw, ident)
                deck["source_url"] = f"https://moxfield.com/decks/{ident}"
                decks.append(deck)
                state["decks_saved"] = len(decks)
                save()
        state["decks_saved"] = len(decks)
        if not decks:
            state.update(status="empty_profile", step="done", finished_at=now())
            write_json(root / "data" / "decks.json", [])
            save()
            return state
        # Save each list before enriching it, so a later network failure loses no deck data.
        write_decks(root, decks, {})
        entries = [e for d in decks for e in d["entries"]]
        declared_tokens = []
        for deck in decks:
            tokens = deck["source_tokens"]
            rows = tokens.values() if isinstance(tokens, dict) else tokens
            for item in rows:
                card = item.get("card", item)
                if (card.get("layout") or card.get("type_line")) and not auxiliary_kind(card):
                    deck.setdefault("ignored_source_relations", []).append({"name": card.get("name"), "scryfall_id": card.get("scryfall_id") or card.get("scryfallId"), "reason": "ordinary_card_in_source_tokens"})
                    continue
                if card.get("name"):
                    declared_tokens.append((deck, {"name": card["name"], "requested_scryfall_id": card.get("scryfall_id") or card.get("scryfallId"), "requested_set": card.get("set"), "requested_collector_number": card.get("cn") or card.get("collector_number")}))
        wanted = entries + [e for _, e in declared_tokens]
        state["step"] = "card_database"
        save()
        log("Obtendo o arquivo bulk do Scryfall: inclui as edições e os idiomas; pode ser grande.")
        bulk, bulk_meta = bulk_file(http, "all_cards")
        state["scryfall_snapshot"] = {k: bulk_meta.get(k) for k in ("type", "updated_at", "jsonl_download_uri", "download_uri", "compressed_size", "size")}
        candidates = scan_bulk(bulk, {e["name"] for e in wanted}, {e["requested_scryfall_id"] for e in wanted if e.get("requested_scryfall_id")})
        original_ids = set()
        declared_entry_ids = {id(entry) for _, entry in declared_tokens}
        for entry in wanted:
            sid = entry.get("requested_scryfall_id")
            try:
                if sid and sid not in candidates:
                    card = http.json(f"{SCRY}/cards/{urllib.parse.quote(sid, safe='')}")
                    candidates[card["id"]] = card
                original, method = resolve_entry(entry, candidates)
                if id(entry) in declared_entry_ids and not auxiliary_kind(original):
                    entry["ignored_reason"] = "ordinary_card_in_source_tokens"
                    continue
                entry.update(card_id=oracle_key(original), printing_id=original["id"], resolution_method=method)
                original_ids.add(original["id"])
                if method == "name_only_edition_unknown":
                    state["warnings"].append(f"{entry['name']}: edição original desconhecida; foi escolhida uma edição de referência.")
            except (ArchiveError, urllib.error.HTTPError) as exc:
                entry.update(card_id=None, printing_id=None, resolution_method="unresolved")
                error("unresolved_card", name=entry["name"], requested_scryfall_id=sid, detail=str(exc))
        # Only direct forward links from cards actually present in deck lists.
        # The raw all_parts metadata stays intact, but cannot expand the archive.
        deck_ids = {e["printing_id"] for e in entries if e.get("printing_id")}
        parts = {p["id"]: p for sid in deck_ids for p in forward_support_parts(candidates[sid])}
        pending = parts.keys() - original_ids
        missing = pending - candidates.keys()
        if missing:
            log(f"Resolvendo {len(missing)} fichas/resultados meld diretamente usados pelos decks ...")
            candidates.update(scan_bulk(bulk, {parts[sid].get("name") for sid in missing}, missing))
        support_ids = set()
        for sid in sorted(pending):
            if sid not in candidates:
                try:
                    card = http.json(f"{SCRY}/cards/{urllib.parse.quote(sid, safe='')}")
                    candidates[card["id"]] = card
                except (ArchiveError, urllib.error.HTTPError) as exc:
                    error("unresolved_related_card", scryfall_id=sid, detail=str(exc))
                    continue
            if parts[sid]["component"] == "token" and not auxiliary_kind(candidates[sid]):
                raise ArchiveError(f"Relação token aponta para carta comum: {sid}")
            support_ids.add(sid)
        for deck, entry in declared_tokens:
            if entry.get("printing_id"):
                deck.setdefault("declared_support_printing_ids", []).append(entry["printing_id"])
            elif entry.get("ignored_reason"):
                deck.setdefault("ignored_source_relations", []).append({"name": entry["name"], "scryfall_id": entry.get("requested_scryfall_id"), "reason": entry["ignored_reason"]})
        selected_ids = set(original_ids | support_ids)
        variants = {sid: language_variants(candidates[sid], candidates) for sid in selected_ids}
        reasons = {sid: [] for sid in selected_ids}
        for deck in decks:
            for entry in deck["entries"]:
                if entry.get("printing_id"):
                    reasons[entry["printing_id"]].append({"kind": "deck_entry", "deck_id": deck["id"], "zone": entry["zone"], "quantity": entry["quantity"]})
            for sid in sorted(set(deck.get("declared_support_printing_ids", []))):
                reasons[sid].append({"kind": "declared_auxiliary", "deck_id": deck["id"], "auxiliary_kind": auxiliary_kind(candidates[sid])})
            for entry in deck["entries"]:
                if entry.get("printing_id"):
                    for part in forward_support_parts(candidates[entry["printing_id"]]):
                        if part["id"] in selected_ids:
                            reasons[part["id"]].append({"kind": "linked_auxiliary", "deck_id": deck["id"], "parent_printing_id": entry["printing_id"], "component": part["component"]})
        for sid, mapping in variants.items():
            for lang, variant in mapping.items():
                if variant:
                    selected_ids.add(variant)
                    if variant != sid:
                        reasons.setdefault(variant, []).append({"kind": "language_variant", "base_printing_id": sid, "language": lang})
        for entry in entries:
            entry["language_variants"] = variants[entry["printing_id"]] if entry.get("printing_id") else {"en": None, "pt": None}
        for deck in decks:
            related = set(deck.get("declared_support_printing_ids", []))
            for entry in deck["entries"]:
                if entry.get("printing_id"):
                    related.update(p["id"] for p in forward_support_parts(candidates[entry["printing_id"]]) if p["id"] in original_ids | support_ids)
            deck["support_printing_ids"] = sorted(related - {e.get("printing_id") for e in deck["entries"]})
            deck["support_language_variants"] = {sid: variants[sid] for sid in deck["support_printing_ids"]}
        printings = {sid: {**candidates[sid], "local_images": cached_card_images(root, candidates[sid]), "archive_reasons": reasons[sid]} for sid in sorted(selected_ids)}
        validate_scope(decks, printings)
        plan = download_plan(decks, printings)
        ignored = sum(len(d.get("ignored_source_relations", [])) for d in decks)
        if ignored:
            state["warnings"].append(f"{ignored} relações de cartas comuns no campo tokens foram preservadas na fonte e excluídas das fichas auxiliares.")
        state.update(selection_policy=plan["policy"], deck_card_instances=plan["deck_card_instances"], deck_printings=plan["deck_printings"], selected_printings=len(printings), images_expected=plan["images_expected"], images_saved=plan["images_cached"], unique_gameplay_cards=len(gameplay_index(printings)), related_printings=len((original_ids | support_ids) - deck_ids), ignored_source_relations=ignored, cards_without_portuguese=sorted({candidates[sid]["name"] for sid in original_ids if not variants[sid]["pt"]}))
        state["quarantine"] = quarantine_extras(root, selected_ids)
        write_json(root / "data" / "download-plan.json", plan)
        write_json(root / "data" / "cards.json", gameplay_index(printings))
        write_json(root / "data" / "printings.json", printings)
        write_decks(root, decks, printings)
        for sid in sorted(selected_ids):
            write_json(root / "raw" / "scryfall" / (sid + ".json"), candidates[sid])
        log(f"Plano validado: {len(decks)} decks, {plan['deck_card_instances']} cartas nas listas, {len(printings)} edições, {plan['images_expected']} imagens ({plan['images_cached']} já disponíveis).")
        if plan_only:
            state.update(status="planned" if not state["errors"] else "partial", step="awaiting_downloads", planned_at=now(), pending_stages=["images", "rulings", "symbols", "rules"])
            write_gallery(root, decks, printings, state)
            save()
            return state
        state["step"] = "images"
        save()
        for i, (sid, card) in enumerate(printings.items(), 1):
            log(f"Imagens {i}/{len(printings)}: {card['name']} [{card.get('lang')}]")
            card["local_images"] = []
            faces = images_for(card)
            if not faces:
                error("missing_image_url", scryfall_id=sid, name=card["name"])
            for face, uris in faces:
                kind = "png" if uris.get("png") else "large"
                url = uris.get(kind)
                if not url:
                    error("missing_image_url", scryfall_id=sid, face=face)
                    continue
                path = root / "assets" / "cards" / sid / (face + (".png" if kind == "png" else ".jpg"))
                try:
                    force = False
                    if path.exists():
                        try:
                            validate_image(path, kind)
                        except ArchiveError:
                            force = True
                    meta = http.download(url, path, "image/png,image/jpeg", force=force)
                    width, height = validate_image(path, kind)
                    card["local_images"].append({"face": face, "path": path.relative_to(root).as_posix(), "source_url": url, "sha256": meta["sha256"], "bytes": meta["bytes"], "width": width, "height": height})
                except (ArchiveError, urllib.error.HTTPError, OSError) as exc:
                    error("image_download", scryfall_id=sid, face=face, detail=str(exc))
            if i % 25 == 0:
                state["images_saved"] = sum(len(c["local_images"]) for c in printings.values())
                write_json(root / "data" / "printings.json", printings)
                save()
        # Preserve the complete provider objects alongside a gameplay-oriented index.
        gameplay = gameplay_index(printings)
        write_json(root / "data" / "cards.json", gameplay)
        write_json(root / "data" / "printings.json", printings)
        state["step"] = "rulings_and_symbols"
        save()
        oracle_ids = {c.get("oracle_id") for c in printings.values()} | {f.get("oracle_id") for c in printings.values() for f in c.get("card_faces", [])}
        oracle_ids.discard(None)
        try:
            rulings_bulk, rulings_meta = bulk_file(http, "rulings")
            rulings = {oid: [] for oid in oracle_ids}
            for ruling in iter_bulk(rulings_bulk):
                if ruling.get("oracle_id") in rulings:
                    rulings[ruling["oracle_id"]].append(ruling)
            write_json(root / "data" / "rulings.json", {"snapshot_updated_at": rulings_meta.get("updated_at"), "by_oracle_id": rulings})
        except (ArchiveError, urllib.error.HTTPError, OSError) as exc:
            error("rulings", detail=str(exc))
        try:
            symbols = http.json(f"{SCRY}/symbology")
            if not isinstance(symbols.get("data"), list):
                raise ArchiveError("Lista de símbolos não reconhecida.")
            for symbol in symbols["data"]:
                symbol["local_path"] = None
                if symbol.get("svg_uri"):
                    path = root / "assets" / "symbols" / symbol_filename(symbol["symbol"])
                    try:
                        http.download(symbol["svg_uri"], path, "image/svg+xml")
                        if "<svg" not in path.read_text(encoding="utf-8"):
                            raise ArchiveError("Símbolo baixado não é SVG.")
                        symbol["local_path"] = path.relative_to(root).as_posix()
                    except (ArchiveError, urllib.error.HTTPError, OSError) as exc:
                        error("symbol_image", symbol=symbol.get("symbol"), detail=str(exc))
            write_json(root / "data" / "symbols.json", symbols)
        except (ArchiveError, urllib.error.HTTPError, OSError) as exc:
            error("symbols", detail=str(exc))
        try:
            with http.open(RULES_PAGE, "text/html") as response:
                page = html.unescape(response.read().decode("utf-8"))
            urls = re.findall(r'https://media\.wizards\.com/[^\s"<>]+\.txt', page, flags=re.I)
            urls = [u for u in urls if "MagicCompRules" in u]
            if not urls:
                raise ArchiveError("Link TXT das regras completas não encontrado na página oficial.")
            http.download(urls[0], root / "rules" / "MagicCompRules.txt", "text/plain")
            state["rules_source_url"] = urls[0]
        except (ArchiveError, urllib.error.HTTPError, OSError) as exc:
            state["warnings"].append(f"Regras completas não baixadas: {exc}; referência: {RULES_PAGE}")
        state.update(status="complete" if not state["errors"] and state["profile_enumeration_complete"] else "partial", step="done", finished_at=now(), images_saved=sum(len(c["local_images"]) for c in printings.values()))
        write_decks(root, decks, printings)
        write_gallery(root, decks, printings, state)
        files = []
        for base in ("data", "decks", "assets", "rules", "raw"):
            directory = root / base
            if directory.exists():
                files.extend({"path": p.relative_to(root).as_posix(), "bytes": p.stat().st_size, "sha256": digest_file(p)} for p in sorted(directory.rglob("*")) if p.is_file())
        write_json(root / "checksums.json", files)
        save()
        log(f"Status: {state['status']}; {len(decks)} decks, {len(gameplay)} cartas, {state['images_saved']} imagens; {len(state['errors'])} pendências.")
        return state
    except KeyboardInterrupt:
        state.update(status="interrupted", interrupted_at=now())
        if "printings" in locals():
            state["images_saved"] = sum(len(c["local_images"]) for c in printings.values())
            write_json(root / "data" / "printings.json", printings)
            write_decks(root, decks, printings)
            write_gallery(root, decks, printings, state)
        save()
        log("Coleta interrompida com Ctrl+C. Downloads concluídos foram preservados; execute novamente para continuar.")
        return state
    except (ArchiveError, urllib.error.HTTPError, OSError, ValueError, KeyError, TypeError) as exc:
        context = describe_error(exc, http)
        state.update(status="blocked", failed_at=now(), failure_detail=context["detail"], failure_url=context["url"], failure_http_status=context["http_status"])
        error("collection_interrupted", step=state["step"], **context)
        save()
        raise ArchiveError(f"Etapa '{state['step']}': {context['detail']}") from exc


def verify(root):
    root = Path(root).resolve()
    state = read_json(root / "manifest.json")
    if not (root / "checksums.json").exists():
        raise ArchiveError(f"A coleta ainda não gerou arquivos para verificar. Status: {state['status']}.")
    errors = []
    for item in read_json(root / "checksums.json"):
        path = (root / item["path"]).resolve()
        if not path.is_relative_to(root):
            raise ArchiveError("Caminho fora da pasta do arquivo no manifesto de integridade.")
        if not path.is_file() or path.stat().st_size != item["bytes"] or digest_file(path) != item["sha256"]:
            errors.append(item["path"])
    decks, cards, printings = (read_json(root / "data" / name) for name in ("decks.json", "cards.json", "printings.json"))
    validate_scope(decks, printings)
    for deck in decks:
        for entry in deck["entries"]:
            if entry.get("card_id") not in cards or entry.get("printing_id") not in printings:
                errors.append(f"{deck['name']}: carta não resolvida {entry['name']}")
        for zone, count in deck["counts"].items():
            if count != sum(e["quantity"] for e in deck["entries"] if e["zone"] == zone):
                errors.append(f"{deck['name']}: contagem de {zone}")
    for sid, printing in printings.items():
        if len(printing.get("local_images", [])) != len(images_for(printing)) or not images_for(printing):
            errors.append(f"{sid}: imagem ausente")
    if errors:
        raise ArchiveError("Falhas de integridade:\n" + "\n".join(errors))
    log(f"Integridade dos arquivos confirmada. Status da coleta: {state['status']}.")
    return state


def main():
    parser = argparse.ArgumentParser(description="Baixar e organizar decks públicos de Magic com imagens e dados locais.")
    parser.add_argument("--user", default="nvvvm")
    parser.add_argument("--output", type=Path, default=ROOT)
    parser.add_argument("--imports", type=Path, help="Usar exportações locais .json/.txt em vez de consultar o perfil.")
    parser.add_argument("--refresh", action="store_true", help="Consultar novamente as fontes e substituir os arquivos da coleta.")
    parser.add_argument("--verify", action="store_true", help="Conferir hashes, referências e quantidades sem acessar a internet.")
    parser.add_argument("--plan", action="store_true", help="Preparar dados e validar o plano, sem baixar imagens, rulings, símbolos ou regras.")
    parser.add_argument("--offline", action="store_true", help="Usar somente o cache local; nunca acessar a rede.")
    parser.add_argument("--version", action="version", version=f"Coletor {VERSION}")
    args = parser.parse_args()
    if args.refresh and args.offline:
        parser.error("--refresh e --offline não podem ser usados juntos.")
    log(f"Coletor {VERSION}")
    try:
        if args.verify:
            state = verify(args.output)
        else:
            with archive_lock(args.output):
                state = run(args.output, args.user, args.imports, args.refresh, http=Http(args.output, args.refresh, args.offline), plan_only=args.plan)
        return 0 if state["status"] in ("complete", "empty_profile") else 3 if state["status"] == "planned" else 2
    except ArchiveError as exc:
        log(f"Coleta não concluída: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
