import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

// === 許可するアメニティーのリスト（必要に応じて追加・変更してください） ===
const AVAILABLE_AMENITIES = [
    "Free Wi-Fi",
    "Parking",
    "Gym / Fitness Center",
    "In-unit Laundry",
    "Shared Laundry",
    "Pet Friendly",
    "Furnished",
    "Air Conditioning",
    "Heating",
    "Study Lounge",
    "Pool",
    "Elevator"
];

const AddProperties = () => {
    // ==========================================
    //  1. 認証（Auth）のステート
    // ==========================================
    const [user, setUser] = useState(null);

    // ==========================================
    //  2. フォーム（物件・部屋）のステート
    // ==========================================
    // 共通部分
    const [propertyInfo, setPropertyInfo] = useState({
        name: '',
        address: '',
        city: '',
        distance: '',
        amenities: [], // 変更: 文字列ではなく配列で選択されたものを管理
        description: '',
        images: [] // 最大20
    });

    // 部屋の初期値
    const initialRoom = {
        id: Date.now(),
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        rent: '',
        description: '',
        images: [] // 最大5
    };
    const [rooms, setRooms] = useState([initialRoom]);

    // ==========================================
    //  3. 認証＆クリーンアップの副作用 (useEffect)
    // ==========================================
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded.data);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            propertyInfo.images.forEach(img => URL.revokeObjectURL(img.previewUrl));
            rooms.forEach(room => room.images.forEach(img => URL.revokeObjectURL(img.previewUrl)));
        };
    }, []);

    // ==========================================
    //  4. フォームのイベントハンドラー
    // ==========================================
    const handlePropertyChange = (e) => {
        const { name, value } = e.target;
        setPropertyInfo({ ...propertyInfo, [name]: value });
    };

    // --- 追加: アメニティーのトグル（選択/解除）ハンドラー ---
    const handleAmenityToggle = (amenity) => {
        let updatedAmenities = [...propertyInfo.amenities];
        if (updatedAmenities.includes(amenity)) {
            // すでに選択されていれば外す
            updatedAmenities = updatedAmenities.filter(a => a !== amenity);
        } else {
            // 選択されていなければ追加する
            updatedAmenities.push(amenity);
        }
        setPropertyInfo({ ...propertyInfo, amenities: updatedAmenities });
    };

    const handleRoomChange = (index, e) => {
        const { name, value } = e.target;
        const updatedRooms = [...rooms];
        updatedRooms[index][name] = value;
        setRooms(updatedRooms);
    };

    // --- 変更: 最大部屋数を5に ---
    const handleAddRoom = () => {
        if (rooms.length < 5) {
            setRooms([...rooms, { ...initialRoom, id: Date.now() }]);
        }
    };

    const handleRemoveRoom = (idToRemove) => {
        if (rooms.length > 1) {
            const roomToRemove = rooms.find(room => room.id === idToRemove);
            roomToRemove?.images.forEach(img => URL.revokeObjectURL(img.previewUrl));
            setRooms(rooms.filter(room => room.id !== idToRemove));
        }
    };

    const handlePropertyImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (propertyInfo.images.length + files.length > 20) {
            alert('共同部分の画像は最大20枚までです。');
            return;
        }
        const newImages = files.map(file => ({
            file: file,
            previewUrl: URL.createObjectURL(file)
        }));
        setPropertyInfo({ ...propertyInfo, images: [...propertyInfo.images, ...newImages] });
    };

    const handleRoomImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const updatedRooms = [...rooms];
        if (updatedRooms[index].images.length + files.length > 5) {
            alert('部屋の画像は最大5枚までです。');
            return;
        }
        const newImages = files.map(file => ({
            file: file,
            previewUrl: URL.createObjectURL(file)
        }));
        updatedRooms[index].images = [...updatedRooms[index].images, ...newImages];
        setRooms(updatedRooms);
    };

    const handleRemovePropertyImage = (indexToRemove) => {
        const imageToRemove = propertyInfo.images[indexToRemove];
        URL.revokeObjectURL(imageToRemove.previewUrl);
        const updatedImages = propertyInfo.images.filter((_, index) => index !== indexToRemove);
        setPropertyInfo({ ...propertyInfo, images: updatedImages });
    };

    const handleRemoveRoomImage = (roomIndex, imageIndexToRemove) => {
        const updatedRooms = [...rooms];
        const roomImages = updatedRooms[roomIndex].images;
        const imageToRemove = roomImages[imageIndexToRemove];
        URL.revokeObjectURL(imageToRemove.previewUrl);
        const updatedRoomImages = roomImages.filter((_, index) => index !== imageIndexToRemove);
        updatedRooms[roomIndex].images = updatedRoomImages;
        setRooms(updatedRooms);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const propertyFiles = propertyInfo.images.map(img => img.file);
        const roomsData = rooms.map(room => ({
            ...room,
            files: room.images.map(img => img.file)
        }));
        console.log("Submit Data:", { property: { ...propertyInfo, images: propertyFiles }, rooms: roomsData });
    };

    // ==========================================
    //  5. レンダリング (UI)
    // ==========================================
    return (
        <div className='pt-25 space-y-5 pb-20'>
            {user && user.role === 'Landlord' ? (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Add New Property</h1>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* --- 共通部分 --- */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 border-l-4 border-yellow-400 pl-3">Property Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Property Name (物件名)</label>
                                    <input type="text" name="name" value={propertyInfo.name} onChange={handlePropertyChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Distance from MTU (大学からの距離)</label>
                                    <input type="text" name="distance" value={propertyInfo.distance} onChange={handlePropertyChange} placeholder="e.g., 0.5 miles" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address (住所)</label>
                                    <input type="text" name="address" value={propertyInfo.address} onChange={handlePropertyChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City (都市)</label>
                                    <input type="text" name="city" value={propertyInfo.city} onChange={handlePropertyChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                </div>
                            </div>

                            {/* --- 変更: アメニティー選択UI (ボタン風チェックボックス) --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities (アメニティー)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {AVAILABLE_AMENITIES.map(amenity => {
                                        const isSelected = propertyInfo.amenities.includes(amenity);
                                        return (
                                            <label 
                                                key={amenity} 
                                                className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all duration-200 text-sm text-center select-none
                                                    ${isSelected ? 'bg-yellow-100 border-yellow-400 text-yellow-800 font-semibold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {/* 実際のチェックボックスは hidden で隠す */}
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={isSelected} 
                                                    onChange={() => handleAmenityToggle(amenity)} 
                                                />
                                                {amenity}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description (共通部分の説明)</label>
                                <textarea name="description" value={propertyInfo.description} onChange={handlePropertyChange} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shared Images (共同部分の画像: 最大20枚)</label>
                                <input type="file" multiple accept="image/*" onChange={handlePropertyImageChange} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer" />
                                <p className="text-sm text-gray-500 mt-1 mb-4">現在 {propertyInfo.images.length} / 20 枚選択中</p>
                                
                                {propertyInfo.images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {propertyInfo.images.map((image, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <img src={image.previewUrl} alt={`property shared ${index}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => handleRemovePropertyImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md hover:bg-red-600 cursor-pointer">
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* --- 部屋の追加部分 --- */}
                        <section className="space-y-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center border-l-4 border-yellow-400 pl-3">
                                {/* 変更: 最大数を5に表示 */}
                                <h2 className="text-2xl font-semibold text-gray-800">Room Types ({rooms.length}/5)</h2>
                            </div>

                            {rooms.map((room, index) => (
                                <div key={room.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative">
                                    {rooms.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveRoom(room.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-full cursor-pointer">
                                            🗑️ 削除
                                        </button>
                                    )}
                                    
                                    <h3 className="font-bold text-lg mb-4 text-gray-700">Room {index + 1}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Room Name (部屋名)</label>
                                            <input type="text" name="name" value={room.name} onChange={(e) => handleRoomChange(index, e)} placeholder="e.g., Master Bedroom" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bedrooms (ベッド数)</label>
                                            <input type="number" min="0" name="bedrooms" value={room.bedrooms} onChange={(e) => handleRoomChange(index, e)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bathrooms (トイレ数)</label>
                                            <input type="number" min="0" step="0.5" name="bathrooms" value={room.bathrooms} onChange={(e) => handleRoomChange(index, e)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Rent (家賃 $/month)</label>
                                            <input type="number" min="0" name="rent" value={room.rent} onChange={(e) => handleRoomChange(index, e)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border" required />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">Room Description (部屋の説明)</label>
                                        <textarea name="description" value={room.description} onChange={(e) => handleRoomChange(index, e)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-2 border"></textarea>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700">Room Images (部屋の画像: 最大5枚)</label>
                                        <input type="file" multiple accept="image/*" onChange={(e) => handleRoomImageChange(index, e)} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer" />
                                        <p className="text-sm text-gray-500 mt-1 mb-4">現在 {room.images.length} / 5 枚選択中</p>

                                        {room.images.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                                {room.images.map((image, imageIndex) => (
                                                    <div key={imageIndex} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                        <img src={image.previewUrl} alt={`room ${index + 1} image ${imageIndex}`} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => handleRemoveRoomImage(index, imageIndex)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md hover:bg-red-600 cursor-pointer">
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* 変更: 最大数を5に */}
                            {rooms.length < 5 && (
                                <button type="button" onClick={handleAddRoom} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-yellow-500 hover:text-yellow-600 transition-colors bg-white cursor-pointer">
                                    + Add Another Room Type (部屋を追加)
                                </button>
                            )}
                            {rooms.length >= 5 && (
                                <p className="text-center text-sm text-red-500">※ 追加できる部屋の最大数（5）に達しました。</p>
                            )}
                        </section>

                        {/* --- Submit Button --- */}
                        <div className="pt-6 border-t border-gray-200 text-right">
                            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-10 rounded-xl shadow-sm transition-colors text-lg cursor-pointer">
                                Register Property (登録する)
                            </button>
                        </div>

                    </form>
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center mt-20 space-y-4'>
                    <h1 className='text-2xl font-semibold text-gray-800 text-center px-4'>
                        You must have a landlord account to add properties.
                    </h1>
                    <p className='text-lg text-gray-600 text-center px-4'>
                        If you are a landlord and wish to add properties,
                    </p>
                    <Link to={"/signup"}>
                        <span className='text-xl underline text-yellow-500 hover:text-yellow-600 font-medium cursor-pointer'>
                            click here to sign up
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AddProperties;