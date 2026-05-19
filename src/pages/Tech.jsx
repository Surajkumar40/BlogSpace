import React from "react";
import useEffect from "react";
import { Link } from "react-router-dom";
import { CategoryPage } from "./CategoryPages";

  function Tech() {
    useEffect(() => { document.title = "Tech | BlogSpace"; }, []);  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Tech</h1>
      <p className="text-gray-700 text-lg">
        Welcome to the Tech section! Here you can explore articles, tutorials, and posts
        about the latest technology trends, programming, gadgets, and innovations.
      </p>
    </div>
  );
}
export { Tech as default } from "./CategoryPages";