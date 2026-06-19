import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Target, BookOpen, Briefcase, TrendingUp, CheckCircle, XCircle,
  Check, Star, Send, ArrowRight, UploadCloud, FileText, RefreshCw,
  Trash2, Share2, Search, Award, AlertTriangle, Lightbulb,
  Calendar, Layers, Trophy, Compass, Quote,
  Link2, Copy, Mail, Twitter, Linkedin, Clock, Lock, Globe, X,
  GraduationCap,
} from 'lucide-react';
import api from '../services/api';
import Roadmap from '../components/Roadmap';
import TrendDashboard from '../components/TrendDashboard';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: Layers },
  { id: 'skills',    label: 'Skills',    icon: Target },
  { id: 'courses',   label: 'Courses',   icon: GraduationCap },
  { id: 'matches',   label: 'Matches',   icon: Briefcase },
  { id: 'roadmap',   label: 'Roadmap',   icon: Compass },
  { id: 'market',    label: 'Market',    icon: TrendingUp },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];

const TUTORIAL_LABEL = 'Tutorial';

const relativeTime = (timestamp) => {
  if (!timestamp) return '';
  const cleaned = String(timestamp).replace(' ', 'T');
  const then = new Date(cleaned).getTime();
  if (Number.isNaN(then)) return timestamp;
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  return `${Math.floor(months / 12)} year ago`;
};

const fullDate = (timestamp) => {
  if (!timestamp) return '';
  const cleaned = String(timestamp).replace(' ', 'T');
  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) return timestamp;
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const pill = (bg, fg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 10px', borderRadius: 'var(--radius-full)',
  fontSize: 11, fontWeight: 600,
  background: bg, color: fg, lineHeight: 1,
});

