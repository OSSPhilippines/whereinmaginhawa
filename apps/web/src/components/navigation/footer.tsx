import Link from 'next/link';
import { MapPin, Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white/70">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-white">Where in Maginhawa</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your community-driven guide to the best restaurants, cafes, and food spots on Maginhawa Street.
            </p>
            <a
              href="https://github.com/OSSPhilippines/whereinmaginhawa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/places" className="text-sm hover:text-white transition-colors">Browse Directory</Link></li>
              <li><Link href="/add-place" className="text-sm hover:text-white transition-colors">Add a Restaurant</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5">
              <li><a href="https://github.com/OSSPhilippines/whereinmaginhawa" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">GitHub</a></li>
              <li><a href="https://github.com/OSSPhilippines/whereinmaginhawa/issues" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">Report an Issue</a></li>
              <li><Link href="/contributing" className="text-sm hover:text-white transition-colors">Contributing Guide</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              <li><Link href="/terms" className="text-sm hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs">
            &copy; {currentYear} Where in Maginhawa. Built for the community.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/places" className="hover:text-white transition-colors">About Us</Link>
            <a href="mailto:drum-ice-scoundrel@duck.com" className="hover:text-white transition-colors">Contact</a>
            <Link href="/add-place" className="hover:text-white transition-colors">Add a Restaurant</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
