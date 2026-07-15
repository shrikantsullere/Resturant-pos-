import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo(0, 0);
    
    // Also find any scrollable main elements (like in MainLayout) and scroll them to top
    const mainElements = document.getElementsByTagName('main');
    if (mainElements.length > 0) {
      for (let i = 0; i < mainElements.length; i++) {
        mainElements[i].scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
