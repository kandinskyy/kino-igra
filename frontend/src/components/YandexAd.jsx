import React from 'react';
import OkkoBanner from './OkkoBanner';

/**
 * Алиас для обратной совместимости: вместо РСЯ выводит официальный партнерский баннер Okko.
 */
export default function YandexAd(props) {
    return <OkkoBanner {...props} />;
}
