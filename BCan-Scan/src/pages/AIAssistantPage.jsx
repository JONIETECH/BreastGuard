import { useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { runInference } from '../services/hfApi';
import { validateAge, validateImageFile, readFileAsDataURL } from '../utils/helpers';
import { Select, Textarea } from '../components/FormInputs';
import { FiAlertCircle, FiImage, FiLayers, FiRefreshCw, FiSend, FiUpload, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import bgDesktop from '../assets/bg2.webp';
import bgMobile from '../assets/bg2.jpg';

const DEFAULT_QUERY = 'What are the recommended next steps for this patient?';

export default function AIAssistantPage() {
  const { addPrediction, addToHistory } = useAppStore();
  const [age, setAge] = useState('45');
  const [symptomDuration, setSymptomDuration] = useState('4');
  const [familyHistory, setFamilyHistory] = useState('No');
  const [reproductiveHistory, setReproductiveHistory] = useState('Normal');
  const [clinicalQuery, setClinicalQuery] = useState(DEFAULT_QUERY);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('report');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!validateImageFile(file)) {
      setError('Please upload a PNG or JPG image under 5MB.');
      return;
    }

    const dataURL = await readFileAsDataURL(file);
    setSelectedImage(file);
    setImagePreview(dataURL);
    setError('');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    await handleFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    await handleFile(file);
  };

  const validateForm = () => {
    if (!selectedImage) {
      setError('Please upload a histopathology image before running the case.');
      return false;
    }

    if (!validateAge(age)) {
      setError('Age must be between 18 and 120.');
      return false;
    }

    if (clinicalQuery.trim().length < 3) {
      setError('Please enter a clinical query.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await runInference({
        image: selectedImage,
        age,
        symptomDur: symptomDuration,
        famHist: familyHistory,
        reproHist: reproductiveHistory,
        query: clinicalQuery,
      });

      setResult(response);
      setActiveTab('report');
      addPrediction(response);
      addToHistory({
        type: 'assistant_case',
        factors: {
          age,
          symptomDuration,
          familyHistory,
          reproductiveHistory,
          query: clinicalQuery,
        },
        image: imagePreview,
        result: response,
      });
    } catch (err) {
      console.error('Failed to run case analysis:', err);
      setError('The deployed model could not complete the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCase = () => {
    setAge('45');
    setSymptomDuration('4');
    setFamilyHistory('No');
    setReproductiveHistory('Normal');
    setClinicalQuery(DEFAULT_QUERY);
    setResult(null);
    setActiveTab('report');
    setError('');
    clearImage();
  };

  const verdict = result?.classification || 'Awaiting analysis';
  const verdictTone =
    result?.classification === 'Malignant'
      ? 'danger'
      : result?.classification === 'Benign'
        ? 'success'
        : 'warning';

  return (
    <>
      <style>{`
        .assistant-bg {
          background-color: var(--gray-50);
          background-image: url(${bgMobile});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
        }
        .assistant-bg::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255, 255, 255, 0.75);
          pointer-events: none;
        }
        .assistant-content {
          position: relative;
          z-index: 1;
        }
        @media (min-width: 768px) {
          .assistant-bg {
            background-image: url(${bgDesktop});
          }
        }
      `}</style>
      <div className="assistant-bg" style={{
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        minHeight: 'calc(100dvh - 72px)',
        padding: '1.25rem',
        color: 'var(--gray-900)',
      }}>
        <div style={styles.container} className="assistant-content">
          <div style={styles.headerRow}>
          <div>
            <p style={styles.kicker}>Clinical Case Assistant</p>
            <h1 style={styles.title}>Patient Information & Assessment</h1>
            <p style={styles.subtitle}>
              Upload one histopathology image, enter the required parameters, and run a grounded case analysis
            </p>
          </div>
        </div>

        <div style={styles.layoutGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelBadge}>Patient Information & Image</span>
              <span style={styles.panelMeta}>{selectedImage ? 'Case image selected' : 'No image selected'}</span>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div
                style={{
                  ...styles.uploadZone,
                  borderColor: dragActive ? 'var(--secondary)' : 'var(--gray-300)',
                  backgroundColor: dragActive ? 'rgba(236,72,153,0.05)' : 'var(--gray-50)',
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div style={styles.uploadIconWrap}>
                  <FiUpload size={34} />
                </div>
                <h3 style={styles.uploadTitle}>Upload Histopathology Image (PNG/JPG)</h3>
                <p style={styles.uploadText}>Drop an image here or click to browse. This image is required!</p>
                <label style={styles.uploadButton}>
                  <FiImage />
                  <span>Choose Image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>

                {imagePreview && (
                  <div style={styles.previewWrap}>
                    <div style={styles.previewCaption}>Selected case image</div>
                    <img src={imagePreview} alt="selected case preview" style={styles.previewImage} />
                    <button
                      type="button"
                      onClick={clearImage}
                      style={styles.clearImageButton}
                      aria-label="Remove selected image"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

              {error && <div style={styles.errorBanner}>{error}</div>}

              <div style={styles.sliderRow}>
                <div style={styles.sliderCard}>
                  <div style={styles.controlHeader}>
                    <span style={styles.controlLabel}>Patient Age (years)</span>
                    <span style={styles.controlValue}>{age}</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={styles.range}
                  />
                  <div style={styles.rangeScale}>
                    <span>18</span>
                    <span>120</span>
                  </div>
                </div>

                <div style={styles.sliderCard}>
                  <div style={styles.controlHeader}>
                    <span style={styles.controlLabel}>Symptom Duration (weeks)</span>
                    <span style={styles.controlValue}>{symptomDuration}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="52"
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    style={styles.range}
                  />
                  <div style={styles.rangeScale}>
                    <span>0</span>
                    <span>52</span>
                  </div>
                </div>
              </div>

              <div style={styles.gridTwo}>
                <Select
                  label="Family History of Breast Cancer?"
                  name="familyHistory"
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                  ]}
                />

                <Select
                  label="Reproductive History"
                  name="reproductiveHistory"
                  value={reproductiveHistory}
                  onChange={(e) => setReproductiveHistory(e.target.value)}
                  options={[
                    { value: 'Normal', label: 'Normal' },
                    { value: 'Early menarche', label: 'Early menarche' },
                    { value: 'Nulliparous', label: 'Nulliparous' },
                  ]}
                />
              </div>

              <Textarea
                label="Clinical Query"
                name="clinicalQuery"
                value={clinicalQuery}
                onChange={(e) => setClinicalQuery(e.target.value)}
                helperText="This prompt is used to ground the report."
              />

              <div style={styles.actionRow}>
                <button type="button" onClick={resetCase} style={styles.secondaryButton}>
                  Reset
                </button>
                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? <LoadingSpinner size={24} inline={true} /> : 'Run AI Assessment'}
                  {!loading && <FiSend />}
                </button>
              </div>
            </form>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelBadge}>AI Assessment Results</span>
              <span
                style={{
                  ...styles.statusChip,
                  backgroundColor:
                    verdictTone === 'danger'
                      ? 'rgba(220,38,38,0.08)'
                      : verdictTone === 'success'
                        ? 'rgba(22,163,74,0.08)'
                        : 'rgba(15,118,110,0.08)',
                  color:
                    verdictTone === 'danger'
                      ? 'var(--danger)'
                      : verdictTone === 'success'
                        ? 'var(--success)'
                        : 'var(--primary)',
                }}
              >
                {verdict}
              </span>
            </div>

            <div style={styles.tabRow}>
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                style={{ ...styles.tabButton, ...(activeTab === 'report' ? styles.tabButtonActive : {}) }}
              >
                <span>Clinical Report</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cam')}
                style={{ ...styles.tabButton, ...(activeTab === 'cam' ? styles.tabButtonActive : {}) }}
              >
                <span>Grad-CAM Explanation</span>
              </button>
            </div>

            {!result ? (
              <div style={styles.emptyState}>
                <div style={{ ...styles.emptyIconWrap, backgroundColor: 'rgba(236,72,153,0.08)', color: 'var(--secondary)' }}>
                  <FiImage size={28} />
                </div>
                <h3 style={styles.emptyTitle}>Ready for a case review</h3>
                <p style={styles.emptyText}>
                  Fill in the patient details on the left, then run the model to see the grounded report and the tissue attention map.
                </p>
              </div>
            ) : activeTab === 'report' ? (
              <div style={styles.reportCard}>
                <div style={styles.reportHeader}>
                  <div>
                    <p style={styles.reportKicker}>Guideline-grounded clinical decision support report</p>
                    <h3 style={styles.reportTitle}>{result.classification}</h3>
                  </div>
                  <div style={styles.confidencePill}>{result.confidence}% confidence</div>
                </div>

                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Prediction</span>
                    <strong>{result.classification}</strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Signal</span>
                    <strong>{result.level}</strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Score</span>
                    <strong>{result.score}/100</strong>
                  </div>
                </div>

                <div style={styles.reportBody}>
                  <p style={styles.reportText}>{result.report}</p>
                </div>
              </div>
            ) : (
              <div style={styles.camCard}>
                <div style={styles.camHeader}>
                  <p style={styles.reportKicker}>Tissue Attention Map (Red = most influential region)</p>
                  <h3 style={styles.reportTitle}>Grad-CAM explanation</h3>
                </div>

                {result.attentionMap ? (
                  <img src={result.attentionMap} alt="Tissue attention map" style={styles.attentionMap} />
                ) : (
                  <div style={styles.camPlaceholder}>
                    <FiAlertCircle size={28} />
                    <p>The Space did not return an attention map for this run.</p>
                  </div>
                )}

                <div style={styles.camNotes}>
                  <p style={styles.camNotesTitle}>Reading the Grad-CAM heatmap:</p>
                  <ul style={styles.camList}>
                    <li><span style={styles.dotRed}></span>Red / Yellow = regions most influential in the AI decision</li>
                    <li><span style={styles.dotBlue}></span>Blue = less influential regions</li>
                    <li>The attention should focus on cell nuclei, tissue patterns, and glandular structures</li>
                  </ul>
                </div>
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
    </>
  );
}

const styles = {
  pageBackground: {
    backgroundColor: 'var(--gray-50)',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    minHeight: 'calc(100dvh - 72px)',
    padding: '1.25rem',
    color: 'var(--gray-900)',
  },
  container: {
    maxWidth: '1480px',
    margin: '0 auto',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  kicker: {
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'var(--secondary)',
    fontWeight: 700,
    fontSize: '0.74rem',
  },
  title: {
    margin: '0.35rem 0 0',
    fontSize: '2rem',
    lineHeight: 1.1,
    color: 'var(--primary)',
  },
  subtitle: {
    margin: '0.65rem 0 0',
    maxWidth: '66ch',
    color: 'var(--gray-700)',
    lineHeight: 1.7,
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.7rem 0.9rem',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(236,72,153,0.22)',
    color: 'var(--secondary)',
    fontWeight: 600,
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem',
  },
  panel: {
    backgroundColor: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  panelMeta: {
    color: 'var(--gray-500)',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  uploadZone: {
    border: '1px dashed var(--gray-300)',
    borderRadius: '0.9rem',
    padding: '1rem',
    backgroundColor: 'var(--gray-50)',
  },
  uploadIconWrap: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary)',
    backgroundColor: 'rgba(236,72,153,0.08)',
    marginBottom: '0.8rem',
  },
  uploadTitle: {
    margin: '0 0 0.35rem',
    fontSize: '1.05rem',
    color: 'var(--gray-800)',
  },
  uploadText: {
    margin: 0,
    color: 'var(--gray-600)',
    lineHeight: 1.6,
  },
  uploadButton: {
    marginTop: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.55rem',
    cursor: 'pointer',
    padding: '0.78rem 1rem',
    borderRadius: '0.75rem',
    backgroundColor: 'white',
    color: 'var(--secondary)',
    fontWeight: 700,
    border: '1px solid rgba(236,72,153,0.28)',
  },
  previewWrap: {
    position: 'relative',
    marginTop: '1rem',
  },
  previewCaption: {
    marginBottom: '0.5rem',
    color: 'var(--gray-700)',
    fontWeight: 600,
  },
  previewImage: {
    width: '100%',
    maxHeight: '260px',
    objectFit: 'cover',
    borderRadius: '0.85rem',
    border: '1px solid var(--gray-200)',
    display: 'block',
  },
  clearImageButton: {
    position: 'absolute',
    top: '0.65rem',
    right: '0.65rem',
    width: '2rem',
    height: '2rem',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: 'rgba(15,23,42,0.85)',
    color: 'white',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  errorBanner: {
    padding: '0.8rem 0.95rem',
    borderRadius: '0.8rem',
    backgroundColor: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.14)',
    color: 'var(--danger)',
  },
  sliderRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.85rem',
  },
  sliderCard: {
    backgroundColor: 'var(--gray-50)',
    borderRadius: '0.85rem',
    border: '1px solid var(--gray-200)',
    padding: '0.85rem',
  },
  controlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '0.7rem',
  },
  controlLabel: {
    color: 'var(--gray-800)',
    fontWeight: 700,
  },
  controlValue: {
    minWidth: '3.2rem',
    textAlign: 'center',
    padding: '0.3rem 0.5rem',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    color: 'var(--gray-800)',
    fontWeight: 700,
    border: '1px solid var(--gray-200)',
  },
  range: {
    width: '100%',
    accentColor: 'var(--secondary)',
  },
  rangeScale: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--gray-500)',
    fontSize: '0.82rem',
    marginTop: '0.4rem',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.85rem',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  secondaryButton: {
    border: '1px solid var(--gray-300)',
    backgroundColor: 'white',
    color: 'var(--gray-700)',
    padding: '0.85rem 1rem',
    borderRadius: '0.85rem',
    cursor: 'pointer',
    fontWeight: 700,
  },
  primaryButton: {
    border: 'none',
    backgroundColor: 'var(--secondary)',
    color: 'white',
    padding: '0.85rem 1.15rem',
    borderRadius: '0.85rem',
    cursor: 'pointer',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.55rem',
  },
  statusChip: {
    padding: '0.5rem 0.8rem',
    borderRadius: '999px',
    fontWeight: 700,
    fontSize: '0.86rem',
    border: '1px solid var(--gray-200)',
  },
  tabRow: {
    display: 'flex',
    gap: '0.65rem',
    borderBottom: '1px solid var(--gray-200)',
    marginBottom: '1rem',
  },
  tabButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--gray-600)',
    padding: '0.8rem 0.2rem',
    cursor: 'pointer',
    fontWeight: 700,
    borderBottom: '2px solid transparent',
  },
  tabButtonActive: {
    color: 'var(--secondary)',
    borderBottomColor: 'var(--secondary)',
  },
  emptyState: {
    minHeight: '520px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '1.5rem',
  },
  emptyIconWrap: {
    width: '3.4rem',
    height: '3.4rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236,72,153,0.08)',
    color: 'var(--secondary)',
    marginBottom: '1rem',
  },
  emptyTitle: {
    margin: '0 0 0.5rem',
    color: 'var(--gray-800)',
  },
  emptyText: {
    margin: 0,
    maxWidth: '42ch',
    color: 'var(--gray-600)',
    lineHeight: 1.7,
  },
  reportCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  reportKicker: {
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--primary)',
    fontSize: '0.72rem',
    fontWeight: 700,
  },
  reportTitle: {
    margin: '0.3rem 0 0',
    color: 'var(--gray-900)',
  },
  confidencePill: {
    padding: '0.55rem 0.85rem',
    borderRadius: '999px',
    backgroundColor: 'rgba(236,72,153,0.08)',
    color: 'var(--secondary)',
    fontWeight: 700,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.75rem',
  },
  summaryItem: {
    padding: '0.8rem',
    borderRadius: '0.8rem',
    backgroundColor: 'var(--gray-50)',
    border: '1px solid var(--gray-200)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  summaryLabel: {
    color: 'var(--gray-500)',
    fontSize: '0.85rem',
  },
  reportBody: {
    marginTop: '0.2rem',
    padding: '1rem',
    borderRadius: '0.85rem',
    backgroundColor: 'var(--gray-50)',
    border: '1px solid var(--gray-200)',
  },
  reportText: {
    margin: 0,
    color: 'var(--gray-800)',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
  },
  camCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  camHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  attentionMap: {
    width: '100%',
    borderRadius: '1rem',
    border: '1px solid var(--gray-200)',
    backgroundColor: 'var(--gray-50)',
    minHeight: '360px',
    objectFit: 'contain',
  },
  camPlaceholder: {
    minHeight: '360px',
    borderRadius: '1rem',
    border: '1px dashed var(--gray-300)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    color: 'var(--gray-600)',
    backgroundColor: 'var(--gray-50)',
  },
  camNotes: {
    padding: '0.95rem 1rem',
    borderRadius: '0.85rem',
    border: '1px solid var(--gray-200)',
    backgroundColor: 'var(--gray-50)',
  },
  camNotesTitle: {
    margin: '0 0 0.7rem',
    fontWeight: 700,
    color: 'var(--gray-800)',
  },
  camList: {
    margin: 0,
    paddingLeft: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    color: 'var(--gray-700)',
  },
  dotRed: {
    display: 'inline-block',
    width: '0.7rem',
    height: '0.7rem',
    borderRadius: '999px',
    backgroundColor: 'red',
    marginRight: '0.55rem',
  },
  dotBlue: {
    display: 'inline-block',
    width: '0.7rem',
    height: '0.7rem',
    borderRadius: '999px',
    backgroundColor: 'blue',
    marginRight: '0.55rem',
  },
};
