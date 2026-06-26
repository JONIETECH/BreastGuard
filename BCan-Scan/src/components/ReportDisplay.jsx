export default function ReportDisplay({ result }) {
  if (!result) return null;

  const isMalignant = result.classification === 'Malignant';
  const color = isMalignant ? '#dc2626' : '#16a34a';
  const bg = isMalignant ? 'rgba(220,38,38,0.07)' : 'rgba(22,163,74,0.07)';
  const border = isMalignant ? 'rgba(220,38,38,0.22)' : 'rgba(22,163,74,0.22)';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {/* PRINT BUTTON */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button
          onClick={() => window.print()}
          style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', borderRadius:'0.75rem', border:'1px solid #e5e7eb', backgroundColor:'white', color:'#374151', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}
        >
          🖨️ Print / Save Report
        </button>
      </div>

      {/* VERDICT */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1.1rem', borderRadius:'1rem', backgroundColor:bg, border:`2px solid ${border}`, flexWrap:'wrap' }}>
        <span style={{ fontSize:'2.4rem' }}>{isMalignant ? '🔴' : '🟢'}</span>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontWeight:800, fontSize:'1.2rem', color, letterSpacing:'0.02em' }}>
            {isMalignant ? 'MALIGNANCY SUSPECTED' : 'BENIGN FINDING'}
          </p>
          <p style={{ margin:'0.3rem 0 0', color:'#374151', fontSize:'0.9rem' }}>
            AI Confidence: <strong style={{ color }}>{result.confidence}%</strong>
          </p>
        </div>
        <div style={{ backgroundColor:color, color:'white', fontWeight:800, fontSize:'1.3rem', padding:'0.5rem 1rem', borderRadius:'999px' }}>
          {result.confidence}%
        </div>
      </div>

      {/* URGENCY */}
      {result.urgency && (
        <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-start', padding:'0.9rem 1rem', borderRadius:'0.8rem', backgroundColor:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)' }}>
          <span style={{ fontSize:'1.3rem' }}>⚡</span>
          <div>
            <p style={{ margin:0, fontSize:'0.75rem', fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.07em' }}>Urgency Level</p>
            <p style={{ margin:'0.2rem 0 0', color:'#78350f', fontWeight:600, fontSize:'0.95rem' }}>{result.urgency}</p>
          </div>
        </div>
      )}

      {/* AGE NOTE */}
      {result.ageNote && (
        <div style={{ padding:'0.8rem 1rem', borderRadius:'0.8rem', backgroundColor:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)' }}>
          <p style={{ margin:0, color:'#1e40af', fontSize:'0.88rem' }}>{result.ageNote}</p>
        </div>
      )}

      {/* RECOMMENDED ACTIONS */}
      {result.actions?.length > 0 && (
        <div style={{ padding:'1rem', borderRadius:'0.9rem', backgroundColor:'#f9fafb', border:'1px solid #e5e7eb' }}>
          <p style={{ margin:'0 0 0.25rem', fontWeight:700, color:'#111827', fontSize:'0.95rem' }}>📋 Recommended Clinical Actions</p>
          <p style={{ margin:'0 0 0.85rem', color:'#6b7280', fontSize:'0.82rem' }}>Next steps based on WHO, Uganda MoH, and NCCN 2024 guidelines.</p>
          <ol style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
            {result.actions.map((a, i) => (
              <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.7rem', fontSize:'0.92rem', color:'#1f2937', lineHeight:1.55 }}>
                <span style={{ backgroundColor:color, color:'white', fontWeight:800, fontSize:'0.75rem', width:'1.6rem', height:'1.6rem', borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'0.1rem' }}>{i+1}</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* HGLCM TEXTURE */}
      {result.hglcmFeatures?.length > 0 && (
        <div style={{ padding:'1rem', borderRadius:'0.9rem', backgroundColor:'#f9fafb', border:'1px solid #e5e7eb' }}>
          <p style={{ margin:'0 0 0.25rem', fontWeight:700, color:'#111827', fontSize:'0.95rem' }}>🔬 Tissue Texture Analysis (HGLCM)</p>
          <p style={{ margin:'0 0 0.85rem', color:'#6b7280', fontSize:'0.82rem' }}>Haralick texture features measure microscopic tissue patterns. Irregular patterns may indicate cancer.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.55rem', marginBottom:'0.8rem' }}>
            {result.hglcmFeatures.map((f, i) => (
              <div key={i} style={{ padding:'0.7rem', borderRadius:'0.7rem', backgroundColor:'white', border:'1px solid #e5e7eb' }}>
                <p style={{ margin:0, fontWeight:700, color:'#374151', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.name}</p>
                <p style={{ margin:'0.2rem 0', fontWeight:800, color:'#111827', fontSize:'1.05rem' }}>{f.value}</p>
                <p style={{ margin:0, color:'#6b7280', fontSize:'0.75rem', lineHeight:1.4 }}>{f.interpretation}</p>
              </div>
            ))}
          </div>
          {result.textureInterpretation && (
            <div style={{ padding:'0.75rem', borderRadius:'0.7rem', backgroundColor:'white', border:'1px solid #e5e7eb' }}>
              <p style={{ margin:0, color:'#374151', fontSize:'0.87rem', lineHeight:1.7 }}>{result.textureInterpretation}</p>
            </div>
          )}
        </div>
      )}

      {/* PATIENT RISK PROFILE */}
      {result.riskProfile && (
        <div style={{ padding:'1rem', borderRadius:'0.9rem', backgroundColor:'#f9fafb', border:'1px solid #e5e7eb' }}>
          <p style={{ margin:'0 0 0.25rem', fontWeight:700, color:'#111827', fontSize:'0.95rem' }}>👤 Patient Risk Profile</p>
          <p style={{ margin:'0 0 0.75rem', color:'#6b7280', fontSize:'0.82rem' }}>Patient-specific risk factors considered alongside the image analysis.</p>
          <div style={{ padding:'0.75rem', borderRadius:'0.7rem', backgroundColor:'white', border:'1px solid #e5e7eb' }}>
            {result.riskProfile.split('\n').filter(l=>l.trim()).map((l,i)=>(
              <p key={i} style={{ margin:'0.2rem 0', color:'#374151', fontSize:'0.87rem', lineHeight:1.6 }}>{l.trim()}</p>
            ))}
          </div>
        </div>
      )}

      {/* AI REASONING */}
      {result.reasoning && (
        <div style={{ padding:'1rem', borderRadius:'0.9rem', backgroundColor:'#f9fafb', border:'1px solid #e5e7eb' }}>
          <p style={{ margin:'0 0 0.25rem', fontWeight:700, color:'#111827', fontSize:'0.95rem' }}>🧠 How the AI Reached This Decision</p>
          <p style={{ margin:'0 0 0.75rem', color:'#6b7280', fontSize:'0.82rem' }}>Plain-language explanation of what the AI analysed.</p>
          <div style={{ padding:'0.75rem', borderRadius:'0.7rem', backgroundColor:'white', border:'1px solid #e5e7eb' }}>
            {result.reasoning.split('\n').filter(l=>l.trim()).map((l,i)=>(
              <p key={i} style={{ margin:'0.2rem 0', color:'#374151', fontSize:'0.87rem', lineHeight:1.6 }}>{l.trim()}</p>
            ))}
          </div>
        </div>
      )}

      {/* GUIDELINES */}
      {result.guidelines?.length > 0 && (
        <div style={{ padding:'1rem', borderRadius:'0.9rem', backgroundColor:'#f9fafb', border:'1px solid #e5e7eb' }}>
          <p style={{ margin:'0 0 0.25rem', fontWeight:700, color:'#111827', fontSize:'0.95rem' }}>📚 Supporting Medical Guidelines</p>
          <p style={{ margin:'0 0 0.75rem', color:'#6b7280', fontSize:'0.82rem' }}>WHO · Uganda Ministry of Health · Uganda Cancer Institute · NCCN 2024</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
           {result.guidelines.map((g,i)=>{
              const srcMatch = g.match(/^\[([^\]]+)\]:\s*/);
              const source = srcMatch ? srcMatch[1].replace(/_/g,' ') : '';
              const text = srcMatch ? g.replace(srcMatch[0],'') : g;
              return (
                <div key={i} style={{ display:'flex', gap:'0.6rem', alignItems:'flex-start', padding:'0.7rem 0.75rem', borderRadius:'0.6rem', backgroundColor:'white', border:'1px solid #e5e7eb' }}>
                  <span style={{ color:'#6366f1', fontWeight:700, flexShrink:0 }}>▸</span>
                  <div>
                    {source && <p style={{ margin:'0 0 0.2rem', fontWeight:700, color:'#4f46e5', fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{source}</p>}
                    <p style={{ margin:0, color:'#374151', fontSize:'0.84rem', lineHeight:1.6 }}>{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', padding:'0.9rem 1rem', borderRadius:'0.8rem', backgroundColor:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)' }}>
        <span style={{ fontSize:'1.1rem', flexShrink:0 }}>⚠️</span>
        <p style={{ margin:0, color:'#7f1d1d', fontSize:'0.84rem', lineHeight:1.6 }}>
          <strong>Clinical Decision Support Only.</strong> This AI output must be reviewed by a qualified clinician. Confirm findings with clinical breast examination, imaging, and biopsy as appropriate. Do not make treatment decisions based on AI output alone.
        </p>
      </div>

    </div>
  );
}
