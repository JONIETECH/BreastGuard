"""
Breast Cancer Screening AI — HuggingFace Spaces Deployment
Makerere University | Group 11 | Supervisor: Dr. Emmanuel Lule
Upload your FINAL_MEDICAL_AI_DEPLOYMENT.zip contents to this Space
alongside this app.py file, then launch.
"""

import os, gc, warnings, time, traceback
import numpy as np
import cv2
import joblib
import gradio as gr
from PIL import Image

warnings.filterwarnings("ignore")

# ─── Paths (all relative to the Space root) ──────────────────────────────────
MODEL_DIR   = "models"
PREP_DIR    = "preprocessors"
VEC_DB_DIR  = "guidelines_db"

# ─── 1. Load Keras model ─────────────────────────────────────────────────────
print("Loading Keras hybrid model...")
import tensorflow as tf
try:
    hybrid_model = tf.keras.models.load_model(
        os.path.join(MODEL_DIR, "hybrid_model.keras"), compile=False
    )
    print(f"✅ Keras model loaded  — inputs: {[i.shape for i in hybrid_model.inputs]}")
except Exception as e:
    print(f"❌ Keras model load failed: {e}")
    hybrid_model = None

# ─── 2. Load preprocessors ───────────────────────────────────────────────────
print("Loading preprocessors...")
try:
    glcm_scaler       = joblib.load(os.path.join(PREP_DIR, "glcm_scaler.pkl"))
    risk_scaler       = joblib.load(os.path.join(PREP_DIR, "scaler.pkl"))
    risk_encoder      = joblib.load(os.path.join(PREP_DIR, "encoder.pkl"))
    pixel_mean        = np.load(os.path.join(PREP_DIR, "pixel_mean.npy"))
    pixel_std         = np.load(os.path.join(PREP_DIR, "pixel_std.npy"))
    OPTIMAL_THRESHOLD = float(np.load(os.path.join(PREP_DIR, "optimal_threshold.npy"))[0])
    print(f"✅ Preprocessors loaded — threshold: {OPTIMAL_THRESHOLD:.4f}")
except Exception as e:
    print(f"❌ Preprocessor load failed: {e}")
    glcm_scaler = risk_scaler = risk_encoder = None
    pixel_mean  = np.array([0.5, 0.5, 0.5], dtype=np.float32)
    pixel_std   = np.array([0.25, 0.25, 0.25], dtype=np.float32)
    OPTIMAL_THRESHOLD = 0.5

# ─── 3. Load RF risk pipeline ────────────────────────────────────────────────
print("Loading RF risk pipeline...")
try:
    rf_pipeline = joblib.load(os.path.join(MODEL_DIR, "rf_pipeline.pkl"))
    print("✅ RF pipeline loaded")
except Exception as e:
    print(f"❌ RF pipeline load failed: {e}")
    rf_pipeline = None

# ─── 4. Detect feature dims from loaded model ────────────────────────────────
if hybrid_model is not None:
    GLCM_DIM_INFERRED = int(hybrid_model.inputs[1].shape[-1])
    RISK_DIM_INFERRED = int(hybrid_model.inputs[2].shape[-1])
else:
    GLCM_DIM_INFERRED = 72
    RISK_DIM_INFERRED = 4
print(f"   GLCM dim: {GLCM_DIM_INFERRED}  |  Risk dim: {RISK_DIM_INFERRED}")

# ─── 5. HGLCM extractor (same as training) ───────────────────────────────────
from skimage.feature import graycomatrix, graycoprops

