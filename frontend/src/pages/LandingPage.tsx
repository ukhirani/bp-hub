import bpLogo from "@/assets/white.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <img className="h-48 w-auto object-contain" src={bpLogo} alt="Logo" />
        <h1 className="text-center">
          A tool to ironically skip the boilerplate
        </h1>
        <Button
          variant="link"
          onClick={() => navigate("/login", { replace: true })}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
