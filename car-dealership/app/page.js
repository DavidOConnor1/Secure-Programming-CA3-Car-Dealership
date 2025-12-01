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
      {/** Hero Section */}
      <>
       <section id="home" className="relative bg-linear-to-r from-gray-900 to-blue-900 dark:from-black dark:to-gray-900">
        <div className="relative container mx-auto px-6 h-full flex items-center">
             <div className="max-w-2xl text-white">
               <h1 className="text-5xl md:text-6xl font-bold mb-6">
                 Your Trip Starts Here
               </h1>
               <p className="text-xl mb-8 text-gray-200 dark:text-gray-300">
                 Premium Reliable Vehicles, Car Enthusiasts who understand their product and notable service.
                 Do not be shy, pop in and drive your dream car home today.
               </p>

               <div className="flex flex-col sm:flex-row gap-4">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition duration-300">
                   Browse Inventory
                 </button>

                 <button className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 px-8 rounded-lg font-semibold text-lg transition duration-300">
                   Learn More
                 </button>
               </div>

             </div>
           </div>
          
          </section>

            
          <section className="py-20 bg-white dark:bg-black"> 
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-black dark:text-white mb-4"> Our Mission</h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    We love and enjoy cars as much as you do and want to bring a simple buying experience that leaves you satisfied!
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center p-8 bg-zinc-50 dark:bg-gray-900 rounded-xl">
                    <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                      Customer Focused
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your satisfaction is our priority. We listen, we understand, and we deliver exactly what you desire from your next vehicle.
                    </p>
                  </div>

                  <div className="text-center p-8 bg-zinc-50 dark:bg-gray-900 rounded-xl">
                    <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white">Quality Assurance</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All of our vehicles are inspected and maintained to the highest degree that it provides a safe and reliable drive
                    </p>
                  </div>
                </div>
              </div>
          </section>

          

        
    );

  
}