class HGLCMExtractor:
    def __init__(self,
                 distances=(1, 2, 3),
                 angles=(0, np.pi/4, np.pi/2, 3*np.pi/4),
                 levels=64):
        self.distances  = distances
        self.angles     = angles
        self.levels     = levels
        self.properties = ["contrast","dissimilarity","homogeneity",
                           "energy","correlation","ASM"]
        self.n_features = len(self.properties)*len(distances)*len(angles)

    def extract(self, image_rgb):
        img_u8 = (image_rgb*255).astype(np.uint8) if image_rgb.max()<=1.0 else image_rgb.astype(np.uint8)
        gray   = cv2.cvtColor(img_u8, cv2.COLOR_RGB2GRAY)
        gray   = cv2.resize(gray, (128, 128), interpolation=cv2.INTER_AREA)
        gray_q = (gray // (256 // self.levels)).astype(np.uint8)
        glcm   = graycomatrix(gray_q, distances=list(self.distances),
                              angles=list(self.angles), levels=self.levels,
                              symmetric=True, normed=True)
        feats  = []
        for prop in self.properties:
            feats.extend(graycoprops(glcm, prop).flatten())
        return np.array(feats, dtype=np.float32)

hg_extractor = HGLCMExtractor()
print(f"✅ HGLCM extractor ready — {hg_extractor.n_features} features")

# ─── 6. Preprocessing function (identical to training) ───────────────────────
IMG_SIZE = 224

def preprocess_image(img_input, img_size=IMG_SIZE):
    """CLAHE → Resize → Normalise [0,1]. Accepts numpy array or PIL Image."""
    if isinstance(img_input, Image.Image):
        img_rgb = np.array(img_input.convert("RGB"))
    else:
        img_rgb = np.array(img_input, copy=True)
        if img_rgb.ndim == 2:
            img_rgb = cv2.cvtColor(img_rgb, cv2.COLOR_GRAY2RGB)
        if img_rgb.shape[-1] == 4:
            img_rgb = cv2.cvtColor(img_rgb, cv2.COLOR_RGBA2RGB)
        if img_rgb.dtype != np.uint8:
            img_rgb = np.clip(img_rgb*255, 0, 255).astype(np.uint8)

    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe   = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    lab_eq  = cv2.merge([clahe.apply(l), a, b])
    rgb_eq  = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2RGB)
    resized = cv2.resize(rgb_eq, (img_size, img_size), interpolation=cv2.INTER_AREA)
    img_norm  = resized.astype(np.float32) / 255.0
    return img_norm, resized   # (normalised float32, uint8 RGB for display)

# ─── 7. RAG pipeline ─────────────────────────────────────────────────────────
print("Building RAG knowledge base...")
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

FALLBACK_CORPUS = [
    ("Uganda_MoH_2020",
     "Uganda Ministry of Health 2020: All women with breast complaints should receive thorough clinical breast examination (CBE). Suspicious lumps must be referred for fine needle aspiration or core needle biopsy. Triple assessment (clinical, imaging, pathology) is the standard of care."),
    ("WHO_Screening_2022",
     "WHO 2022: Clinical breast examination recommended for women aged 40-74 every 1-2 years in resource-limited settings. Mammography recommended for women 50-69. Ultrasound may serve as alternative for dense breast tissue where mammography is unavailable."),
    ("NCCN_2024",
     "NCCN 2024: Stage I-II — breast-conserving surgery or mastectomy; sentinel node biopsy standard; adjuvant chemotherapy for high-risk features. Stage III — neoadjuvant systemic therapy before surgery. Stage IV — systemic therapy is the primary modality."),
    ("Uganda_Cancer_Institute",
     "Uganda Cancer Institute: Suspected breast cancer should be referred urgently for triple assessment. Early referral is critical given that over 80% of Uganda patients present at Stage III-IV."),
    ("Risk_Factors",
     "Established risk factors: Age, family history (2-3x risk with first-degree relative), BRCA1/BRCA2 mutations (45-72% lifetime risk), dense breast tissue (4x risk), early menarche (<12 years), late menopause (>55 years), nulliparity, HRT use, obesity post-menopause, alcohol consumption."),
    ("SubSaharan_Context",
     "Sub-Saharan Africa: Uganda median breast cancer diagnosis age is 42 years. Over 80% present at Stage III-IV. 5-year survival is below 40%. Community health worker programmes and mobile screening units have improved early detection rates."),
    ("Histopathology",
     "Histopathological types: IDC (invasive ductal carcinoma) is most common (70-80%). Grade 1 (well-differentiated) has better prognosis than Grade 3. Ki-67 >20% indicates high proliferative activity. ER/PR/HER2 receptor status guides adjuvant therapy selection."),
    ("Patient_Counselling",
     "Post-diagnosis counselling: Provide immediate psychological support, information about diagnosis and treatment options in accessible language. Facilitate shared decision-making, including fertility preservation for premenopausal women."),
    ("BIRADS",
     "BI-RADS classification: Category 3 (probably benign — 6-month follow-up), Category 4 (suspicious — biopsy recommended), Category 5 (highly suspicious >95% malignancy — biopsy required). Irregular margins and posterior acoustic shadowing are suspicious ultrasound features."),
    ("Benign_Management",
     "Benign breast lesions: Fibroadenomas are well-defined, mobile, non-tender masses. Management: clinical follow-up at 3-6 months, biopsy if >2cm or rapidly growing. Fibrocystic changes require reassurance and symptomatic management. Routine excision not indicated for simple benign lesions."),
]

