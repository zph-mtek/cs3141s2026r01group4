import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { amenityIcon } from '../components/amenityIcons';
import { FaRegTrashCan } from "react-icons/fa6";
import { getPropertyById } from '../API/getPropertyById';
import { updatePropertyData } from '../API/updatePropertyData';
import { deleteProperty } from '../API/deleteProperty';
import PinDropMap from '../components/PinDropMap.jsx';

const EditProperty = () => {

  const navigate = useNavigate();
  const { propertyId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      if (decodedToken.data.role !== 'Landlord') {
        navigate('/');
      } else {
        const fetchPropertyData = async () => {
          try {
            const result = await getPropertyById(propertyId);

            const rawData = result.data || result;
            const propertyBox = rawData.property;

            if (propertyBox) {
              const newInfo = {
                name: propertyBox.name || '',
                address: propertyBox.address || '',
                city: propertyBox.city || '',
                distance: propertyBox.distanceFromMTU || '',
                walkDistance: propertyBox.walkDistance || '',
                amenities: Array.isArray(rawData.amenities) ? rawData.amenities.map(a => a.amenityName || a) : [],
                description: propertyBox.description || '',
                images: Array.isArray(rawData.images) ? rawData.images : []
              };
              setPropertyInfo(newInfo);
              if (propertyBox.lat != null) setLat(parseFloat(propertyBox.lat));
              if (propertyBox.lng != null) setLng(parseFloat(propertyBox.lng));

              if (Array.isArray(rawData.rentals) && rawData.rentals.length > 0) {
                const formattedRooms = rawData.rentals.map(room => ({
                  id: room.rentalId,
                  name: room.roomName || '',
                  bedrooms: room.bedroomCt || 1,
                  bathrooms: room.bathroomCt || 1,
                  rent: room.cost || '',
                  description: room.description || '',
                  images: Array.isArray(room.images) ? room.images : []
                }));
                setRooms(formattedRooms);
              }
            }
          } catch (apiError) {
            console.error("failed to fetch data:", apiError);
          }
        }
        fetchPropertyData();
      }

    } catch (error) {
      console.error("Token invalid:", error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, propertyId]);

  // usestate to send to the backend
  const [propertyInfo, setPropertyInfo] = useState({
    name: '',
    address: '',
    city: '',
    distance: '',
    walkDistance: '',
    amenities: [],
    description: '',
    images: [] // 20 max
  });

  // data for room 
  const initialRoom = {
    id: Date.now(),
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    rent: '',
    description: '',
    images: [] // 5 max
  };

  // usestate to add rooms
  const [rooms, setRooms] = useState([initialRoom])

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!propertyInfo.name.trim())         errors.name        = 'Property name is required.';
    if (!propertyInfo.address.trim())      errors.address     = 'Address is required.';
    if (!propertyInfo.city.trim())         errors.city        = 'City is required.';
    if (!propertyInfo.distance.toString().trim()) errors.distance = 'Distance from campus is required.';
    if (!propertyInfo.walkDistance.trim()) errors.walkDistance = 'Walk distance is required.';
    if (!propertyInfo.description.trim())  errors.description = 'Description is required.';
    rooms.forEach((room, i) => {
      if (!room.name.trim())               errors[`room_${i}_name`]      = 'Room name is required.';
      if (!room.rent.toString().trim())    errors[`room_${i}_rent`]      = 'Price is required.';
      if (!room.bedrooms.toString().trim()) errors[`room_${i}_bedrooms`] = 'Number of bedrooms is required.';
      if (!room.bathrooms.toString().trim()) errors[`room_${i}_bathrooms`] = 'Number of bathrooms is required.';
    });
    return errors;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProperty(propertyId);
      navigate('/manage');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete property. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // function to send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFormErrors({});
    const formData = new FormData();

    formData.append("propertyId", propertyId);
    formData.append("name", propertyInfo.name);
    formData.append("address", propertyInfo.address);
    formData.append("city", propertyInfo.city);
    formData.append("distance", propertyInfo.distance);
    formData.append("description", propertyInfo.description);
    formData.append("walkDistance", propertyInfo.walkDistance);
    formData.append("amenities", JSON.stringify(propertyInfo.amenities));
    if (lat !== null) formData.append("lat", lat);
    if (lng !== null) formData.append("lng", lng);

    propertyInfo.images.forEach((imgObj) => {
      if (imgObj.file) {
        formData.append("propertyImages[]", imgObj.file);
      }
    });

    const cleanRoomsData = rooms.map(room => ({
      id: room.id,
      name: room.name,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      rent: room.rent,
      description: room.description
    }));

    formData.append("roomsInfo", JSON.stringify(cleanRoomsData));

    rooms.forEach(room => {
      room.images.forEach(imgObj => {
        if (imgObj.file) {
          formData.append(`roomImages_${room.id}[]`, imgObj.file);
        }
      });
    });

    setIsSubmitting(true);
    try {
      await updatePropertyData(formData);
      alert('Information updated successfully!');
      navigate('/manage');
    } catch (error) {
      console.error("error:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // function to set image to propertyInfo
  const imageChangeHandler = (e) => {
    const files = Array.from(e.target.files);

    if (propertyInfo.images.length + files.length > 20) {
      alert("Shared images can only be up to 20");
      return;
    }

    const newImages = files.map((file) => {
      return {
        file: file,
        previewUrl: URL.createObjectURL(file)
      }
    })

    setPropertyInfo({
      ...propertyInfo,
      images: [...propertyInfo.images, ...newImages]
    });
  }

  // delete image by index
  const removeImageHandler = (imageIndex) => {
    const imageToRemove = propertyInfo.images[imageIndex];

    if (imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const updatedImages = propertyInfo.images.filter((image, index) => {
      return index !== imageIndex;
    })

    setPropertyInfo({
      ...propertyInfo,
      images: updatedImages
    });
  }

  // function to add amenity if button is clicked
  const amenityHandler = (amenity) => {
    let updatedAmenities = [...propertyInfo.amenities];

    if (updatedAmenities.includes(amenity)) {
      updatedAmenities = updatedAmenities.filter(a => a !== amenity);
    }
    else {
      updatedAmenities.push(amenity);
    }

    setPropertyInfo({ ...propertyInfo, amenities: updatedAmenities });
  }

  // function to add rooms
  const addRoomHandler = () => {
    if (rooms.length < 5) {
      setRooms([...rooms, { ...initialRoom, id: Date.now() }])
    }
    else {
      alert("You can only add 5 room max")
      return;
    }
  }

  const handleRoomChange = (roomId, field, value) => {
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, [field]: value };
      }
      return room;
    });
    setRooms(updatedRooms);
  };

  // function to remove rooms
  const removeRoomHandler = (roomIdToRemove) => {
    const updatedRooms = rooms.filter(room => room.id !== roomIdToRemove)
    setRooms(updatedRooms)
  }

  // function to add image to room
  const roomImageChangeHandler = (e, roomId) => {
    const files = Array.from(e.target.files);
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    const targetRoom = rooms[roomIndex];

    if (targetRoom.images.length + files.length > 5) {
      alert("Room images can only be up to 5")
      return;
    }

    const newImages = files.map((file) => {
      return {
        file: file,
        previewUrl: URL.createObjectURL(file)
      }
    });

    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        return { ...room, images: [...room.images, ...newImages] }
      }
      return room;
    })

    setRooms(updatedRooms);
  }

  // function to delete image from room
  const removeRoomImageHandler = (roomId, imageIndex) => {
    const updatedRooms = rooms.map(room => {
      if (room.id === roomId) {
        if (room.images[imageIndex].previewUrl) {
          URL.revokeObjectURL(room.images[imageIndex].previewUrl);
        }

        const updatedImages = room.images.filter((image, index) => index !== imageIndex);
        return { ...room, images: updatedImages };
      }
      return room;
    });

    setRooms(updatedRooms);
  };

  return (
    <div className='pt-25 space-y-5 pb-20'>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete this property?</h2>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. All rooms, images, and reviews associated with this property will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10'>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-1">Edit Property</h1>

        <form action="" onSubmit={handleSubmit}>

          <section>
            <h2 className='pb-10 text-xl font-bold'>Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Name</label>
                <input type="text" value={propertyInfo.name}
                  onChange={(e) => { setPropertyInfo({ ...propertyInfo, name: e.target.value }); setFormErrors(p => ({...p, name: undefined})); }} name="name" className={`mt-1 block w-full rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors.name ? 'border-red-400' : 'border-gray-300'}`} placeholder='Husky Apartment' />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" value={propertyInfo.city}
                  onChange={(e) => { setPropertyInfo({ ...propertyInfo, city: e.target.value }); setFormErrors(p => ({...p, city: undefined})); }} name="city" className={`mt-1 block w-full rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors.city ? 'border-red-400' : 'border-gray-300'}`} placeholder='Houghton' />
                {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Distance from campus</label>
                <input type="text" value={propertyInfo.distance}
                  onChange={(e) => { setPropertyInfo({ ...propertyInfo, distance: e.target.value }); setFormErrors(p => ({...p, distance: undefined})); }} name="distance" className={`mt-1 block w-full rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors.distance ? 'border-red-400' : 'border-gray-300'}`} placeholder='0.5mile' />
                {formErrors.distance && <p className="text-red-500 text-xs mt-1">{formErrors.distance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" value={propertyInfo.address}
                  onChange={(e) => { setPropertyInfo({ ...propertyInfo, address: e.target.value }); setFormErrors(p => ({...p, address: undefined})); }} name="address" className={`mt-1 block w-full rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors.address ? 'border-red-400' : 'border-gray-300'}`} placeholder='1801 Townsend Drive' />
                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Distance from campus on foot</label>
                <input type="text" value={propertyInfo.walkDistance}
                  onChange={(e) => { setPropertyInfo({ ...propertyInfo, walkDistance: e.target.value }); setFormErrors(p => ({...p, walkDistance: undefined})); }} name="distance-walk" className={`mt-1 block w-full rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors.walkDistance ? 'border-red-400' : 'border-gray-300'}`} placeholder='15 minutes walk' />
                {formErrors.walkDistance && <p className="text-red-500 text-xs mt-1">{formErrors.walkDistance}</p>}
              </div>
            </div>
          </section>

          <section className='mt-10'>
            <h2 className='pb-4 text-xl font-bold'>Property Location</h2>
            <p className='text-sm text-gray-500 mb-4'>Click the map to place a pin or drag the existing pin to update the exact location.</p>
            <PinDropMap
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
            />
            {lat !== null && lng !== null && (
              <p className='text-xs text-gray-400 mt-2'>Pinned: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
            )}
          </section>

          <div>
            <h2 className='pb-10 pt-20 text-xl font-bold'>Add amenities</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20'>
              {Object.entries(amenityIcon).map(([key, icon]) => {
                const isSelected = propertyInfo.amenities.includes(key);
                return (
                  <label key={key} className={`flex items-center space-x-3 p-3 border border-gray-200 ${isSelected ? 'bg-yellow-500/70' : 'bg-white'} rounded-xl cursor-pointer`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      onChange={() => amenityHandler(key)}
                    />
                    <span className="text-2xl text-gray-600">{icon}</span>
                    <span className="capitalize font-medium text-gray-700 select-none">
                      {key.replace('_', ' ')}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className='pb-20'>
              <label className="text-xl font-bold text-gray-900 mb-8 pb-4">Description</label>
              <textarea value={propertyInfo.description} maxLength={1000}
                onChange={(e) => { setPropertyInfo({ ...propertyInfo, description: e.target.value }); setFormErrors(p => ({...p, description: undefined})); }} name="description" id="propertyDescription" placeholder="Property description..." className={`w-full h-40 p-2 rounded border-2 mt-5 focus:outline-none ${formErrors.description ? 'border-red-400' : ''}`}></textarea>
              {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
            </div>

            <div className='pb-20'>
              <label className="text-xl font-bold text-gray-900 mb-8 pb-4 block">Add image for apartment (shared images)</label>
              <span className='text-lg font-bold text-gray-600'>images selected {propertyInfo.images.length}/20</span>
              <input type="file" multiple onChange={imageChangeHandler} accept="image/*" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 hover:file:bg-yellow-300 cursor-pointer" />

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {propertyInfo.images.map((image, index) => (
                  <div key={index} className="aspect-square border border-gray-200 rounded-lg overflow-hidden relative">
                    <img src={image.previewUrl || `https://huskyrentlens.cs.mtu.edu/backend/${image.imageUrl}`} alt={`preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImageHandler(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg shadow hover:bg-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div>
                <h2 className='pb-10 text-xl font-bold'>Add room</h2>
                <div>
                  {rooms.map((room, index) => {
                    return (
                      <div key={room.id} className='bg-gray-100 p-5 rounded-2xl mb-10 relative'>
                        <p className='text-xl pb-10 font-bold'>Room {index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Room Name</label>
                            <input value={room.name}
                              onChange={(e) => { handleRoomChange(room.id, 'name', e.target.value); setFormErrors(p => ({...p, [`room_${index}_name`]: undefined})); }} type="text" className={`mt-1 block w-full bg-white rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors[`room_${index}_name`] ? 'border-red-400' : 'border-gray-300'}`} placeholder='Husky Apartment' />
                            {formErrors[`room_${index}_name`] && <p className="text-red-500 text-xs mt-1">{formErrors[`room_${index}_name`]}</p>}
                          </div>

                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Number of bedrooms</label>
                            <input value={room.bedrooms}
                              onChange={(e) => { handleRoomChange(room.id, 'bedrooms', e.target.value); setFormErrors(p => ({...p, [`room_${index}_bedrooms`]: undefined})); }} type="number" className={`mt-1 block w-full bg-white rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors[`room_${index}_bedrooms`] ? 'border-red-400' : 'border-gray-300'}`} placeholder='1' />
                            {formErrors[`room_${index}_bedrooms`] && <p className="text-red-500 text-xs mt-1">{formErrors[`room_${index}_bedrooms`]}</p>}
                          </div>

                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input value={room.rent}
                              onChange={(e) => { handleRoomChange(room.id, 'rent', e.target.value); setFormErrors(p => ({...p, [`room_${index}_rent`]: undefined})); }} type="number" className={`mt-1 block w-full bg-white rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors[`room_${index}_rent`] ? 'border-red-400' : 'border-gray-300'}`} placeholder='900' />
                            {formErrors[`room_${index}_rent`] && <p className="text-red-500 text-xs mt-1">{formErrors[`room_${index}_rent`]}</p>}
                          </div>

                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Number of bathrooms</label>
                            <input value={room.bathrooms}
                              onChange={(e) => { handleRoomChange(room.id, 'bathrooms', e.target.value); setFormErrors(p => ({...p, [`room_${index}_bathrooms`]: undefined})); }} type="number" className={`mt-1 block w-full bg-white rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border ${formErrors[`room_${index}_bathrooms`] ? 'border-red-400' : 'border-gray-300'}`} placeholder='1' />
                            {formErrors[`room_${index}_bathrooms`] && <p className="text-red-500 text-xs mt-1">{formErrors[`room_${index}_bathrooms`]}</p>}
                          </div>
                        </div>

                        <div className="pb-10">
                          <label className="block text-sm font-medium text-gray-700">Room Description</label>
                          <textarea
                            value={room.description}
                            onChange={(e) => handleRoomChange(room.id, 'description', e.target.value)}
                            className="w-full h-40 p-2 rounded border-2 mt-5 focus:outline-none rounded-2   "
                            placeholder="Describe this room..."
                          ></textarea>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 mt-2">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-gray-700">Room {index + 1} Photos <span className="font-normal text-gray-400">({room.images?.length || 0}/5)</span></p>
                            <label className="cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                              + Add Photos
                              <input type="file" onChange={(e) => roomImageChangeHandler(e, room.id)} multiple accept="image/*" className="hidden" />
                            </label>
                          </div>

                          {(!room.images || room.images.length === 0) ? (
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-colors">
                              <span className="text-2xl mb-1">🖼️</span>
                              <span className="text-sm text-gray-500">Click to upload room photos</span>
                              <input type="file" onChange={(e) => roomImageChangeHandler(e, room.id)} multiple accept="image/*" className="hidden" />
                            </label>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {room.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="aspect-square rounded-lg overflow-hidden relative group">
                                  <img
                                    src={
                                      image.previewUrl ||
                                      `https://huskyrentlens.cs.mtu.edu/backend/${image.image_url || image.imageUrl}`
                                    }
                                    alt={`preview ${imageIndex}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg shadow hover:bg-red-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeRoomImageHandler(room.id, imageIndex)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {rooms.length > 1 ?
                          <button type="button" className='absolute top-5 right-8 cursor-pointer hover:text-red-500' onClick={() => removeRoomHandler(room.id)}>
                            <FaRegTrashCan />
                          </button> : <></>}
                      </div>
                    )
                  })}

                  {rooms.length < 5 && (
                    <button type="button" onClick={addRoomHandler} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-yellow-500 hover:text-yellow-600 transition-colors bg-white cursor-pointer">
                      + Add Another Room Type
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-100 hover:bg-red-200 text-red-600 font-bold py-3 px-8 rounded-xl transition-colors text-lg cursor-pointer flex items-center gap-2"
              >
                <FaRegTrashCan />
                Delete Property
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 px-10 rounded-xl shadow-sm transition-colors text-lg cursor-pointer"
              >
                {isSubmitting ? 'Saving…' : 'Change Information'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProperty