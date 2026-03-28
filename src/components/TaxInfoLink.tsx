import { Info } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TaxInfoLink = () => {
  const location = useLocation();
  const from = encodeURIComponent(location.pathname + location.search);

  return (
    <Link
      to={`/avantage-fiscal?from=${from}`}
      title="En savoir plus sur l'avantage fiscal"
      className="inline-flex items-center ml-1 bg-primary/10 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
    >
      <Info className="h-3.5 w-3.5 text-primary" />
    </Link>
  );
};

export default TaxInfoLink;
