const About = () => {
    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">About SmartCity</h1>
            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <h2>Our Mission</h2>
                <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                    The SmartCity platform is designed to empower citizens by providing an easy and efficient way to report local issues,
                    track their resolution, and stay updated on community improvements. Our goal is to foster a collaborative environment
                    between residents and city administration to build better, safer, and cleaner neighborhoods.
                </p>
                <h3 style={{ marginTop: '2rem' }}>How It Works</h3>
                <ul style={{ marginTop: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                    <li><strong>Report:</strong> Snap a photo and provide details of the issue you encountered.</li>
                    <li><strong>Engage:</strong> Upvote issues reported by others in your neighborhood to increase their priority.</li>
                    <li><strong>Track:</strong> Monitor the status of your reported issues from pending to resolved.</li>
                </ul>
            </div>
        </div>
    );
};

export default About;
