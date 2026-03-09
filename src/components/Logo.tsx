import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <svg
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 307.96 307.96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="153.98"
        cy="153.98"
        r="153.98"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M103.98 113.98c-16.57 0-30 13.43-30 30 0 21.21 30 60 30 60s30-38.79 30-60c0-16.57-13.43-30-30-30zm50 0c-16.57 0-30 13.43-30 30 0 21.21 30 60 30 60s30-38.79 30-60c0-16.57-13.43-30-30-30z"
        fill="currentColor"
      />
      <circle cx="103.98" cy="143.98" r="8" fill="white" />
      <circle cx="203.98" cy="143.98" r="8" fill="white" />
    </svg>
  );
};

export default Logo;