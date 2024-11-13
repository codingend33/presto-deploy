import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import hljs from "highlight.js";

const CodeHighlighter = ({ code, fontSize }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <Box
      component="pre"
      sx={{
        fontSize: `${fontSize}em`,
        whiteSpace: "pre-wrap",
        overflow: "hidden",
        maxHeight: "100%",
        padding: "8px",
        backgroundColor: "#f5f5f5",
        borderRadius: "5px",
      }}
    >
      <code ref={codeRef}>{code}</code>
    </Box>
  );
};

export default CodeHighlighter;
