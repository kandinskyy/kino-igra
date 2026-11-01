import { Children, cloneElement, isValidElement, useId } from "react";
import { tint } from "../config/robotMaterials";

// One lighting direction for sewn panels, sleeves and accessories. Only colors
// actually used by this layer get paints; existing metal/glass paints stay intact.
export default function CostumeSurface({ children, ...props }) {
  const id = "cloth-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const paints = new Map();
  function shade(nodes) {
    return Children.map(nodes, (node) => {
      if (!isValidElement(node)) return node;
      const changes = {};
      const fill = node.props.fill;
      if (typeof fill === "string" && /^#[0-9a-f]{6}$/i.test(fill)) {
        const color = fill.toLowerCase();
        if (!paints.has(color)) paints.set(color, `${id}-${paints.size}`);
        changes.fill = `url(#${paints.get(color)})`;
      }
      if (node.props.children) changes.children = shade(node.props.children);
      return cloneElement(node, changes);
    });
  }
  const surfaces = shade(children);
  return (
    <g {...props}>
      <defs>
        {[...paints].map(([color, paint]) => (
          <radialGradient key={color} id={paint} cx=".32" cy=".18" r=".95">
            <stop stopColor={tint(color, .24)} />
            <stop offset=".46" stopColor={color} />
            <stop offset="1" stopColor={tint(color, -.34)} />
          </radialGradient>
        ))}
      </defs>
      {surfaces}
    </g>
  );
}
