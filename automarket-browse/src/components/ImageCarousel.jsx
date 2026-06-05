import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getCarPhotos } from '../services/api';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import required modules
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
// Import custom styles
import './ImageCarousel.css';

const ImageCarousel = ({ id }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getCarPhotos(id);
        console.log('Fetched images:', data.photos);
        // Filter out any potential duplicates by URL
        const uniqueImages = data.photos.filter((image, index, self) => 
          index === self.findIndex(img => img.url === image.url)
        );
        setImages(uniqueImages);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load images: ${err.message}`);
        setLoading(false);
      }
    };

    fetchImages();
  }, [id]);

  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  const handleSlideChange = (swiper) => {
    setCurrentSlide(swiper.activeIndex);
  };

  // Close popup when clicking outside the image
  const handlePopupBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPopup(false);
    }
  };

  // Handle keyboard events for popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPopup && e.key === 'Escape') {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  if (loading) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Swiper
          ref={swiperRef}
          style={{
            '--swiper-navigation-color': '#fff',
            '--swiper-pagination-color': '#fff',
          }}
          spaceBetween={10}
          navigation={false}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[Navigation, Thumbs]}
          className="w-full rounded-xl"
          onSlideChange={handleSlideChange}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="w-full bg-gray-100 relative overflow-hidden">
                <img
                  src={image.url}
                  alt={`Car image ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Magnify Icon */}
        <div
          onClick={handlePopupToggle}
          className="absolute bottom-4 right-4 z-10 cursor-pointer hover:opacity-70 transition-all duration-200"
        >
          <img src="/magnify-icon.svg" alt="Magnify" className="w-8 h-8" />
        </div>

        {/* Custom Navigation Buttons */}
        {images.length > 1 && (
          <>
            <div
              onClick={() => swiperRef.current?.swiper.slidePrev()}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-200 cursor-pointer hover:opacity-70"
            >
              <img src="/previous-photo.svg" alt="Previous" className="w-10 h-10 hover:brightness-75 transition-all duration-200" />
            </div>
            
            <div
              onClick={() => swiperRef.current?.swiper.slideNext()}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-200 cursor-pointer hover:opacity-70"
            >
              <img src="/next-photo.svg" alt="Next" className="w-10 h-10 hover:brightness-75 transition-all duration-200" />
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={6}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="thumbs-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <button className="w-full h-20 p-0 cursor-pointer focus:outline-none">
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Image Popup Modal */}
      {showPopup && images[currentSlide] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2"
          onClick={handlePopupBackdropClick}
        >
          <div className="relative w-[1000px] h-[700px] bg-stone-50 rounded-xl p-3">
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 z-10 text-gray-600 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Large image */}
            <img
              src={images[currentSlide].url}
              alt={`Car image ${currentSlide + 1} - Full size`}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

ImageCarousel.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ImageCarousel; 