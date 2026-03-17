import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { classifyImage } from '../services/mockServices';
import { validateImageFile, readFileAsDataURL } from '../utils/helpers';
import { colors } from '../utils/colors.js';
import Card from '../components/Card';
import Button from '../components/Button';
import { FiUpload, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import bg2 from '../assets/bg2.webp';

export default function ImageUploadPage() {
  const { uploadedImages, addImage, removeImage, addPrediction, addToHistory } = useAppStore();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classifications, setClassifications] = useState({});
  const [errors, setErrors] = useState({});

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!validateImageFile(file)) {
      setErrors((prev) => ({
        ...prev,
        [file.name]: 'Invalid file. Please upload PNG or JPG images under 5MB.',
      }));
      return;
    }

    const dataURL = await readFileAsDataURL(file);
    const imageData = {
      id: Date.now() + Math.random(),
      name: file.name,
      data: dataURL,
      uploadedAt: new Date(),
    };

    addImage(imageData);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[file.name];
      return newErrors;
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    for (let file of files) {
      if (file.type.startsWith('image/')) {
        await processFile(file);
      }
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    for (let file of files) {
      await processFile(file);
    }
  };

  const classifyImages = async () => {
    setLoading(true);
    const newClassifications = {};

    for (let image of uploadedImages) {
      try {
        const result = await classifyImage(image.data);
        newClassifications[image.id] = result;
        addPrediction(result);
      } catch (error) {
        console.error('Classification failed:', error);
      }
    }

    setClassifications(newClassifications);
    addToHistory({
      type: 'image_upload',
      images: uploadedImages,
      results: newClassifications,
    });
    setLoading(false);
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <h1>Histopathology Image Upload</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          Upload histopathology images for AI-powered analysis and classification
        </p>

      {/* Upload Area */}
      <Card highlight={true}>
        <div
          style={{
            ...styles.uploadArea,
            borderColor: dragActive ? 'var(--primary)' : 'var(--gray-300)',
            backgroundColor: dragActive ? 'rgba(30, 64, 175, 0.05)' : 'transparent',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div style={styles.uploadContent}>
            <FiUpload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h3>Drag and drop images here</h3>
            <p>or</p>
            <label>
              <Button variant="secondary">Choose Files</Button>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '1rem' }}>
              Supported formats: PNG, JPG | Max size: 5MB each
            </p>
          </div>
        </div>
      </Card>

      {/* Error Messages */}
        {Object.entries(errors).length > 0 && (
        <Card style={{ marginTop: '2rem', borderColor: 'var(--danger)', backgroundColor: 'var(--gray-50)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <FiAlertCircle size={24} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <div>
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Upload Errors</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--danger)' }}>
                {Object.entries(errors).map(([filename, error]) => (
                  <li key={filename} style={{ marginBottom: '0.25rem' }}>
                    <strong>{filename}:</strong> {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
        <Card title="Uploaded Images" style={{ marginTop: '2rem' }}>
          <div style={styles.imagesGrid}>
            {uploadedImages.map((image) => (
              <div key={image.id} style={styles.imageCard}>
                <div style={styles.imageWrapper}>
                  <img src={image.data} alt={image.name} style={styles.image} />
                </div>
                <p style={{ fontSize: '0.875rem', marginTop: '0.75rem', wordBreak: 'break-word' }}>
                  {image.name}
                </p>

                {classifications[image.id] && (
                  <div style={styles.classification}>
                    <div
                      style={{
                        ...styles.classificationBadge,
                        backgroundColor:
                          classifications[image.id].classification === 'Benign'
                            ? colors.benignBg
                            : colors.malignantBg,
                        color:
                          classifications[image.id].classification === 'Benign'
                            ? colors.benignText
                            : colors.malignantText,
                      }}
                    >
                      {classifications[image.id].classification}
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      Confidence: {classifications[image.id].confidence.toFixed(1)}%
                    </p>
                  </div>
                )}

                <button
                  onClick={() => removeImage(image.id)}
                  style={styles.removeButton}
                  title="Remove image"
                >
                  <FiX size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            {Object.keys(classifications).length === uploadedImages.length ? (
              <Button variant="secondary">Classifications Complete</Button>
            ) : (
              <Button size="large" disabled={loading} onClick={classifyImages}>
                {loading ? 'Classifying...' : 'Classify Images'}
              </Button>
            )}
          </div>
        </Card>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), url(${bg2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    minHeight: 'calc(100dvh - 72px)',
    borderRadius: '0',
    padding: '1.25rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  uploadArea: {
    border: '2px dashed',
    borderRadius: '0.75rem',
    padding: '3rem',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  imageCard: {
    position: 'relative',
    backgroundColor: 'var(--gray-50)',
    border: '1px solid var(--gray-200)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    backgroundColor: 'var(--gray-100)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  classification: {
    marginTop: '0.75rem',
    textAlign: 'center',
  },
  classificationBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  removeButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--gray-200)',
  },
};
