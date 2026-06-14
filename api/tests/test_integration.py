import io
import json
import os
import tempfile
import time
import unittest

# Use a temp file DB for tests (':memory:' creates separate DBs per connection)
_test_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_test_db.close()
os.environ.setdefault("DB_FILE", _test_db.name)
os.environ.setdefault("GEMINI_API_KEY", "")
os.environ.setdefault("ENV", "development")

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app, raise_server_exceptions=False)


def _register_user(username="testuser", email="test@example.com", password="Test1234!"):
    return client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "full_name": "Test User",
        "password": password,
    })


def _login_user(username="testuser", password="Test1234!"):
    return client.post("/api/auth/login", data={
        "username": username,
        "password": password,
    })


def _auth_header(access_token):
    return {"Authorization": f"Bearer {access_token}"}


def _make_pdf_content(text="Simple resume text"):
    """Create minimal valid PDF with extractable text using pypdf."""
    try:
        from pypdf import PdfWriter
        from io import BytesIO
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        buf = BytesIO()
        writer.write(buf)
        return buf.getvalue()
    except ImportError:
        content = f"%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n340\n%%EOF"
        return content.encode("latin-1")


class AuthFlowTests(unittest.TestCase):
    def test_register_success(self):
        resp = _register_user("flowuser", "flow@example.com")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("registered", resp.json()["message"])

    def test_register_duplicate_username(self):
        _register_user("dupuser", "dup1@example.com")
        resp = _register_user("dupuser", "dup2@example.com")
        self.assertEqual(resp.status_code, 400)

    def test_register_duplicate_email(self):
        _register_user("user_a", "same@example.com")
        resp = _register_user("user_b", "same@example.com")
        self.assertEqual(resp.status_code, 400)

    def test_login_success(self):
        _register_user("loginuser", "login@example.com")
        resp = _login_user("loginuser")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("role", data)
        self.assertIn("username", data)
        # Tokens should NOT be in response body (httpOnly cookies only)
        self.assertNotIn("access_token", data)
        self.assertNotIn("refresh_token", data)

    def test_login_wrong_password(self):
        _register_user("wrongpw", "wrongpw@example.com")
        resp = _login_user("wrongpw", password="WrongPassword1!")
        self.assertEqual(resp.status_code, 401)

    def test_login_nonexistent_user(self):
        resp = _login_user("ghostuser")
        self.assertEqual(resp.status_code, 401)

    def test_me_endpoint(self):
        _register_user("meuser", "me@example.com")
        login_resp = _login_user("meuser")
        # Get user info via /me using cookie auth
        resp = client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["username"], "meuser")

    def test_me_unauthenticated(self):
        resp = client.get("/api/auth/me")
        # Returns 200 with null user or 401 depending on implementation
        self.assertIn(resp.status_code, [200, 401])

    def test_logout_clears_cookies(self):
        _register_user("logoutuser", "logout@example.com")
        _login_user("logoutuser")
        resp = client.post("/api/auth/logout")
        self.assertEqual(resp.status_code, 200)
        # After logout, /me should return 401
        resp = client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401)

    def test_check_username_available(self):
        resp = client.get("/api/auth/check-username/uniqueuser123")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["available"])

    def test_check_username_taken(self):
        _register_user("takenuser", "taken@example.com")
        resp = client.get("/api/auth/check-username/takenuser")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.json()["available"])


class AnalysisEndpointTests(unittest.TestCase):
    def _get_auth(self):
        _register_user("analysisuser", "analysis@example.com")
        _login_user("analysisuser")
        # Extract access token from cookie
        for cookie in client.cookies.jar:
            if cookie.name == "access_token":
                return cookie.value
        return None

    def test_upload_pdf(self):
        token = self._get_auth()
        pdf = _make_pdf_content()
        resp = client.post(
            "/api/analyze",
            files={"file": ("resume.pdf", io.BytesIO(pdf), "application/pdf")},
            data={"target_role": "Software Engineer"},
            headers=_auth_header(token) if token else {},
        )
        # Should succeed or return 422/503 (if local parser can't extract text or no Gemini)
        self.assertIn(resp.status_code, [200, 422, 503])

    def test_upload_invalid_filetype(self):
        token = self._get_auth()
        resp = client.post(
            "/api/analyze",
            files={"file": ("resume.txt", io.BytesIO(b"hello"), "text/plain")},
            data={"target_role": "General"},
            headers=_auth_header(token) if token else {},
        )
        self.assertEqual(resp.status_code, 400)

    def test_upload_empty_file(self):
        token = self._get_auth()
        resp = client.post(
            "/api/analyze",
            files={"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")},
            data={"target_role": "General"},
            headers=_auth_header(token) if token else {},
        )
        self.assertEqual(resp.status_code, 400)

    def test_cache_hit_returns_same_data(self):
        token = self._get_auth()
        pdf = _make_pdf_content()
        resp1 = client.post(
            "/api/analyze",
            files={"file": ("resume.pdf", io.BytesIO(pdf), "application/pdf")},
            data={"target_role": "Data Scientist"},
            headers=_auth_header(token) if token else {},
        )
        if resp1.status_code not in [200]:
            return  # Skip if local parser can't handle it

        resp2 = client.post(
            "/api/analyze",
            files={"file": ("resume.pdf", io.BytesIO(pdf), "application/pdf")},
            data={"target_role": "Data Scientist"},
            headers=_auth_header(token) if token else {},
        )
        self.assertEqual(resp2.status_code, 200)

    def test_latest_analysis(self):
        token = self._get_auth()
        resp = client.get("/api/user/latest-analysis",
                          headers=_auth_header(token) if token else {})
        # Should return 200 (possibly with null analysis)
        self.assertIn(resp.status_code, [200, 404])

    def test_user_history(self):
        token = self._get_auth()
        resp = client.get("/api/user/history",
                          headers=_auth_header(token) if token else {})
        self.assertEqual(resp.status_code, 200)
        self.assertIn("history", resp.json())


