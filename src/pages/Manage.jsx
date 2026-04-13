import React, { useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Link, useNavigate } from 'react-router-dom'
import { getPropertyiesByLandlordId } from '../API/getPropertyiesByLandlordId'

const buildDisplayName = (user) => {
  const nameFromParts = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  return nameFromParts || user?.email || 'Landlord'
}

const buildInitials = (value) => {
  if (!value) return 'LL'
  return value.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LL'
}

const StatCard = ({ label, value }) => (
  <div className='rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4'>
    <p className='text-2xl font-extrabold text-gray-900'>{value}</p>
    <p className='text-sm text-gray-500 mt-1'>{label}</p>
  </div>
)

const Manage = () => {
  document.title = 'Manage Properties | HuskyRentLens'

  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [propertyData, setPropertyData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const decoded = jwtDecode(token)

      if (decoded.data.role !== 'Landlord') {
        navigate('/')
        return
      }

      setUser(decoded.data)
    } catch (error) {
      console.error('Invalid token', error)
      localStorage.removeItem('token')
      navigate('/login')
      return
    }
  }, [navigate])

  useEffect(() => {
    if (!user) return

    const fetchMyProperties = async () => {
      setIsLoading(true)

      try {
        const response = await getPropertyiesByLandlordId()
        setPropertyData(response.data || [])
      } catch (error) {
        console.log('error fetching property', error)
        setPropertyData([])
      }

      setIsLoading(false)
    }

    fetchMyProperties()
  }, [user])

  const displayName = useMemo(() => buildDisplayName(user), [user])
  const initials = useMemo(() => buildInitials(displayName), [displayName])

  return (
    <div className='min-h-screen bg-gray-50 pt-8 md:pt-12 px-4 sm:px-6 lg:px-8 pb-20'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <section className='rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
          <div className='h-24 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500' />
          <div className='px-5 sm:px-6 pb-6 -mt-12'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-4 mb-6'>
              <div className='w-24 h-24 rounded-full border-4 border-white bg-gray-900 text-white text-2xl font-black flex items-center justify-center shadow-lg shrink-0'>
                {initials}
              </div>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-yellow-700 mb-1'>Landlord dashboard</p>
                <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900'>Hello, {displayName}!</h1>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3'>
              <Link to='/profile' className='inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3 font-semibold text-gray-800 transition-colors'>
                My Profile
              </Link>
              <Link to='/manage/add' className='inline-flex items-center justify-center rounded-2xl bg-yellow-400 hover:bg-yellow-500 px-5 py-3 font-bold text-gray-900 transition-colors shadow-sm'>
                + Add New Property
              </Link>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
              <StatCard label='Active Listings' value={propertyData.length} />
              <StatCard label='Total Properties' value={propertyData.length} />
            </div>
          </div>
        </section>

        <section className='rounded-3xl bg-white border border-gray-100 shadow-sm p-5 sm:p-6'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>Your Properties</h2>
            <p className='text-gray-500 mt-1'>Manage all your rental listings</p>
          </div>

          {isLoading ? (
            <p className='text-gray-600'>Loading your properties...</p>
          ) : propertyData && propertyData.length > 0 ? (
            <div className='space-y-4'>
              {propertyData.map((property) => (
                <div
                  key={property.propertyId}
                  className='flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow'
                >
                  <div className='w-full sm:w-32 h-24 bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden flex justify-center items-center text-gray-400'>
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={`https://huskyrentlens.cs.mtu.edu/backend/${property.images[0].imageUrl}`}
                        className='w-full h-full object-cover'
                        alt={property.name}
                      />
                    ) : (
                      <span className='text-sm font-medium'>No Image</span>
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg font-bold text-gray-900'>{property.name}</h3>
                    <p className='text-gray-500 text-sm mt-1'>📍 {property.address}</p>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:flex-shrink-0'>
                    <Link to={`/properties/${property.propertyId}`} className='inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 transition-colors'>
                      View
                    </Link>
                    <Link to={`/manage/edit/${property.propertyId}`} className='inline-flex items-center justify-center rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2.5 px-4 transition-colors'>
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300'>
              <p className='text-gray-700 text-lg font-medium'>No properties found.</p>
              <p className='text-gray-400 mt-1'>Click "Add New Property" to get started.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Manage