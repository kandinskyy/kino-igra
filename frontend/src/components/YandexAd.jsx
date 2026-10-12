import React, { useEffect, useId, useState } from 'react';

/**
 * Компонент рекламного блока Яндекс РСЯ (Yandex Advertising Network)
 * Поддерживает автоматический рендеринг через window.yaContextCb
 * и красивый превью-плейсхолдер до подключения боевого ID блока.
 */
export default function YandexAd({ 
    blockId = import.meta.env.VITE_YANDEX_BLOCK_ID || 'R-A-XXXXXX-1',
    maxWidth = '728px',
    minHeight = '90px',
    style = {},
    showPlaceholderInDev = true
}) {
    const reactId = useId().replace(/:/g, '');
    const containerId = `yandex_rtb_${blockId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${reactId}`;
    const [isLoaded, setIsLoaded] = useState(false);
    const isPlaceholderId = !blockId || blockId.includes('XXXXXX');

    useEffect(() => {
        if (isPlaceholderId) return;

        try {
            window.yaContextCb = window.yaContextCb || [];
            window.yaContextCb.push(() => {
                if (window.Ya?.Context?.AdvManager) {
                    window.Ya.Context.AdvManager.render({
                        blockId: blockId,
                        renderTo: containerId,
                        onRender: () => setIsLoaded(true),
                        onError: (data) => console.warn('[Yandex RTB] Ad error:', data)
                    });
                }
            });
        } catch (e) {
            console.warn('[Yandex RTB] Init error:', e);
        }
    }, [blockId, containerId, isPlaceholderId]);

    if (isPlaceholderId) {
        return null;
    }

    return (
        <div 
            style={{ 
                width: '100%', 
                maxWidth: maxWidth, 
                margin: '1.2rem auto', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                ...style 
            }}
        >
            <div 
                id={containerId}
                style={{
                    width: '100%',
                    minHeight: minHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                {/* Плейсхолдер до загрузки реальной рекламы или при тестовом ID */}
                {(!isLoaded || isPlaceholderId) && showPlaceholderInDev && (
                    <div 
                        style={{
                            width: '100%',
                            minHeight: minHeight,
                            padding: '0.8rem 1.2rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px dashed rgba(255, 255, 255, 0.12)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            color: 'var(--text-muted, rgba(255,255,255,0.6))',
                            fontSize: '0.78rem',
                            textAlign: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                            <span style={{ fontSize: '0.9rem' }}>📢</span> Реклама от Яндекса (РСЯ)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                            {isPlaceholderId ? `Блок: ${blockId} (будет отображаться после модерации сайта в РСЯ)` : 'Загрузка рекламного блока...'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
