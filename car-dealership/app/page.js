import Image from "next/image";
import {car, Shield, Target, Award, Clock, Users, CheckCircle, Phone, Mail, MapPin, Icon} from 'lucide-react';

export default function Home() {
  
    
    const featuredVehicles = [
      {
        name: "2025 Type R 5FL 2.0 VTEC Turbo Honda Civic",
        price: "$87,000",
        image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.autoblog.com%2Freviews%2F2025-honda-civic-type-r-6-reasons-to-love-it-3-reasons-to-think-twice&psig=AOvVaw0GcA9e6n82bdUBc6tj0m8k&ust=1764689445487000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCICln9HanJEDFQAAAAAdAAAAABAE",
        features: ["VTEC", "TURBO", "Manual Transmission", "4.9, 0-60"]
      },
      {
        name: "2025 Mazda MX-5",
        price: "$36,900",
        image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.caranddriver.com%2Fmazda%2Fmx-5-miata&psig=AOvVaw2g_xqPpe9MX5G79z9uLSHM&ust=1764689479611000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMiVnN_anJEDFQAAAAAdAAAAABAE",
        features: ["Convertible", "Manual Transmission", "Discounted"]
      },
      {
        name: "2026 Toyota AE-86",
        price: "$40,000",
        image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.motor1.com%2Fnews%2F497618%2Ftoyota-ae86-modern-rendering%2F&psig=AOvVaw2W1ZSE-SCh5zUroaRDuHf-&ust=1764689511773000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCNDc__LanJEDFQAAAAAdAAAAABAE",
        features: ["Classic", "Electric", "Manual Transmission"]
      }
    ];

    const whyUs = [
      {
        icon: <Award className="text-blue-600" size={24} />,
        title:"Award-Winning Service",
        description: "Consistently rated #1 in customer satisfaction for 10 consecutive years. 2015-2025",
      },
      {
      icon: <Clock className="text-blue-600" size={24} />,
      title: "Best Price Guarantee",
      description: "We can match or best verifiable price from competitors across the nation"
      },
      {
        icon: <Users className="text-blue-600" size={24} />,
        title: "Experienced Consultation",
        description: "Knowlegdeable staff dedicated to find your perfect vehicle"
      }
    ]

    return (
      
    );

  
}
