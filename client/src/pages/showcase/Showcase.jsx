import './showcase.css';
import ScrollHero from './ScrollHero';
import FeaturesSection from './FeaturesSection';
import SpecsSection from './SpecsSection';
import ClosingCTA from './ClosingCTA';

// Standalone luxury product showcase — scroll-scrubbed hero (canvas + JPEG frames
// rendered from the project's own 3D car) funnelling into a ParkEase CTA.
export default function Showcase() {
  return (
    <main className="lux" style={{ background: '#000' }}>
      <ScrollHero />
      <FeaturesSection />
      <SpecsSection />
      <ClosingCTA />
    </main>
  );
}
