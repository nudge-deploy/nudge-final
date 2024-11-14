import { Link, useNavigate } from "react-router-dom";
import { Records } from "../interface/SimulationInterface";


export default function RecordCard({ ...recordCard} : Records) {
  const navigate = useNavigate();
  const handleNavigateDetail = (id: string) => {
    navigate(`/detail-page/${id}`, { state: recordCard })
  } 
  return (
    <div 
      onClick={() => handleNavigateDetail(recordCard.id)} 
      className={`flex flex-col space-y-1 relative shadow-md p-3 m-3 
        ${
          recordCard.category_id == 1 ? `bg-green-500`
          : recordCard.category_id == 2 ? `bg-blue-500`
          : recordCard.category_id == 3 ? `bg-red-600`
          : `bg-purple-600`
        } 
        w-72 h-56 rounded-xl hover:scale-105 transition max-mobile:w-40 max-mobile:h-72`}>
      <div className="text-white text-base font-semibold">{recordCard.record_title}</div>
      <div className={` ${
          recordCard.category_id == 1 ? `text-green-500`
          : recordCard.category_id == 2 ? `text-blue-500`
          : recordCard.category_id == 3 ? `text-red-600`
          : `text-purple-600`
        }  w-fit rounded-full px-1 text-xs bg-slate-100 font-bold`}>{recordCard.record_name}</div>
      <div className="text-white font-light text-sm">
        {
          recordCard.record_description.substring(
            0,
            Math.min(
              recordCard.record_description.indexOf('.') !== -1 ? recordCard.record_description.indexOf('.') : recordCard.record_description.length,
              recordCard.record_description.indexOf('!') !== -1 ? recordCard.record_description.indexOf('!') : recordCard.record_description.length
            )
          )
        }...
      </div>
      <Link to={`/detail-page/${recordCard.id}`} state={recordCard} className='absolute bottom-3 text-sm underline text-white font-light'>More details</Link>
    </div>
  )
}
