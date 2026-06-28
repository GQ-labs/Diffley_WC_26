import { useLayoutEffect, useState, type RefObject } from 'react';
import {
  BRACKET_FEEDER_FORKS,
  BRACKET_FEEDER_LINES,
  bracketLineExitsRight,
  getBracketColumnIndex,
} from '../../lib/bracketLayout';
import styles from './KnockoutTab.module.css';

interface Point {
  x: number;
  y: number;
}

function centerRight(rect: DOMRect, origin: DOMRect): Point {
  return {
    x: rect.right - origin.left,
    y: rect.top + rect.height / 2 - origin.top,
  };
}

function centerLeft(rect: DOMRect, origin: DOMRect): Point {
  return {
    x: rect.left - origin.left,
    y: rect.top + rect.height / 2 - origin.top,
  };
}

function forkPath(
  parentA: Point,
  parentB: Point,
  child: Point,
  exitRight: boolean,
): string {
  const forkX = exitRight
    ? parentA.x + (child.x - parentA.x) * 0.45
    : parentA.x - (parentA.x - child.x) * 0.45;

  return [
    `M ${parentA.x} ${parentA.y} H ${forkX}`,
    `M ${parentB.x} ${parentB.y} H ${forkX}`,
    `M ${forkX} ${parentA.y} V ${parentB.y}`,
    `M ${forkX} ${(parentA.y + parentB.y) / 2} H ${child.x}`,
  ].join(' ');
}

function linePath(from: Point, to: Point, exitRight: boolean): string {
  const midX = exitRight
    ? from.x + (to.x - from.x) * 0.55
    : from.x - (from.x - to.x) * 0.55;

  return `M ${from.x} ${from.y} H ${midX} V ${to.y} H ${to.x}`;
}

function measurePaths(container: HTMLElement): string[] {
  const origin = container.getBoundingClientRect();
  const paths: string[] = [];

  const anchor = (num: number): DOMRect | null => {
    const el = container.querySelector(`[data-bracket-match="${num}"]`);
    return el?.getBoundingClientRect() ?? null;
  };

  for (const { child, parents } of BRACKET_FEEDER_FORKS) {
    const rectA = anchor(parents[0]);
    const rectB = anchor(parents[1]);
    const rectChild = anchor(child);
    if (!rectA || !rectB || !rectChild) continue;

    const exitRight = bracketLineExitsRight(parents[0]);
    const pointA = exitRight ? centerRight(rectA, origin) : centerLeft(rectA, origin);
    const pointB = exitRight ? centerRight(rectB, origin) : centerLeft(rectB, origin);
    const pointChild = exitRight ? centerLeft(rectChild, origin) : centerRight(rectChild, origin);

    paths.push(forkPath(pointA, pointB, pointChild, exitRight));
  }

  for (const { child, parent } of BRACKET_FEEDER_LINES) {
    const rectParent = anchor(parent);
    const rectChild = anchor(child);
    if (!rectParent || !rectChild) continue;

    const parentCol = getBracketColumnIndex(parent);
    const exitRight = parentCol <= 4;
    const from = exitRight ? centerRight(rectParent, origin) : centerLeft(rectParent, origin);
    const to = exitRight ? centerLeft(rectChild, origin) : centerRight(rectChild, origin);

    paths.push(linePath(from, to, exitRight));
  }

  return paths;
}

export function BracketConnectors({
  gridRef,
  layoutKey,
}: {
  gridRef: RefObject<HTMLElement | null>;
  layoutKey: string;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const update = () => {
      const rect = container.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
      setPaths(measurePaths(container));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);

    const onResize = () => update();
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [gridRef, layoutKey]);

  if (paths.length === 0 || size.width === 0) return null;

  return (
    <svg
      className={styles.connectors}
      width={size.width}
      height={size.height}
      aria-hidden="true"
    >
      {paths.map((d, index) => (
        <path key={`${layoutKey}-${index}`} d={d} className={styles.connectorPath} />
      ))}
    </svg>
  );
}
