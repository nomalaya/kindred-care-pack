import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BACK_BUTTON } from "@/lib/designSystem";

interface Props {
  /** If provided, renders a Link; otherwise uses history.back() */
  to?: string;
  label?: string;
}

const BackButton = ({ to, label = "Retour" }: Props) => {
  if (to) {
    return (
      <Link to={to} className={BACK_BUTTON}>
        <ArrowLeft className="h-4 w-4 mr-1" /> {label}
      </Link>
    );
  }

  return (
    <button onClick={() => window.history.back()} className={BACK_BUTTON}>
      <ArrowLeft className="h-4 w-4 mr-1" /> {label}
    </button>
  );
};

export default BackButton;
