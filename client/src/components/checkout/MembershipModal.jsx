import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { X, Check, CreditCard, ShieldCheck, Zap, Video } from 'lucide-react';

export default function MembershipModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { upgradeMembership } = useUserStore();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg("");
    
    // Simulate payment processing delay for UX realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    const successResponse = await upgradeMembership();
    setLoading(false);

    if (successResponse) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } else {
      setErrorMsg("Payment declined or an error occurred. Please try again.");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px'
    }}>
      <div 
        className="animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {!success && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={24} />
          </button>
        )}

        {success ? (
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Payment Successful!</h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Welcome to Premium. All advanced modules are now unlocked.</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--color-brand-light)', padding: '40px 32px 32px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>SignSync Premium</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '48px', fontWeight: '900', color: 'var(--color-brand)', lineHeight: 1 }}>₱499</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-brand)' }}>.00</span>
                <span style={{ color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>/ month</span>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ color: '#10b981', marginTop: '2px' }}><Check size={20} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>Unlock All Advanced Courses</strong>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Master complex grammar, conversational phrases, and idioms.</span>
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ color: '#10b981', marginTop: '2px' }}><Zap size={20} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>Priority AI Tracking</strong>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Lower latency and higher framerates in the Practice Room.</span>
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ color: '#10b981', marginTop: '2px' }}><Video size={20} /></div>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>HD Demo Videos</strong>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Crystal clear 1080p reference videos from deaf instructors.</span>
                  </div>
                </li>
              </ul>

              {errorMsg && (
                <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', marginBottom: '24px', textAlign: 'center', border: '1px solid #fecaca' }}>
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--color-brand)',
                  color: '#fff',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.8 : 1,
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                }}
              >
                {loading ? (
                  <>Processing Payment...</>
                ) : (
                  <><CreditCard size={20} /> Confirm Payment</>
                )}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', marginTop: '16px' }}>
                <ShieldCheck size={14} /> Secure, simulated transaction
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
