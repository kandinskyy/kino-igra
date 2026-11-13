import { useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

import categoryOptions from "../../../shared/catalog-categories.json";
import {useGame} from "../GameContext.jsx";
import {KinonamesSettings} from "../kinonames/KinonamesUI.jsx";
import {defaultKinonamesSettings, mergeKinonamesSettings} from "../kinonames/settings.js";
const defaultCategories = ["films"];

export default function MatchSettings({
  settings = {},
  targetVP,
  categories = defaultCategories,
  host,
  onSave,
}) {
  const {gameState:g,player,socket}=useGame();
  const dialog = useRef(null);
  const [draft, setDraft] = useState(String(targetVP));
  const [draftCategories, setDraftCategories] = useState(categories);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("original");
  const [circles, setCircles] = useState("1");
  const [hidden, setHidden] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [rules, setRules] = useState(false);

  function open() {
    setDraft(String(targetVP));
    setDraftCategories([...categories]);
    setError("");
    setRules(false);
    setMode(settings.mode || "original");
    setCircles(String(settings.circles || 1));
    setHidden(!!settings.hiddenMode);
    setRepeat(!!settings.repeatRatings);
    setKnDraft(mergeKinonamesSettings(g?.kinonames?.settings||defaultKinonamesSettings));
    dialog.current.showModal();
  }

  async function save(event) {
    event.preventDefault();
    if (!host || saving) return;
    if (viewMode!=='kinonames'&&!draftCategories.length) return;
    const value = Number(draft);
    if (viewMode!=='kinonames'&&(
      !Number.isInteger(Number(circles)) ||
      Number(circles) < 1 ||
      Number(circles) > 999
    )) {
      setError("Введите целое число кругов от 1 до 999");
      return;
    }
    if (viewMode!=='kinonames'&&(!Number.isInteger(value) || value < 1 || value > 999)) {
      setError("Введите целое число от 1 до 999");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(viewMode==='kinonames'?(Number(targetVP)||10):value, viewMode==='kinonames'?['superheroes']:draftCategories, {
        mode,
        circles: Number(circles),
        hiddenMode: hidden,
        repeatRatings: repeat,
      });
      if(viewMode==='kinonames'&&settings.mode!=='kinonames'&&canEditKinonames){
        const store=mergeKinonamesSettings(knDraft);
        const result=await socket.timeout(10000).emitWithAck('kinonames_settings',{lobbyId:g.id,settings:store});
        if(!result?.success)throw Error(result?.message||'Не удалось сохранить настройки Kinonames');
      }
      dialog.current.close();
    } catch (e) {
      setError(
        e.message || "Не удалось сохранить параметры. Попробуйте ещё раз.",
      );
    } finally {
      setSaving(false);
    }
  }

  const viewMode = host ? mode : settings.mode || "original";
  const [knDraft,setKnDraft]=useState(()=>mergeKinonamesSettings(g?.kinonames?.settings||defaultKinonamesSettings));
  const canEditKinonames=(g?.kinonames?.creatorId||g?.creatorId||g?.host)===player?.id;
  async function saveKinonames(next){
    setKnDraft(next);
    const result=await socket.timeout(10000).emitWithAck('kinonames_settings',{lobbyId:g.id,settings:next});
    if(!result?.success)throw Error(result?.message||'Не удалось сохранить настройки Kinonames');
  }
  return (
    <div className="match-settings">
      <button
        type="button"
        className="match-settings-trigger"
        onClick={open}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal aria-hidden="true" />
        <span>Параметры игры</span>
      </button>
      <p className="match-settings-summary">
        {settings.mode === "kinonames" ? "Kinonames" : settings.mode === "opinion" ? "Мнение одного" : "До победы"}{" "}
        {settings.mode === "kinonames" ? <strong>{g?.kinonames?.settings?.variant === "competitive" ? "Многопользовательский" : "Одиночный"}</strong> : <strong>{settings.mode === "opinion" ? `${settings.circles || 1} кругов` : `${targetVP} очков`}</strong>}
      </p>
      <dialog
        ref={dialog}
        className="app-dialog match-settings-dialog"
        aria-labelledby="match-settings-title"
        onCancel={(event) => {
          if (saving) event.preventDefault();
        }}
      >
        <form className="dialog-body" onSubmit={save} noValidate>
          <button
            type="button"
            className="dialog-close"
            aria-label="Закрыть параметры игры"
            disabled={saving}
            onClick={() => dialog.current.close()}
          >
            <X />
          </button>
          <h2 id="match-settings-title">Параметры игры</h2>
          {rules ? (
            <section
              className="match-rules"
              aria-label="Правила выбранного режима"
            >
              <h3>
                {viewMode === "kinonames" ? "Kinonames" : viewMode === "original" ? "Оригинальный" : "Мнение одного"}
              </h3>
              {viewMode === "kinonames" ? <>
                <p>Ведущий видит цвета 25 персонажей и даёт подсказку: одно слово и число. Угадывающие единогласно выбирают карточку; через 3 секунды она открывается. Изменение голоса отменяет подтверждение.</p>
                <p>В одиночной игре нужно открыть все синие карточки, сохранив жизни. Чёрная карточка отнимает жизнь, нейтральная не завершает угадывание. Подсказки ограничены, время — нет.</p>
                <p>В многопользовательской игре команды ходят по очереди. Своя карточка даёт 15 секунд; чужая или нейтральная завершает ход, чёрная означает поражение. При остатке не больше 5 секунд единогласный выбор открывается сразу.</p>
                <p>Предатель видит карточки соперника и чёрную. Он голосует вместе со всеми, а его роль остаётся скрытой.</p>
              </> : viewMode === "original" ? (
                <>
                  <p>
                    В каждом раунде — пять произведений. Расставьте оценки от S
                    до D: каждую можно использовать один раз, последняя
                    назначается автоматически.
                  </p>
                  <p>
                    За каждое совпадение с другим игроком вы получаете одно
                    очко. Ведущий запускает таймер и раскрывает оценки. Игра
                    заканчивается после раунда, в котором достигнута цель по
                    очкам.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Критик составляет рейтинг пяти произведений и нажимает
                    «Сохранить оценки». Остальные угадывают его оценки за 60
                    секунд. Если все сохранят ответы, раунд завершится раньше.
                  </p>
                  <p>
                    За совпадение — +1 очко, за все пять — ещё +1 (итого 6).
                    Критик получает по очку за каждый идеальный ответ, но если угадали все — получает 0. Каждый участник
                    становится критиком один раз за круг.
                  </p>
                  <p>
                    Незаполненные оценки дополняются случайно и отмечаются
                    «Авто». После игры открываются итоговые места и история
                    раундов.
                  </p>
                </>
              )}
              <h4>Дополнительные условия</h4>
              <p>
                <strong>Скрытый режим.</strong> Чужие очки и общая таблица
                скрыты до финала. В «Мнении одного» также скрыты личность
                критика и чужие прогнозы. Вы видите только свои очки и
                результат.
              </p>
              <p>
                <strong>Любая оценка.</strong> Одну оценку можно поставить
                нескольким произведениям.
              </p>
              <button
                type="button"
                className="btn-secondary full"
                onClick={() => setRules(false)}
              >
                Назад к параметрам
              </button>
            </section>
          ) : (
            <>
              <div className="match-mode-field">
                <div className="match-section-heading">
                  <label htmlFor="match-mode">Режим игры</label>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setRules(true)}
                  >
                    Правила режима
                  </button>
                </div>
                <div className="match-mode-select">
                  <select
                    id="match-mode"
                    value={viewMode}
                    disabled={!host || saving}
                    onChange={(event) => setMode(event.target.value)}
                  >
                    <option value="original">Оригинальный</option>
                    <option value="opinion">Мнение одного</option>
                    <option value="kinonames">Kinonames</option>
                  </select>
                  <ChevronDown aria-hidden="true" />
                </div>
              </div>
              {viewMode==='kinonames'?<>
                {settings.mode==='kinonames'?<KinonamesSettings value={g?.kinonames?.settings||knDraft} editable={canEditKinonames} onSave={saveKinonames}/>:<p className="match-field-help">Сначала сохраните режим Kinonames. Его параметры можно будет изменить в этой панели.</p>}
              </>:<><div className="match-target-field">
                <label htmlFor="match-target-vp">
                  {viewMode === "original"
                    ? "Очки до победы"
                    : "Количество кругов"}
                </label>
                {host ? (
                  <>
                    <div className="target-input">
                      <input
                        id="match-target-vp"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="999"
                        step="1"
                        value={viewMode === "original" ? draft : circles}
                        disabled={saving}
                        aria-invalid={!!error}
                        aria-describedby="match-target-help"
                        onChange={(event) => {
                          (viewMode === "original" ? setDraft : setCircles)(
                            event.target.value,
                          );
                          setError("");
                        }}
                      />
                      <span>
                        {viewMode === "original" ? "очков" : "кругов"}
                      </span>
                    </div>
                    <p id="match-target-help" className="match-field-help">
                      {viewMode === "original"
                        ? "Целое число от 1 до 999"
                        : "За один круг каждый участник один раз становится критиком."}
                    </p>
                  </>
                ) : (
                  <strong className="match-target-value">
                    {viewMode === "opinion"
                      ? `${host ? circles : settings.circles || 1} кругов`
                      : `${targetVP} очков`}
                  </strong>
                )}
              </div>
              <fieldset className="match-categories" disabled={!host || saving}>
                <legend>Категории</legend>
                <div className="match-category-options">
                  {categoryOptions.map(({ id, label }) => (
                    <label key={id}>
                      <input
                        type="checkbox"
                        checked={(host ? draftCategories : categories).includes(
                          id,
                        )}
                        onChange={(event) =>
                          setDraftCategories((current) =>
                            event.target.checked
                              ? [...current, id]
                              : current.filter((value) => value !== id),
                          )
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {host && !draftCategories.length && (
                <p className="match-settings-error" role="alert">
                  Выберите хотя бы одну категорию
                </p>
              )}
              <p className="match-field-help">
                Можно выбрать несколько категорий.
              </p>
              <fieldset
                className="match-categories match-conditions"
                disabled={!host || saving}
              >
                <legend>Дополнительные условия</legend>
                <label>
                  <input
                    type="checkbox"
                    checked={host ? hidden : !!settings.hiddenMode}
                    onChange={(event) => setHidden(event.target.checked)}
                  />
                  <span>
                    <strong>Скрытый режим</strong>
                    <small>
                      Только ваши очки, без общей таблицы до финала
                      {viewMode === "opinion" ? " и без имени критика" : ""}.
                    </small>
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={host ? repeat : !!settings.repeatRatings}
                    onChange={(event) => setRepeat(event.target.checked)}
                  />
                  <span>
                    <strong>Любая оценка</strong>
                    <small>
                      Одну оценку можно поставить нескольким произведениям.
                    </small>
                  </span>
                </label>
              </fieldset></>}
              {!host && (
                <p className="match-field-help">Параметры меняет ведущий</p>
              )}
              {error && (
                <p className="match-settings-error" role="alert">
                  {error}
                </p>
              )}
              <div className="dialog-actions">
                {host ? (
                  <>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={saving}
                      onClick={() => dialog.current.close()}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={saving || (viewMode!=='kinonames'&&!draftCategories.length)}
                    >
                      {saving ? "Сохраняем…" : "Сохранить"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => dialog.current.close()}
                  >
                    Понятно
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </dialog>
    </div>
  );
}
