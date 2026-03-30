import React, { useEffect } from 'react'
import { MdClose } from "react-icons/md";

const ImageModal = ({ toggleModal, photos }) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

  return (
    <div>
        <div onClick={toggleModal} className="fixed inset-0 z-50 flex flex-col bg-black/80 p-10 overflow-y-auto">
            <MdClose onClick={toggleModal}  size={50} className='fixed cursor-pointer absolute top-5 right-10 text-white hover:text-gray-400 transition-colors'/>

            <div>
                {photos && photos.map((photo, index) => (
                    <div className='pb-7'>
                        <img key={index} src={photo.imageUrl} alt={`Property ${index}`} className=''/>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default ImageModal