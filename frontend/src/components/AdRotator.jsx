import React, { useState, useEffect } from 'react';
import { copyText } from '../utils/clipboard';
import { AD_OFFERS } from '../config/adsConfig';

/**
 * Fisher-Yates перемешивание массива индексов.
 * Если передан prevLastIndex и элементов > 1, гарантирует, что первый элемент
 * нового цикла не совпадает с последним элементом прошлого цикла (исключая повтор подряд).
 */
function createShuffledDeck(length, prevLastIndex = null) {
    if (length <= 1) return [0];
    const deck = Array.from({ length }, (_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (prevLastIndex !== null && deck[0] === prevLastIndex) {
        const swapIdx = Math.floor(Math.random() * (length - 1)) + 1;
        [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
    }
    return deck;
}

// Глобальная колода, обеспечивающая непрерывный честный цикл без повторов между экранами
let globalDeck = null;
let globalDeckIndex = 0;

function getNextOfferIndex() {
    if (!AD_OFFERS.length) return 0;
    if (AD_OFFERS.length === 1) return 0;

    // Если колода еще не создана, устарела по размеру или закончился текущий цикл
    if (!globalDeck || globalDeck.length !== AD_OFFERS.length || globalDeckIndex >= globalDeck.length) {
        const lastIndex = globalDeck && globalDeck.length === AD_OFFERS.length 
            ? globalDeck[globalDeck.length - 1] 
            : null;
        globalDeck = createShuffledDeck(AD_OFFERS.length, lastIndex);
        globalDeckIndex = 0;
    }

    const nextIdx = globalDeck[globalDeckIndex];
    globalDeckIndex++;
    return nextIdx;
}

/**
 * Ротатор рекламных партнерских баннеров.
 * Показывает предложения в случайном порядке полными циклами:
 * каждый оффер гарантированно показывается 1 раз за цикл без повторений.
 */
export default function AdRotator({
    maxWidth = '780px',
    style = {},
    rotationInterval = 14000,
    fixedOfferId = null
}) {
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (fixedOfferId) {
            const found = AD_OFFERS.findIndex(o => o.id === fixedOfferId);
            return found !== -1 ? found : 0;
        }
        return getNextOfferIndex();
    });
    const [copied, setCopied] = useState(false);
    const [isFading, setIsFading] = useState(false);

    // Автоматическая ротация: случайный полный цикл без повторов
    useEffect(() => {
        if (AD_OFFERS.length <= 1 || fixedOfferId) return;

        const timer = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentIndex(getNextOfferIndex());
                setIsFading(false);
            }, 300);
        }, rotationInterval);

        return () => clearInterval(timer);
    }, [rotationInterval, fixedOfferId]);

    const offer = AD_OFFERS[currentIndex] || AD_OFFERS[0];
    if (!offer) return null;

    const handleCopyCode = (e) => {
        e.stopPropagation();
        if (!offer.promoCode) return;
        copyText(offer.promoCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
        if (offer.url) {
            window.open(offer.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleBannerClick = () => {
        if (offer.url) {
            window.open(offer.url, '_blank', 'noopener,noreferrer');
        }
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
                    background: offer.gradient || 'linear-gradient(135deg, rgba(20, 20, 30, 0.85) 0%, rgba(10, 10, 16, 0.94) 100%)',
                    border: `1px solid ${offer.borderColor || 'rgba(255, 255, 255, 0.2)'}`,
                    boxShadow: `0 12px 35px rgba(0, 0, 0, 0.55), 0 0 25px ${offer.glowColor || 'rgba(255, 255, 255, 0.1)'}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
                    backdropFilter: 'blur(16px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.2rem',
                    opacity: isFading ? 0.35 : 1,
                    transform: isFading ? 'scale(0.99)' : 'scale(1)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = offer.borderHoverColor || offer.borderColor;
                    e.currentTarget.style.boxShadow = `0 16px 45px rgba(0, 0, 0, 0.65), 0 0 35px ${offer.glowColor || 'rgba(255, 255, 255, 0.2)'}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = offer.borderColor || 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = `0 12px 35px rgba(0, 0, 0, 0.55), 0 0 25px ${offer.glowColor || 'rgba(255, 255, 255, 0.1)'}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`;
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {/* Неоновое фоновое свечение в тонах бренда */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-40%',
                        left: '-20%',
                        width: '320px',
                        height: '240px',
                        background: `radial-gradient(circle, ${offer.glowColor || 'rgba(255, 255, 255, 0.15)'} 0%, transparent 70%)`,
                        filter: 'blur(35px)',
                        pointerEvents: 'none'
                    }}
                />

                {/* Левая часть: логотип и предложение */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 1, flex: '1 1 300px' }}>
                    {/* Логотип бренда */}
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: offer.btnGradient || 'linear-gradient(135deg, #444 0%, #222 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: `0 0 18px ${offer.glowColor || 'rgba(0, 0, 0, 0.5)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <span style={{ fontSize: '1.5rem', lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))' }}>
                            {offer.logoEmoji || '🎁'}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.6px', marginTop: '2px' }}>
                            {offer.logoText || offer.brand}
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
                                    background: offer.badgeBg || 'rgba(255, 255, 255, 0.15)',
                                    color: offer.badgeColor || '#ffffff',
                                    border: `1px solid ${offer.borderColor || 'rgba(255, 255, 255, 0.2)'}`
                                }}
                            >
                                {offer.badge}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)' }}>18+</span>
                        </div>

                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                            {offer.title}{' '}
                            <span style={{ color: offer.accentColor || '#fb923c', textShadow: `0 0 14px ${offer.accentColor || '#fb923c'}` }}>
                                {offer.highlight}
                            </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.3 }}>
                            {offer.subtitle}
                        </div>
                    </div>
                </div>

                {/* Правая часть: кнопка перехода и промокод */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 1, flexWrap: 'wrap' }}>
                    {offer.promoCode && (
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
                                border: copied ? '1px solid #22c55e' : `1px dashed ${offer.borderColor || 'rgba(255, 255, 255, 0.4)'}`,
                                color: copied ? '#4ade80' : '#ffffff',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-main)',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>{copied ? '✓' : '🎟️'}</span>
                            <span>{copied ? 'СКОПИРОВАН!' : offer.promoCode}</span>
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
                            background: offer.btnGradient || 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#ffffff',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-main)',
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: `0 4px 18px ${offer.glowColor || 'rgba(0, 0, 0, 0.4)'}`,
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.04)';
                            if (offer.btnHoverGradient) e.currentTarget.style.background = offer.btnHoverGradient;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            if (offer.btnGradient) e.currentTarget.style.background = offer.btnGradient;
                        }}
                    >
                        <span>{offer.buttonText || 'Перейти к акции'}</span>
                        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>➔</span>
                    </button>
                </div>
            </div>

            {/* Юридическая маркировка рекламы в соответствии с 347-ФЗ (с erid токеном) */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '4px 8px 0',
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.35)',
                    letterSpacing: '0.3px'
                }}
            >
                <div>
                    {offer.legalText}
                </div>
            </div>
        </div>
    );
}
