import React, { useState, useEffect } from "react";
import * as Blockly from "blockly/core";
import "blockly/blocks"; 
import "blockly/javascript";

export default function BlocklyTabs() {
  const [files, setFiles] = useState([
    { id: "main", name: "main.blockly", workspace: null },
    { id: "utils", name: "utils.blockly", workspace: null },
  ]);
  const [activeFile, setActiveFile] = useState("main");
  const [code, setCode] = useState("");

  useEffect(() => {
    files.forEach((file) => {
      if (!file.workspace) {
        const workspace = Blockly.inject(`workspace-${file.id}`, {
          toolbox: toolboxConfig,
        });
        file.workspace = workspace;

        workspace.addChangeListener(() => {
          if (file.id === activeFile) {
            const generated = Blockly.JavaScript.workspaceToCode(workspace);
            setCode(generated);
          }
        });
      }
    });
  }, [files, activeFile]);

  function addNewFile() {
    const id = `file-${Date.now()}`;
    const newFile = { id, name: `${id}.blockly`, workspace: null };
    setFiles([...files, newFile]);
    setActiveFile(id);
  }

  function switchTab(id) {
    setActiveFile(id);
    const file = files.find((f) => f.id === id);
    if (file?.workspace) {
      const generated = Blockly.JavaScript.workspaceToCode(file.workspace);
      setCode(generated);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left side: Tabs + Workspaces */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="tabs" style={{ display: "flex" }}>
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => switchTab(file.id)}
              style={{
                background: file.id === activeFile ? "#ccc" : "#eee",
                marginRight: "4px",
              }}
            >
              {file.name}
            </button>
          ))}
          <button onClick={addNewFile}>+</button>
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          {files.map((file) => (
            <div
              key={file.id}
              id={`workspace-${file.id}`}
              style={{
                display: file.id === activeFile ? "block" : "none",
                width: "100%",
                height: "100%",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right side: Preview */}
      <div style={{ flex: 1 }}>
        <iframe
          title="preview"
          style={{ width: "100%", height: "100%" }}
          srcDoc={`<script>${code}</script>`}
        />
      </div>
    </div>
  );
}
