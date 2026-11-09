import { useNavigate } from "react-router";

export default function BackButton({ message = "Go back", fallback = "/" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Browser history length includes forward entries and unrelated sites.
    // React Router records this app's current history position in `idx`.
    if (Number.isInteger(window.history.state?.idx) && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button type="button" onClick={handleBack} className="p-1 font-semibold text-foreground hover:text-foreground hover:bg-muted transition-colors!">
      {message}
    </button>
  );
}
