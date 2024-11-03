import { Link, useNavigate } from 'react-router-dom'
import { Records } from '../interface/SimulationInterface'

export default function RelatedRecordCard({ ...recordCard } : Records ) {
  const navigate = useNavigate();
  const handleNavigateDetail = (id: string) => {
    navigate(`/detail-page/${id}`, { state: recordCard })
  }
  return (
    <div onClick={() => handleNavigateDetail(recordCard.id)} className='relative p-3 m-3 bg-primary w-72 h-44 rounded-xl hover:scale-105 transition max-mobile:w-40 max-mobile:h-64'>
      <div className="text-white text-base font-semibold">{recordCard.record_title}</div>
      <div className="text-white font-light text-sm">{recordCard.record_description}</div>
      <Link to={`/detail-page/${recordCard.id}`} state={recordCard} className='absolute bottom-3 text-sm underline text-white font-light'>More details</Link>
    </div>
  )
}
