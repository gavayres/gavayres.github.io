(function() {
  'use strict';

  // Get the toggle button
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply the theme on page load
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    // Show light mode color (what it will change to when clicked)
    darkModeToggle.textContent = '●';
    darkModeToggle.style.color = '#9cc799c8';
  } else {
    document.body.classList.remove('dark-mode');
    // Show dark mode color (what it will change to when clicked)
    darkModeToggle.textContent = '●';
    darkModeToggle.style.color = '#333333';
  }

  // Toggle dark mode when button is clicked
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      
      // Update button icon - show the color it will change to when clicked
      darkModeToggle.textContent = '●';
      // If now in dark mode, show light mode color (next click goes to light)
      // If now in light mode, show dark mode color (next click goes to dark)
      darkModeToggle.style.color = isDarkMode ? '#9cc799c8' : '#333333';

      // Save preference to localStorage
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
  }
})();

