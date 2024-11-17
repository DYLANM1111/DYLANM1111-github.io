document.addEventListener('DOMContentLoaded', function() {
    const productImage = document.querySelector('.product-image');
    const modal = document.getElementById('trailerModal');
    const closeBtn = document.querySelector('.close');
    const trailerVideo = document.getElementById('trailerVideo');

    const trailerUrl = 'images/wonder.mp4';

    productImage.addEventListener('click', function() {
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    function openModal() {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        trailerVideo.innerHTML = `<video width="100%" height="auto" controls>
                                    <source src="${trailerUrl}" type="video/mp4">
                                  </video>`;
        setTimeout(() => {
            trailerVideo.querySelector('video').play();
        }, 300);
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            trailerVideo.innerHTML = '';
        }, 300);
    }
});