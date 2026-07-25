import { AboutService } from "./components/AboutService";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Limits } from "./components/Limits";
import { SixSteps } from "./components/SixSteps";
import { Stats } from "./components/Stats";

export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
      <Stats />
      <AboutService />
      <SixSteps />
      <Limits />  
      <FAQ />
      <Footer />
    </>
  );
}
