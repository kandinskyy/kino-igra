import React from 'react';
import { useGame } from '../GameContext';

const ModalDialog = () => {
    const { modal, closeModal, toast } = useGame();

    return (
        <>
            {/* Всплывающий тост вверху экрана */}
            {toast && (
                <div 
                    className="toast-notification"
                    style={{
                        position: 'fixed',
                        top: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10000,
                        background: toast.type === 'error' 
                            ? 'rgba(30, 8, 16, 0.92)' 
                            : toast.type === 'success' 
                                ? 'rgba(4, 26, 18, 0.92)' 
                                : 'rgba(5, 18, 36, 0.92)',
                        border: toast.type === 'error' 
                            ? '1px solid rgba(255, 56, 100, 0.5)' 
                            : toast.type === 'success' 
                                ? '1px solid rgba(0, 230, 118, 0.5)' 
                                : '1px solid rgba(28, 160, 229, 0.5)',
                        boxShadow: toast.type === 'error' 
                            ? '0 8px 30px rgba(255, 56, 100, 0.35)' 
                            : toast.type === 'success' 
                                ? '0 8px 30px rgba(0, 230, 118, 0.35)' 
                                : '0 8px 30px rgba(28, 160, 229, 0.35)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        pointerEvents: 'none',
                        animation: 'toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>
                        {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✅' : '🌧️'}
                    </span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Модальное диалоговое окно */}
            {modal && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(2, 6, 16, 0.82)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        animation: 'modalFadeIn 0.22s ease-out'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && modal.type === 'alert') {
                            closeModal(true);
                        }
                    }}
                >
                    <div 
                        className="glass-panel"
                        style={{
                            maxWidth: '460px',
                            width: '100%',
                            padding: '2.2rem',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: modal.isDanger 
                                ? 'radial-gradient(circle at 50% 0%, rgba(255, 56, 100, 0.15) 0%, rgba(8, 16, 30, 0.96) 100%)' 
                                : 'radial-gradient(circle at 50% 0%, rgba(28, 160, 229, 0.18) 0%, rgba(6, 18, 36, 0.96) 100%)',
                            border: modal.isDanger 
                                ? '1px solid rgba(255, 56, 100, 0.45)' 
                                : '1px solid rgba(28, 160, 229, 0.45)',
                            boxShadow: modal.isDanger 
                                ? '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(255, 56, 100, 0.3)' 
                                : '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(28, 160, 229, 0.3)',
                            animation: 'modalPopIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {/* Иконка / эмодзи */}
                        <div 
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: modal.isDanger ? 'rgba(255, 56, 100, 0.14)' : 'rgba(28, 160, 229, 0.14)',
                                border: modal.isDanger ? '1px solid rgba(255, 56, 100, 0.4)' : '1px solid rgba(28, 160, 229, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                marginBottom: '1.2rem',
                                boxShadow: modal.isDanger ? '0 0 20px rgba(255, 56, 100, 0.3)' : '0 0 20px rgba(28, 160, 229, 0.3)'
                            }}
                        >
                            {modal.icon || (modal.isDanger ? '🛑' : '🌧️')}
                        </div>

                        {/* Заголовок */}
                        <h3 style={{ 
                            fontSize: '1.4rem', 
                            fontWeight: 800, 
                            color: '#ffffff', 
                            margin: 0,
                            letterSpacing: '-0.3px'
                        }}>
                            {modal.title || 'Внимание'}
                        </h3>

                        {/* Текст сообщения */}
                        <p style={{ 
                            fontSize: '1.02rem', 
                            color: '#cbd5e1', 
                            lineHeight: '1.6', 
                            margin: '0.9rem 0 1.8rem',
                            wordBreak: 'break-word'
                        }}>
                            {modal.message}
                        </p>

                        {/* Кнопки управления */}
                        {modal.type === 'confirm' ? (
                            <div style={{ display: 'flex', gap: '0.9rem', width: '100%', justifyContent: 'center' }}>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => closeModal(false)}
                                    style={{ flex: 1, padding: '12px 18px', fontSize: '1rem' }}
                                >
                                    {modal.cancelText || 'Отмена'}
                                </button>
                                <button 
                                    className={modal.isDanger ? 'btn-primary btn-danger' : 'btn-primary'}
                                    onClick={() => closeModal(true)}
                                    style={{ 
                                        flex: 1, 
                                        padding: '12px 18px', 
                                        fontSize: '1rem',
                                        background: modal.isDanger 
                                            ? 'linear-gradient(135deg, #ff3864 0%, #b81438 100%)' 
                                            : undefined,
                                        boxShadow: modal.isDanger 
                                            ? '0 4px 20px rgba(255, 56, 100, 0.5)' 
                                            : undefined
                                    }}
                                >
                                    {modal.confirmText || 'Подтвердить'}
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="btn-primary"
                                onClick={() => closeModal(true)}
                                style={{ width: '100%', padding: '12px 24px', fontSize: '1.05rem' }}
                            >
                                {modal.confirmText || 'Понятно'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ModalDialog;
