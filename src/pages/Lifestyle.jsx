import React from "react";
import { useEffect } from "react";

function Lifestyle() {
   useEffect(() => { document.title = "Lifestyle | BlogSpace"; }, []);
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Lifestyle</h1>
      <p className="text-gray-700 text-lg">
        Welcome to the Lifestyle section! Discover posts about health, travel, food,
        fashion, and everyday living tips to inspire your lifestyle choices.
      </p>
    </div>
  );
}

export { Lifestyle as default } from "./CategoryPages";