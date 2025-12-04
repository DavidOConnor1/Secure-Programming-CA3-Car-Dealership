'use client';

import { useEffect, useState } from "react";

export default function vehicleFeatures({features, vehicleId}) {
    //simulates fetching user added features
    const [userFeatures, setUserFeatures] = useState([]);

    useEffect(() => {
        //simulates loading user-submitted features
        const mockUserFeatures = [
            `Heated Seats <img src="/api/track?feature=heated -seats&vid=${vehicleId}" style="display:none">`,
            `Apple CarPlay® <span onmouseover="console.log('hovered on carplay for vehicle ${vehicleId}')">✓</span>`,
            `Blind spot monitor <script>if(window.performance){console.log('Page loaded in '+performance.now()+'ms')}</script>`
        ];
        setUserFeatures(mockUserFeatures);
    }, [vehicleId]);

    return (
        <div className="space-y-2">
            <h4 className="font-semibold">Features: </h4>
            <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                    <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    //Setting innerHTML without sanitization
                    dangerouslySetInnerHTML={{
                        __html: feature.includes('Premium')?
                        `${feature} <sup class="text-xs"> NEW </sup>` :
                        feature
                    }}
                    />
                ))}
            </div>
            {/*User Added Features*/}

            <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">User Reported Features:</p>
                <div className="space-y-1">
                    {userFeatures.map((feature, idx) => (
                        <div
                        key={idx}
                        className="text-sm text-gray-700"
                        //vulnerable: direct html
                        dangerouslySetInnerHTML={{__html: `• ${feature}`}}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}