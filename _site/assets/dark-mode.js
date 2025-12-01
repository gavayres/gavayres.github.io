(function() {
  'use strict';

  // Get the toggle button
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply the theme on page load
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '●';
    darkModeToggle.style.color = '#333333';
  } else {
    document.body.classList.remove('dark-mode');
    darkModeToggle.textContent = '●';
    darkModeToggle.style.color = '#9cc799c8';
  }

  // Toggle dark mode when button is clicked
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      
      // Update button icon
      darkModeToggle.textContent = '●';
      
      darkModeToggle.style.color = isDarkMode ? '#9cc799c8' : '#333333';

      // Save preference to localStorage
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
  }
})();

