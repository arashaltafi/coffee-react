import { useEffect } from "react";
import Home from "./pages/Home";

const App = () => {
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (localStorage.getItem('theme') === 'light') {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <Home />
  )
}

export default App