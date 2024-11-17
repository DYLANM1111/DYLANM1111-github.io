document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.getElementById('profileIcon');
    const profileDropdown = document.getElementById('profileDropdown');

    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target) && !profileIcon.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });
 
});