import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { getChatResponse, classifyImage } from '../services/mockServices';
import Card from '../components/Card';
import Button from '../components/Button';
import { FiSend, FiMessageCircle, FiImage, FiX } from 'react-icons/fi';
import bg2 from '../assets/bg2.webp';

export default function AIAssistantPage() {
  const { chatMessages, addMessage, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const suggestedQuestions = [
    'What does malignant mean?',
    'What are common symptoms of breast cancer?',
    'What should a patient do after screening?',
    'How is breast cancer treated?',
    'What are prevention strategies?',
    'How often should screening occur?',
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Please upload a PNG or JPG image');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    // Add user message with image
    const userMessage = {
      id: Date.now(),
      text: 'I uploaded an image for analysis',
      sender: 'user',
      image: imagePreview,
    };
    addMessage(userMessage);

    setLoading(true);
    try {
      // Classify the image
      const classification = await classifyImage(selectedImage);

      // Add classification result
      const classificationMessage = {
        id: Date.now() + 1,
        text: `Image Analysis Result: ${classification.label} (Confidence: ${classification.confidence}%)`,
        sender: 'assistant',
        isClassification: true,
      };
      addMessage(classificationMessage);

      // Generate AI response based on classification
      const aiResponse = await getChatResponse(
        `The uploaded image has been classified as ${classification.label}. Please provide guidance.`
      );

      const aiMessage = {
        id: Date.now() + 2,
        text: aiResponse,
        sender: 'assistant',
      };
      addMessage(aiMessage);
    } catch (error) {
      console.error('Failed to process image:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I had trouble analyzing the image. Please try again.',
        sender: 'assistant',
      };
      addMessage(errorMessage);
    } finally {
      setSelectedImage(null);
      setImagePreview(null);
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (message = input.trim()) => {
    if (!message && !selectedImage) return;

    // If image is selected, upload it first
    if (selectedImage) {
      await handleImageUpload();
      setInput('');
      return;
    }

    // Add user message
    const userMessage = { id: Date.now(), text: message, sender: 'user' };
    addMessage(userMessage);
    setInput('');
    setLoading(true);

    // Get AI response
    try {
      const response = await getChatResponse(message);
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'assistant',
      };
      addMessage(aiMessage);
    } catch (error) {
      console.error('Failed to get response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    handleSendMessage(question);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <h1>Medical AI Assistant</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          Ask questions about breast cancer screening, or upload an image for analysis
        </p>

        <div style={styles.chatWrapper}>
        {/* Chat Area */}
        <div style={styles.chatArea}>
          {chatMessages.length === 0 ? (
            <div style={styles.emptyState}>
              <FiMessageCircle size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <h3>Start a Conversation</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
                Ask me anything about breast cancer screening or upload an image
              </p>

              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Suggested Questions:
                </p>
                <div style={styles.suggestedGrid}>
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      style={styles.suggestedButton}
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.messagesList}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageWrapper,
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.message,
                      backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--gray-100)',
                      color: msg.sender === 'user' ? 'white' : 'var(--gray-900)',
                      borderColor: msg.isClassification ? 'var(--success)' : undefined,
                      borderWidth: msg.isClassification ? '2px' : '0px',
                    }}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="uploaded"
                        style={{
                          maxWidth: '200px',
                          borderRadius: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      />
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={styles.messageWrapper}>
                  <div style={{ ...styles.message, backgroundColor: 'var(--gray-100)' }}>
                    <div style={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <Card style={styles.inputCard}>
          {/* Image Preview */}
          {imagePreview && (
            <div style={styles.imagePreviewWrapper}>
              <img src={imagePreview} alt="preview" style={styles.imagePreview} />
              <button
                onClick={removeImage}
                style={styles.removeImageButton}
                title="Remove image"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Input Controls */}
          <div style={styles.inputControls}>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={selectedImage ? 'Add optional message...' : 'Type your question...'}
                style={styles.input}
                disabled={loading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.imageButton}
                title="Upload image"
                disabled={loading}
              >
                <FiImage />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={(!input.trim() && !selectedImage) || loading}
                style={styles.SendButton}
                title="Send message"
              >
                <FiSend />
              </button>
            </div>
          </div>

          {chatMessages.length > 0 && (
            <div style={styles.actions}>
              <Button variant="outline" size="small" onClick={clearChat}>
                Clear Chat
              </Button>
            </div>
          )}
        </Card>
        </div>
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
    height: 'calc(100vh - 200px)',
    display: 'flex',
    flexDirection: 'column',
  },
  chatWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '500px',
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  messagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '0.5rem',
  },
  message: {
    maxWidth: '70%',
    padding: '0.875rem 1.25rem',
    borderRadius: '0.75rem',
    wordWrap: 'break-word',
    lineHeight: '1.5',
  },
  typingIndicator: {
    display: 'flex',
    gap: '0.375rem',
    alignItems: 'center',
  },
  suggestedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  suggestedButton: {
    padding: '0.75rem',
    backgroundColor: 'var(--gray-100)',
    border: '1px solid var(--gray-300)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    fontFamily: "'Fira Code', monospace",
  },
  inputCard: {
    padding: '1rem',
  },
  inputControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  inputWrapper: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid var(--gray-300)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: "'Fira Code', monospace",
  },
  imageButton: {
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--secondary)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Fira Code', monospace",
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  SendButton: {
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Fira Code', monospace",
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
  imagePreviewWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '1rem',
  },
  imagePreview: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '0.5rem',
    border: '2px solid var(--primary)',
  },
  removeImageButton: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    backgroundColor: 'var(--danger)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    transition: 'background-color 0.3s ease',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--gray-200)',
  },
};
