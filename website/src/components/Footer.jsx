import { Link } from 'react-router-dom';

export default function Footer(){
  return (
    <footer className="border-t border-white/10 bg-bg/60">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} AppsMobs</span>
            <span className="text-white/40">•</span>
            <Link to="/about" className="hover:text-white">About</Link>
            <span className="text-white/40">•</span>
            <Link to="/download" className="hover:text-white">Download</Link>
          </div>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <a href="mailto:support@appsmobs.com" className="hover:text-white">Support</a>
            <Link to="/partnership" className="hover:text-white">Become a Partner</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

