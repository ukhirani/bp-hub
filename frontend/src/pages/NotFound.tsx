import bpLogo from "@/assets/white.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

const NotFound = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2">
                <img className="h-48 w-auto object-contain" src={bpLogo} alt="Logo" />
                <h1 className="text-center">
                    {children}
                </h1>
                <Button
                    variant="link"
                    className="underline cursor-pointer"
                    onClick={() => navigate("/", { replace: true })}
                >
                    Go to Home
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
