import unittest
from datetime import timedelta

from api.auth import create_access_token, create_refresh_token, decode_token
from api.career_services import (
    compute_resume_score_breakdown,
    generate_interview_questions,
    generate_job_matches,
    rank_candidates,
)
from api.job_hunt_services import compare_resume_to_jd, recommend_projects, get_translations


class FeatureTests(unittest.TestCase):
    def test_explainable_scoring(self):
        resume_data = {
            "summary": "Backend engineer",
            "education": ["B.Tech CSE"],
            "experience": ["Built APIs"],
            "skills": ["Python", "FastAPI"],
            "interests": ["Open source"],
        }
        score, feedback, breakdown = compute_resume_score_breakdown(resume_data)
        self.assertEqual(score, 95)
        self.assertEqual(len(feedback), 0)
        self.assertEqual(breakdown["skills"]["status"], "present")
        self.assertTrue(breakdown["skills"]["evidence"])

    def test_job_match_generation(self):
        jobs = generate_job_matches("Data Science", ["Python"], ["Deep Learning"])
        self.assertTrue(len(jobs) > 0)
        self.assertIn("fit_score", jobs[0])
        self.assertIn("title", jobs[0])

    def test_interview_questions(self):
        questions = generate_interview_questions("DevOps", ["Kubernetes"], ["Linux"])
        self.assertTrue(len(questions) >= 4)
        self.assertIn("question", questions[0])

    def test_candidate_ranking(self):
        ranked = rank_candidates(
            [
                {"id": 1, "analysis_data": {"resume_score": 80, "match_score": 70, "missing_skills": ["A"]}},
                {"id": 2, "analysis_data": {"resume_score": 60, "match_score": 55, "missing_skills": ["A", "B", "C"]}},
            ],
            "Web Development",
        )
        self.assertEqual(ranked[0]["candidate_id"], 1)
        self.assertGreater(ranked[0]["final_rank_score"], ranked[1]["final_rank_score"])

    def test_refresh_token_type(self):
        access = create_access_token({"sub": "u", "role": "user"}, timedelta(minutes=1))
        refresh = create_refresh_token({"sub": "u", "role": "user"}, timedelta(minutes=1))
        self.assertEqual(decode_token(access)["type"], "access")
        self.assertEqual(decode_token(refresh)["type"], "refresh")

    def test_jd_compare(self):
        result = compare_resume_to_jd(["python", "sql", "docker"], "Need Python SQL AWS communication")
        self.assertIn("coverage_score", result)
        self.assertIn("python", result["matched_keywords"])

    def test_project_recommendations(self):
        recs = recommend_projects("Data Science", ["ML", "NLP"])
        self.assertTrue(len(recs) >= 2)
        self.assertIn("title", recs[0])

    def test_i18n(self):
        tr = get_translations("es")
        self.assertIn("analysis_complete", tr)


if __name__ == "__main__":
    unittest.main()