try:
    if os.path.exists(VEC_DB_DIR) and os.listdir(VEC_DB_DIR):
        vectorstore = FAISS.load_local(VEC_DB_DIR, embeddings, allow_dangerous_deserialization=True)
        print(f"✅ FAISS vector DB loaded from {VEC_DB_DIR}")
    else:
        raise FileNotFoundError("No local vector DB found")
except Exception:
    print("Building FAISS from fallback corpus...")
    docs = [Document(page_content=text, metadata={"source": title})
            for title, text in FALLBACK_CORPUS]
    vectorstore = FAISS.from_documents(docs, embeddings)
    print(f"✅ FAISS built from {len(FALLBACK_CORPUS)}-document fallback corpus")


def rag_retrieve_and_format(query, cancer_detected, cancer_prob, top_k=5):
    """Retrieve relevant guidelines and format as a structured recommendation."""
    try:
        results = vectorstore.similarity_search_with_score(query, k=top_k)
    except Exception:
        results = [(d, 1.0) for d in vectorstore.similarity_search(query, k=top_k)]

    selected = [(doc, sc) for doc, sc in results if sc >= 0.3]
    if not selected:
        selected = results[:3]

    lines   = []
    sources = []
    for doc, sc in selected:
        src = doc.metadata.get("source", "unknown")
        sources.append(src)
        lines.append(f"• [{src}]: {doc.page_content[:300]}...")

    finding = "MALIGNANCY SUSPECTED" if cancer_detected else "BENIGN FINDING"
    conf    = f"{cancer_prob:.1%}"

    if cancer_detected:
        actions = (
            "1. Urgent referral to breast oncology specialist\n"
            "2. Core needle biopsy for histopathological confirmation\n"
            "3. Triple assessment: clinical exam + imaging + pathology\n"
            "4. Staging workup if biopsy confirms malignancy\n"
            "5. Patient counselling and psychosocial support"
        )
    else:
        actions = (
            "1. Routine clinical breast examination at 6-12 months\n"
            "2. Patient education on breast self-examination\n"
            "3. Review and address modifiable risk factors\n"
            "4. Reassurance with documentation of benign finding"
        )

    recommendation = (
        f"AI Finding: {finding} (Confidence: {conf})\n\n"
        f"Recommended Clinical Actions:\n{actions}\n\n"
        f"Supporting Guideline Evidence:\n" + "\n".join(lines) + "\n\n"
        f"Sources cited: {', '.join(dict.fromkeys(sources))}"
    )
    return recommendation, list(dict.fromkeys(sources))

