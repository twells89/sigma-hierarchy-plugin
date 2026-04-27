import {
  useConfig,
  useEditorPanelConfig,
  useElementData,
} from "@sigmacomputing/plugin";
import { useMemo, useState } from "react";

interface Node_t {
  value: string;
  label: string;
  children?: Node_t[];
}

function TreeNode({
  node,
  checked,
  onCheck,
}: {
  node: Node_t;
  checked: Set<string>;
  onCheck: (value: string, isChecked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;

  const allChildValues = (n: Node_t): string[] => [
    n.value,
    ...(n.children?.flatMap(allChildValues) ?? []),
  ];

  const isChecked = checked.has(node.value);
  const childValues = node.children?.flatMap(allChildValues) ?? [];
  const isIndeterminate =
    !isChecked && childValues.some((v) => checked.has(v));

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    onCheck(node.value, newChecked);
    allChildValues(node).forEach((v) => onCheck(v, newChecked));
  };

  return (
    <div style={{ paddingLeft: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0", cursor: "default" }}>
        <span
          style={{ width: 14, display: "inline-block", cursor: hasChildren ? "pointer" : "default", userSelect: "none" }}
          onClick={() => hasChildren && setExpanded((v) => !v)}
        >
          {hasChildren ? (expanded ? "▾" : "▸") : ""}
        </span>
        <input
          type="checkbox"
          checked={isChecked}
          ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
          onChange={handleCheck}
          style={{ cursor: "pointer" }}
        />
        <span
          style={{ fontSize: 13 }}
          onClick={() => hasChildren && setExpanded((v) => !v)}
        >
          {node.label}
        </span>
      </div>
      {expanded &&
        node.children?.map((child) => (
          <TreeNode key={child.value} node={child} checked={checked} onCheck={onCheck} />
        ))}
    </div>
  );
}

function App() {
  useEditorPanelConfig([
    { type: "element", name: "source" },
    { type: "column", name: "label", source: "source", allowMultiple: false },
    { type: "column", name: "depth", source: "source", allowMultiple: false },
    { type: "column", name: "x", source: "source", allowMultiple: false },
  ]);

  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const treeData = useMemo(() => {
    const labelCol = sigmaData[config.label];
    const depthCol = sigmaData[config.depth];
    const xCol = sigmaData[config.x];

    if (!xCol?.length || !labelCol?.length || !depthCol?.length) return [];

    const rootNode: Node_t = { value: String(xCol[0]), label: String(labelCol[0]) };
    const data = [rootNode];
    const stack: Node_t[] = [rootNode];

    for (let i = 1; i < labelCol.length; i++) {
      const node: Node_t = { value: String(xCol[i]), label: String(labelCol[i]) };
      const depth = Number(depthCol[i]);
      stack[depth] = node;
      if (!stack[depth - 1].children) stack[depth - 1].children = [];
      stack[depth - 1].children!.push(node);
    }
    return data;
  }, [config.depth, config.label, config.x, sigmaData]);

  if (!config.source || !config.label || !config.depth || !config.x) {
    return <p style={{ padding: 8, color: "#888", fontSize: 13 }}>Configure source and columns in the panel.</p>;
  }
  if (treeData.length === 0) {
    return <p style={{ padding: 8, color: "#888", fontSize: 13 }}>No data — check that X, Label, and Depth columns are mapped.</p>;
  }

  const handleCheck = (value: string, isChecked: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      isChecked ? next.add(value) : next.delete(value);
      return next;
    });
  };

  return (
    <div style={{ padding: 8, fontFamily: "sans-serif", overflowY: "auto", height: "100%" }}>
      {treeData.map((node) => (
        <TreeNode key={node.value} node={node} checked={checked} onCheck={handleCheck} />
      ))}
    </div>
  );
}

export default App;
