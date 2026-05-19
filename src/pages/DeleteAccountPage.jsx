import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

 function DeleteAccountPage() {
  const navigate = useNavigate();

  const handleDelete = () => {
    // Call your backend API here to delete the account
    alert("Account deleted successfully!");
    navigate("/login"); // Redirect to login after deletion
    useEffect(() => { document.title = "Delete Account | BlogSpace"; }, []);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
      <h1 className="text-xl font-bold mb-4 text-red-600">Delete Account</h1>
      <p className="text-gray-700 mb-6">
        Are you sure you want to permanently delete your account? This action cannot be undone.
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export { DeleteAccountPage as default } from "./AccountPages";
