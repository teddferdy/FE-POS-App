/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { ArrowBigLeft, ArrowBigRight, Info } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog";

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <div className="flex items-center">
      <button onClick={prevImage}>
        <ArrowBigLeft className="w-10 h-10" color="#bcbcbc" />
      </button>
      <div className="flex-1 p-2 w-full">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex}`}
          className="w-full object-cover"
        />
      </div>
      <button onClick={nextImage}>
        <ArrowBigRight className="w-10 h-10" color="#bcbcbc" />
      </button>
    </div>
  );
};

const DialogCarouselImage = () => {
  const images = [
    "https://via.placeholder.com/600x300/FF5733/FFFFFF?text=Image+1",
    "https://via.placeholder.com/600x300/33FF57/FFFFFF?text=Image+2",
    "https://via.placeholder.com/600x300/3357FF/FFFFFF?text=Image+3"
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Info className="w-6 h-6" color="#bcbcbc" />
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Image Carousel</DialogTitle>
        </DialogHeader>
        <ImageCarousel images={images} />
      </DialogContent>
    </Dialog>
  );
};

export default DialogCarouselImage;
