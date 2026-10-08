"""Synthetic fixtures only. Tests never access the network or write archive data."""
import copy
import gzip
import io
import json
from pathlib import Path
import struct
import tempfile
import unittest
import urllib.error
import urllib.parse
import zlib
from unittest.mock import patch

import coletar as c

A = "00000000-0000-4000-8000-000000000001"
AP = "00000000-0000-4000-8000-000000000002"
T = "00000000-0000-4000-8000-000000000003"
TP = "00000000-0000-4000-8000-000000000004"
OA = "10000000-0000-4000-8000-000000000001"
OT = "10000000-0000-4000-8000-000000000003"


def png():
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(b"\x00\x10\x20\x30\xff")) + chunk(b"IEND", b"")


def fixture_cards():
    front = {"name": "Fixture Front", "type_line": "Creature", "mana_cost": "{1}{G}", "oracle_text": "Synthetic test text.", "image_uris": {"png": "https://cards.scryfall.io/test/front.png"}}
    back = {"name": "Fixture Back", "type_line": "Creature", "oracle_text": "Synthetic reverse text.", "image_uris": {"png": "https://cards.scryfall.io/test/back.png"}}
    a = {"object": "card", "id": A, "oracle_id": OA, "name": "Fixture Front // Fixture Back", "set": "test", "collector_number": "1", "lang": "en", "layout": "transform", "games": ["paper"], "highres_image": True, "card_faces": [front, back], "all_parts": [{"id": A, "name": "Fixture Front // Fixture Back", "component": "combo_piece"}, {"id": T, "name": "Fixture Token", "component": "token"}]}
    ap = copy.deepcopy(a)
    ap.update(id=AP, lang="pt", set="testpt", printed_name="Teste Frente // Teste Verso")
    ap["card_faces"][0].update(printed_name="Teste Frente", printed_text="Texto impresso sintético.")
    token = {"object": "card", "id": T, "oracle_id": OT, "name": "Fixture Token", "set": "ttest", "collector_number": "1", "lang": "en", "layout": "token", "games": ["paper"], "oracle_text": "", "type_line": "Token Creature", "image_uris": {"png": "https://cards.scryfall.io/test/token.png"}}
    tokenpt = {**token, "id": TP, "lang": "pt", "printed_name": "Ficha de Teste"}
    return [a, ap, token, tokenpt]


def fixture_deck(ident="fixture-deck", qty=2):
    return {"publicId": ident, "name": "Synthetic " + ident, "format": "commander", "boards": {"mainboard": {"cards": {"card": {"quantity": qty, "card": {"name": "Fixture Front // Fixture Back", "scryfall_id": A}, "finish": "foil"}}}, "sideboard": {"cards": {}}}}


