import React from 'react';
import foodbandImg from '../assets/ads/foodband.png';
import dominosSvg from '../assets/ads/dominos.svg';
import aviasalesImg from '../assets/ads/aviasales_mark.png';
import aliexpressSvg from '../assets/ads/aliexpress_mark.svg';

/**
 * Официальные логотипы брендов в контрастной премиальной плашке (44x44px).
 * Плашка с белым фоном и мягкой глубокой тенью исключает любое сливание с фоном баннера.
 */
export default function BrandLogo({ id, glowColor }) {
    let logoSrc = null;
    let logoAlt = '';
    let imgStyle = {
        width: '30px',
        height: '30px',
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))'
    };

    if (id === 'foodband') {
        logoSrc = foodbandImg;
        logoAlt = 'FoodBand';
        imgStyle.width = '36px';
        imgStyle.height = '36px';
        imgStyle.filter = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))';
    } else if (id === 'dominos') {
        logoSrc = dominosSvg;
        logoAlt = "Domino's Pizza";
        imgStyle.width = '30px';
        imgStyle.height = '30px';
    } else if (id === 'aviasales') {
        logoSrc = aviasalesImg;
        logoAlt = 'Aviasales';
        imgStyle.width = '30px';
        imgStyle.height = '30px';
    } else if (id === 'aliexpress') {
        logoSrc = aliexpressSvg;
        logoAlt = 'AliExpress';
        imgStyle.width = '30px';
        imgStyle.height = '30px';
    }

    return (
        <div
            style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: `0 6px 18px rgba(0, 0, 0, 0.55), 0 0 14px ${glowColor || 'rgba(255, 255, 255, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
                padding: '3px'
            }}
        >
            {logoSrc && (
                <img
                    src={logoSrc}
                    alt={logoAlt}
                    style={imgStyle}
                />
            )}
        </div>
    );
}
