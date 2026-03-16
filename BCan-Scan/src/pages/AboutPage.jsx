import { FiUsers, FiUser } from 'react-icons/fi';
import styles from '../styles/AboutPage.module.css';

export default function AboutPage() {
  const team = [
    {
      name: 'Karungi Maria Daphine',
      email: 'daphinewanyama@gmail.com',
    },
    {
      name: 'Apio Diane',
      email: 'apiodianne@gmail.com',
    },
    {
      name: 'Rwothomio Jonathan',
      email: 'jonahbst@gmail.com',
    },
    {
      name: 'Mutsaka Emmason',
      email: 'mutsakaemmason@gmail.com',
    },
  ];

  return (
    <div className={styles.aboutPage}>
      <header className={styles.aboutHeader}>
        <h1 className={styles.aboutTitle}>About BreastGuard AI</h1>
        <p className={styles.aboutIntro}>
          BreastGuard AI is a final year Computer Science project developed at Makerere University,
          College of Computing and Information Sciences. It demonstrates the practical use of AI in
          breast cancer screening and early detection support.
        </p>
      </header>

      <section className={styles.missionBand}>
        <p>
          <strong>Our Mission:</strong> Provide accessible and intelligent screening support tools,
          assist clinicians with evidence-based AI insights, and improve awareness through clear,
          conversational guidance.
        </p>
      </section>

      <section className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featuresGrid}>
          <article className={styles.featureTile}>
            <h4>Risk Assessment</h4>
            <p>Predicts breast cancer risk using clinical and lifestyle factors.</p>
          </article>
          <article className={styles.featureTile}>
            <h4>Image Analysis</h4>
            <p>Classifies uploaded histopathology images with confidence scores.</p>
          </article>
          <article className={styles.featureTile}>
            <h4>AI Assistant</h4>
            <p>Provides educational guidance and answers screening-related questions.</p>
          </article>
          <article className={styles.featureTile}>
            <h4>History Tracking</h4>
            <p>Stores previous sessions for progress review and comparison over time.</p>
          </article>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}><FiUsers /> Project Team</h2>
        <div className={styles.teamGrid}>
          {team.map((member, idx) => (
            <article key={idx} className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <FiUser size={24} />
              </div>
              <p className={styles.teamName}>{member.name}</p>
              <a href={`mailto:${member.email}`} className={styles.teamEmail}>
                {member.email}
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
