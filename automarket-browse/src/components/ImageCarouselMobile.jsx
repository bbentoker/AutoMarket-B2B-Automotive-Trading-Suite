import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getCarPhotos } from '../services/api';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';

const ImageCarouselMobile = ({ id }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  if (loading) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!images.length) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-500">
        No images available
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        className="w-full h-full"
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
              <img
                src={image.url}
                alt={`Car image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Image counter */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {images.length > 1 ? `${currentSlide + 1} / ${images.length}` : '1 / 1'}
      </div>


    </div>
  );
};

ImageCarouselMobile.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ImageCarouselMobile; 