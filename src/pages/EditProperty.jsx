import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { amenityIcon } from '../components/amenityIcons';
import { FaRegTrashCan } from "react-icons/fa6";
import { getPropertyById } from '../API/getPropertyById';

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
            console.log("取得したデータ(全体):", result);

            // 🚨 ログの構造に合わせて、中身の 'property' オブジェクトを取り出す
            const rawData = result.data || result;
            const propertyBox = rawData.property; // 👈 ここがポイント！

            if (propertyBox) {
              // 1. 基本情報のセット
              setPropertyInfo({
                name: propertyBox.name || '',
                address: propertyBox.address || '',
                city: propertyBox.city || '',
                distance: propertyBox.distanceFromMTU || '',
                walkDistance: propertyBox.walkDistance || '',
                // アメニティは [{amenityName: 'wifi'}, ...] を ['wifi', ...] に変換
                amenities: rawData.amenities ? rawData.amenities.map(a => a.amenityName) : [],
                description: propertyBox.description || '',
                images: rawData.images || []
              });

              // 2. 部屋情報（ログでは 'rentals' という名前になっています）
              if (rawData.rentals && rawData.rentals.length > 0) {
                const formattedRooms = rawData.rentals.map(room => ({
                  id: room.rentalId || Date.now(),
                  name: room.roomName || '', // ログに roomName があれば
                  bedrooms: room.bedroomCt || 1,
                  bathrooms: room.bathroomCt || 1,
                  rent: room.cost || '',
                  description: room.description || '',
                  images: room.images || []
                }));
                setRooms(formattedRooms);
              }
            }
          } catch (apiError) {
            console.error("failed to fetch data:", apiError);
          }
        };
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

  // function to send data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("propertyId", propertyId);
    formData.append("name", propertyInfo.name);
    formData.append("address", propertyInfo.address);
    formData.append("city", propertyInfo.city);
    formData.append("distance", propertyInfo.distance);
    formData.append("description", propertyInfo.description);
    formData.append("walkDistance", propertyInfo.walkDistance);
    formData.append("amenities", JSON.stringify(propertyInfo.amenities));

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

    try {
      console.log("更新データ:", formData);
      alert('Information updated successfully!');
      navigate('/manage');
    } catch (error) {
      console.error(error);
      alert(error.message);
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
      <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10'>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-1">Edit Property</h1>

        <form action="" onSubmit={handleSubmit}>

          <section>
            <h2 className='pb-10 text-xl font-bold'>Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Name</label>
                <input type="text" value={propertyInfo.name}
                  onChange={(e) => setPropertyInfo({ ...propertyInfo, name: e.target.value })} name="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='Husky Apartment' />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" value={propertyInfo.city}
                  onChange={(e) => setPropertyInfo({ ...propertyInfo, city: e.target.value })} name="city" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='Houghton' />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Distance from campus</label>
                <input type="text" value={propertyInfo.distance}
                  onChange={(e) => setPropertyInfo({ ...propertyInfo, distance: e.target.value })} name="distance-walk" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='0.5mile' />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" value={propertyInfo.address}
                  onChange={(e) => setPropertyInfo({ ...propertyInfo, address: e.target.value })} name="distance-walk" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='1801 Townsend Drive' />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Distance from campus on foot</label>
                <input type="text" value={propertyInfo.walkDistance}
                  onChange={(e) => setPropertyInfo({ ...propertyInfo, walkDistance: e.target.value })} name="distance-walk" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='15 minues walk' />
              </div>
            </div>
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
                onChange={(e) => setPropertyInfo({ ...propertyInfo, description: e.target.value })} name="description" id="propertyDescription" placeholder="Property description..." className="w-full h-40 p-2 rounded border-2 mt-5 focus:outline-none rounded-2 "></textarea>
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
                              onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)} type="text" name="name" className="mt-1 block w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='Husky Apartment' />
                          </div>

                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Number of bedroom</label>
                            <input value={room.bedrooms}
                              onChange={(e) => handleRoomChange(room.id, 'bedrooms', e.target.value)} type="number" name="name" className="mt-1 block w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='1' />
                          </div>

                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input value={room.rent}
                              onChange={(e) => handleRoomChange(room.id, 'rent', e.target.value)} type="number" name="name" className="mt-1 block w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='900' />
                          </div>

                          <div className='lg:col-span-2'>
                            <label className="block text-sm font-medium text-gray-700">Number of bathroom</label>
                            <input value={room.bathrooms}
                              onChange={(e) => handleRoomChange(room.id, 'bathrooms', e.target.value)} type="number" name="name" className="mt-1 block w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required placeholder='1' />
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

                        <label className="text-xl font-bold text-gray-900 mb-8 block">Add image for this room</label>
                        <span className='text-lg font-bold text-gray-600'>images selected {room.images?.length || 0}/5</span>
                        <input type="file" onChange={(e) => roomImageChangeHandler(e, room.id)} multiple accept="image/*" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 hover:file:bg-yellow-300 cursor-pointer" />

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {room.images && room.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="aspect-square border border-gray-200 rounded-lg overflow-hidden relative">
                              <img
                                src={
                                  image.previewUrl ||
                                  `https://huskyrentlens.cs.mtu.edu/backend/${image.image_url || image.imageUrl}` // 🚨 image_url と imageUrl 両方試す
                                }
                                alt={`preview ${imageIndex}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg shadow hover:bg-red-600 cursor-pointer"
                                onClick={() => removeRoomImageHandler(room.id, imageIndex)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
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

            <div className="pt-6 text-right">
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-10 rounded-xl shadow-sm transition-colors text-lg cursor-pointer">
                Change Information
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProperty