document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initSmoothScrolling();
    initHeaderShadow();
    initAdvantageTabs();
    initAnimations();
    initProductSliders();
    initImageModal();
});

document.addEventListener('DOMContentLoaded', function () {
    const galleryGrid = document.getElementById('galleryGrid');
    const repoOwner = 'amgeekz';
    const repoName = 'megahjayapvc';
    const galleryFolder = 'galeri';
    const branch = 'main';

    async function loadGallery() {
        try {
            galleryGrid.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i> Memuat galeri...
                </div>
            `;

            const response = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${galleryFolder}?ref=${branch}`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) {
                throw new Error(`Gagal memuat: ${response.status} ${response.statusText}`);
            }

            const files = await response.json();

            const mediaFiles = files.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'].includes(ext);
            });

            if (mediaFiles.length === 0) {
                throw new Error('Tidak ada media ditemukan di folder galeri');
            }

            galleryGrid.innerHTML = '';

            mediaFiles.slice(0, 9).forEach(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                const isVideo = ['mp4', 'webm'].includes(ext);

                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.dataset.src = file.download_url;
                galleryItem.dataset.type = isVideo ? 'video' : 'image';
                galleryItem.dataset.caption = file.name.replace(/\.[^/.]+$/, '');

                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail';

                if (isVideo) {
                    thumbnail.innerHTML = `
                        <video muted loop playsinline>
                            <source src="${file.download_url}" type="video/${ext}">
                        </video>
                        <div class="play-icon"><i class="fas fa-play"></i></div>
                    `;
                } else {
                    thumbnail.innerHTML = `
                        <img src="${file.download_url}" alt="${file.name.replace(/\.[^/.]+$/, '')}" loading="lazy">
                    `;
                }

                galleryItem.appendChild(thumbnail);
                galleryGrid.appendChild(galleryItem);
            });

            initLightbox();
        } catch (error) {
            console.error('Error loading gallery:', error);
            galleryGrid.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${error.message}</p>
                    <button class="retry-button">Coba Lagi</button>
                </div>
            `;
        }
    }

    function initLightbox() {
        const lightbox = document.querySelector('.lightbox');
        const mediaContainer = document.querySelector('.lightbox-media-container');
        const captionElement = document.querySelector('.lightbox-caption');
        const closeBtn = document.querySelector('.close-lightbox');

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function () {
                const src = this.dataset.src;
                const type = this.dataset.type;
                const caption = this.dataset.caption;

                mediaContainer.innerHTML = '';
                captionElement.textContent = caption;

                if (type === 'video') {
                    const video = document.createElement('video');
                    video.src = src;
                    video.controls = true;
                    video.autoplay = true;
                    video.style.maxWidth = '100%';
                    mediaContainer.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = caption;
                    mediaContainer.appendChild(img);
                }

                lightbox.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        });

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });

        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            const videos = mediaContainer.querySelectorAll('video');
            videos.forEach(v => v.pause());
        }
    }

    // Retry Button
    document.addEventListener('click', e => {
        if (e.target.classList.contains('retry-button')) {
            loadGallery();
        }
    });

    loadGallery();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Smooth Scrolling Functionality
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header Shadow on Scroll
function initHeaderShadow() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
        }
    });
}

// Advantage Tabs Functionality
function initAdvantageTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabBtns.length === 0 || tabContents.length === 0) return;
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (!tabId) return;
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(`${tabId}-advantages`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Animation on Scroll
function initAnimations() {
    const animatableElements = document.querySelectorAll('.product-card, .section-title, .advantage-card, .testimonials, .gallery');
    if (animatableElements.length === 0) return;
    
    // Set initial state
    animatableElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    const animateOnScroll = function() {
        animatableElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
}

// Product Slider Functionality
function initProductSliders() {
    const sliders = document.querySelectorAll('.product-slider');
    if (sliders.length === 0) return;
    
    sliders.forEach(slider => {
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');
        const dotsContainer = slider.querySelector('.slider-dots');
        
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        let slideInterval;
        
        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
        
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        
        function updateSlider() {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
            });
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        function goToSlide(index) {
            currentSlide = (index + slides.length) % slides.length;
            updateSlider();
        }
        
        function nextSlide() {
            goToSlide(currentSlide + 1);
        }
        
        function prevSlide() {
            goToSlide(currentSlide - 1);
        }
        
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000);
        }
        
        // Initialize slider
        updateSlider();
        startAutoSlide();
        
        // Pause on hover
        slider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slider.addEventListener('mouseleave', startAutoSlide);
        
        // Button events
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        // Touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(slideInterval);
        }, {passive: true});
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        }, {passive: true});
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                nextSlide();
            }
            if (touchEndX > touchStartX + 50) {
                prevSlide();
            }
        }
    });
}

function initImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    
    const modalImg = document.getElementById('modal-image');
    const captionText = document.querySelector('.modal-caption');
    const closeModal = document.querySelector('.close-modal');
    const modalPrev = document.createElement('button');
    const modalNext = document.createElement('button');
    
    // Create navigation buttons
    modalPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    modalNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
    modalPrev.className = 'modal-nav modal-prev';
    modalNext.className = 'modal-nav modal-next';
    modal.appendChild(modalPrev);
    modal.appendChild(modalNext);
    
    // Store all images and their sources
    let allImages = [];
    let currentImageIndex = 0;
    
    // Initialize modal with slider images
    function initModalImages() {
        allImages = [];
        const sliders = document.querySelectorAll('.product-slider');
        
        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.slide img');
            slides.forEach(img => {
                allImages.push({
                    src: img.src,
                    alt: img.alt || '',
                    element: img // Store reference to the original image element
                });
            });
        });
    }
    
    // Show image in modal
    function showImage(index) {
        if (allImages.length === 0) return;
        
        currentImageIndex = (index + allImages.length) % allImages.length;
        modalImg.src = allImages[currentImageIndex].src;
        if (captionText) captionText.innerHTML = allImages[currentImageIndex].alt;
    }
    
    // Navigation functions
    function nextImage() {
        showImage(currentImageIndex + 1);
    }
    
    function prevImage() {
        showImage(currentImageIndex - 1);
    }
    
    // Initialize modal images
    initModalImages();
    
    // Set up click handlers for all images
    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('click', function() {
            // Find the clicked image in our collection
            const clickedImage = allImages.find(item => 
                item.element === this ||  // Direct reference match
                item.src === this.src    // Fallback: src match
            );
            
            if (clickedImage) {
                currentImageIndex = allImages.indexOf(clickedImage);
                modal.style.display = "block";
                showImage(currentImageIndex);
            }
        });
    });
    
    // Navigation events
    modalNext.addEventListener('click', nextImage);
    modalPrev.addEventListener('click', prevImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (modal.style.display !== "block") return;
        
        if (e.key === "ArrowRight") nextImage();
        else if (e.key === "ArrowLeft") prevImage();
        else if (e.key === "Escape") modal.style.display = "none";
    });
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = "none";
        });
    }
    
    // Close when clicking outside image
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('modal-content')) {
            modal.style.display = "none";
        }
    });
}

