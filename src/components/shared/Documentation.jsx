import React from "react";
import PageWrapper from "../layout/PageWrapper";

const categories = [
  {
    id: 1,
    title: "HTML",
    color: "#f97316",
    subcategories: [
      { id: 1, title: "Page",       color:"#FF8500", content:["<html>", "<head>", "<body>", "<title>"] },
      { id: 2, title: "Structure",  color:"#7b68ee", content:["<div>", "<header>", "<nav>", "<main>", "<footer>", "<section>", "<article>", "<br>", "<hr>"] },
      { id: 3, title: "Text",       color:"#4a90e2", content:["<h1>-<h6>", "<p>", "<span>", "<a>", "<strong>", "<em>"] },
      { id: 4, title: "Attributes", color:"#F5B945", content:["class", "id", "style", "attributes"] },
      { id: 5, title: "Media",      color:"#D94452", content:["<img>", "<audio>", "<video>"] },
      { id: 6, title: "Forms",      color:"#20b2aa", content:["<form>", "<label>", "<input>", "<textarea>", "<button>"] },
      { id: 7, title: "Tables",     color:"#9b59b6", content:["<table>", "<th>", "<tr>", "<td>"] },
      { id: 8, title: "Lists",      color:"#ff6b6b", content:["<li>", "<ul>", "<ol>", "<select>", "<option>"] },
    ]
  },
  {
    id: 2,
    title: "CSS",
    color: "#4285f4",
    subcategories: [
      { id: 1, title: "Selectors",                color:"#FF8500", content:["element", "class", "id", "universal (*)", "grouping (,)", "descendant", "child (>)", "adjacent sibling (+)", "general sibling (~)"] },
      { id: 2, title: "Text & Fonts",             color:"#4a90e2", content:["color", "font-family", "font-size", "font-weight", "line-height", "text-align", "text-decoration", "text-transform", "letter-spacing"] },
      { id: 3, title: "Box Model",                color:"#7b68ee", content:["margin", "padding", "border", "width", "height", "box-sizing"] },
      { id: 4, title: "Backgrounds",              color:"#F5B945", content:["background-color", "background-image", "background-repeat", "background-position", "background-size", "background-attachment"] },
      { id: 5, title: "Flexbox",                  color:"#D94452", content:["display:flex", "flex-direction", "justify-content", "align-items", "align-content", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis"] },
      { id: 6, title: "Grid",                     color:"#20b2aa", content:["display:grid", "grid-template-columns", "grid-template-rows", "grid-gap", "grid-column", "grid-row", "justify-items", "align-items"] },
      { id: 7, title: "Positioning",              color:"#9b59b6", content:["position", "top", "right", "bottom", "left", "z-index", "float", "clear"] },
      { id: 8, title: "Animations & Transitions", color:"#ff6b6b", content:["transition", "transition-duration", "transition-property", "animation", "animation-name", "animation-duration", "animation-iteration-count", "animation-timing-function", "@keyframes"] },
    ]
  },
  {
    id: 2,
    title: "JavaScript",
    color: "#fbbc05",
    subcategories: [
      { id: 1, title: "Basics",           color:"#FF8500", content:["variables (var, let, const)", "data types", "operators", "comments"] },
      { id: 2, title: "Control Flow",     color:"#4a90e2", content:["if", "else", "else if", "switch", "for loop", "while loop", "do...while"] },
      { id: 3, title: "Functions",        color:"#7b68ee", content:["function declaration", "function expression", "arrow functions", "parameters", "return"] },
      { id: 4, title: "Objects",          color:"#F5B945", content:["object literals", "properties", "methods", "this keyword", "JSON"] },
      { id: 5, title: "Arrays",           color:"#D94452", content:["array literals", "push()", "pop()", "shift()", "unshift()", "map()", "filter()", "reduce()", "forEach()"] },
      { id: 6, title: "DOM Manipulation", color:"#20b2aa", content:["document.getElementById()", "document.querySelector()", "innerHTML", "style", "addEventListener()", "createElement()", "appendChild()"] },
      { id: 7, title: "Events",           color:"#9b59b6", content:["onclick", "onchange", "onmouseover", "onkeydown", "onload"] },
      { id: 8, title: "Advanced",         color:"#ff6b6b", content:["ES6 features", "classes", "modules (import/export)", "promises", "async/await", "fetch API", "error handling (try...catch)"] },
    ]
  },
]

const Documentation = () => {
  return (
    <PageWrapper>
      <div className="space-y-4">

      </div>
      <div>
        <h1 className="text-xl font-bold">Documentation</h1>
        <p className="text-sm font-semibold text-slate-500">
          Read about every blocks here
        </p>
      </div>

    </PageWrapper>
  );
};

export default Documentation;
