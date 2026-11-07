import { useEffect, useRef, useState } from "react";
import { Heart, Sparkles, X } from "lucide-react";

export default function SupportDevelopment() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current, previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return <>
    <button className="support-trigger" onClick={() => setOpen(true)}>
      <Heart size={17} aria-hidden="true"/><span>Поддержать разработку</span>
    </button>
    {open && <dialog ref={ref} className="app-dialog support-dialog" aria-labelledby="support-title" aria-describedby="support-description"
      onCancel={event => {event.preventDefault();setOpen(false);}}
      onClick={event => {if(event.target===ref.current)setOpen(false);}}>
      <div className="dialog-body">
        <button className="dialog-close" aria-label="Закрыть" onClick={() => setOpen(false)}><X/></button>
        <h2 id="support-title">Поддержать разработку</h2>
        <p id="support-description">Если вам нравится OVERRATED, здесь можно поддержать развитие игры.</p>
        <div className="support-options">
          <a href="https://www.donationalerts.com/r/serene_ya" target="_blank" rel="noopener noreferrer" className="support-option">
            <Heart aria-hidden="true"/>
            <span><strong>Поддержать напрямую</strong><span>Разовый донат через DonationAlerts — на сервер и новые обновления игры.</span></span>
          </a>
          <a href="https://tooken.club/register?ref=TCXQX0X98DDED" target="_blank" rel="sponsored noopener noreferrer" className="support-option">
            <Sparkles aria-hidden="true"/>
            <span><strong>Tooken Club</strong><span>Пользуетесь нейросетями? Токены для GPT, Claude, DeepSeek и других моделей — с единым балансом и доступом через API.</span></span>
          </a>
        </div>
      </div>
    </dialog>}
  </>;
}