const SkillsTab = ({ matched, gaps, filter, setFilter }) => {
  const filterMatch = (s) => s.toLowerCase().includes(filter.toLowerCase());
  const visibleMatched = filter ? matched.filter(filterMatch) : matched;
  const visibleGaps = filter ? gaps.filter(filterMatch) : gaps;

  return (
    <div className="analysis-skills">
      <div className="analysis-search">
        <Search size={16} color="var(--color-text-light)" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter skills..."
          aria-label="Filter skills"
        />
        {filter && (
          <button
            type="button"
            onClick={() => setFilter('')}
            className="analysis-search-clear"
            aria-label="Clear filter"
          >
            <XCircle size={14} />
          </button>
        )}
      </div>

      <div className="analysis-skills-grid">
        <div className="card analysis-skills-card">
          <div className="analysis-skills-head analysis-skills-head-match">
            <CheckCircle size={18} color="var(--color-success)" />
            <h3>Matched skills</h3>
            <span className="analysis-skills-count analysis-skills-count-match">
              {visibleMatched.length}{filter ? ` / ${matched.length}` : ''}
            </span>
          </div>
          <div className="analysis-skills-body">
            {visibleMatched.length === 0 ? (
              <p className="analysis-empty-text">
                {filter ? 'No matches for that filter.' : 'No matched skills identified yet.'}
              </p>
            ) : (
              <div className="analysis-tags">
                {visibleMatched.map((s) => (
                  <span key={s} className="analysis-tag analysis-tag-match">
                    <Check size={11} /> {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card analysis-skills-card">
          <div className="analysis-skills-head analysis-skills-head-gap">
            <XCircle size={18} color="var(--color-error)" />
            <h3>Skill gaps</h3>
            <span className="analysis-skills-count analysis-skills-count-gap">
              {visibleGaps.length}{filter ? ` / ${gaps.length}` : ''}
            </span>
          </div>
          <div className="analysis-skills-body">
            {visibleGaps.length === 0 ? (
              <p className="analysis-empty-text">
                {filter ? 'No matches for that filter.' : 'All clear - no major gaps identified.'}
              </p>
            ) : (
              <div className="analysis-tags">
                {visibleGaps.map((s) => (
                  <span key={s} className="analysis-tag analysis-tag-gap">
                    <Target size={11} /> {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PLATFORM_STYLES = {
  udemy: {
    gradient: 'linear-gradient(135deg, #a435f0, #6b21a8)',
    label: 'Udemy',
  },
  coursera: {
    gradient: 'linear-gradient(135deg, #0056d2, #1a365d)',
    label: 'Coursera',
  },
  edx: {
    gradient: 'linear-gradient(135deg, #c41230, #7f1d1d)',
    label: 'edX',
  },
  pluralsight: {
    gradient: 'linear-gradient(135deg, #e11d48, #9f1239)',
    label: 'Pluralsight',
  },
  linkedin: {
    gradient: 'linear-gradient(135deg, #0077b5, #004182)',
    label: 'LinkedIn Learning',
  },
  youtube: {
    gradient: 'linear-gradient(135deg, #ff0000, #991b1b)',
    label: 'YouTube',
  },
  default: {
    gradient: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    label: 'Course',
  },
};

const detectPlatform = (url) => {
  if (!url) return 'default';
  const lower = url.toLowerCase();
  if (lower.includes('udemy.com')) return 'udemy';
  if (lower.includes('coursera.org') || lower.includes('coursera.com')) return 'coursera';
  if (lower.includes('edx.org')) return 'edx';
  if (lower.includes('pluralsight.com')) return 'pluralsight';
  if (lower.includes('linkedin.com/learning')) return 'linkedin';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  return 'default';
};

const CoursesTab = ({ courses, recommendedSkills, targetRole }) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return (
      <div className="card analysis-empty">
        <GraduationCap size={24} color="var(--color-text-light)" />
        <h3>No courses available</h3>
        <p>Course recommendations will appear here once your resume is analyzed.</p>
      </div>
    );
  }

  return (
    <div className="card analysis-resources-card">
      <div className="analysis-card-head">
        <div className="analysis-card-icon" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>
          <GraduationCap size={18} />
        </div>
        <div>
          <h3>Recommended courses</h3>
          <p className="analysis-card-sub">
            {targetRole ? `Curated courses for ${targetRole}` : 'Curated courses to boost your skills'}
          </p>
        </div>
        <span style={pill('var(--indigo-50)', 'var(--color-primary)')}>
          {courses.length} course{courses.length === 1 ? '' : 's'}
        </span>
      </div>

      {recommendedSkills && recommendedSkills.length > 0 && (
        <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
            <Lightbulb size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
            Because you're targeting <strong>{targetRole}</strong>, focus on these skills:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {recommendedSkills.slice(0, 8).map((skill) => (
              <span key={skill} style={pill('var(--emerald-50)', 'var(--color-success)')}>
                <Check size={10} /> {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-resources-grid">
        {courses.map((course, i) => {
          const url = course.url || course.course_url;
          const platform = detectPlatform(url);
          const style = PLATFORM_STYLES[platform];
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="analysis-resource-card"
            >
              <div className="analysis-resource-thumb" style={{ background: style.gradient }}>
                <GraduationCap size={22} color="white" />
                <span style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {style.label}
                </span>
              </div>
              <div className="analysis-resource-meta">
                <span className="analysis-resource-tag">Course</span>
                <h4 className="analysis-resource-title">{course.name || course.course_name}</h4>
                <div className="analysis-resource-foot">
                  View course
                  <ArrowRight size={12} />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

const MatchesTab = ({ matches, targetRole }) => {
  if (!Array.isArray(matches) || matches.length === 0) {
    return (
      <div className="card analysis-empty">
        <Briefcase size={24} color="var(--color-text-light)" />
        <h3>No matches yet</h3>
        <p>Job matches will appear here once your resume is analyzed.</p>
      </div>
    );
  }

  return (
    <div className="card analysis-resources-card">
      <div className="analysis-card-head">
        <div className="analysis-card-icon" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>
          <Briefcase size={18} />
        </div>
        <div>
          <h3>Job matches</h3>
          <p className="analysis-card-sub">
            {targetRole ? `Roles matching your profile for ${targetRole}` : 'Roles matching your profile'}
          </p>
        </div>
        <span style={pill('var(--indigo-50)', 'var(--color-primary)')}>
          {matches.length} match{matches.length === 1 ? '' : 'es'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 20px 20px' }}>
        {matches.map((match, i) => (
          <motion.div
            key={match.job_id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              padding: '16px', borderRadius: '12px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>
                  {match.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  {match.company} • {match.location}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 8px', borderRadius: '6px',
                  background: match.fit_score >= 80 ? 'var(--emerald-50)' : match.fit_score >= 60 ? '#FEF3C7' : 'var(--color-error-light)',
                  color: match.fit_score >= 80 ? 'var(--color-success)' : match.fit_score >= 60 ? '#D97706' : 'var(--color-error)',
                  fontSize: '12px', fontWeight: 700,
                }}>
                  {match.fit_score}% fit
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span style={pill('var(--color-bg)', 'var(--color-text-muted)')}>
                {match.workplace_type}
              </span>
              {match.salary_estimate > 0 && (
                <span style={pill('var(--emerald-50)', 'var(--color-success)')}>
                  ${(match.salary_estimate / 1000).toFixed(0)}k
                </span>
              )}
            </div>

            {match.why_matched && match.why_matched.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {match.why_matched.map((reason, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <Check size={10} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    {reason}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const NextStep = ({ analysis, gaps }) => {
  if (!analysis) return null;
  const firstGap = (gaps || [])[0];
  const firstRoadmap = Array.isArray(analysis.roadmap) ? analysis.roadmap[0] : null;
  const title = firstRoadmap?.title || (firstGap ? `Learn ${firstGap}` : 'Polish your resume');
  const body = firstRoadmap?.action_items?.[0] || (firstGap
    ? `${firstGap} is the highest-impact skill to add right now - it shows up in the most roles you're targeting.`
    : 'Refine the wording of your bullets and quantify the impact of each project.');

  return (
    <div className="analysis-next-step">
      <div className="analysis-next-step-icon">
        <Lightbulb size={20} color="white" />
      </div>
      <div className="analysis-next-step-body">
        <div className="analysis-next-step-label">Recommended next step</div>
        <h4 className="analysis-next-step-title">{title}</h4>
        <p className="analysis-next-step-text">{body}</p>
      </div>
    </div>
  );
};

const OverviewTab = ({ analysis, resumeInfo, targetRole, predictedField, matchScore, scoreBreakdown, feedbackMsgs, missingSkills }) => {
  const overallImpression = feedbackMsgs[0] ||
    'Your resume shows potential but has some key areas to improve to better align with industry standards.';

  return (
    <div className="analysis-overview">
      <div className="analysis-overview-grid">
        <div className="card analysis-impression">
          <div className="analysis-card-head">
            <div className="analysis-card-icon" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>
              <Sparkles size={18} />
            </div>
            <h3>Overall impression</h3>
            <Quote size={16} color="var(--color-text-light)" style={{ marginLeft: 'auto' }} />
          </div>
          <p className="analysis-impression-text">{overallImpression}</p>
          <div className="analysis-impression-tags">
            {predictedField && (
              <span style={pill('var(--indigo-50)', 'var(--color-primary)')}>
                {predictedField}
              </span>
            )}
            <span style={pill('var(--emerald-50)', 'var(--color-success)')}>
              ATS Optimized
            </span>
            {resumeInfo?.parsing_method && (
              <span style={pill('var(--color-bg)', 'var(--color-text-muted)')}>
                {resumeInfo.parsing_method}
              </span>
            )}
            {resumeInfo?.no_of_pages != null && (
              <span style={pill('var(--color-bg)', 'var(--color-text-muted)')}>
                {resumeInfo.no_of_pages} page{resumeInfo.no_of_pages === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        <div className="card analysis-match">
          <div className="analysis-card-head">
            <div className="analysis-card-icon" style={{ background: 'var(--emerald-50)', color: 'var(--color-success)' }}>
              <Target size={18} />
            </div>
            <h3>Role match</h3>
          </div>
          <div className="analysis-match-body">
            <div className="analysis-match-ring">
              <svg viewBox="0 0 120 120" className="analysis-match-ring-svg">
                <defs>
                  <linearGradient id="matchRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#matchRingGrad)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - (matchScore ?? 0) / 100) }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="analysis-match-ring-text">
                <div className="analysis-match-ring-num">{matchScore ?? 0}<span>%</span></div>
              </div>
            </div>
            <div className="analysis-match-meta">
              <div className="analysis-match-label">
                alignment with <strong>{targetRole || 'target role'}</strong>
              </div>
              <div
                className="analysis-match-level"
                data-level={matchScore >= 75 ? 'excellent' : matchScore >= 50 ? 'good' : matchScore >= 25 ? 'fair' : 'low'}
              >
                {matchScore >= 75 ? 'Strong match' : matchScore >= 50 ? 'Good match' : matchScore >= 25 ? 'Partial match' : 'Low match'}
              </div>
              <p className="analysis-match-hint">
                {matchScore >= 75
                  ? 'You already cover most of what this role asks for.'
                  : matchScore >= 50
                  ? 'You are on the right track - a few targeted skills will close the gap.'
                  : 'There are meaningful gaps. Follow the roadmap to build them up.'}
              </p>
            </div>
          </div>
        </div>

        {scoreBreakdown && Object.keys(scoreBreakdown).length > 0 && (
          <div className="card analysis-breakdown">
            <div className="analysis-card-head">
              <div className="analysis-card-icon" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>
                <Award size={18} />
              </div>
              <h3>Score breakdown</h3>
            </div>
            <div className="analysis-breakdown-list">
              {Object.entries(scoreBreakdown).map(([key, val]) => {
                const present = val.status === 'present';
                const score = val.score ?? 0;
                return (
                  <div key={key} className="analysis-breakdown-row">
                    <div className="analysis-breakdown-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                        className="analysis-breakdown-fill"
                        style={{
                          background: present
                            ? 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
                            : 'linear-gradient(90deg, var(--color-error), #F87171)',
                        }}
                      />
                    </div>
                    <div className="analysis-breakdown-meta">
                      <span className="analysis-breakdown-label">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="analysis-breakdown-score">{score}</span>
                    </div>
                    <span
                      className={`analysis-breakdown-pill analysis-breakdown-pill-${present ? 'ok' : 'miss'}`}
                    >
                      {present ? 'Optimal' : 'Missing'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <NextStep analysis={analysis} gaps={missingSkills} />
      </div>
    </div>
  );
};

const RoadmapTab = ({ roadmap, analysisId }) => {
  if (!Array.isArray(roadmap) || roadmap.length === 0) {
    return (
      <div className="card analysis-empty">
        <BookOpen size={24} color="var(--color-text-light)" />
        <h3>No roadmap generated</h3>
        <p>This analysis did not include a learning roadmap.</p>
      </div>
    );
  }
  return (
    <div className="card analysis-roadmap-card">
      <div className="analysis-card-head">
        <div className="analysis-card-icon" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>
          <Briefcase size={18} />
        </div>
        <div>
          <h3>AI career roadmap</h3>
          <p className="analysis-card-sub">A step-by-step plan to close your skill gaps.</p>
        </div>
      </div>
      <Roadmap path={roadmap} analysisId={analysisId} />
    </div>
  );
};

const MarketTab = ({ trends, targetRole }) => {
  if (!trends || (!trends.growth && !trends.top_skills && !trends.remote_vs_onsite && !trends.regional_distribution)) {
    return (
      <div className="card analysis-empty">
        <TrendingUp size={24} color="var(--color-text-light)" />
        <h3>No market data</h3>
        <p>Market trends for {targetRole || 'this role'} are not available right now.</p>
      </div>
    );
  }
  return (
    <div className="card analysis-market-card">
      <div className="analysis-card-head">
        <div className="analysis-card-icon" style={{ background: 'var(--emerald-50)', color: 'var(--color-success)' }}>
          <TrendingUp size={18} />
        </div>
        <div>
          <h3>Market trends{targetRole ? ` for ${targetRole}` : ''}</h3>
          <p className="analysis-card-sub">Demand, pay, and work-environment data.</p>
        </div>
      </div>
      <TrendDashboard trends={trends} />
    </div>
  );
};

const ResourcesTab = ({ tutorials }) => {
  if (!Array.isArray(tutorials) || tutorials.length === 0) {
    return (
      <div className="card analysis-empty">
        <BookOpen size={24} color="var(--color-text-light)" />
        <h3>No resources yet</h3>
        <p>Once you identify skill gaps, we'll surface tutorials to close them.</p>
      </div>
    );
  }
  return (
    <div className="card analysis-resources-card">
      <div className="analysis-card-head">
        <div className="analysis-card-icon" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>
          <BookOpen size={18} />
        </div>
        <div>
          <h3>Learning resources</h3>
          <p className="analysis-card-sub">Curated tutorials to close your skill gaps.</p>
        </div>
        <span style={pill('var(--indigo-50)', 'var(--color-primary)')}>
          {tutorials.length} tutorial{tutorials.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="analysis-resources-grid">
        {tutorials.slice(0, 9).map((video, i) => {
          const platform = detectPlatform(video.url);
          const style = PLATFORM_STYLES[platform];
          return (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="analysis-resource-card"
            >
              <div className="analysis-resource-thumb" style={{ background: style.gradient }}>
                <PlayCircle size={22} color="white" />
                <span style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {style.label}
                </span>
              </div>
              <div className="analysis-resource-meta">
                <span className="analysis-resource-tag">{TUTORIAL_LABEL}</span>
                <h4 className="analysis-resource-title">{video.title}</h4>
                <div className="analysis-resource-foot">
                  Watch on {style.label}
                  <ArrowRight size={12} />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

const PlayCircle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const FeedbackCard = ({ resumeInfo, onSent }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData(e.target);
      await api.post('/api/feedback', {
        name: resumeInfo?.name || 'Anonymous',
        email: resumeInfo?.email || 'N/A',
        score: rating.toString(),
        comments: fd.get('comments') || '',
      });
      setSent(true);
      onSent?.();
    } catch (_err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analysis-feedback">
      {!sent ? (
        <>
          <div className="analysis-feedback-header">
            <h3>How useful was this analysis?</h3>
            <p>Your feedback helps us improve the AI for everyone.</p>
          </div>
          <div className="analysis-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${star} out of 5`}
                className="analysis-star-btn"
              >
                <Star
                  size={28}
                  fill={(hover || rating) >= star ? 'var(--color-primary)' : 'transparent'}
                  color={(hover || rating) >= star ? 'var(--color-primary)' : 'var(--color-border)'}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="analysis-rating-label">
              {rating === 1 && 'Not useful'}
              {rating === 2 && 'Slightly useful'}
              {rating === 3 && 'Moderately useful'}
              {rating === 4 && 'Very useful'}
              {rating === 5 && 'Extremely useful'}
            </div>
          )}
          <form onSubmit={handleSubmit} className="analysis-feedback-form">
            {error && (
              <div style={{
                padding: '8px 12px', marginBottom: '12px',
                background: 'var(--color-error-light)', color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 'var(--font-semibold)',
              }}>
                {error}
              </div>
            )}
            <textarea
              name="comments"
              placeholder="Any suggestions to improve the analysis?"
              className="analysis-feedback-input"
            />
            <button type="submit" disabled={loading || !rating} className="analysis-feedback-submit">
              {loading ? (
                <><span className="analysis-spinner" /> Sending...</>
              ) : (
                <><Send size={15} /> Submit feedback</>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="analysis-feedback-sent">
          <div className="analysis-feedback-sent-icon">
            <Check size={28} color="white" />
          </div>
          <h3>Thanks for the feedback!</h3>
          <p>It helps us improve the AI for everyone.</p>
        </div>
      )}
    </div>
  );
};

const Skeleton = () => (
  <div className="analysis-skeleton">
    <div className="analysis-skeleton-line analysis-skeleton-line-lg" />
    <div className="analysis-skeleton-hero">
      <div className="analysis-skeleton-circle" />
      <div className="analysis-skeleton-stack">
        <div className="analysis-skeleton-line analysis-skeleton-line-md" />
        <div className="analysis-skeleton-line analysis-skeleton-line-sm" />
      </div>
    </div>
    <div className="analysis-skeleton-grid">
      <div className="analysis-skeleton-card" />
      <div className="analysis-skeleton-card" />
      <div className="analysis-skeleton-card analysis-skeleton-card-wide" />
    </div>
  </div>
);

const EmptyState = ({ onUpload }) => (
  <motion.div
    initial="hidden" animate="visible" variants={stagger}
    className="analysis-empty-state"
  >
    <motion.div variants={fadeUp} className="analysis-empty-state-icon">
      <FileText size={32} color="var(--color-primary)" />
    </motion.div>
    <motion.h2 variants={fadeUp} className="analysis-empty-state-title">
      No analysis yet
    </motion.h2>
    <motion.p variants={fadeUp} className="analysis-empty-state-text">
      Upload your resume to get a personalized match score, skill gap analysis, and learning roadmap.
    </motion.p>
    <motion.button
      variants={fadeUp}
      onClick={onUpload}
      className="btn btn-primary"
      style={{ minHeight: '48px', padding: '12px 24px', fontSize: '15px' }}
    >
      <UploadCloud size={16} /> Upload a resume
      <ArrowRight size={16} />
    </motion.button>
  </motion.div>
);

const EXPIRY_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 7 * 24 },
  { label: '30 days', hours: 30 * 24 },
];

const ShareModal = ({ analysisId, targetRole, resumeName, onClose }) => {
  const [expiry, setExpiry] = useState(7 * 24);
  const [isPublic, setIsPublic] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const copiedTimer = useRef(null);

  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); }, []);

  const createLink = useCallback(async () => {
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/api/reports/share', {
        analysis_id: analysisId,
        expires_in_hours: expiry,
        is_public: isPublic,
      }, { _skipAuthRedirect: true });
      const token = res.data?.share_token;
      if (token) {
        const base = window.location.origin;
        setShareUrl(`${base}/shared/${token}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create share link.');
    } finally {
      setCreating(false);
    }
  }, [analysisId, expiry, isPublic]);

  const copyLink = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [shareUrl]);

  const shareText = `Check out my career analysis${targetRole ? ` for ${targetRole}` : ''}`;

  const socialLinks = shareUrl ? [
    { icon: Linkedin, label: 'LinkedIn', color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { icon: Twitter, label: 'Twitter', color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { icon: Mail, label: 'Email', color: 'var(--color-text-secondary)', url: `mailto:?subject=${encodeURIComponent(`Career Analysis${targetRole ? ` - ${targetRole}` : ''}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}` },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="share-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Share Analysis"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-modal-header">
          <div>
            <h3 className="share-modal-title">
              <Share2 size={18} /> Share Analysis
            </h3>
            <p className="share-modal-subtitle">
              {resumeName || 'Your career analysis'}
            </p>
          </div>
          <button onClick={onClose} className="share-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="share-modal-body">
          {/* Expiry selector */}
          <div className="share-section">
            <label className="share-label">
              <Clock size={14} /> Link expires in
            </label>
            <div className="share-expiry-grid">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  onClick={() => setExpiry(opt.hours)}
                  className={`share-expiry-btn ${expiry === opt.hours ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="share-section">
            <label className="share-label">
              {isPublic ? <Globe size={14} /> : <Lock size={14} />}
              Visibility
            </label>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`share-toggle ${isPublic ? 'public' : 'private'}`}
            >
              <span className="share-toggle-track">
                <span className="share-toggle-thumb" />
              </span>
              <span>{isPublic ? 'Anyone with the link can view' : 'Only you can view'}</span>
            </button>
          </div>

          {/* Generate button */}
          {!shareUrl && (
            <button
              onClick={createLink}
              disabled={creating}
              className="share-generate-btn"
            >
              {creating ? 'Generating link...' : 'Generate Share Link'}
            </button>
          )}

          {error && <div className="share-error">{error}</div>}

          {/* Link display + copy */}
          {shareUrl && (
            <div className="share-link-box">
              <div className="share-link-url">
                <Link2 size={14} />
                <input
                  readOnly
                  value={shareUrl}
                  className="share-link-input"
                  onClick={(e) => e.target.select()}
                />
              </div>
              <button onClick={copyLink} className="share-copy-btn">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          )}

          {/* Social share */}
          {shareUrl && (
            <div className="share-section">
              <label className="share-label">Share on</label>
              <div className="share-social-row">
                {socialLinks.map((social) => {
                  const SocialIcon = social.icon;
                  return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-social-btn"
                    style={{ '--social-color': social.color }}
                    title={`Share on ${social.label}`}
                  >
                    <SocialIcon size={16} />
                    <span>{social.label}</span>
                  </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
const AnalysisResult = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [skillFilter, setSkillFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(
        `/api/user/latest-analysis?_t=${Date.now()}`,
        { _skipAuthRedirect: true }
      );
      if (res.data?.found) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/', { replace: true });
        return;
      }
      setError('Could not load your analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadAnalysis(); }, [loadAnalysis]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') loadAnalysis(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadAnalysis]);

  const analysis = data?.analysis;
  const resumeInfo = analysis?.data || {};
  const targetRole = analysis?.target_role || data?.target_role;
  const predictedField = analysis?.predicted_field || data?.predicted_field;
  const matchScore = analysis?.match_score;
  const resumeScore = analysis?.resume_score ?? data?.resume_score ?? 0;
  const missingSkills = Array.isArray(analysis?.missing_skill_names) ? analysis.missing_skill_names : [];
  const matchedSkills = Array.isArray(resumeInfo?.skills) ? resumeInfo.skills : [];
  const feedbackMsgs = Array.isArray(analysis?.feedback) ? analysis.feedback : [];
  const tutorials = Array.isArray(analysis?.videos?.tutorials) ? analysis.videos.tutorials : [];
  const roadmap = analysis?.roadmap;
  const trends = analysis?.trends;
  const scoreBreakdown = analysis?.score_breakdown;
  const courses = Array.isArray(analysis?.recommended_courses) ? analysis.recommended_courses : [];
  const recommendedSkills = Array.isArray(analysis?.recommended_skills) ? analysis.recommended_skills : [];
  const jobMatches = Array.isArray(analysis?.job_matches) ? analysis.job_matches : [];

  const handleDelete = async () => {
    if (!data?.id) return;
    setDeleting(true);
    try {
      await api.delete(`/api/user/analysis/${data.id}`, { _skipAuthRedirect: true });
      setData(null);
      setDeleteConfirm(false);
    } catch (_err) {
      setError('Could not delete the analysis. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="analysis-page">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-page">
        <div className="card analysis-error">
          <AlertTriangle size={20} color="var(--color-error)" />
          <p>{error}</p>
          <button onClick={loadAnalysis} className="btn btn-secondary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analysis-page">
        <EmptyState onUpload={() => navigate('/app')} />
      </div>
    );
  }

  const analyzedLabel = relativeTime(data.timestamp);
  const analyzedFull = fullDate(data.timestamp);

  return (
    <div className="analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <div>
          <div className="analysis-eyebrow">
            <Sparkles size={12} />
            Your career analysis
          </div>
          <h1 className="analysis-title">Career Analysis</h1>
          <div className="analysis-meta">
            <span className="analysis-meta-item">
              <Calendar size={13} />
              <span title={analyzedFull}>Analyzed {analyzedLabel}</span>
            </span>
            {data.pdf_name && (
              <span className="analysis-meta-item">
                <FileText size={13} />
                <span>{data.pdf_name}</span>
              </span>
            )}
            {predictedField && (
              <span className="analysis-meta-item">
                <Trophy size={13} />
                <span>{predictedField}</span>
              </span>
            )}
          </div>
        </div>
        <div className="analysis-actions">
          <button
            onClick={() => navigate('/app')}
            className="btn btn-primary analysis-cta"
          >
            <RefreshCw size={14} /> Re-analyze
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="analysis-icon-btn"
            aria-label="Share this analysis"
            title="Share"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="analysis-icon-btn analysis-icon-btn-danger"
            aria-label="Delete this analysis"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <motion.div
        initial="hidden" animate="visible" variants={stagger}
        className="analysis-hero"
      >
        <div className="analysis-hero-grid" />
        <motion.div variants={fadeUp} className="analysis-hero-score">
          <div className="analysis-hero-score-ring">
            <div className="analysis-hero-score-ring-track" />
            <div
              className="analysis-hero-score-ring-fill"
              style={{ '--p': `${Math.max(0, Math.min(100, resumeScore))}%` }}
            />
            <div className="analysis-hero-score-inner">
              <div className="analysis-hero-score-num">{Math.round(resumeScore)}</div>
              <div className="analysis-hero-score-denom">/ 100</div>
            </div>
          </div>
          <div className="analysis-hero-score-label">Resume score</div>
          <div
            className="analysis-hero-score-level"
            data-level={resumeScore >= 80 ? 'excellent' : resumeScore >= 60 ? 'good' : resumeScore >= 40 ? 'fair' : 'low'}
          >
            <Trophy size={11} />
            {resumeScore >= 80 ? 'Excellent' : resumeScore >= 60 ? 'Strong' : resumeScore >= 40 ? 'Getting there' : 'Needs work'}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="analysis-hero-info">
          {resumeInfo?.name && (
            <div className="analysis-hero-identity">
              <div className="analysis-hero-avatar" aria-hidden="true">
                {resumeInfo.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'}
              </div>
              <div className="analysis-hero-identity-text">
                <div className="analysis-hero-name">{resumeInfo.name}</div>
                {resumeInfo.email && <div className="analysis-hero-email">{resumeInfo.email}</div>}
              </div>
            </div>
          )}

          <div className="analysis-hero-label">Target role</div>
          <h2 className="analysis-hero-role">
            {targetRole || predictedField || 'Your target role'}
          </h2>

          {predictedField && (
            <div className="analysis-hero-field-pill">
              <Sparkles size={12} /> {predictedField}
            </div>
          )}

          <div className="analysis-hero-stats">
            <div className="analysis-hero-stat" data-tone="success">
              <div className="analysis-hero-stat-icon"><CheckCircle size={16} /></div>
              <div className="analysis-hero-stat-body">
                <div className="analysis-hero-stat-value">{matchedSkills.length}</div>
                <div className="analysis-hero-stat-label">Matched skills</div>
              </div>
            </div>
            <div className="analysis-hero-stat" data-tone={missingSkills.length > 0 ? 'danger' : 'success'}>
              <div className="analysis-hero-stat-icon"><Target size={16} /></div>
              <div className="analysis-hero-stat-body">
                <div className="analysis-hero-stat-value">{missingSkills.length}</div>
                <div className="analysis-hero-stat-label">Skill gaps</div>
              </div>
            </div>
            <div className="analysis-hero-stat" data-tone="primary">
              <div className="analysis-hero-stat-icon"><Briefcase size={16} /></div>
              <div className="analysis-hero-stat-body">
                <div className="analysis-hero-stat-value">{Array.isArray(roadmap) ? roadmap.length : 0}</div>
                <div className="analysis-hero-stat-label">Roadmap steps</div>
              </div>
            </div>
            <div className="analysis-hero-stat" data-tone={matchScore >= 70 ? 'success' : matchScore >= 40 ? 'warning' : 'danger'}>
              <div className="analysis-hero-stat-icon"><TrendingUp size={16} /></div>
              <div className="analysis-hero-stat-body">
                <div className="analysis-hero-stat-value">{matchScore ?? 0}<span className="analysis-hero-stat-pct">%</span></div>
                <div className="analysis-hero-stat-label">Role match</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="analysis-tabs" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className={`analysis-tab ${active ? 'analysis-tab-active' : ''}`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {active && (
                <motion.div
                  layoutId="analysis-tab-underline"
                  className="analysis-tab-underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="analysis-tab-panel"
        >
          {activeTab === 'overview' && (
            <OverviewTab
              analysis={analysis}
              resumeInfo={resumeInfo}
              targetRole={targetRole}
              predictedField={predictedField}
              matchScore={matchScore}
              scoreBreakdown={scoreBreakdown}
              feedbackMsgs={feedbackMsgs}
              missingSkills={missingSkills}
            />
          )}
          {activeTab === 'skills' && (
            <SkillsTab
              matched={matchedSkills}
              gaps={missingSkills}
              filter={skillFilter}
              setFilter={setSkillFilter}
            />
          )}
          {activeTab === 'courses' && (
            <CoursesTab
              courses={courses}
              recommendedSkills={recommendedSkills}
              targetRole={targetRole}
            />
          )}
          {activeTab === 'matches' && (
            <MatchesTab
              matches={jobMatches}
              targetRole={targetRole}
            />
          )}
          {activeTab === 'roadmap' && <RoadmapTab roadmap={roadmap} analysisId={data?.id} />}
          {activeTab === 'market' && <MarketTab trends={trends} targetRole={targetRole} />}
          {activeTab === 'resources' && <ResourcesTab tutorials={tutorials} />}
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <FeedbackCard resumeInfo={resumeInfo} />

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="analysis-modal-backdrop"
            onClick={() => !deleting && setDeleteConfirm(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-analysis-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="analysis-modal"
            >
              <div className="analysis-modal-icon analysis-modal-icon-danger">
                <Trash2 size={20} color="white" />
              </div>
              <h3 id="delete-analysis-title" className="analysis-modal-title">
                Delete this analysis?
              </h3>
              <p className="analysis-modal-text">
                This will remove the current analysis from your account. Your other historical analyses are kept.
              </p>
              <div className="analysis-modal-actions">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="btn btn-secondary"
                  style={{ minHeight: '40px', flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="analysis-modal-danger"
                >
                  {deleting ? (
                    <><span className="analysis-spinner" /> Deleting...</>
                  ) : (
                    <><Trash2 size={14} /> Delete</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShare && (
          <ShareModal
            analysisId={data?.id}
            targetRole={targetRole}
            resumeName={resumeInfo?.name || data?.filename}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalysisResult;
