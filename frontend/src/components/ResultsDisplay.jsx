import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, PlayCircle, Star, Send, Target, Award, BookOpen,
  TrendingUp, Share2, Check, CheckCircle, XCircle, Briefcase, DollarSign,
} from 'lucide-react';
import api from '../services/api';
import Roadmap from './Roadmap';
import TrendDashboard from './TrendDashboard';
import AnimatedScore from './AnimatedScore';

const badge = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 10px',
  borderRadius: 'var(--radius-full)',
  fontSize: '11px',
  fontWeight: 'var(--font-semibold)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  background: color.bg,
  color: color.fg,
});

const ResultsDisplay = ({ data, onReset }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  if (!data) return null;
  const {
    data: resumeInfo,
    target_role,
    predicted_field,
    match_score,
    missing_skill_names,
    resume_score,
    feedback,
    videos,
    roadmap,
    trends,
    score_breakdown,
  } = data;

  const missingSkills = Array.isArray(missing_skill_names) ? missing_skill_names : [];
  const matchedSkills = Array.isArray(resumeInfo?.skills) ? resumeInfo.skills : [];
  const feedbackMsgs = Array.isArray(feedback) ? feedback : [];
  const tutorials = Array.isArray(videos?.tutorials) ? videos.tutorials : [];

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setLoading(true);
    try {
      const res = await api.post('/api/feedback', {
        name: resumeInfo?.name || 'Anonymous',
        email: resumeInfo?.email || 'N/A',
        score: rating.toString(),
        comments: fd.get('comments') || '',
      });
      if (res.status === 200 || res.status === 201) setFeedbackSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 16px 80px',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '32px',
      }}>
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            transition: 'background 150ms ease, color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg)';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <ArrowLeft size={16} /> New Analysis
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: 'var(--radius-full)',
          fontSize: '12px', fontWeight: 'var(--font-semibold)',
          color: 'var(--color-primary)', background: 'var(--indigo-50)',
          border: '1px solid var(--indigo-100)',
        }}>
          <Target size={12} />
          Target: {target_role || 'General'}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 'var(--font-extrabold)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--color-text)',
          marginBottom: '8px',
        }}>
          Your Career Analysis
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}>
          Here's how your resume stacks up for{' '}
          <strong style={{ color: 'var(--color-text)' }}>{target_role || 'your target role'}</strong>
        </p>
      </div>

      <div className="card" style={{ padding: '40px 24px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
          gap: '40px',
        }}>
          <div>
            <AnimatedScore score={resume_score} />
            <p style={{
              textAlign: 'center', marginTop: '12px',
              fontSize: '11px', fontWeight: 'var(--font-bold)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}>
              Resume Score
            </p>
          </div>
          <div style={{ flex: '1 1 280px', maxWidth: '420px' }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)', marginBottom: '10px',
            }}>
              Overall Impression
            </h2>
            <p style={{
              fontSize: '14px', color: 'var(--color-text-muted)',
              lineHeight: 1.6, margin: 0,
            }}>
              {feedbackMsgs[0] ||
                'Your resume shows potential but has some key areas to improve to better align with industry standards.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
              {predicted_field && (
                <span style={badge({ bg: 'var(--indigo-50)', fg: 'var(--color-primary)' })}>
                  {predicted_field}
                </span>
              )}
              <span style={badge({ bg: 'var(--emerald-50)', fg: 'var(--color-success)' })}>
                ATS Optimized
              </span>
              {resumeInfo?.parsing_method && (
                <span style={badge({ bg: 'var(--color-bg)', fg: 'var(--color-text-muted)' })}>
                  {resumeInfo.parsing_method}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px', marginBottom: '20px',
      }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '16px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', marginBottom: '20px',
          }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'var(--indigo-50)', color: 'var(--color-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Target size={16} />
            </span>
            Target Matching
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>
                Role Alignment
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>
                {match_score ?? 0}%
              </span>
            </div>
            <div style={{
              height: '8px', width: '100%', borderRadius: 'var(--radius-full)',
              background: 'var(--color-border)', overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${match_score ?? 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'var(--color-primary)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
          </div>
          <p style={{
            fontSize: '12px', color: 'var(--color-text-muted)',
            fontStyle: 'italic', margin: 0, lineHeight: 1.5,
          }}>
            "{target_role}" requires specific competencies mapped against your profile.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '16px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', marginBottom: '20px',
          }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'var(--emerald-50)', color: 'var(--color-success)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DollarSign size={16} />
            </span>
            Market Insights
          </h3>
          {trends && (trends.growth || trends.top_skills) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Avg. Salary
                </span>
                <span style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>
                  {trends.top_skills?.[0]
                    ? `$${Math.round((trends.top_skills[0].salary || 115000) / 1000)}k+`
                    : '$115k+'}
                </span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Demand Trend
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'var(--font-bold)', color: 'var(--color-success)' }}>
                  {trends.growth?.length
                    ? `+${trends.growth[trends.growth.length - 1].demand - trends.growth[0].demand}%`
                    : '+35%'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)',
                textAlign: 'center', margin: '4px 0 0' }}>
                Based on real-time market data.
              </p>
            </div>
          ) : (
            <p style={{
              textAlign: 'center', padding: '24px 0',
              color: 'var(--color-text-muted)', fontStyle: 'italic',
              fontSize: '14px', margin: 0,
            }}>
              Loading market trends...
            </p>
          )}
        </div>
      </div>

      {score_breakdown && Object.keys(score_breakdown).length > 0 && (
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '16px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', marginBottom: '20px',
          }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'var(--indigo-50)', color: 'var(--color-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Award size={16} />
            </span>
            Technical Score Breakdown
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {Object.entries(score_breakdown).map(([key, val]) => {
              const present = val.status === 'present';
              return (
                <div key={key} style={{
                  textAlign: 'center', padding: '16px 12px',
                  background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    fontSize: '24px', fontWeight: 'var(--font-extrabold)',
                    color: 'var(--color-primary)', marginBottom: '4px',
                  }}>
                    {val.score ?? 0}
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: 'var(--font-semibold)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: 'var(--color-text-muted)', marginBottom: '10px',
                  }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <span style={badge(present
                    ? { bg: 'var(--emerald-50)', fg: 'var(--color-success)' }
                    : { bg: 'var(--color-error-light)', fg: 'var(--color-error)' }
                  )}>
                    {present ? 'Optimal' : 'Missing'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px', marginBottom: '20px',
      }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '15px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-success)', marginBottom: '16px',
          }}>
            <CheckCircle size={16} />
            Matched Skills ({matchedSkills.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchedSkills.length > 0 ? (
              matchedSkills.slice(0, 30).map((skill, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--emerald-50)', color: 'var(--color-success)',
                  fontSize: '12px', fontWeight: 'var(--font-semibold)',
                  border: '1px solid #A7F3D0',
                }}>
                  <Check size={11} /> {skill}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                No skills identified yet.
              </span>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '15px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-error)', marginBottom: '16px',
          }}>
            <XCircle size={16} />
            Missing Competencies ({missingSkills.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missingSkills.length > 0 ? (
              missingSkills.slice(0, 20).map((skill, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-error-light)', color: 'var(--color-error)',
                  fontSize: '12px', fontWeight: 'var(--font-semibold)',
                  border: '1px solid #FECACA',
                }}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '14px' }}>
                All clear! No major gaps identified.
              </span>
            )}
          </div>
        </div>
      </div>

      {trends && (trends.growth || trends.top_skills) && (
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '16px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', marginBottom: '20px',
          }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'var(--emerald-50)', color: 'var(--color-success)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={16} />
            </span>
            Market Trends for {target_role}
          </h3>
          <TrendDashboard trends={trends} targetRole={target_role} />
        </div>
      )}

      {Array.isArray(roadmap) && roadmap.length > 0 && (
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '16px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', marginBottom: '4px',
          }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'var(--indigo-50)', color: 'var(--color-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={16} />
            </span>
            AI Career Roadmap
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            A personalized learning path to close your skill gaps.
          </p>
          <Roadmap path={roadmap} />
        </div>
      )}

      {tutorials.length > 0 && (
        <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
          }}>
            <div>
              <h3 style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '16px', fontWeight: 'var(--font-bold)',
                color: 'var(--color-text)', marginBottom: '4px',
              }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                  background: 'var(--indigo-50)', color: 'var(--color-primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BookOpen size={16} />
                </span>
                Learning Resources
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Curated tutorials to close your skill gaps.
              </p>
            </div>
            <span style={badge({ bg: 'var(--indigo-50)', fg: 'var(--color-primary)' })}>
              {tutorials.length} tutorials
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}>
            {tutorials.slice(0, 6).map((video, i) => (
              <a
                key={i}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  padding: '16px', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  transition: 'border-color 150ms ease, transform 150ms ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '10px',
                  }}>
                    <span style={badge({ bg: 'var(--indigo-50)', fg: 'var(--color-primary)' })}>
                      Tutorial
                    </span>
                    <PlayCircle size={16} color="var(--color-text-muted)" />
                  </div>
                  <h4 style={{
                    fontSize: '13px', fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text)', marginBottom: '6px', lineHeight: 1.4,
                  }}>
                    {video.title}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Watch on YouTube
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {feedbackMsgs.length > 1 && (
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '16px', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', marginBottom: '16px',
          }}>
            <span style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              background: 'var(--indigo-50)', color: 'var(--color-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={16} />
            </span>
            Actionable Feedback
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {feedbackMsgs.map((msg, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
                fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.5,
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--color-primary)', marginTop: '7px', flexShrink: 0,
                }} />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        borderRadius: 'var(--radius-xl)',
        padding: '40px 24px',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        {!feedbackSent ? (
          <>
            <h3 style={{ fontSize: '20px', fontWeight: 'var(--font-bold)', marginBottom: '8px' }}>
              Was this analysis helpful?
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              Your feedback helps us improve the AI.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '4px', transition: 'transform 150ms ease',
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? '#F59E0B' : 'transparent'}
                    color={(hoverRating || rating) >= star ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
                  />
                </button>
              ))}
            </div>
            <form onSubmit={handleFeedbackSubmit} style={{ maxWidth: '440px', margin: '0 auto' }}>
              <textarea
                name="comments"
                placeholder="Any suggestions to improve our AI?"
                style={{
                  width: '100%', minHeight: '90px',
                  padding: '14px', borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: '14px',
                  fontFamily: 'inherit', resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                  marginBottom: '12px',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', height: '44px', padding: '0 20px',
                  borderRadius: 'var(--radius-lg)', border: 'none',
                  background: 'white', color: '#ffffff',
                  fontWeight: 'var(--font-semibold)', fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Submit Feedback'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Check size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'var(--font-bold)', marginBottom: '4px' }}>
              Thank you!
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Your feedback helps us improve.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;
