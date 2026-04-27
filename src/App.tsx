import {
  useConfig,
  useEditorPanelConfig,
  useElementData,
} from "@sigmacomputing/plugin";
import { useMemo, useState } from "react";
import CheckboxTree from "react-checkbox-tree";

interface Node_t {
  value: string;
  label: string;
  children?: Node_t[];
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
  const [expanded, setExpanded] = useState<string[]>([]);
  const [checked, setChecked] = useState<string[]>([]);

  const treeData = useMemo(() => {
    const labelCol = sigmaData[config.label];
    const depthCol = sigmaData[config.depth];
    const xCol = sigmaData[config.x];

    if (!xCol?.length || !labelCol?.length || !depthCol?.length) {
      return [];
    }

    const rootNode: Node_t = {
      value: String(xCol[0]),
      label: String(labelCol[0]),
    };
    const data = [rootNode];
    const stack: Node_t[] = [rootNode];

    for (let i = 1; i < labelCol.length; i++) {
      const node: Node_t = {
        value: String(xCol[i]),
        label: String(labelCol[i]),
      };
      const currentDepth = Number(depthCol[i]);
      stack[currentDepth] = node;
      if (!stack[currentDepth - 1].children) {
        stack[currentDepth - 1].children = [];
      }
      stack[currentDepth - 1].children!.push(node);
    }
    return data;
  }, [config.depth, config.label, config.x, sigmaData]);

  if (!config.source || !config.label || !config.depth || !config.x) {
    return <p style={{ padding: 8, color: "#888" }}>Configure source and columns in the panel.</p>;
  }

  if (treeData.length === 0) {
    return <p style={{ padding: 8, color: "#888" }}>No data — check that X, Label, and Depth columns are mapped.</p>;
  }

  return (
    <CheckboxTree
      nodes={treeData}
      checked={checked}
      expanded={expanded}
      checkModel="all"
      expandOnClick
      onExpand={nodes => setExpanded(nodes)}
      onCheck={selectedNodes => setChecked(selectedNodes)}
      iconsClass="fa4"
    />
  );
}

export default App;
