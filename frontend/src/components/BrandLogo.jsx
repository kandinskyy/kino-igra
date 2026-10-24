import React from 'react';

/**
 * Векторные четкие SVG-логотипы партнеров в едином премиальном формате (44x44).
 * Без размытых эмодзи и без сплюснутых мелких надписей.
 */
export default function BrandLogo({ id, glowColor, btnGradient }) {
    return (
        <div
            style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: btnGradient || 'linear-gradient(135deg, #222 0%, #111 100%)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: `0 4px 14px ${glowColor || 'rgba(0, 0, 0, 0.4)'}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}
        >
            {id === 'foodband' && (
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C16.5 2 20.2 3.3 21.4 4.1C21.7 4.3 21.8 4.7 21.6 5L12.5 22C12.3 22.3 11.7 22.3 11.5 22L2.4 5C2.2 4.7 2.3 4.3 2.6 4.1C3.8 3.3 7.5 2 12 2Z" fill="#ffedd5" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />
                    <circle cx="10" cy="8.5" r="1.8" fill="#ea580c" />
                    <circle cx="14" cy="13" r="1.6" fill="#ea580c" />
                    <circle cx="12" cy="7" r="1.1" fill="#ea580c" />
                </svg>
            )}
            {id === 'dominos' && (
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <g transform="rotate(-18 16 16)">
                        <rect x="7" y="3.5" width="18" height="12" rx="2.5" fill="#e31837" stroke="#ffffff" strokeWidth="0.8" />
                        <circle cx="16" cy="9.5" r="2.2" fill="#ffffff" />
                        <rect x="7" y="16.5" width="18" height="12" rx="2.5" fill="#0078ae" stroke="#ffffff" strokeWidth="0.8" />
                        <circle cx="12" cy="22.5" r="1.9" fill="#ffffff" />
                        <circle cx="20" cy="22.5" r="1.9" fill="#ffffff" />
                    </g>
                </svg>
            )}
            {id === 'aviasales' && (
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="#ffffff" />
                </svg>
            )}
            {id === 'aliexpress' && (
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path d="M7 8V6C7 3.79 8.79 2 11 2H13C15.21 2 17 3.79 17 6V8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4.5 8H19.5L18.4 20.2C18.3 21.2 17.5 22 16.5 22H7.5C6.5 22 5.7 21.2 5.6 20.2L4.5 8Z" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 13C10 14.8 14 14.8 15 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )}
        </div>
    );
}
