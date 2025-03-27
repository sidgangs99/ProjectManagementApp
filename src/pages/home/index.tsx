import { signOut } from "next-auth/react";

const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <button onClick={() => signOut()} className="btn-primary">
        Sign Out
      </button>
    </div>
  );
};

export default Home;