class FakeHttp:
    def __init__(self, root, damaged=False, bulk_format="jsonl"):
        self.root, self.sources = Path(root), {}
        self.cards, self.damaged = fixture_cards(), damaged
        self.bulk_format = bulk_format

    def json(self, url):
        self.sources[url] = "synthetic-fixture"
        if "/users/" in url or "/decks/search?" in url:
            return {"data": [{"publicId": "fixture-one", "name": "Synthetic one"}, {"publicId": "fixture-two", "name": "Synthetic two"}], "totalResults": 2}
        if "/decks/all/" in url:
            return fixture_deck(url.rsplit("/", 1)[1])
        if "/bulk-data/" in url:
            kind = url.rsplit("/", 1)[1]
            field = "jsonl_download_uri" if self.bulk_format == "jsonl" else "download_uri"
            suffix = ".jsonl.gz" if self.bulk_format == "jsonl" else ".json"
            return {"type": kind, field: f"https://data.scryfall.io/test/{kind}{suffix}", "updated_at": "synthetic-fixture"}
        if url.endswith("/symbology"):
            return {"data": [{"symbol": "{G}", "svg_uri": "https://svgs.scryfall.io/card-symbols/G.svg"}]}
        if "/cards/" in url:
            sid = url.rsplit("/", 1)[1]
            for card in self.cards:
                if card["id"] == sid:
                    return copy.deepcopy(card)
        raise urllib.error.HTTPError(url, 404, "Synthetic not found", {}, None)

    def download(self, url, path, accept="*/*", compressed=False, force=False):
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        if "all_cards.json" in url:
            # Put a related PT token before its parent to catch order-dependent selection.
            records = list(reversed(self.cards))
            body = "\n".join(json.dumps(card) for card in records) + "\n" if self.bulk_format == "jsonl" else json.dumps(records)
            path.write_bytes(gzip.compress(body.encode()))
        elif "rulings.json" in url:
            records = [{"oracle_id": OA, "comment": "Synthetic ruling", "source": "test"}]
            body = "\n".join(json.dumps(ruling) for ruling in records) + "\n" if self.bulk_format == "jsonl" else json.dumps(records)
            path.write_bytes(gzip.compress(body.encode()))
        elif url.endswith(".png"):
            path.write_bytes(b"<html>blocked</html>" if self.damaged else png())
        elif url.endswith(".svg"):
            path.write_text('<svg xmlns="http://www.w3.org/2000/svg"></svg>', encoding="utf-8")
        else:
            path.write_text("Synthetic comprehensive rules.", encoding="utf-8")
        return {"source_url": url, "retrieved_at": "synthetic-fixture", "bytes": path.stat().st_size, "sha256": c.digest_file(path)}

    def open(self, url, accept="*/*", compressed=False):
        return io.BytesIO(b'<a href="https://media.wizards.com/test/MagicCompRules.txt">TXT</a>')


