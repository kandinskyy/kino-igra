import React, { useState } from 'react';
import { copyText } from '../utils/clipboard';

/**
 * Премиальный промо-баннер официальной партнерки онлайн-кинотеатра Okko.
 * Поддерживает кастомную реферальную ссылку через .env (VITE_OKKO_PARTNER_URL)
 * или проп partnerUrl, а также копирование промокода в буфер обмена.
 */
export default function OkkoBanner({
    partnerUrl = import.meta.env.VITE_OKKO_PARTNER_URL || 'https://okko.tv/',
    promoCode = import.meta.env.VITE_OKKO_PROMO_CODE || 'FILM30',
    maxWidth = '780px',
    style = {}
}) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = (e) => {
        e.stopPropagation();
        copyText(promoCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
    };

    const handleBannerClick = () => {
        window.open(partnerUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            style={{
                width: '100%',
                maxWidth: maxWidth,
                margin: '1.4rem auto 0.8rem',
                ...style
            }}
        >
            <div
                onClick={handleBannerClick}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    padding: '1.2rem 1.6rem',
                    background: 'linear-gradient(135deg, rgba(38, 12, 68, 0.78) 0%, rgba(16, 7, 34, 0.88) 60%, rgba(8, 4, 18, 0.94) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.38)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.55), 0 0 25px rgba(147, 51, 234, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.2rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.65)';
                    e.currentTarget.style.boxShadow = '0 16px 45px rgba(0, 0, 0, 0.65), 0 0 35px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.38)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.55), 0 0 25px rgba(147, 51, 234, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {/* Декоративное неоновое фиолетовое свечение на фоне */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-40%',
                        left: '-20%',
                        width: '320px',
                        height: '240px',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.32) 0%, transparent 70%)',
                        filter: 'blur(35px)',
                        pointerEvents: 'none'
                    }}
                />

                {/* Левая часть: логотип Okko и текстовое предложение */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 1, flex: '1 1 300px' }}>
                    {/* Логотип Okko */}
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 0 18px rgba(124, 58, 237, 0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <span style={{ fontSize: '1.45rem', lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))' }}>
                            🎬
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px', marginTop: '2px' }}>
                            OKKO
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                                style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(168, 85, 247, 0.25)',
                                    color: '#e9d5ff',
                                    border: '1px solid rgba(192, 132, 252, 0.35)'
                                }}
                            >
                                Кинотеатр Okko
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)' }}>18+</span>
                        </div>

                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                            30 дней подписки Okko всего за <span style={{ color: '#c084fc', textShadow: '0 0 14px rgba(192, 132, 252, 0.75)' }}>1 ₽</span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.3 }}>
                            Тысячи фильмов, сериалов и новинок кино в Full HD без рекламы
                        </div>
                    </div>
                </div>

                {/* Правая часть: кнопка перехода и промокод */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 1, flexWrap: 'wrap' }}>
                    {promoCode && (
                        <button
                            type="button"
                            onClick={handleCopyCode}
                            title="Нажмите, чтобы скопировать промокод"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                background: copied ? 'rgba(34, 197, 94, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                                border: copied ? '1px solid #22c55e' : '1px dashed rgba(192, 132, 252, 0.5)',
                                color: copied ? '#4ade80' : '#f3e8ff',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-main)',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{copied ? '✓' : '🎟️'}</span>
                            <span>{copied ? 'СКОПИРОВАН!' : promoCode}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBannerClick();
                        }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#ffffff',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-main)',
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: '0 4px 18px rgba(147, 51, 234, 0.5)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.04)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(168, 85, 247, 0.7)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 18px rgba(147, 51, 234, 0.5)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)';
                        }}
                    >
                        <span>Забрать 30 дней</span>
                        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>➔</span>
                    </button>
                </div>
            </div>

            {/* Юридическая маркировка рекламы в соответствии с 347-ФЗ */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '4px 8px 0',
                    fontSize: '0.66rem',
                    color: 'rgba(255, 255, 255, 0.35)',
                    letterSpacing: '0.3px'
                }}
            >
                Реклама. ООО «Окко», ОГРН 1167847381130. 18+
            </div>
        </div>
    );
}
