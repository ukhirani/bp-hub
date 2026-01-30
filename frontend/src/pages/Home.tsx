import useToken from "../../hooks/useToken";
import LandingPage from "./LandingPage";

export default function Home() {
  const { token } = useToken();

  if (!token) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-background">
      <h1 className="text-xl font-semibold">Home</h1>
    </div>
  );
}