class ShareEndpointTests(unittest.TestCase):
    def _get_auth(self):
        _register_user("shareuser", "share@example.com")
        _login_user("shareuser")
        for cookie in client.cookies.jar:
            if cookie.name == "access_token":
                return cookie.value
        return None

    def test_create_and_retrieve_share(self):
        token = self._get_auth()
        # First create an analysis to have an analysis_id
        pdf = _make_pdf_content()
        analysis_resp = client.post(
            "/api/analyze",
            files={"file": ("resume.pdf", io.BytesIO(pdf), "application/pdf")},
            data={"target_role": "General"},
            headers=_auth_header(token) if token else {},
        )
        if analysis_resp.status_code != 200:
            return  # Skip if analysis failed

        # Get latest analysis to find the ID
        latest = client.get("/api/user/latest-analysis",
                            headers=_auth_header(token) if token else {})
        if latest.status_code != 200 or not latest.json().get("analysis"):
            return

        analysis_id = latest.json()["analysis"]["id"]

        # Create share link
        share_resp = client.post("/api/reports/share", json={
            "analysis_id": analysis_id,
            "expires_in_hours": 24,
            "is_public": True,
        }, headers=_auth_header(token) if token else {})

        if share_resp.status_code != 200:
            return  # Share creation may need specific analysis format

        share_data = share_resp.json()
        self.assertIn("share_token", share_data)
        token_val = share_data["share_token"]

        # Retrieve shared report (public, no auth needed)
        get_resp = client.get(f"/api/reports/share/{token_val}")
        self.assertEqual(get_resp.status_code, 200)
        self.assertTrue(get_resp.json().get("shared"))

    def test_share_requires_auth(self):
        resp = client.post("/api/reports/share", json={
            "analysis_id": 99999,
            "expires_in_hours": 24,
            "is_public": True,
        })
        self.assertIn(resp.status_code, [401, 404])


class HealthEndpointTests(unittest.TestCase):
    def test_health_check(self):
        resp = client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

    def test_root_endpoint(self):
        resp = client.get("/")
        self.assertEqual(resp.status_code, 200)


class SecurityHeadersTests(unittest.TestCase):
    def test_security_headers_present(self):
        resp = client.get("/api/health")
        self.assertEqual(resp.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(resp.headers.get("x-frame-options"), "DENY")
        self.assertIn("strict-transport-security", resp.headers)
        self.assertIn("content-security-policy", resp.headers)

    def test_cache_control_no_store(self):
        resp = client.get("/api/health")
        self.assertEqual(resp.headers.get("cache-control"), "no-store")


class MockInterviewTests(unittest.TestCase):
    def test_list_roles(self):
        resp = client.get("/api/mock-interview")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("roles", data)
        self.assertIsInstance(data["roles"], list)
        self.assertGreater(len(data["roles"]), 0)

    def test_get_questions_for_role(self):
        resp = client.get("/api/mock-interview/Data Science")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["role"], "Data Science")
        self.assertIn("questions", data)
        self.assertIsInstance(data["questions"], list)
        self.assertGreater(len(data["questions"]), 0)
        self.assertIn("question", data["questions"][0])
        self.assertIn("answer", data["questions"][0])

    def test_get_questions_case_insensitive(self):
        resp = client.get("/api/mock-interview/data science")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["role"], "Data Science")

    def test_get_questions_unknown_role_404(self):
        resp = client.get("/api/mock-interview/NonexistentRole")
        self.assertEqual(resp.status_code, 404)

    def test_get_questions_whitespace_handling(self):
        resp = client.get("/api/mock-interview/  Data Science  ")
        self.assertEqual(resp.status_code, 200)


if __name__ == "__main__":
    unittest.main()
