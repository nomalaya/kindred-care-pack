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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="#FF6B6B" stroke="white" strokeWidth="2"/>
      <path d="M30 45 L35 40 L50 55 L65 40 L70 45 L50 65 Z" fill="white"/>
      <circle cx="38" cy="35" r="3" fill="white"/>
      <circle cx="62" cy="35" r="3" fill="white"/>
    </svg>
  );
};

export default Logo;