import { BookMarked, ChevronDownCircle, CircleArrowRight, FileCode } from "lucide-react";
import React from "react";

// Reusable component for a topic item with a "Start" button
const TopicItem = ({ name, icon:Icon }) => (
  <li className="flex justify-between py-2 p-2 rounded-r-lg  hover:bg-gray-100 disabled:bg-gray-300 bg-gray-300">
    <div className="flex items-center gap-5">
      <span className="bg-blockly-green p-1 rounded-full"><Icon className="w-8 h-8 fill-white stroke-blockly-green"/></span>
      <span className="text-slate-700 font-bold">{name}</span>
    </div>
    <button className="flex justify-between items-center gap-2 px-2 py-1 text-sm font-bold hover:bg-linear-to-l from-blockly-blue rounded-r-4xl transition-colors duration-1000 ease-in-out">
      <span className="hover:underline">Start</span>
      <CircleArrowRight/>
    </button>
  </li>
);

const CollapsibleCategory = ({ img, title, description, progress, topics, color }) => (
  <details className="group rounded-lg mb-4 transition-all" style={{ '--summary-open-color': color }}>
    <summary className="flex items-center shadow-sm bg-white justify-between p-5 cursor-pointer list-none border-3 border-white group-open:border-(--summary-open-color) rounded-lg transition-all duration-300">
      <div className="flex items-center gap-5">
        <img src={img} alt="" className="max-h-25" />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">
          Progress: <span className="text-blue-600">{progress}</span>
        </span>
        <ChevronDownCircle className="group-open:rotate-180 transition-transform duration-300"/>
      </div>
    </summary>
    <div className="mx-4 px-4 pb-4 rounded-b-xl bg-slate-600 overflow-hidden transition-all duration-300 max-h-0 group-open:max-h-125">
      <div className="border-l-8" style={{ borderLeftColor: color }}>
        <ul className="space-y-2 pt-2">
          {topics.map((topic, index) => (
            <TopicItem key={index} name={topic.title} icon={topic.icon}/>
          ))}
        </ul>
      </div>
    </div>
  </details>
);

const Hero = () => (
    <div className="bg-blockly-dark/80 rounded-2xl text-white bg-[url('/home_bg.jpg')] bg-cover bg-center shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-around gap-20 p-4 md:p-8 md:px-18 mb-8 bg-purple-950/80 rounded-2xl">
        <img src="/learn_web.png" alt="Website picture" className="max-h-50 rounded-lg" />
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="bg-blockly-red px-2 rounded">Web Development</span> Roadmap
          </h2>
          <p className="text-white max-w-2xl">
            <span className="font-bold">Learn web development Components</span>
            <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
        </div>
      </div>
    </div>
);
const LearnPage = () => {
  const categories = [
    {
      img: '/html_logo.png',
      title: "HTML",
      description: "A website's structure",
      progress: "0%",
      color: "#f97316",
      topics: [
        {title:"Introduction", icon:BookMarked},
        {title:"Basic Tags", icon:FileCode},
        {title:"Textual Tags", icon:FileCode},
        {title:"Structure Elements", icon:FileCode},
        {title:"Media Elements", icon:FileCode},
      ],
    },
    {
      img: '/css_logo.png',
      title: "CSS",
      description: "A website's design",
      progress: "0%",
      color: '#4285f4',
      topics: [
        {title:"Selectors", icon:FileCode},
        {title:"Box Model", icon:FileCode},
        {title:"Flexbox", icon:FileCode},
        {title:"Grid", icon:FileCode},
        {title:"Animations", icon:FileCode},
      ],
    },
    {
      img: '/js_logo.png',
      title: "JavaScript",
      description: "A website's behavior",
      progress: "0%",
      color: "#fbbc05",
      topics: [
        {title:"Variables", icon:FileCode},
        {title:"Functions", icon:FileCode},
        {title:"DOM Manipulation", icon:FileCode},
        {title:"Events", icon:FileCode},
        {title:"Async JS", icon:FileCode},
      ],
    },
  ];

  return (
    <main className="wrapper max-w-5xl mx-auto px-4 py-8 font-sans">
      <Hero />
      <section className="space-y-3">
        {categories.map((cat) => (
          <CollapsibleCategory
            key={cat.title}
            img={cat.img}
            title={cat.title}
            description={cat.description}
            progress={cat.progress}
            topics={cat.topics}
            color={cat.color}
          />
        ))}
      </section>
    </main>
  );
};

export default LearnPage;