import React from 'react'
import {MapContainer, Marker, TileLayer} from "react-leaflet"
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pingIcon from "../assets/pin.png";



const MapCom = (props) => {

  const markers = [
    {
      geocode: [47.1200, -88.5500],
      popUp: "Michigan Technological University"
    },
    {
      geocode: [props.lat, props.lng],
      popUp: "apartment"
    }
  ]

  const customIcon = new Icon({
    iconUrl: pingIcon,
    iconSize: [40, 40]
  })

  const mtuIcon = new Icon({
    iconUrl: "https://www.mtu.edu/umc/resources/brand/images/full-name-horizontal-515subbanner.jpg",
    iconSize: [80],
  });

return (
    <div className='h-[400px] w-full rounded-2xl overflow-hidden'>
      <MapContainer center={[props.lat, props.lng]} zoom={14} className='h-full w-full'>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* 47.1200, -88.5500 */}
        {
          markers.map((marker, index) => (
            <Marker key={index} position={marker.geocode} icon={marker.popUp === "Michigan Technological University" ? mtuIcon : customIcon}>

            </Marker>
          ))
        }
      </MapContainer>
    </div>
  )
}

export default MapCom