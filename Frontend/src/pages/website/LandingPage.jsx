import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EcosystemGrid from './components/EcosystemGrid';
import Stats from './components/Stats';
import FeaturedFood from './components/FeaturedFood';
import HospitalityService from './components/HospitalityService';
import About from './components/About';
import Services from './components/Services';
import Reservation from './components/Reservation';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Loader from './components/Loader';

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-background text-text-primary selection:bg-landing-primary/30 min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <EcosystemGrid />
        <Stats />
        <FeaturedFood />
        <HospitalityService />
        <About />
        <Services />
        <Reservation />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
