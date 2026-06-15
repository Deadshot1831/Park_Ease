import { FaParking } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-brand-700">
          <FaParking /> ParkEase
        </div>
        <p>Smart parking, booked in advance — find, compare & reserve.</p>
        <p>© {new Date().getFullYear()} ParkEase. All rights reserved.</p>
      </div>
    </footer>
  );
}
