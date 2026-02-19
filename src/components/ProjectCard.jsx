const ProjectCard = ({ icon: Icon, title, onClick, color }) => {
  return (
    <button onClick={onClick}
      className={`${color} border-2 border-slate-300 rounded-lg p-6 hover:shadow-lg hover:bg-blockly-blue/10 hover:border-blockly-blue transition-all flex flex-col items-center justify-center space-y-3 min-h-30 `}
    >
      {Icon && <Icon className="w-10 h-10" />}
      <span className="font-bold text-gray-800">{title}</span>
    </button>
  );
};

export default ProjectCard;