# ─── 8. Grad-CAM ─────────────────────────────────────────────────────────────
def get_last_conv_name(model):
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
        if hasattr(layer, "layers"):
            for sub in reversed(layer.layers):
                if isinstance(sub, tf.keras.layers.Conv2D):
                    return sub.name
    return None

def compute_gradcam(model, img_batch, glcm_batch, risk_batch, class_idx):
    """GradientTape Grad-CAM — returns heatmap numpy array."""
    last_conv = get_last_conv_name(model)
    if last_conv is None:
        return None
    try:
        # Try building grad_model with full model's conv layer
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(last_conv).output, model.output]
        )
        with tf.GradientTape() as tape:
            conv_out, preds = grad_model([img_batch, glcm_batch, risk_batch])
            loss = preds[:, class_idx]
        grads      = tape.gradient(loss, conv_out)
        pooled_g   = tf.reduce_mean(grads, axis=(1, 2)).numpy()
        conv_np    = conv_out.numpy()
        cam        = np.zeros(conv_np.shape[1:3], dtype=np.float32)
        for j, w in enumerate(pooled_g[0]):
            cam += w * conv_np[0, :, :, j]
        cam = np.maximum(cam, 0)
        if cam.max() != 0:
            cam = cam / cam.max()
        return cam
    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None

def overlay_heatmap(orig_rgb_uint8, heatmap):
    h = cv2.resize(heatmap, (orig_rgb_uint8.shape[1], orig_rgb_uint8.shape[0]))
    colored  = cv2.applyColorMap((h * 255).astype(np.uint8), cv2.COLORMAP_JET)
    overlay  = cv2.addWeighted(orig_rgb_uint8, 0.6, colored, 0.4, 0)
    return cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)

