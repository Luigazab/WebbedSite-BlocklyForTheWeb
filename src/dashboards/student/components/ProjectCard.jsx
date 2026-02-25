const ProjectCard = ({ icon: Icon, title, onClick, color }) => {
  return (
    <button onClick={onClick}
      className={`${color} btn w-full rounded-lg p-6  flex flex-col items-center justify-center space-y-3 min-h-30 `}
    >
      {Icon && <Icon className="w-10 h-10 text-blockly-light" />}
      <span className="font-bold text-blockly-light">{title}</span>
    </button>
  );
};

export default ProjectCard;