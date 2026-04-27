import {
  useConfig,
  useEditorPanelConfig,
  useElementData,
} from "@sigmacomputing/plugin";

function App() {
  useEditorPanelConfig([
    { type: "element", name: "source" },
    { type: "column", name: "label", source: "source", allowMultiple: false },
    { type: "column", name: "depth", source: "source", allowMultiple: false },
    { type: "column", name: "x", source: "source", allowMultiple: false },
    { type: "variable", name: "filterControl" },
  ]);

  const config = useConfig();
  const sigmaData = useElementData(config.source);

  const labelCol = sigmaData[config.label] ?? [];
  const depthCol = sigmaData[config.depth] ?? [];

  return (
    <div style={{ padding: 12, fontFamily: "sans-serif", fontSize: 13 }}>
      <p><strong>rows:</strong> {labelCol.length}</p>
      {labelCol.slice(0, 5).map((label, i) => (
        <p key={i}>{String(label)} (depth {String(depthCol[i])})</p>
      ))}
    </div>
  );
}

export default App;
