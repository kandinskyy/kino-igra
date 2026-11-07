import { criticNameStyle } from "../config/playerSymbols";
import { Avatar, Poster } from "./Identity";
export default function MatchReveal({ game: g, me }) {
  const opinion = g.mode === "opinion";
  return (
    <div className="movie-grid reveal-grid">
      {g.movies.map((m, index) => {
        const myRating = g.ratings?.[me]?.[m.id],
          correct = g.criticRatings?.[m.id];
        const points = g.matchPoints?.[m.id] || 0;
        return (
          <article
            key={`${g.roundId}-${m.id}`}
            style={{ "--reveal-delay": `${index * 260}ms` }}
            className={`movie-card reveal-card staged-reveal ${opinion && !g.isCritic ? (points ? "guess-hit" : "guess-miss") : ""} ${opinion && g.myPerfect ? "perfect-reveal" : ""}`}
          >
            <div className="movie-poster">
              <Poster movie={m} />
            </div>
            <h2>{m.title}</h2>
            {!g.hiddenMode && !opinion && (
              <div className="film-average">
                <span>Средняя оценка</span>
                <strong>
                  {g.roundAverages?.[m.id] || "—"}
                  <small> / 5</small>
                </strong>
              </div>
            )}
            {g.hiddenMode && (
              <div className="personal-ballot">
                <span>
                  {g.isCritic ? "Ваш рейтинг" : "Ваша оценка"}{" "}
                  <strong className={`rank-${myRating}`}>{myRating}</strong>
                  {g.autoRatings?.[me]?.[m.id] && <small>Авто</small>}
                </span>
                {opinion && !g.isCritic && (
                  <span>
                    Критик{" "}
                    <strong className={`rank-${correct}`}>{correct}</strong>
                    {g.criticAuto?.[m.id] && <small>Авто</small>}
                  </span>
                )}
                {!g.isCritic && <strong>+{points}</strong>}
              </div>
            )}
            {!g.hiddenMode && <GroupedBallots game={g} movie={m} me={me}/>}
          </article>
        );
      })}
    </div>
  );
}

function GroupedBallots({game:g,movie,me}) {
  const opinion=g.mode==='opinion';
  const mine=g.players.find(p=>p.id===me);
  const critic=opinion?g.players.find(p=>p.id===g.criticId):null;
  const rating=p=>p.id===g.criticId&&opinion ? g.criticRatings?.[movie.id] : g.ratings?.[p.id]?.[movie.id];
  function row(p,featured=false){
    const r=rating(p), isCritic=opinion&&p.id===g.criticId;
    const points=opinion ? (!isCritic&&r===g.criticRatings?.[movie.id]?1:0) : Math.max(0,(g.roundDetails?.[movie.id]?.[r]?.length||0)-1);
    const auto=isCritic?g.criticAuto?.[movie.id]:g.autoRatings?.[p.id]?.[movie.id];
    return <li key={p.id} className={(featured?'own-ballot ':'')+(isCritic?'current-critic':'')} style={isCritic?criticNameStyle(p.color):undefined}>
      <Avatar player={p}/>
      <span className="ballot-name">{p.nickname}{auto&&<small> · Авто</small>}</span>
      {featured&&<strong className={'ballot-rank rank-'+r}>{r||'—'}</strong>}
      {!isCritic&&<small className={points?'ballot-bonus':'ballot-zero'}>+{points}</small>}
    </li>;
  }
  return <div className="original-ballots">
    <ul className="film-ballots personal-film-ballot" aria-label="Ваши оценки и рейтинг критика">
      {mine&&row(mine,true)}
      {critic&&critic.id!==me&&row(critic,true)}
    </ul>
    {['S','A','B','C','D'].map(r=>{
      const people=g.players.filter(p=>p.id!==me&&p.id!==critic?.id&&rating(p)===r);
      return people.length>0&&<section className="ballot-group" key={r} aria-label={'Оценка '+r}><h3 className={'rank-'+r}><span>{r}</span></h3><ul className="film-ballots">{people.map(p=>row(p))}</ul></section>;
    })}
  </div>;
}
