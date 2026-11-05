import { robots, robotIndex } from "../config/playerSymbols";
import FilmCharacter from "./characters/FilmCharacter";
import { cast } from "./characters/cast";
import "./characters/motion.css";
import ExpansionArt from "./characters/expansion/CharacterArt";
import { additions } from "./characters/expansion/cast";
import "./characters/expansion/motion.css";

const drawings = new Map(cast.map((character) => [character.id, character]));
const expanded = new Map(additions.map(character => [character.id, character]));

export default function Character({color, index, full = false, celebrate = false, className = ""}) {
  const identity = robots[index ?? robotIndex(color)] || robots[0];
  return (
    <span
      className={`character game-character ${full ? "is-full" : "is-portrait"} ${className}`}
      style={{"--character-color": identity.color}}
      aria-hidden="true"
    >
      {expanded.has(identity.outfit) ? <ExpansionArt character={expanded.get(identity.outfit)} portrait={!full} celebrate={celebrate}/> : <FilmCharacter
        character={drawings.get(identity.outfit) || cast[0]}
        portrait={!full}
        mood={celebrate ? "victory" : "character"}
        motion={full}
      />}
    </span>
  );
}
