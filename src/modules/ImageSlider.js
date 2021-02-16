import React, { useState } from 'react';
import { FiArrowLeftCircle, FiArrowRightCircle } from 'react-icons/fi';

export const Images = [
  { image: "/images/marvin/no4.png" },
  { image: "/images/marvin/no1.png" },
  { image: "/images/marvin/no2.png" },
  { image: "/images/marvin/no3.png" },
  { image: "/images/marvin/no5.png" },
  { image: "/images/marvin/no6.png" },
  { image: "/images/marvin/no7.png" },
  { image: "/images/marvin/no8.png" },
  { image: "/images/marvin/no9.png" },
  { image: "/images/marvin/no10.png" },
  { image: "/images/marvin/no11.png" },
  { image: "/images/marvin/no12.png" }
];

export const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  const nextSlide = () => { setCurrent(current === length - 1 ? 0 : current + 1); };
  const prevSlide = () => { setCurrent(current === 0 ? length - 1 : current - 1); };
  
  if(Array.isArray(images) || images.length >= 0) {
    return (
      <div className='slider disable-hl'>
        <FiArrowLeftCircle className='left-arrow' onClick={prevSlide} />
          <div className="slide active" key={current}>
            <img src={ images[current].image } alt='travel image' className='image disable-hl' />
          </div>
        <FiArrowRightCircle className='right-arrow' onClick={nextSlide} />
      </div>
    );
  }
  else { return null; }
};