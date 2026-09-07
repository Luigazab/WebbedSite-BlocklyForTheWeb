import { useNavigate } from "react-router";

export default function BackButton({ message = "Go back", fallback = "/" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button onClick={handleBack} className="p-1 font-semibold text-slate-700 hover:text-slate-800 hover:bg-slate-200 transition-colors!">
      {message}
    </button>
  );
}
