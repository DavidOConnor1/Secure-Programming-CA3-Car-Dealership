"use client";

import { useEffect, useState } from "react";

export default function vehicleFeatures({ features, vehicleId }) {
  //simulates fetching user added features
  const [userFeatures, setUserFeatures] = useState([]);

  useEffect(() => {
    //simulates loading user-submitted features
    //removed all the mock data
    const mockUserFeatures = [
      `Heated Seats`,
      `Apple CarPlay®`,
      `Blind spot monitor`,
    ];
    setUserFeatures(mockUserFeatures);
  }, [vehicleId]);

  // santize text
  const santizeText = (text) => {
    if (!text) return "";
    return text
      .replace(/[<>]/g, "") //removes < >
      .replace(/javascript:/gi, "") //removes javascript
      .replace(/on\w+=/gi, "") //removes event handlers
      .trim();
  };

  //escapes html
  const escapeHTML = (text) => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">Features:</h4>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, idx) => {
          // SECURE: Sanitize the feature before checking
          const cleanFeature = sanitizeText(feature);
          const isPremium = cleanFeature.toLowerCase().includes("premium");

          return (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {/* SECURE: Render text safely */}
              {cleanFeature}
              {isPremium && <sup className="text-xs"> NEW</sup>}
            </span>
          );
        })}
      </div>

      {/* User Added Features */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">User Reported Features:</p>
        <div className="space-y-1">
          {userFeatures.map((feature, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              {/* SECURE: No dangerouslySetInnerHTML */}•{" "}
              {sanitizeText(feature)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
