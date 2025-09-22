// Author: Aazaf Ritha
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../../api/quizzes";
import QuestionCard from "../../components/QuestionCard";
import { contentApi } from "../../api/content";
import "./QuizCreate.css";

const uid = () => Math.random().toString(36).slice(2, 10);

function PreviewModal({ quiz, onClose }) {
  if (!quiz) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quiz-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Preview: {quiz.title}</h3>
            <p className="modal-subtitle">
              Time limit: {quiz.timeLimitMin ? `${quiz.timeLimitMin} min` : "none"} · Pass: {quiz.passingScore}%
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}
          {(quiz.questions || []).map((q, idx) => (
            <div key={q.id || q._id || idx} className="preview-question">
              <div className="question-number">Question {idx + 1}</div>
              <div className="question-text">{q.stem}</div>
              <ul className="options-list">
                {(q.options || []).map((o, i) => (
                  <li key={o.id || o._id || i} className="option-item">
                    • {o.text}{" "}
                    {o.isCorrect ? (
                      <span className="correct-badge">correct</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Looks good
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuizCreate() {
  const nav = useNavigate();

  // Quiz meta
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLimitMin, setTimeLimitMin] = useState(30);
  const [passingScore, setPassingScore] = useState(70);

  // Badge
  const [badgeTitle, setBadgeTitle] = useState("");
  const [badgeDescription, setBadgeDescription] = useState("");
  const [badgeImage, setBadgeImage] = useState("");
  const [badgeImagePreview, setBadgeImagePreview] = useState("");
  const [badgeUploading, setBadgeUploading] = useState(false);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [previewOf, setPreviewOf] = useState(null);

  const addQuestion = (type) => {
    const newQuestion = {
      id: uid(),
      type: type,
      stem: "",
      explanation: "",
      options: type === "tf" ? [
        { id: uid(), text: "True", isCorrect: false },
        { id: uid(), text: "False", isCorrect: false }
      ] : [],
      points: 1
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id, next) =>
    setQuestions(prev => prev.map(q => q.id === id ? next : q));
  const removeQuestion = (id) =>
    setQuestions(prev => prev.filter(q => q.id !== id));

  async function handleBannerUpload(file) {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG, JPEG, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const localUrl = URL.createObjectURL(file);
    setBannerPreview(localUrl);
    setBannerUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      setBannerImage(data.url);
    } catch (e) {
      console.error('Banner upload error:', e);
      alert(e.message || "Banner upload failed. Please try again.");
      setBannerPreview(null); // Clear preview on error
    } finally {
      setBannerUploading(false);
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000);
    }
  }

  async function handleBadgeUpload(file) {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setBadgeImagePreview(localUrl);
    setBadgeUploading(true);
    try {
      const data = await contentApi.uploadImage(file);
      setBadgeImage(data.url);
    } catch (e) {
      alert(e.message || "Badge upload failed");
    } finally {
      setBadgeUploading(false);
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000);
    }
  }

  const draft = useMemo(() => ({
    title,
    description,
    bannerImage: bannerImage || bannerPreview,
    difficulty,
    timeLimitMin: Number(timeLimitMin) || null,
    passingScore: Number(passingScore) || 70,
    badgeTitle,
    badgeDescription,
    badgeImage: badgeImage || badgeImagePreview,
    status: "draft",
    questions,
    totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0)
  }), [title, description, bannerImage, bannerPreview, difficulty, timeLimitMin, passingScore, badgeTitle, badgeDescription, badgeImage, badgeImagePreview, questions]);

  const canSave = Boolean(
    title.trim() &&
    badgeTitle.trim() &&
    questions.length > 0 &&
    questions.every(q => {
      if (!q.stem?.trim()) return false;
      if (q.type === "short") return true; // Short answer doesn't need options
      if (q.type === "tf") return q.options?.length === 2 && q.options.some(o => o.isCorrect);
      return (q.options?.length > 0) && q.options.some(o => o.isCorrect);
    })
  );

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await quizApi.create(draft);
      nav("/admin/quizzes");
    } catch (e) {
      alert(e.message || e);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const quiz = await quizApi.create(draft);
      await quizApi.publish(quiz._id || quiz.id);
      nav("/admin/quizzes");
    } catch (e) {
      alert(e.message || e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="quiz-create-page">
      {/* Top Header Bar */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button 
            className="preview-btn"
            onClick={() => setPreviewOf(draft)} 
            disabled={!canSave}
          >
            <span className="btn-icon">👁️</span>
            Preview
          </button>
          <button 
            className="save-draft-btn"
            onClick={save} 
            disabled={!canSave || saving}
          >
            <span className="btn-icon">💾</span>
            Save Draft
          </button>
          <button 
            className="publish-btn"
            onClick={publish} 
            disabled={!canSave || saving}
          >
            Publish Quiz
          </button>
          <span className="admin-welcome">Welcome, Administrator</span>
          <div className="admin-avatar">A</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-main">
        <div className="content-left">
          {/* Header Section */}
          <div className="content-header-section">
            <button className="back-btn" onClick={() => nav("/admin/quizzes")}>
              ← Back
            </button>
            <div className="header-content">
              <h1 className="content-main-title">Create New Quiz</h1>
              <p className="content-subtitle">Design engaging quizzes with custom badges.</p>
            </div>
          </div>

          {/* Quiz Information */}
          <div className="content-section">
            <h2 className="section-title">Quiz Information</h2>
            
            <div className="form-group">
              <label className="form-label required">Quiz Title *</label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Enter quiz title..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                placeholder="Describe what this quiz covers..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/banner.jpg"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleBannerUpload(e.target.files?.[0])}
                className="file-input"
              />
              {bannerUploading && <div className="upload-status">Uploading banner...</div>}
              {(bannerPreview || bannerImage) && (
                <div className="banner-preview-container">
                  <img
                    src={bannerImage || bannerPreview}
                    alt="Banner preview"
                    className="banner-preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling?.remove();
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'banner-error';
                      errorDiv.textContent = 'Failed to load image preview';
                      errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.875rem; margin-top: 0.5rem; text-align: center;';
                      e.target.parentNode.appendChild(errorDiv);
                    }}
                  />
                </div>
              )}
            </div>


            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Difficulty *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Time Limit (minutes)</label>
                <input 
                  type="number" 
                  min={0} 
                  value={timeLimitMin} 
                  onChange={(e) => setTimeLimitMin(e.target.value)}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={passingScore} 
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="content-section">
            <div className="questions-header">
              <h2 className="section-title">Questions ({questions.length})</h2>
              <div className="total-points">Total Points: {draft.totalPoints}</div>
            </div>

            <div className="question-type-buttons">
              <button 
                className="question-type-btn"
                onClick={() => addQuestion("mcq")}
              >
                <span className="btn-icon">✓</span>
                Add Multiple Choice
              </button>
              <button 
                className="question-type-btn"
                onClick={() => addQuestion("tf")}
              >
                <span className="btn-icon">✗</span>
                Add True/False
              </button>
              <button 
                className="question-type-btn"
                onClick={() => addQuestion("short")}
              >
                <span className="btn-icon">?</span>
                Add Short Answer
              </button>
            </div>

            <div className="questions-list">
              {questions.map((q) => (
                <QuestionCard 
                  key={q.id} 
                  q={q} 
                  onChange={(next) => updateQuestion(q.id, next)} 
                  onRemove={() => removeQuestion(q.id)} 
                />
              ))}
              {questions.length === 0 && (
                <div className="empty-questions">
                  <div className="empty-icon">?</div>
                  <p>No questions added yet. Use the buttons above to add your first question.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="content-right">
          {/* Completion Badge */}
          <div className="content-section">
            <h2 className="section-title">
              <span className="section-icon">🏆</span>
              Completion Badge
            </h2>
            
            <div className="form-group">
              <label className="form-label required">Badge Title *</label>
              <input 
                value={badgeTitle} 
                onChange={(e) => setBadgeTitle(e.target.value)}
                className="form-input"
                placeholder="e.g., JavaScript Master"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Badge Description</label>
              <textarea 
                rows={3} 
                value={badgeDescription} 
                onChange={(e) => setBadgeDescription(e.target.value)}
                className="form-textarea"
                placeholder="Describe what this badge represents..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Badge Image</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/badge.jpg"
                value={badgeImage}
                onChange={(e) => setBadgeImage(e.target.value)}
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => handleBadgeUpload(e.target.files?.[0])}
                className="file-input"
              />
              {badgeUploading && <div className="upload-status">Uploading badge...</div>}
              {(badgeImagePreview || badgeImage) && (
                <div className="badge-preview-container">
                  <img
                    src={badgeImage || badgeImagePreview}
                    alt="Badge preview"
                    className="badge-preview"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quiz Summary */}
          <div className="content-section">
            <h2 className="section-title">Quiz Summary</h2>
            
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Questions:</span>
                <span className="stat-value">{questions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Points:</span>
                <span className="stat-value">{draft.totalPoints}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Difficulty:</span>
                <span className="stat-value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Limit:</span>
                <span className="stat-value">{timeLimitMin} min</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Passing Score:</span>
                <span className="stat-value">{passingScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PreviewModal quiz={previewOf} onClose={() => setPreviewOf(null)} />
    </div>
  );
}
