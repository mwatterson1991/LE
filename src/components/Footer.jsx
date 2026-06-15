import React from 'react'

// Shared site footer for the leland.ai pages.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <img src={`${import.meta.env.BASE_URL}assets/logos/New Leland Logo/Icon/Icon-White.svg`} alt="Leland" className="footer-logo" />
          <div className="footer-bottom">
            <div className="footer-social">
              <a href="https://www.linkedin.com/school/joinleland/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://www.instagram.com/joinleland/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
            <p className="footer-copyright">Copyright 2026 Leland Inc.<br />All rights reserved.</p>
          </div>
        </div>

        <div className="footer-columns">
          <div className="footer-col">
            <h4 className="footer-col-heading">Platform</h4>
            <ul className="footer-col-links">
              <li><a href="https://www.joinleland.com" className="footer-col-link">Home</a></li>
              <li><a href="https://www.joinleland.com/events" className="footer-col-link">Free Events</a></li>
              <li><a href="https://www.joinleland.com/bootcamps" className="footer-col-link">Bootcamps</a></li>
              <li><a href="https://www.joinleland.com/plus" className="footer-col-link">Leland+</a></li>
              <li><a href="https://www.joinleland.com/become-an-expert" className="footer-col-link">Become an expert</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-heading">Popular</h4>
            <ul className="footer-col-links">
              <li><a href="https://www.joinleland.com/search/school/mba" className="footer-col-link">MBA</a></li>
              <li><a href="https://www.joinleland.com/search/career/build-with-ai" className="footer-col-link">AI Productivity</a></li>
              <li><a href="https://www.joinleland.com/search/career/management-consulting" className="footer-col-link">Management Consulting</a></li>
              <li><a href="https://www.joinleland.com/search/test/gre" className="footer-col-link">GRE</a></li>
              <li><a href="https://www.joinleland.com/search/career/private-equity" className="footer-col-link">Private Equity</a></li>
              <li><a href="https://www.joinleland.com/search/career/product-management" className="footer-col-link">Product Management</a></li>
              <li><a href="https://www.joinleland.com/search/career/career-development" className="footer-col-link">Career Development</a></li>
              <li><a href="https://www.joinleland.com/search/school/college" className="footer-col-link">College</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-heading">For Organizations</h4>
            <ul className="footer-col-links">
              <li><a href="/program" className="footer-col-link">AI Builder Program</a></li>
              <li><a href="/services" className="footer-col-link">AI Services</a></li>
              <li><a href="/recruit" className="footer-col-link">Recruit AI Talent</a></li>
              <li><a href="/pledge" className="footer-col-link">100M Pledge</a></li>
              <li><a href="https://www.leland.ai/services" className="footer-col-link">AI Transformation</a></li>
              <li><a href="https://partner.joinleland.com/universities" className="footer-col-link">For Universities</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-heading">Company</h4>
            <ul className="footer-col-links">
              <li><a href="https://www.joinleland.com/reviews" className="footer-col-link">Reviews</a></li>
              <li><a href="https://www.joinleland.com/careers" className="footer-col-link">Careers</a></li>
              <li><a href="https://www.joinleland.com/library" className="footer-col-link">Library</a></li>
            </ul>
            <h4 className="footer-col-heading footer-col-heading-sub">Resources</h4>
            <ul className="footer-col-links">
              <li><a href="https://www.joinleland.com/support" className="footer-col-link">Support</a></li>
              <li><a href="https://www.joinleland.com/legal" className="footer-col-link">Legal</a></li>
              <li><a href="https://www.joinleland.com/privacy" className="footer-col-link">Privacy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