# ─── 9. Full inference pipeline ──────────────────────────────────────────────
def run_inference(image, age, symptom_dur, fam_hist, repro_hist, query):
    """End-to-end inference: preprocess → HGLCM → CNN → RF → RAG → report."""
    if image is None:
        return ("⚠️ Please upload a histopathology image to proceed.", None)
    if hybrid_model is None:
        return ("❌ Model not loaded. Check that hybrid_model.keras is in the models/ folder.", None)

    try:
        t0 = time.time()

        # ── Preprocess image ─────────────────────────────────────────────────
        img_norm, orig_rgb = preprocess_image(image)

        # Apply same pixel standardisation as training
        img_std = (img_norm - pixel_mean) / (pixel_std + 1e-7)

        # ── HGLCM features ───────────────────────────────────────────────────
        glcm_raw = hg_extractor.extract(img_norm).reshape(1, -1)
        if glcm_scaler is not None:
            glcm_sc = glcm_scaler.transform(glcm_raw)
        else:
            glcm_sc = glcm_raw
        # Pad/trim to model's expected dim
        if glcm_sc.shape[1] < GLCM_DIM_INFERRED:
            glcm_sc = np.pad(glcm_sc, ((0,0),(0, GLCM_DIM_INFERRED - glcm_sc.shape[1])))
        elif glcm_sc.shape[1] > GLCM_DIM_INFERRED:
            glcm_sc = glcm_sc[:, :GLCM_DIM_INFERRED]

        # ── Risk vector ──────────────────────────────────────────────────────
        fh_val = 1 if fam_hist == "Yes" else 0
        patient_dict = {"age": [float(age)], "symptom_duration_weeks": [float(symptom_dur)],
                        "family_history": [fh_val]}

        import pandas as pd
        patient_df = pd.DataFrame(patient_dict)

        scaled_parts  = []
        encoded_parts = []

        if risk_scaler is not None:
            _num_cols = [c for c in ["age", "symptom_duration_weeks"] if c in patient_df.columns]
            if _num_cols:
                # Only transform cols the scaler was fitted on
                try:
                    scaled_parts.append(risk_scaler.transform(patient_df[_num_cols]))
                except Exception:
                    scaled_parts.append(patient_df[_num_cols].values)

        if risk_encoder is not None:
            _cat_cols = [c for c in ["family_history", "reproductive_history"]
                         if c in patient_df.columns]
            rh_map = {"Normal": 0, "Early Menarche": 1, "Nulliparous": 2}
            patient_df["reproductive_history"] = rh_map.get(repro_hist, 0)
            _cat_cols = [c for c in ["family_history","reproductive_history"] if c in patient_df.columns]
            if _cat_cols:
                try:
                    encoded_parts.append(risk_encoder.transform(patient_df[_cat_cols]))
                except Exception:
                    encoded_parts.append(patient_df[_cat_cols].values.astype(float))

        all_parts = scaled_parts + encoded_parts
        if all_parts:
            risk_vec = np.concatenate(all_parts, axis=1).astype(np.float32)
        else:
            risk_vec = np.array([[float(age)/85.0, float(symptom_dur)/52.0,
                                   float(fh_val), 0.0]], dtype=np.float32)

        # Pad/trim to model dim
        if risk_vec.shape[1] < RISK_DIM_INFERRED:
            risk_vec = np.pad(risk_vec, ((0,0),(0, RISK_DIM_INFERRED - risk_vec.shape[1])))
        elif risk_vec.shape[1] > RISK_DIM_INFERRED:
            risk_vec = risk_vec[:, :RISK_DIM_INFERRED]

        # ── CNN inference ────────────────────────────────────────────────────
        img_batch  = img_std[np.newaxis, ...]
        glcm_batch = glcm_sc
        risk_batch = risk_vec

        cancer_prob     = float(hybrid_model.predict(
            [img_batch, glcm_batch, risk_batch], verbose=0).ravel()[0])
        cancer_detected = cancer_prob > OPTIMAL_THRESHOLD

        # ── RAG recommendation ────────────────────────────────────────────────
        rag_text, sources = rag_retrieve_and_format(
            query, cancer_detected, cancer_prob)

        # ── Build report ──────────────────────────────────────────────────────
        status  = "🔴 MALIGNANCY SUSPECTED" if cancer_detected else "🟢 BENIGN"
        latency = time.time() - t0

        report = (
            f"{'='*60}\n"
            f"BREAST CANCER SCREENING AI — CLINICAL REPORT\n"
            f"Makerere University | Group 11\n"
            f"{'='*60}\n\n"
            f"AI FINDING     : {status}\n"
            f"PROBABILITY    : {cancer_prob:.2%}\n"
            f"THRESHOLD USED : {OPTIMAL_THRESHOLD:.3f}\n"
            f"INFERENCE TIME : {latency:.2f}s\n\n"
            f"PATIENT PROFILE:\n"
            f"  Age                  : {age} years\n"
            f"  Symptom duration     : {symptom_dur} weeks\n"
            f"  Family history       : {fam_hist}\n"
            f"  Reproductive history : {repro_hist}\n\n"
            f"GUIDELINE-GROUNDED RECOMMENDATION:\n"
            f"{rag_text}\n\n"
            f"{'='*60}\n"
            f"⚠️  DISCLAIMER: Decision support only.\n"
            f"All outputs must be reviewed by a qualified clinician.\n"
            f"Confirm with CBE, imaging, and biopsy as appropriate.\n"
            f"{'='*60}"
        )

        # ── Grad-CAM ─────────────────────────────────────────────────────────
        heatmap = compute_gradcam(
            hybrid_model, img_batch, glcm_batch, risk_batch, int(cancer_detected))
        if heatmap is not None:
            overlay = overlay_heatmap(orig_rgb, heatmap)
        else:
            overlay = orig_rgb

        gc.collect()
        return report, overlay

    except Exception as e:
        return (f"❌ Inference error:\n{str(e)}\n\n{traceback.format_exc()}", None)