class CollectorTests(unittest.TestCase):
    def test_profile_uses_author_filtered_deck_search(self):
        class Capture:
            def json(self, url):
                self.url = url
                return {"data": [], "totalResults": 0}
        http = Capture()
        username = "nvvvm&fmt=standard"
        c.enumerate_decks(http, username)
        parsed = urllib.parse.urlparse(http.url)
        query = urllib.parse.parse_qs(parsed.query)
        self.assertEqual(parsed.path, "/v2/decks/search")
        self.assertEqual(query["authorUserNames"], [username])
        self.assertNotIn("fmt", query)
        self.assertEqual(query["showIllegal"], ["true"])

    def test_only_a_first_page_404_activates_the_alternate_profile_route(self):
        class Legacy:
            def __init__(self):
                self.urls = []
            def json(self, url):
                self.urls.append(url)
                if "/decks/search?" in url:
                    raise urllib.error.HTTPError(url, 404, "Not Found", {}, None)
                number = int(urllib.parse.parse_qs(urllib.parse.urlparse(url).query)["pageNumber"][0])
                return {"data": [{"publicId": str(number)}], "totalResults": 2}
        http = Legacy()
        rows, total = c.enumerate_decks(http, "test")
        self.assertEqual((len(rows), total), (2, 2))
        self.assertEqual(len(http.urls), 3)
        self.assertIn("/users/test/decks?", http.urls[-1])
        class Refused:
            def __init__(self):
                self.urls = []
            def json(self, url):
                self.urls.append(url)
                raise urllib.error.HTTPError(url, 403, "Forbidden", {}, None)
        refused = Refused()
        with self.assertRaises(urllib.error.HTTPError):
            c.enumerate_decks(refused, "test")
        self.assertEqual(len(refused.urls), 1)

    def test_pinned_decks_are_deduplicated_without_corrupting_page_counts(self):
        class Pinned:
            def json(self, url):
                return {"data": [{"publicId": "one"}], "pinned": [{"publicId": "one"}, {"publicId": "two"}, {"publicId": "other", "createdByUser": {"userName": "someone-else"}}], "totalResults": 1}
        rows, total = c.enumerate_decks(Pinned(), "test")
        self.assertEqual({row["publicId"] for row in rows}, {"one", "two"})
        self.assertEqual(total, 2)

    def test_pinned_decks_can_be_included_in_the_declared_total(self):
        class Pinned:
            def json(self, url):
                return {"data": [{"publicId": "one"}], "pinned": [{"publicId": "two"}], "totalResults": 2, "totalPages": 1}
        rows, total = c.enumerate_decks(Pinned(), "test")
        self.assertEqual((len(rows), total), (2, 2))

    def test_a_broken_author_filter_never_collects_another_users_decks(self):
        class WrongUser:
            def json(self, url):
                return {"data": [{"publicId": "other", "createdByUser": {"userName": "someone-else"}}], "totalResults": 1}
        with self.assertRaises(c.ArchiveError):
            c.enumerate_decks(WrongUser(), "test")

    def test_real_http_404_preserves_the_failed_url_and_stage(self):
        def missing(request, timeout):
            raise urllib.error.HTTPError(request.full_url, 404, "Not Found", {}, None)
        with tempfile.TemporaryDirectory() as directory, patch("urllib.request.urlopen", side_effect=missing) as requests:
            root = Path(directory)
            with self.assertRaises(c.ArchiveError) as failure:
                c.run(root)
            state = c.read_json(root / "manifest.json")
            self.assertEqual(requests.call_count, 2)
            self.assertEqual(state["failure_http_status"], 404)
            self.assertIn("/v2/users/nvvvm/decks?", state["failure_url"])
            self.assertIn("/v2/decks/search?", state["failure_detail"])
            self.assertIn("Etapa 'profile'", str(failure.exception))
            self.assertEqual(state["errors"][0]["http_status"], 404)
            self.assertEqual(state["decks_saved"], 0)

    def test_streaming_plain_gzip_and_small_chunks(self):
        content = [{"name": "á{}[]", "nested": [{"a": 1}]}, {"unicode": "Frente // Verso"}]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bulk"
            for body in (json.dumps(content, ensure_ascii=False).encode(), gzip.compress(json.dumps(content).encode())):
                path.write_bytes(body)
                self.assertEqual(list(c.iter_array(path, chunk_size=3)), content)

    def test_bulk_rejects_truncation_and_trailing_garbage(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bulk"
            for body in ('[{"a":1}', '[{"a":1},]', '[] garbage', '{"not":"array"}'):
                path.write_text(body)
                with self.assertRaises(c.ArchiveError):
                    list(c.iter_array(path, chunk_size=2))

    def test_current_jsonl_streams_plain_gzip_bom_and_blank_lines(self):
        records = [{"name": "Carta á", "oracle_text": "Primeira linha.\nSegunda linha."}, {"name": "Frente // Verso", "faces": [{"text": "{T}: habilidade"}]}]
        body = ("\ufeff\n  \n" + "\n".join(json.dumps(card, ensure_ascii=False) for card in records)).encode("utf-8")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bulk.data"
            for data in (body, gzip.compress(body)):
                path.write_bytes(data)
                self.assertEqual(list(c.iter_bulk(path, chunk_size=3)), records)
            # Legacy data is still detected by content, even with no filename extension.
            path.write_bytes(gzip.compress(json.dumps(records).encode()))
            self.assertEqual(list(c.iter_bulk(path, chunk_size=3)), records)

    def test_jsonl_rejects_invalid_truncated_non_object_and_empty_files(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bulk.data"
            for data in (b'{"id":"ok"}\n{"id":', b'{"id":"ok"}\n42\n', b'<html>blocked</html>', b' \n'):
                path.write_bytes(data)
                with self.assertRaises(c.ArchiveError):
                    list(c.iter_bulk(path))
            path.write_bytes(b'{"id":"ok"}\n{"id":')
            with self.assertRaisesRegex(c.ArchiveError, "linha 2"):
                list(c.iter_bulk(path))

    def test_truncated_gzip_does_not_escape_as_an_unhandled_eof_error(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bulk.data"
            for body in (b'{"id":"ok"}\n', b'[{"id":"ok"}]'):
                path.write_bytes(gzip.compress(body)[:-5])
                with self.assertRaises(c.ArchiveError):
                    list(c.iter_bulk(path))

    def test_captured_scryfall_metadata_selects_the_current_jsonl_download(self):
        fixture = c.read_json(Path(__file__).parent / "fixtures" / "scryfall-all-cards-metadata.json")
        class CapturedMetadata:
            def __init__(self, root):
                self.root = Path(root)
            def json(self, url):
                return fixture
            def download(self, url, path, accept, compressed):
                self.download_url, self.compressed, self.accept = url, compressed, accept
                Path(path).parent.mkdir(parents=True, exist_ok=True)
                Path(path).write_bytes(gzip.compress(b'{"id":"synthetic-test-record"}\n'))
        with tempfile.TemporaryDirectory() as directory:
            http = CapturedMetadata(directory)
            path, metadata = c.bulk_file(http, "all_cards")
            self.assertEqual(http.download_url, fixture["jsonl_download_uri"])
            self.assertFalse(http.compressed)
            self.assertIn("application/gzip", http.accept)
            self.assertEqual(metadata["compressed_size"], 395352588)
            self.assertEqual(list(c.iter_bulk(path)), [{"id": "synthetic-test-record"}])

    def test_current_jsonl_url_is_preferred_when_legacy_url_is_also_present(self):
        class BothUrls:
            def __init__(self, root):
                self.root = Path(root)
            def json(self, url):
                return {"type": "all_cards", "jsonl_download_uri": "https://data.scryfall.io/current.jsonl.gz", "download_uri": "https://data.scryfall.io/legacy.json"}
            def download(self, url, path, accept, compressed):
                self.url = url
        with tempfile.TemporaryDirectory() as directory:
            http = BothUrls(directory)
            c.bulk_file(http, "all_cards")
            self.assertEqual(http.url, "https://data.scryfall.io/current.jsonl.gz")

    def test_pagination_does_not_stop_on_short_pages(self):
        class Pages:
            def json(self, url):
                page = int(url.split("pageNumber=")[1].split("&")[0])
                return {"data": [{"publicId": str(page)}] if page < 3 else []}
        rows, expected = c.enumerate_decks(Pages(), "test")
        self.assertEqual((len(rows), expected), (2, 2))

    def test_repeated_or_incomplete_pages_never_claim_completion(self):
        class Repeat:
            def json(self, url):
                return {"data": [{"publicId": "same"}], "totalResults": 2}
        with self.assertRaises(c.ArchiveError):
            c.enumerate_decks(Repeat(), "test")
        class Incomplete:
            def json(self, url):
                return {"data": [{"publicId": "a"}] if "pageNumber=1&" in url else [], "totalResults": 2}
        with self.assertRaises(c.ArchiveError):
            c.enumerate_decks(Incomplete(), "test")

    def test_both_moxfield_board_shapes_and_exact_quantities(self):
        raw = fixture_deck(qty=7)
        deck = c.normalize_deck(raw)
        self.assertEqual(deck["counts"]["mainboard"], 7)
        old = {"publicId": "old", "mainboard": raw["boards"]["mainboard"]["cards"], "sideboard": {}}
        self.assertEqual(c.normalize_deck(old)["entries"][0]["quantity"], 7)
        for invalid in (True, 0, -1, "7"):
            bad = fixture_deck(qty=invalid)
            with self.assertRaises(c.ArchiveError):
                c.normalize_deck(bad)

    def test_unknown_boards_and_empty_schema_fail(self):
        with self.assertRaises(c.ArchiveError):
            c.normalize_deck({"publicId": "test", "error": "blocked"})

    def test_missing_exact_printing_does_not_silently_change_edition(self):
        entry = {"name": "Fixture Token", "requested_scryfall_id": "missing"}
        with self.assertRaises(c.ArchiveError):
            c.resolve_entry(entry, {card["id"]: card for card in fixture_cards()})

    def test_translation_is_tied_to_oracle_identity(self):
        cards = {card["id"]: card for card in fixture_cards()}
        variants = c.language_variants(cards[A], cards)
        self.assertEqual(variants, {"en": A, "pt": AP})
        del cards[AP]
        self.assertIsNone(c.language_variants(cards[A], cards)["pt"])

    def test_split_adventure_and_double_faced_images(self):
        a = fixture_cards()[0]
        self.assertEqual([side for side, _ in c.images_for(a)], ["front", "back"])
        split = {**a, "layout": "split", "image_uris": {"png": "physical-card.png"}}
        self.assertEqual(c.images_for(split), [("front", {"png": "physical-card.png"})])

    def test_moxfield_text_sections_markers_and_sets(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "deck.txt"
            path.write_text("1 Fixture Leader (TEST) 1 *CMDR*\n\nDeck\n3 Fixture Token (TTEST) 2 *F*\nSideboard\n1 Extra Card\n", encoding="utf-8")
            raw, ident = c.import_text(path)
            deck = c.normalize_deck(raw, ident)
            self.assertEqual(deck["counts"], {"mainboard": 3, "commanders": 1, "sideboard": 1})
            self.assertEqual(deck["entries"][0]["finish"], "foil")
            self.assertEqual(deck["entries"][0]["requested_set"], "ttest")

    def test_png_integrity_rejects_truncation_and_bad_crc(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "card.png"
            path.write_bytes(png())
            self.assertEqual(c.validate_image(path, "png"), (1, 1))
            for body in (png()[:24], png()[:-1], b"html", png()[:-5] + b"XXXXX"):
                path.write_bytes(body)
                with self.assertRaises(c.ArchiveError):
                    c.validate_image(path, "png")

    def test_complete_pipeline_tokens_languages_shared_images_and_checksums(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            state = c.run(root, http=FakeHttp(root))
            self.assertEqual(state["status"], "complete")
            self.assertEqual(state["decks_saved"], 2)
            self.assertEqual(state["unique_gameplay_cards"], 2)
            self.assertEqual(state["images_saved"], 6)
            decks = c.read_json(root / "data" / "decks.json")
            self.assertEqual(decks[0]["entries"][0]["language_variants"]["pt"], AP)
            self.assertIn(T, decks[0]["support_printing_ids"])
            printings = c.read_json(root / "data" / "printings.json")
            self.assertIn(TP, printings)
            self.assertEqual(c.read_json(root / "data" / "rulings.json")["by_oracle_id"][OA][0]["comment"], "Synthetic ruling")
            self.assertTrue(state["scryfall_snapshot"]["jsonl_download_uri"].endswith(".jsonl.gz"))
            self.assertEqual(len(list((root / "assets" / "cards").rglob("*.png"))), 6)
            c.verify(root)
            image = root / printings[A]["local_images"][0]["path"]
            image.write_bytes(b"corruption")
            with self.assertRaises(c.ArchiveError):
                c.verify(root)

    def test_token_backlinks_never_import_other_creators_or_their_tokens(self):
        other_id, other_token_id = "other-creator", "other-token"
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            http = FakeHttp(root)
            token = next(card for card in http.cards if card["id"] == T)
            token["all_parts"] = [
                {"id": A, "name": "Fixture Front // Fixture Back", "component": "combo_piece"},
                {"id": other_id, "name": "Unrelated Creator", "component": "combo_piece"},
                {"id": T, "name": "Fixture Token", "component": "token"},
                {"id": other_token_id, "name": "Unrelated Token", "component": "token"},
            ]
            http.cards.extend([
                {**http.cards[0], "id": other_id, "oracle_id": "unrelated-oracle", "name": "Unrelated Creator", "all_parts": [{"id": other_token_id, "name": "Unrelated Token", "component": "token"}]},
                {**token, "id": other_token_id, "oracle_id": "unrelated-token-oracle", "name": "Unrelated Token", "all_parts": []},
            ])
            state = c.run(root, http=http)
            self.assertEqual(state["status"], "complete")
            self.assertEqual(set(c.read_json(root / "data/printings.json")), {A, AP, T, TP})
            for deck in c.read_json(root / "data/decks.json"):
                self.assertEqual(deck["support_printing_ids"], [T])
            c.verify(root)

    def test_source_tokens_reject_ordinary_and_deleted_digital_cards(self):
        class PollutedSource(FakeHttp):
            def json(self, url):
                result = super().json(url)
                if "/decks/all/" in url:
                    result["tokens"] = [
                        {"name": "Unrelated Creature", "scryfall_id": "other-card", "layout": "normal", "type_line": "Creature"},
                        {"name": "A-Deleted Digital Card", "scryfall_id": "deleted-digital", "layout": "normal", "type_line": "Creature"},
                        {"name": "Fixture Token", "scryfall_id": T, "layout": "token", "type_line": "Token Creature"},
                    ]
                return result
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            state = c.run(root, http=PollutedSource(root))
            self.assertEqual(state["status"], "complete")
            self.assertEqual(state["errors"], [])
            self.assertEqual(state["ignored_source_relations"], 4)
            self.assertEqual(set(c.read_json(root / "data/printings.json")), {A, AP, T, TP})
            for deck in c.read_json(root / "data/decks.json"):
                self.assertEqual(deck["declared_support_printing_ids"], [T])
                self.assertEqual(len(deck["source_tokens"]), 3)

    def test_plan_exports_data_without_downloading_images_rulings_or_symbols(self):
        class OnlyCardDatabase(FakeHttp):
            def download(self, url, *args, **kwargs):
                if "all_cards.json" not in url:
                    raise AssertionError("Plan attempted an asset download: " + url)
                return super().download(url, *args, **kwargs)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            state = c.run(root, http=OnlyCardDatabase(root), plan_only=True)
            self.assertEqual(state["status"], "planned")
            self.assertEqual(state["images_expected"], 6)
            self.assertEqual(state["images_saved"], 0)
            plan = c.read_json(root / "data/download-plan.json")
            self.assertEqual(set(plan["printings"]), {A, AP, T, TP})
            self.assertEqual(plan["printings"][AP]["reasons"][0]["base_printing_id"], A)
            self.assertTrue((root / "data/cards.json").exists())
            self.assertTrue((root / "catalogo.html").exists())
            self.assertFalse((root / "assets").exists())

    def test_scope_audit_rejects_an_unrelated_printing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            c.run(root, http=FakeHttp(root), plan_only=True)
            printings = c.read_json(root / "data/printings.json")
            printings["unrelated"] = {**printings[A], "id": "unrelated", "oracle_id": "unrelated-oracle"}
            with self.assertRaisesRegex(c.ArchiveError, "sem vínculo autorizado"):
                c.validate_scope(c.read_json(root / "data/decks.json"), printings)

    def test_token_component_cannot_download_an_ordinary_card(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            http = FakeHttp(root)
            token = next(card for card in http.cards if card["id"] == T)
            token.update(layout="normal", type_line="Creature")
            with self.assertRaisesRegex(c.ArchiveError, "token aponta para carta comum"):
                c.run(root, http=http)
            self.assertFalse((root / "assets").exists())

    def test_quarantine_preserves_extras_and_keeps_selected_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            extra = root / "assets/cards/extra/front.png"
            keep = root / f"assets/cards/{A}/front.png"
            raw = root / "raw/scryfall/extra.json"
            for path in (extra, keep, raw):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"preserve-me")
            report = c.quarantine_extras(root, {A})
            moves = c.read_json(root / report["manifest"])["moves"]
            self.assertEqual(len(moves), 2)
            self.assertEqual(keep.read_bytes(), b"preserve-me")
            self.assertFalse(extra.exists())
            for move in moves:
                moved = (root / move["to"]).resolve()
                self.assertTrue(moved.is_relative_to(root.resolve()))
                if moved.is_dir():
                    self.assertEqual((moved / "front.png").read_bytes(), b"preserve-me")
                else:
                    self.assertEqual(moved.read_bytes(), b"preserve-me")

    def test_archive_lock_prevents_concurrent_runs_and_is_released(self):
        with tempfile.TemporaryDirectory() as directory:
            with c.archive_lock(directory):
                with self.assertRaises(c.ArchiveError):
                    with c.archive_lock(directory):
                        self.fail("Second collector acquired the same archive")
            with c.archive_lock(directory):
                pass

    def test_offline_mode_reads_old_cache_and_never_opens_network(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            url = "https://api.scryfall.com/test-cached"
            path = root / ".cache/json" / (c.hashlib.sha256(url.encode()).hexdigest() + ".json")
            c.write_json(path, {"source_url": url, "retrieved_at": "synthetic-fixture", "data": {"cached": True}})
            c.os.utime(path, (0, 0))
            http = c.Http(root, offline=True)
            self.assertEqual(http.json(url), {"cached": True})
            with self.assertRaisesRegex(c.ArchiveError, "modo offline não acessa a rede"):
                http.json("https://api.scryfall.com/test-missing")

    def test_unicode_mana_symbols_cannot_overwrite_each_other(self):
        symbols = ("{∞}", "{½}", "{G}", "{W/U}", "{W-U}")
        filenames = [c.symbol_filename(symbol) for symbol in symbols]
        self.assertEqual(len(set(filenames)), len(symbols))
        self.assertTrue(all(name.endswith(".svg") and "/" not in name for name in filenames))

    def test_real_treasure_backlinks_are_metadata_not_download_targets(self):
        fixture = c.read_json(Path(__file__).parent / "fixtures/scryfall-treasure-relations.json")
        token = fixture["card"]
        self.assertEqual(token["name"], "Treasure")
        self.assertGreater(sum(p["component"] == "combo_piece" for p in token["all_parts"]), 100)
        self.assertEqual(c.forward_support_parts(token), [])

    def test_complete_pipeline_still_accepts_legacy_bulk_arrays(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            state = c.run(root, http=FakeHttp(root, bulk_format="array"))
            self.assertEqual(state["status"], "complete")
            self.assertEqual(state["images_saved"], 6)
            c.verify(root)

    def test_failed_images_cannot_produce_a_complete_archive(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            state = c.run(root, http=FakeHttp(root, damaged=True))
            self.assertEqual(state["status"], "partial")
            self.assertEqual(state["images_saved"], 0)
            with self.assertRaises(c.ArchiveError):
                c.verify(root)

    def test_blocked_connection_records_zero_downloaded_decks(self):
        class Broken(FakeHttp):
            def json(self, url):
                raise c.ArchiveError("Synthetic connection failure")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with self.assertRaises(c.ArchiveError):
                c.run(root, http=Broken(root))
            state = c.read_json(root / "manifest.json")
            self.assertEqual(state["status"], "blocked")
            self.assertEqual(state["decks_saved"], 0)
            self.assertFalse((root / "data" / "decks.json").exists())

    def test_windows_folder_names_are_safe(self):
        for value in ("../deck/..", "CON", "AUX", "nul", "a:b*c?d", "á deck"):
            safe = c.slug(value)
            self.assertNotIn("/", safe)
            self.assertNotIn(":", safe)
            self.assertNotIn("..", safe)
            self.assertNotEqual(safe.upper(), "CON")

    def test_bad_cached_file_can_be_downloaded_again(self):
        class Response(io.BytesIO):
            def __init__(self, body):
                super().__init__(body)
                self.headers = {"Content-Length": str(len(body))}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            http = c.Http(root)
            path = root / "card.png"
            url = "https://cards.scryfall.io/test/card.png"
            path.write_bytes(b"<html>blocked</html>")
            c.write_json(path.with_suffix(".png.source.json"), {"source_url": url, "retrieved_at": "synthetic-fixture", "sha256": c.digest_file(path)})
            http.open = lambda *args: Response(png())
            http.download(url, path, force=True)
            self.assertEqual(c.validate_image(path, "png"), (1, 1))

    def test_gallery_embeds_untrusted_text_without_script_injection(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            c.write_gallery(root, [{"name": "</script><script>bad()</script>"}], {}, {"status": "partial"})
            output = (root / "catalogo.html").read_text(encoding="utf-8")
            self.assertEqual(output.count("</script>"), 1)
            self.assertNotIn("<script>bad()", output)
            self.assertIn("\\u003c/script>", output)


if __name__ == "__main__":
    unittest.main()
