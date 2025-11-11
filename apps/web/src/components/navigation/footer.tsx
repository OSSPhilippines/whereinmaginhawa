import Link from 'next/link';
import { MapPin, Github, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-white">
                  Where In Maginhawa
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400">
              Your community-driven guide to the best restaurants, cafés, and food spots on Maginhawa Street.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/OSSPhilippines/whereinmaginhawa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/places" className="text-sm hover:text-primary transition-colors">
                  Browse Directory
                </Link>
              </li>
              <li>
                <Link href="/add-place" className="text-sm hover:text-primary transition-colors">
                  Add a Place
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/OSSPhilippines/whereinmaginhawa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/OSSPhilippines/whereinmaginhawa/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/OSSPhilippines/whereinmaginhawa/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Contributing Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm hover:text-primary transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Where In Maginhawa. A community-driven project by{' '}
              <a
                href="https://jofftiquez.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Joff Tiquez
              </a>
              {' '}in collaboration with the <a href="https://ossph.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open Source Software Philippines</a>.
            </p>
            <p className="text-xs text-gray-500 text-center md:text-right">
              Made with ❤️ for the Maginhawa community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
