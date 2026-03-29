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
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-10 overflow-y-auto">
            <MdClose onClick={toggleModal}  size={50} className='cursor-pointer absolute top-5 right-5 text-white hover:text-gray-400 transition-colors'/>
        </div>
    </div>
  )
}

export default ImageModal