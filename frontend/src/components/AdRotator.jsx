import React, { useState, useEffect } from 'react';
import { copyText } from '../utils/clipboard';
import { AD_OFFERS } from '../config/adsConfig';
import BrandLogo from './BrandLogo';

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
                margin: '1.2rem auto 0.6rem',
                ...style
            }}
        >
            <div
                onClick={handleBannerClick}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '14px',
                    padding: '0.85rem 1.25rem',
                    background: offer.gradient || 'linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(10, 10, 16, 0.96) 100%)',
                    border: `1px solid ${offer.borderColor || 'rgba(255, 255, 255, 0.2)'}`,
                    boxShadow: `0 10px 30px rgba(0, 0, 0, 0.55), 0 0 20px ${offer.glowColor || 'rgba(255, 255, 255, 0.08)'}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
                    backdropFilter: 'blur(16px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'nowrap',
                    gap: '1rem',
                    opacity: isFading ? 0.35 : 1,
                    transform: isFading ? 'scale(0.995)' : 'scale(1)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = offer.borderHoverColor || offer.borderColor;
                    e.currentTarget.style.boxShadow = `0 14px 40px rgba(0, 0, 0, 0.65), 0 0 30px ${offer.glowColor || 'rgba(255, 255, 255, 0.18)'}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = offer.borderColor || 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.55), 0 0 20px ${offer.glowColor || 'rgba(255, 255, 255, 0.08)'}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`;
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {/* Мягкое фоновое неоновое свечение в цветах бренда */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-15%',
                        width: '280px',
                        height: '200px',
                        background: `radial-gradient(circle, ${offer.glowColor || 'rgba(255, 255, 255, 0.12)'} 0%, transparent 70%)`,
                        filter: 'blur(35px)',
                        pointerEvents: 'none'
                    }}
                />

                {/* Левая часть: четкий векторный логотип бренда */}
                <BrandLogo
                    id={offer.id}
                    glowColor={offer.glowColor}
                    btnGradient={offer.btnGradient}
                />

                {/* Центральная часть: сбалансированный текст в едином стиле */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        zIndex: 1,
                        flex: '1 1 auto',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                            style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.6px',
                                padding: '1px 6px',
                                borderRadius: '5px',
                                background: offer.badgeBg || 'rgba(255, 255, 255, 0.15)',
                                color: offer.badgeColor || '#ffffff',
                                border: `1px solid ${offer.borderColor || 'rgba(255, 255, 255, 0.2)'}`
                            }}
                        >
                            {offer.badge}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.4)' }}>18+</span>
                    </div>

                    <div
                        style={{
                            fontSize: '0.94rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            letterSpacing: '-0.2px',
                            lineHeight: 1.25,
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                        }}
                    >
                        {offer.title}{' '}
                        <span style={{ color: offer.accentColor || '#38bdf8', textShadow: `0 0 10px ${offer.accentColor || '#38bdf8'}` }}>
                            {offer.highlight}
                        </span>
                    </div>

                    <div
                        style={{
                            fontSize: '0.74rem',
                            color: 'rgba(255, 255, 255, 0.72)',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {offer.subtitle}
                    </div>
                </div>

                {/* Правая часть: кнопка ВСЕГДА справа на одной линии */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick();
                    }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: offer.btnGradient || 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-main)',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: `0 3px 14px ${offer.glowColor || 'rgba(0, 0, 0, 0.35)'}`,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        zIndex: 1
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
                    <span>{offer.buttonText || 'Перейти'}</span>
                    <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>➔</span>
                </button>
            </div>

            {/* Юридическая маркировка рекламы в соответствии с 347-ФЗ (с erid токеном) */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '3px 6px 0',
                    fontSize: '0.62rem',
                    color: 'rgba(255, 255, 255, 0.35)',
                    letterSpacing: '0.25px'
                }}
            >
                <div>
                    {offer.legalText}
                </div>
            </div>
        </div>
    );
}
