import React from "react";

const Home = () => {
  return (
    <div className="flex h-screen">
      <div className="bg-red-500 hidden md:block flex-[0.1] md:hover:flex-[0.2] transition-all">
        Sidebar
      </div>
      <div className="flex-1 bg-orange-900">Menu</div>
    </div>
  );
};

export default Home;
