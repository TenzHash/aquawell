import { useNavigate } from "react-router-dom";
import AuthModals from "../components/AuthModals";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <AuthModals
        loginOpen={false}
        registerOpen={true}
        onClose={() => navigate("/")}
        onSwitchToRegister={() => undefined}
        onSwitchToLogin={() => navigate("/login")}
      />
    </div>
  );
}
