import {useEffect,useRef,useState} from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type {Fact} from './domain'
// GCJ02 inverse approximation for OSM's WGS84 basemap; routing stays in provider coordinates.
function wgs([lng,lat]:number[],system:string):[number,number]{
 if(system==='WGS84'||lng<72.004||lng>137.8347||lat<.8293||lat>55.8271)return [lat,lng]
 const x=lng-105,y=lat-35,pi=Math.PI
 let dlat=-100+2*x+3*y+.2*y*y+.1*x*y+.2*Math.sqrt(Math.abs(x))+(20*Math.sin(6*x*pi)+20*Math.sin(2*x*pi))*2/3+(20*Math.sin(y*pi)+40*Math.sin(y/3*pi))*2/3+(160*Math.sin(y/12*pi)+320*Math.sin(y*pi/30))*2/3
 let dlng=300+x+2*y+.1*x*x+.1*x*y+.1*Math.sqrt(Math.abs(x))+(20*Math.sin(6*x*pi)+20*Math.sin(2*x*pi))*2/3+(20*Math.sin(x*pi)+40*Math.sin(x/3*pi))*2/3+(150*Math.sin(x/12*pi)+300*Math.sin(x/30*pi))*2/3
 const rad=lat*pi/180,magic=1-.006693421622966*Math.sin(rad)**2,root=Math.sqrt(magic)
 dlat=dlat*180/(6378245*(1-.006693421622966)/(magic*root)*pi);dlng=dlng*180/(6378245/root*Math.cos(rad)*pi)
 return [lat-dlat,lng-dlng]
}
export function TripMap({items,example=false}:{items:Fact[];example?:boolean}){
 const ref=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false)
 useEffect(()=>{if(!ref.current||example||!items.length)return;const map=L.map(ref.current,{scrollWheelZoom:false}).setView(wgs(items[0].coordinate,items[0].coordinateSystem),12)
 const tile=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(map);tile.on('tileerror',()=>setFailed(true))
 const coordinates=items.map(p=>wgs(p.coordinate,p.coordinateSystem));items.forEach((p,i)=>{const label=document.createElement('span');label.textContent=p.name;L.marker(coordinates[i],{icon:L.divIcon({className:'number-pin',html:`<b>${i+1}</b>`,iconSize:[30,30]})}).addTo(map).bindPopup(label)})
 if(coordinates.length>1){L.polyline(coordinates,{color:'#55768f',dashArray:'5 8',weight:3}).addTo(map);map.fitBounds(L.latLngBounds(coordinates),{padding:[30,30]})}
 const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe(ref.current);return ()=>{observer.disconnect();map.remove()}
 },[items,example])
 if(example)return <div className="example-map"><div className="map-river"/><div className="map-road"/><span>示例地点顺序 · 非实际导航</span><div className="map-stops">{items.map((p,i)=><div key={p.id}><b>{i+1}</b><small>{p.name}</small></div>)}</div></div>
 if(!items.length)return <div className="empty-inline">添加地点后显示地图</div>
 return <div className="map-wrap"><div className="real-map" ref={ref}/><small>{failed?'底图加载失败，可查看下方地点地址。':'连线表示地点顺序，并非导航路线。'}</small></div>
}
