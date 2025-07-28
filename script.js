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
    // Configuration
    const config = {
        repoOwner: 'amgeekz',
        repoName: 'megahjayapvc',
        galleryFolder: 'galeri',
        branch: 'main',
        itemsPerPage: 9, // 3x3 grid
        supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm']
    };

    // DOM Elements
    const galleryGrid = document.getElementById('galleryGrid');
    const lightbox = document.querySelector('.lightbox');
    const mediaContainer = document.querySelector('.lightbox-media-container');
    const captionElement = document.querySelector('.lightbox-caption');
    const closeBtn = document.querySelector('.close-lightbox');

    // State Management
    let currentPage = 1;
    let allMediaFiles = [];
    let isLoading = false;

    // Initialize Load More Button
    const loadMoreBtn = createLoadMoreButton();
    
    // Initial Load
    loadGallery();

    // Main Gallery Loader
    async function loadGallery(page = 1) {
        if (isLoading) return;
        
        try {
            isLoading = true;
            currentPage = page;

            // Show loading state only for first page or empty grid
            if (page === 1 || galleryGrid.children.length === 0) {
                showLoadingState();
                loadMoreBtn.disabled = true;
            }

            // Fetch data if not already loaded
            if (page === 1 || allMediaFiles.length === 0) {
                await fetchGalleryData();
            }

            // Render gallery items
            renderGalleryItems(page);

            // Initialize lightbox on first load
            if (page === 1) {
                initLightbox();
            }

        } catch (error) {
            console.error('Gallery Error:', error);
            showErrorState(error);
        } finally {
            isLoading = false;
            updateLoadMoreButton();
        }
    }

    // Helper Functions
    function createLoadMoreButton() {
        const container = document.createElement('div');
        container.className = 'load-more-container';
        
        const button = document.createElement('button');
        button.className = 'load-more-btn';
        button.textContent = 'Lihat Selengkapnya';
        button.addEventListener('click', () => loadGallery(currentPage + 1));
        
        container.appendChild(button);
        galleryGrid.parentNode.insertBefore(container, galleryGrid.nextSibling);
        
        return button;
    }

    async function fetchGalleryData() {
        const response = await fetch(
            `https://api.github.com/repos/${config.repoOwner}/${config.repoName}/contents/${config.galleryFolder}?ref=${config.branch}`,
            { headers: { 'Accept': 'application/vnd.github.v3+json' } }
        );

        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
        }

        const files = await response.json();
        allMediaFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return config.supportedFormats.includes(ext);
        });

        if (allMediaFiles.length === 0) {
            throw new Error('No media found in gallery folder');
        }
    }

    function renderGalleryItems(page) {
        const startIndex = (page - 1) * config.itemsPerPage;
        const endIndex = startIndex + config.itemsPerPage;
        const mediaFilesToShow = allMediaFiles.slice(startIndex, endIndex);

        // Clear only on first page
        if (page === 1) {
            galleryGrid.innerHTML = '';
        }

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        mediaFilesToShow.forEach(file => {
            const galleryItem = createGalleryItem(file);
            fragment.appendChild(galleryItem);
        });

        galleryGrid.appendChild(fragment);
    }

    function createGalleryItem(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const isVideo = ['mp4', 'webm'].includes(ext);
        const item = document.createElement('div');
        
        item.className = 'gallery-item';
        item.dataset.src = file.download_url;
        item.dataset.type = isVideo ? 'video' : 'image';
        item.dataset.caption = file.name.replace(/\.[^/.]+$/, '');
        
        item.innerHTML = `
            <div class="thumbnail">
                ${isVideo ? `
                    <video muted loop playsinline>
                        <source src="${file.download_url}" type="video/${ext}">
                    </video>
                    <div class="play-icon"><i class="fas fa-play"></i></div>
                ` : `
                    <img src="${file.download_url}" alt="${file.name.replace(/\.[^/.]+$/, '')}" loading="lazy">
                `}
            </div>
        `;
        
        return item;
    }

    function updateLoadMoreButton() {
        const hasMore = (currentPage * config.itemsPerPage) < allMediaFiles.length;
        loadMoreBtn.disabled = !hasMore || isLoading;
        loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        loadMoreBtn.textContent = isLoading ? 'Memuat...' : 'Lihat Selengkapnya';
    }

    function showLoadingState() {
        galleryGrid.innerHTML = `
            <div class="loading" style="grid-column: 1/-1; text-align:center; padding:2rem;">
                <i class="fas fa-spinner fa-spin"></i> Memuat galeri...
            </div>
        `;
    }

    function showErrorState(error) {
        galleryGrid.innerHTML = `
            <div class="error" style="grid-column: 1/-1; text-align:center; padding:2rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${error.message}</p>
                <button class="retry-button">Coba Lagi</button>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
    }

    // Lightbox Functions
    function initLightbox() {
        // Event delegation for gallery items
        galleryGrid.addEventListener('click', handleGalleryItemClick);
        
        // Lightbox controls
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', e => e.target === lightbox && closeLightbox());
        document.addEventListener('keydown', e => e.key === 'Escape' && closeLightbox());
    }

    function handleGalleryItemClick(e) {
        const galleryItem = e.target.closest('.gallery-item');
        if (!galleryItem) return;

        const { src, type, caption } = galleryItem.dataset;
        
        mediaContainer.innerHTML = type === 'video' 
            ? `<video src="${src}" controls autoplay style="max-width:100%"></video>`
            : `<img src="${src}" alt="${caption}" style="max-width:100%">`;
        
        captionElement.textContent = caption;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
        mediaContainer.querySelector('video')?.pause();
    }

    // Retry button handler
    document.addEventListener('click', e => {
        if (e.target.classList.contains('retry-button')) {
            currentPage = 1;
            loadGallery();
        }
    });
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

