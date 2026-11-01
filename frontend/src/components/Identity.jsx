import { CloudRain } from "lucide-react";
import Character from "./Character";
import { robotColor } from "../config/playerSymbols";
export function Emblem(props) {
  return <Character {...props} />;
}
export function Avatar({ player, large = false }) {
  return (
    <span
      className={`avatar ${large ? "avatar-large" : ""}`}
      style={{ "--player-color": robotColor(player.color) }}
    >
      <Emblem color={player.color} />
    </span>
  );
}
export function Cloud() {
  return <CloudRain strokeWidth={1.8} aria-hidden="true" />;
}
export function Poster({
  movie,
  variant = "card",
  priority = false,
  ...props
}) {
  const proxied = movie.posterUrl?.startsWith("/api/poster/");
  const sizes =
    variant === "fan"
      ? "(max-width: 720px) 87px, (max-width: 1100px) 94px, 122px"
      : "(max-width: 524px) calc(100vw - 64px), (max-width: 720px) 434px, (min-width: 1440px) 240px, calc((100vw - 208px) / 5)";
  return (
    <img
      src={proxied ? movie.posterUrl + "?w=342" : movie.posterUrl}
      srcSet={
        proxied
          ? [185, 342, 500]
              .map((w) => `${movie.posterUrl}?w=${w} ${w}w`)
              .join(", ")
          : undefined
      }
      sizes={proxied ? sizes : undefined}
      width="500"
      height="750"
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      alt={`Постер «${movie.title}»`}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith("/poster-placeholder.svg")) {
          e.currentTarget.removeAttribute("srcset");
          e.currentTarget.src = "/poster-placeholder.svg";
        }
      }}
      {...props}
    />
  );
}
