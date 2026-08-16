import { PhoneCall, Mail, AlertTriangle } from 'lucide-react';

const Helpline = () => {
    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Helpline & Support</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Emergency Contact */}
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <AlertTriangle size={24} />
                        <h2 style={{ margin: 0 }}>Emergency Support</h2>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>For immediate life-threatening emergencies, please contact the national emergency services.</p>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>112</div>
                </div>

                {/* City Administration */}
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <PhoneCall size={24} />
                        <h2 style={{ margin: 0 }}>City Administration</h2>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>For general inquiries related to city services and public works.</p>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>1800-XXXX-XXXX</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+91 998-123-4567</div>
                </div>

                {/* Technical Support */}
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                        <Mail size={24} />
                        <h2 style={{ margin: 0 }}>App Support</h2>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Issues with the UrbanEye app? Contact our technical team.</p>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>support@UrbanEye.gov</div>
                    <div style={{ color: 'var(--color-text-muted)' }}>Response time: 24-48 hours</div>
                </div>

            </div>
        </div>
    );
};

export default Helpline;
