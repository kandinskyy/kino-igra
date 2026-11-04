import { Component, createRef } from "react";

// Capture the visible positions before React changes the row order. Relative
// coordinates keep unrelated page scrolling/layout changes out of the motion.
export default class AnimatedScoreList extends Component {
  container = createRef();
  animations = [];

  measure() {
    const root = this.container.current;
    const origin = root.getBoundingClientRect();
    return new Map([...root.children].map(node => {
      const rect = node.getBoundingClientRect();
      return [node.dataset.scoreId, {node, x: rect.left - origin.left, y: rect.top - origin.top}];
    }));
  }

  getSnapshotBeforeUpdate(previous) {
    return previous.order !== this.props.order ? this.measure() : null;
  }

  componentDidUpdate(previous, state, snapshot) {
    if (!snapshot) return;
    this.animations.forEach(animation => animation.cancel());
    this.animations = [];
    const targets = this.measure();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // All layout reads precede animation writes. A replacement animation starts
    // at the current visual position if a second reorder interrupts the first.
    for (const [id, target] of targets) {
      const old = snapshot.get(id);
      if (!old) continue;
      const x = old.x - target.x, y = old.y - target.y;
      if (Math.abs(x) < .5 && Math.abs(y) < .5) continue;
      this.animations.push(target.node.animate([
        {transform: `translate3d(${x}px, ${y}px, 0)`},
        {transform: "translate3d(0, 0, 0)"},
      ], {duration: 850, easing: "cubic-bezier(.4, 0, .2, 1)"}));
    }
  }

  componentWillUnmount() {
    this.animations.forEach(animation => animation.cancel());
  }

  render() {
    return <div ref={this.container} className={this.props.className} aria-label={this.props.label}>{this.props.children}</div>;
  }
}
