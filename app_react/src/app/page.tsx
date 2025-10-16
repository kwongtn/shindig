import Image from "next/image";
import ThemeSelector from "@/components/theme-selector";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 p-4 sticky top-0 z-10">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Shindig</a>
        </div>
        <div className="flex-none">
          <ThemeSelector />
        </div>
      </div>
      
      <div className="hero min-h-[70vh] bg-base-100">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Shindig</h1>
            <p className="py-6">Next.js, Tailwind CSS & DaisyUI starter template with Sentry integration</p>
            
            <div className="flex flex-wrap justify-center gap-4 py-6">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-secondary">Documentation</button>
              <button className="btn btn-ghost">Learn More</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Next.js</h2>
                  <p>The React framework for production.</p>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Tailwind CSS</h2>
                  <p>A utility-first CSS framework.</p>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">DaisyUI</h2>
                  <p>Beautiful Tailwind CSS components.</p>
                </div>
              </div>
            </div>
            
            <div className="py-6">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Try the theme selector in the top right to see how themes change!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Buttons</h2>
              <div className="flex flex-wrap gap-2">
                <button className="btn">Default</button>
                <button className="btn btn-primary">Primary</button>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-accent">Accent</button>
                <button className="btn btn-ghost">Ghost</button>
                <button className="btn btn-link">Link</button>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Badges & Indicators</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="badge badge-primary">primary</div>
                <div className="badge badge-secondary">secondary</div>
                <div className="badge badge-accent">accent</div>
                <div className="badge">Default</div>
                <div className="indicator">
                  <div className="indicator-item badge badge-primary">99+</div>
                  <div className="btn">inbox</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Progress Bars & Stats</h2>
              <div className="space-y-3">
                <progress className="progress progress-primary w-full" value="50" max="100"></progress>
                <progress className="progress progress-secondary w-full" value="75" max="100"></progress>
                <progress className="progress progress-accent w-full" value="90" max="100"></progress>
                
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Downloads</div>
                    <div className="stat-value">31K</div>
                    <div className="stat-desc">Jan 1st - Feb 1st</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Input Elements</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
                <input type="text" placeholder="Primary" className="input input-primary w-full max-w-xs" />
                <input type="text" placeholder="Secondary" className="input input-secondary w-full max-w-xs" />
                <input type="text" placeholder="Accent" className="input input-accent w-full max-w-xs" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="divider my-8">Theme Showcase</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-primary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">Primary Card</h2>
              <p>This card uses the primary color as background.</p>
            </div>
          </div>
          
          <div className="card bg-secondary text-secondary-content">
            <div className="card-body">
              <h2 className="card-title">Secondary Card</h2>
              <p>This card uses the secondary color as background.</p>
            </div>
          </div>
          
          <div className="card bg-accent text-accent-content">
            <div className="card-body">
              <h2 className="card-title">Accent Card</h2>
              <p>This card uses the accent color as background.</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-10">
        <aside>
          <p>Next.js + Tailwind CSS + DaisyUI + Sentry Starter</p>
        </aside>
      </footer>
    </div>
  );
}
