import { useLocation, useNavigate } from "react-router-dom";
import { Pages, Records, UserPageVisits, UserPurchase } from "../interface/SimulationInterface";
import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient";
import { useGetUser } from "../hooks/useGetUser";
import Modal from 'react-modal';
import { useGetSimulation } from "../hooks/useGetSimulation";
import { useGetUserBalance } from "../hooks/useGetUserBalance";

function formatCurrency(value: number, currency: string = 'IDR', locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0, // No decimal places
  }).format(value);
}

export default function SimulationDetailPage() {

  const recordProps = useLocation();
  const { ...record } = recordProps.state as Records 
  const navigate = useNavigate();
  const { userId, email } = useGetUser();
  const { simulationId } = useGetSimulation();
  const { dummyBalance, balanceAfterPurchase, percentageSpent, remainingPercentage, userPurchases } = useGetUserBalance();

  // console.log('simul id on detail: ', simulationId);
  const [modalPurchase, setModalPurchase] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [inputValue, setInputValue] = useState<number>();

  // handle user purchase
  const handleUserPurchase = async ({ name_purchased, percentage_purchased } : UserPurchase) => {
    console.log('user beli');
    
    if(name_purchased.includes('Kredit') || percentage_purchased <= remainingPercentage!) {
      const { error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: userId,
          name_purchased: name_purchased,
          percentage_purchased: percentage_purchased,
          simulation_id: simulationId,
        });
      
      if(error) {
        console.log('error while user purchase: ', error);
      } else {
        console.log('successful product purchase: ');
        setModalSuccess(true);
        setModalPurchase(false);
      }
    } else {
      alert(`Anda hanya dapat membelanjakan maksimum ${remainingPercentage}% dari saldo Anda`);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(parseInt(value)); // Convert to number or keep as empty
  };

  const [detailPageData, setDetailPageData] = useState<Pages>();
  const fetchDetailPage = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('page_name', 'Detail Page')
    
    if(error) {
      console.log('error while fetching list page: ', error);
    }
    if(data) {
      // console.log('response list page: ', data[0]);
      setDetailPageData(data[0]);
    }
  }

  const postTimeSpent = async ({ simulation_id, user_id, user_email, page_id, page_name, record_id, record_title, enter_time, exit_time } : UserPageVisits) => {
    console.log('Page ID: ', page_id);

    const enterTimeDate = new Date(enter_time);
    const exitTimeDate = new Date(exit_time);
    
    const { data, error } = await supabase
      .from('user_page_visits')
      .insert({
        user_id: user_id,
        user_email: user_email,
        page_id: page_id,
        page_name: page_name,
        record_id: record_id,
        record_title: record_title,
        enter_time: enterTimeDate,
        exit_time: exitTimeDate,
        simulation_id: simulation_id
        // time_spent: time_spent,
      });
    
    if(error) {
      console.log('error while posting page time spent: ', error);
    }
    if(data) {
      console.log('SUCCESS detail PAGE TIME SPENT: ', data);
    }
  }

  const startTimeRef = useRef<number>(0);
  useEffect(() => {
    fetchDetailPage();
  }, [startTimeRef])
  
  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const leaveTime = Date.now();
      const timeSpent = (leaveTime - startTimeRef.current) / 1000;
      if(simulationId && detailPageData && detailPageData.id) {
        if(timeSpent > 0.5) {
          console.log('Start time: ', typeof startTimeRef.current, 'Leave time: ', typeof leaveTime);
          console.log(`Time Spent on Detail Page with Record ${record.record_title}: ${timeSpent.toFixed(2)} seconds`)

          postTimeSpent({
            user_id: userId,
            page_id: detailPageData.id,
            page_name: detailPageData.page_name,
            user_email: email,
            record_id: record.id,
            record_title: record.record_title,
            enter_time: startTimeRef.current,
            exit_time: leaveTime,
            time_spent: timeSpent,
            simulation_id: simulationId
          })
        }
      } else {
        console.log('simulation id doesnt exist: ');
      }
    }
  }, [startTimeRef, detailPageData, simulationId])

  return (
    <div className="p-3 flex flex-col w-full space-y-3 max-tablet:justify-center max-tablet:h-screen max-mobile:justify-center max-mobile:h-screen bg-slate-100 h-screen justify-center">
      <div className="text-2xl text-slate-700 font-semibold">{record.record_title}</div>

      <div className="flex flex-row space-x-2">
        <div className="font-medium bg-primary px-2 py-1 w-1/10 rounded-full text-slate-100 text-center text-xs">{record.record_name}</div>
        <div className="font-medium bg-secondary px-2 py-1 w-1/10 rounded-full text-slate-100 text-center text-xs">{record.record_code}</div>
      </div>

      <div className="text-slate-700 text-base">{record.record_description}</div>
      <div className="flex flex-row space-y-3 space-x-3 items-center">
        <div className="text-slate-700 font-medium">Tertarik membeli produk ini?</div>
        <button onClick={() => setModalPurchase(true)} className="btn btn-primary w-32 text-slate-100">{ record.record_name.includes('Kredit') ? 'Ambil kredit' : 'Beli sekarang' }</button>
        <button onClick={() => navigate('/simulation')} className="btn btn-accent w-32 text-slate-100">Kembali</button>
      </div>    
      <Modal
        ariaHideApp={false}
        isOpen={modalPurchase}
        onRequestClose={() => setModalPurchase(false)}
        style={modalStyles}
      >
        <div className="bg-slate-100 rounded-lg shadow-lg p-6 max-w-md mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Konfirmasi Pembelian</h2>
            <button
              onClick={() => setModalPurchase(false)}
              className="btn btn-circle btn-ghost text-gray-600"
            >
              ✕
            </button>
          </div>

          {
            record.record_name.includes('Kredit') ?
              <div className="text-gray-700">Apakah anda yakin ingin mengajukan {record.record_title}</div>
            :
              <>
                <div className="text-sm text-gray-700">Berapa persentase dari saldo yang Anda mau belanjakan untuk {record.record_title}</div>
                <div className="text-sm text-gray-700 font-bold">Saldo Anda: {

                  userPurchases.length > 0 ?

                    balanceAfterPurchase ?
                      formatCurrency(balanceAfterPurchase)
                      :
                      "Rp 0"

                    :
                    
                    dummyBalance ?
                      formatCurrency(dummyBalance)
                      :
                      "Calculating dummy balance"

                  }
                  {'\n'}/ { formatCurrency(dummyBalance!) }
                </div>
                <div className="text-gray-700 text-sm font-bold">Anda sudah membelanjakan {percentageSpent}% dari saldo Anda.</div>
                <div className="text-gray-700 text-sm font-bold">Anda dapat membelanjakan maksimum {remainingPercentage}% dari saldo Anda.</div>
                {
                  percentageSpent == 100 ?
                  <div className="text-red-600 text-sm">Anda sudah tidak dapat belanja produk. Jual kembali produk untuk berbelanja ulang.</div>
                  :
                  <input 
                    onChange={handleChange}
                    value={inputValue}
                    type='number' 
                    className="input input-bordered w-full max-w-xs bg-slate-100 input-secondary text-gray-700" 
                  />
                }
              </>
          }
          <div className="flex justify-end space-x-2 pt-4">
            <button
              className="btn btn-ghost"
              onClick={() => setModalPurchase(false)}
            >
              Batal
            </button>
            <button
              className="btn btn-primary text-slate-100"
              disabled={!record.record_name.includes('Kredit') && percentageSpent == 100}
              onClick={
                () => handleUserPurchase({ user_id: userId, name_purchased: record.record_title, percentage_purchased: inputValue! })
              }
            >
              { record.record_name.includes('Kredit') ? "Ajukan" : "Beli" }
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        ariaHideApp={false}
        isOpen={modalSuccess}
        onRequestClose={() => {
          setModalSuccess(false);
          navigate('/simulation');
        }}
        style={modalStyles}
      >
        <div className="bg-slate-100 rounded-lg shadow-lg p-6 max-w-md mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-700">{ record.record_name.includes('Kredit') ? "Pengajuan kredit diterima" : "Pembelian berhasil" }</h2>
            <button
              onClick={() => setModalPurchase(false)}
              className="btn btn-circle btn-ghost text-gray-600"
            >
              ✕
            </button> 
          </div>

          <div className="text-gray-700">{ record.record_name.includes('Kredit') ? `Selamat! Pengajuan ${record.record_title} Anda diterima` : `Selamat! Pembelian ${record.record_title} Anda berhasil`}</div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              className="btn btn-secondary"
              onClick={() => setModalSuccess(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    borderRadius: '0.5rem', // Rounded corners
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark semi-transparent background
  },
};