# ─── 10. Gradio UI ───────────────────────────────────────────────────────────
with gr.Blocks(
    theme=gr.themes.Soft(primary_hue="blue", secondary_hue="slate"),
    title="Uganda Breast Cancer AI Screening Assistant"
) as demo:

    gr.Markdown("""
    # 🩺 Breast Cancer Screening AI Assistant — Uganda
    **Makerere University | Group 11 | Supervisor: Dr. Emmanuel Lule**
    Integrates **EfficientNetB3 CNN + HGLCM texture features + Clinical Risk Prediction**
    grounded in WHO, Uganda MoH, and NCCN clinical guidelines.
    > ⚠️ **For clinical decision support only. All results must be reviewed by a qualified clinician.**
    """)

    with gr.Row():
        # ── Left: Inputs ──────────────────────────────────────────────────────
        with gr.Column(scale=1):
            gr.Markdown("### 📋 Patient Information & Image")

            inp_image = gr.Image(
                label="Upload Histopathology Image (PNG/JPG)",
                type="numpy",
                height=250
            )

            with gr.Row():
                inp_age    = gr.Slider(18, 90, value=45, step=1,
                                       label="Patient Age (years)")
                inp_dur    = gr.Slider(0.0, 52.0, value=4.0, step=0.5,
                                       label="Symptom Duration (weeks)")

            with gr.Row():
                inp_fam    = gr.Dropdown(["No", "Yes"], value="No",
                                          label="Family History of Breast Cancer?")
                inp_repro  = gr.Dropdown(
                    ["Normal", "Early Menarche", "Nulliparous"],
                    value="Normal", label="Reproductive History")

            inp_query = gr.Textbox(
                label="Clinical Query for Guideline Retrieval",
                value="What are the recommended next steps for this patient?",
                lines=2
            )

            run_btn = gr.Button("🔍 Run AI Assessment", variant="primary", size="lg")

            gr.Markdown("**Example cases — click to load:**")
            gr.Examples(
                examples=[
                    [None, 52, 12, "Yes", "Nulliparous",
                     "What are the recommended referral and biopsy guidelines?"],
                    [None, 35, 4,  "No",  "Normal",
                     "What routine screening schedule is recommended?"],
                    [None, 64, 20, "Yes", "Early Menarche",
                     "What treatment options exist for this patient?"],
                ],
                inputs=[inp_image, inp_age, inp_dur, inp_fam, inp_repro, inp_query],
                label="Example Scenarios"
            )

        # ── Right: Outputs ────────────────────────────────────────────────────
        with gr.Column(scale=1):
            gr.Markdown("### 📊 AI Assessment Results")

            with gr.Tabs():
                with gr.Tab("📄 Clinical Report"):
                    out_report = gr.Textbox(
                        label="Guideline-Grounded Clinical Decision Support Report",
                        lines=28,
                        show_copy_button=True
                    )
                with gr.Tab("🔬 Grad-CAM Explanation"):
                    out_heatmap = gr.Image(
                        label="Tissue Attention Map (Red = most influential region)",
                        height=350
                    )
                    gr.Markdown("""
                    **Reading the Grad-CAM heatmap:**
                    - 🔴 **Red / Yellow** = Regions most influential in the AI decision
                    - 🔵 **Blue** = Less influential regions
                    - The attention should focus on cell nuclei, tissue patterns, and glandular structures
                    """)

    run_btn.click(
        fn=run_inference,
        inputs=[inp_image, inp_age, inp_dur, inp_fam, inp_repro, inp_query],
        outputs=[out_report, out_heatmap]
    )

    gr.Markdown("""
    ---
    **System:** EfficientNetB3 (ImageNet → fine-tuned) + Haralick GLCM texture fusion + Random Forest risk stratification + FAISS RAG pipeline
    **References:** WHO Breast Cancer Guidelines 2022 · Uganda MoH Cancer Guidelines 2020 · NCCN Guidelines v2024 · CDC Breast Cancer Risk Assessment
    """)

if __name__ == "__main__":
    demo.launch()