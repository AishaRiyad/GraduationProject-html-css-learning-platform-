// ✅ Perfected version: clean aligned cards + same tag formatting in editor
import React, { useState, useRef } from "react";

export default function HtmlStructureBuilder() {
  const [flipped, setFlipped] = useState([]);
  const [code, setCode] = useState("");
  const iframeRef = useRef(null);

  const elements = [
    {
      id: "doctype",
      tag: "<!DOCTYPE html>",
      description: "Defines the document as an HTML5 document.",
      color: "#D4AC0D",
    },
    {
      id: "html",
      tag: "<html>\n</html>",
      description: "The root element of the HTML document.",
      color: "#27AE60",
    },
    {
      id: "head",
      tag: `<head>\n  <meta charset="utf-8" />\n  <title>Playground</title>\n</head>`,
      description: "Contains meta info like title, charset, and links.",
      color: "#2980B9",
    },
    {
      id: "body",
      tag: "<body>\n</body>",
      description: "Contains the content of the webpage.",
      color: "#8E44AD",
    },
    {
      id: "h1",
      tag: "<h1>Hello HTML!</h1>",
      description: "Defines a large heading for the webpage.",
      color: "#E74C3C",
    },
    {
      id: "p",
      tag: "<p>Edit me then click Run ▶</p>",
      description: "Defines a paragraph of text.",
      color: "#7F8C8D",
    },
  ];

  const handleFlip = (id, tag, color) => {
    const isFlipped = flipped.includes(id);
    const updatedFlipped = isFlipped
      ? flipped.filter((item) => item !== id)
      : [...flipped, id];
    setFlipped(updatedFlipped);

    // Add tag to code editor (plain HTML, not span)
    if (!isFlipped) {
      setCode((prevCode) => {
        if (id === "doctype") return tag + "\n" + prevCode;
        if (id === "html") return prevCode.replace(/<\!DOCTYPE html>/, `$&\n${tag}`);
        if (id === "head") return prevCode.replace(/<html>/, `$&\n${tag}`);
        if (id === "body") return prevCode.replace(/<\/head>/, `$&\n${tag}`);
        if (id === "h1" || id === "p") return prevCode.replace(/<body>/, `$&\n  ${tag}`);
        return prevCode + "\n" + tag;
      });
    }
  };

  const runCode = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2 flex items-center">
          <span className="mr-2">🧱</span> Build HTML Structure
        </h2>
        <p className="text-gray-700 mb-6">
          Click on each element to reveal its purpose and watch it build your code!
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {elements.map((el) => (
            <div
              key={el.id}
              onClick={() => handleFlip(el.id, el.tag, el.color)}
              className="cursor-pointer p-4 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 bg-white flex flex-col justify-center items-center text-center min-h-[130px]"
              style={{
                backgroundColor: el.color + "22",
                border: `2px solid ${el.color}`,
              }}
            >
              {flipped.includes(el.id) ? (
                <p
                  className="text-sm text-center font-medium px-2"
                  style={{ color: el.color }}
                >
                  {el.description}
                </p>
              ) : (
                <pre
                  className="text-sm font-mono font-semibold leading-tight whitespace-pre-wrap text-center"
                  style={{ color: el.color }}
                >
                  {el.tag}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Try it yourself</h2>
          <button
            onClick={runCode}
            className="px-5 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold"
          >
            Run ▶
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Click the cards above to build your HTML code..."
            className="w-full h-72 p-3 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <div className="border rounded-lg overflow-hidden">
            <iframe ref={iframeRef} title="preview" className="w-full h-72 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
