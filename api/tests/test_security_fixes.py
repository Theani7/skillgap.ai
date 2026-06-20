"""Tests for audit security fixes."""
import pytest
from api.database import _ensure_column, ALLOWED_TABLES
from api.routes.analysis import _detect_filetype
from api.security import get_password_hash, verify_password


class TestEnsureColumnWhitelist:
    def test_allowed_table_passes(self):
        """Tables in whitelist should not raise when calling _ensure_column."""
        import sqlite3
        conn = sqlite3.connect(":memory:")
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY)")
        _ensure_column(cursor, "users", "new_col", "TEXT", "'some_default'")
        conn.close()

    def test_unknown_table_raises(self):
        """Unknown table should raise ValueError."""
        import sqlite3
        conn = sqlite3.connect(":memory:")
        cursor = conn.cursor()
        with pytest.raises(ValueError, match="not in the allowed tables whitelist"):
            _ensure_column(cursor, "malicious_table", "col", "TEXT")
        conn.close()


class TestFileTypeDetection:
    def test_pdf_magic_bytes(self):
        assert _detect_filetype(b"%PDF-1.4 fake content", "test.pdf") == "pdf"

    def test_docx_magic_bytes(self):
        assert _detect_filetype(b"PK\x03\x04 fake content", "test.docx") == "docx"

    def test_extension_fallback_removed(self):
        """Extension alone should not determine file type."""
        assert _detect_filetype(b"not a pdf", "test.pdf") is None
        assert _detect_filetype(b"not a docx", "test.docx") is None

    def test_empty_content(self):
        assert _detect_filetype(b"", "test.pdf") is None


class TestPasswordHashing:
    def test_long_password_warning(self, caplog):
        """Passwords over 72 bytes should trigger a warning."""
        import logging
        with caplog.at_level(logging.WARNING):
            get_password_hash("a" * 100)
        assert "exceeds 72 bytes" in caplog.text

    def test_normal_password_no_warning(self, caplog):
        """Normal passwords should not trigger warnings."""
        import logging
        with caplog.at_level(logging.WARNING):
            get_password_hash("normalpassword")
        assert "exceeds 72 bytes" not in caplog.text

    def test_password_verify_works(self):
        password = "test_password_123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed)
        assert not verify_password("wrong_password", hashed)
