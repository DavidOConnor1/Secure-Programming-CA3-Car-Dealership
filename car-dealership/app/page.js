import Image from "next/image";
import {
  Car,
  Shield,
  Target,
  Award,
  Clock,
  Users,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Home() {
  const featuredVehicles = [
    {
      name: "2025 Type R 5FL 2.0 VTEC Turbo Honda Civic",
      price: "$87,000",
      image:
        "https://www.autoblog.com/.image/w_3840,q_auto:good,c_limit/MjA5MDg4OTM3NDAxMTMyNjU2/2023-honda-civic-type-r.jpg",
      features: ["VTEC", "TURBO", "Manual Transmission", "4.9s 0-60"],
    },
    {
      name: "2025 Mazda MX-5",
      price: "$36,900",
      image:
        "https://hips.hearstapps.com/hmg-prod/images/2025-mazda-mx-5-miata-35th-anniversary-pr-114-6792b9db0b3ec.jpg?crop=0.707xw:0.596xh;0.168xw,0.334xh&resize=2048:*",
      features: ["Convertible", "Manual Transmission", "Discounted"],
    },
    {
      name: "2026 Toyota AE-86",
      price: "$40,000",
      image:
        "https://cdn.motor1.com/images/mgl/13P3q/s1/modern-day-toyota-ae86-rendering-front.webp",
      features: ["Classic", "Electric", "Manual Transmission"],
    },
  ];

  const whyUs = [
    {
      icon: <Award className="text-blue-600" size={24} />,
      title: "Award-Winning Service",
      description:
        "Consistently rated #1 in customer satisfaction for 10 consecutive years. 2015-2025",
    },
    {
      icon: <Clock className="text-blue-600" size={24} />,
      title: "Best Price Guarantee",
      description:
        "We can match or best verifiable price from competitors across the nation",
    },
    {
      icon: <Users className="text-blue-600" size={24} />,
      title: "Experienced Consultation",
      description: "Knowledgeable staff dedicated to find your perfect vehicle",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative h-[600px] bg-gradient-to-r from-gray-900 to-blue-900 dark:from-black dark:to-gray-900"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Trip Starts Here
            </h1>
            <p className="text-xl mb-8 text-gray-200 dark:text-gray-300">
              Premium Reliable Vehicles, Car Enthusiasts who understand their
              product and notable service. Do not be shy, pop in and drive your
              dream car home today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition duration-300">
                Browse Inventory
              </button>

              <button className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold text-lg transition duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We love and enjoy cars as much as you do and want to bring a
              simple buying experience that leaves you satisfied!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-zinc-50 dark:bg-gray-900 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target
                  className="text-blue-600 dark:text-blue-400"
                  size={32}
                />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                Customer Focused
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your satisfaction is our priority. We listen, we understand, and
                we deliver exactly what you desire from your next vehicle.
              </p>
            </div>

            <div className="text-center p-8 bg-zinc-50 dark:bg-gray-900 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield
                  className="text-blue-600 dark:text-blue-400"
                  size={32}
                />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                Transparent Process
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No hidden fees, no surprises. We believe in honest pricing and
                clear communication.
              </p>
            </div>

            <div className="text-center p-8 bg-zinc-50 dark:bg-gray-900 rounded-xl">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle
                  className="text-blue-600 dark:text-blue-400"
                  size={32}
                />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-black dark:text-white">
                Quality Assurance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All of our vehicles are inspected and maintained to the highest
                degree to provide a safe and reliable drive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-zinc-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
              Why Choose CarGuy Mechanics Dealership
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience a difference with a company who cares
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {whyUs.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-black p-8 rounded-xl shadow-lg"
              >
                <div className="flex items-start space-x-4">
                  <div className="shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">
              Trusted by Car Enthusiasts
            </h3>
            <p className="text-xl mb-6 text-blue-100">
              Join thousands of satisfied customers who found their dream car
              with us.
            </p>
            <div className="grid grid-cols-3 gap-8 mt-10">
              <div>
                <div className="text-4xl font-bold">15+</div>
                <div className="text-blue-200">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold">98%</div>
                <div className="text-blue-200">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold">5-Star</div>
                <div className="text-blue-200">Google Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <Car className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
              Featured Vehicles
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our current Japanese selection of Cars
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredVehicles.map((vehicle, index) => (
              <div
                key={index}
                className="bg-zinc-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">
                    {vehicle.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-black dark:text-white ">
                      {vehicle.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 dark:from-black dark:to-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Drive Your Dream Car?
            </h2>
            <p className="text-xl mb-10 text-gray-300">
              Visit us today or schedule a test drive. Our car enthusiast team
              is ready to help you find the perfect vehicle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition duration-300">
                Schedule Test Drive
              </button>
              <button className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-bold text-lg transition duration-300">
                Contact Sales
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-10 border-t border-gray-700">
              <div className="flex flex-col items-center">
                <Phone size={32} />
                <h4 className="text-xl font-semibold mt-4 mb-2">Call Us</h4>
                <p className="text-gray-300">(555) 123-CARS</p>
              </div>
              <div className="flex flex-col items-center">
                <Mail size={32} />
                <h4 className="text-xl font-semibold mt-4 mb-2">Email Us</h4>
                <p className="text-gray-300">sales@carguymechanics.com</p>
              </div>
              <div className="flex flex-col items-center">
                <MapPin size={32} />
                <h4 className="text-xl font-semibold mt-4 mb-2">Visit Us</h4>
                <p className="text-gray-300">123 JDM Street, Tokyo, Japan</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
