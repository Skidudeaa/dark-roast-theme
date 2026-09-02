// Operational Interface Doctrine — public conformance checker types.
// Hand-authored; copied verbatim to dist/system/conformance.d.ts by
// scripts/build-system.js.

export interface OiTreeLocation {
  readonly line: number;
  readonly column: number;
}

export interface OiTreeNode {
  readonly kind: 'document' | 'element' | 'text';
  readonly tag: string;
  readonly attrs: Map<string, string>;
  readonly children: OiTreeNode[];
  readonly parent: OiTreeNode | null;
  readonly text: string;
  readonly location: OiTreeLocation | null;
  /** The original DOM or parse5 node this tree node was built from. */
  readonly source: unknown;
  /** On a document tree built from an element: the subtree that is judged. */
  readonly scope?: OiTreeNode | null;
}

export interface OiFindingSubject {
  readonly tag: string | null;
  readonly id: string | null;
  readonly classes: readonly string[];
  /** Short selector-like description, e.g. `<section#status.oi-surface>`. */
  readonly description: string;
  readonly line: number | null;
  readonly column: number | null;
  /** The original DOM or parse5 node, when available. */
  readonly node: unknown;
}

export interface OiFinding {
  /** Stable kebab-case finding code, e.g. `slot-required`. */
  readonly code: string;
  readonly message: string;
  readonly subject: OiFindingSubject;
}

export interface OiConformanceReport {
  readonly findings: readonly OiFinding[];
  /** Number of primitive roots checked. */
  readonly primitives: number;
  /** Number of recipe roots checked. */
  readonly recipes: number;
}

/** Build a checkable tree from a live DOM Document, DocumentFragment, or Element. */
export declare function fromDom(node: Node): OiTreeNode;

/**
 * Build a checkable tree from a parse5 document or element. Parse with
 * `sourceCodeLocationInfo: true` to receive line and column positions.
 */
export declare function fromParse5(node: object): OiTreeNode;

/**
 * Check every primitive and recipe root in the tree against the generated
 * contract. Never throws for markup problems; returns findings instead.
 */
export declare function checkConformance(tree: OiTreeNode): OiConformanceReport;

/** Render findings as sorted one-line strings for logs and test output. */
export declare function formatFindings(findings: readonly OiFinding[], label?: string): string[];
