import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container py-32 text-center">
      <div className="font-display text-gold tracking-[0.4em] text-xs mb-4">SPQR · ARCHIVE</div>
      <h1 className="font-serif text-7xl text-foreground">CDIV</h1>
      <div className="gold-divider my-6 max-w-xs mx-auto" />
      <p className="text-lg text-muted-foreground">
        This record does not exist in the imperial mainframe.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-md bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:shadow-imperial transition-all"
      >
        Return to Mainframe
      </Link>
    </div>
  );
};

export default NotFound;
