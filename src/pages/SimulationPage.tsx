  import { useEffect, useRef, useState } from "react";
  import supabase from "../database/supabaseClient";
  import { useGetUser } from "../hooks/useGetUser";
  import { Pages, Records, UserPageVisits, UserPurchase } from "../interface/SimulationInterface";
  import RecordCard from "../components/RecordCard";
  import RelatedRecordCard from "../components/RelatedRecordCard";
  import { useNavigate } from "react-router-dom";
  import { modalStyles } from "./SimulationDetailPage";
  import Modal from 'react-modal';
import { useGetSimulation } from "../hooks/useGetSimulation";

  export default function SimulationPage() {

    // const [loading, setLoading] = useState(false);
   
    const { userId, email } = useGetUser();
    const { simulationId } = useGetSimulation();
    // console.log('SIMULATION ID ON SIMUL PAGE: ', simulationId);
    const questionId = "6d06b8b9-c3fa-4309-832c-222f3cb674db";
    const ruleBasedQuestionIds = [
      {
        rule_based_id: '897478ff-81d4-4b9a-975b-f01d82f83894',
      },
      {
        rule_based_id: '1f2603b2-54b5-4dcb-8bc3-137333d84a96',
      },  
      // {
      //   rule_based_id: '88f674b0-a723-4311-9d60-b9afa32c415e' // outside psychography behavior
      // }
    ]
    const [ruleBasedResponses, setRuleBasedResponses] = useState<string[]>([]);
    // for fetch rulebased, avoid double calls
    const hasFetchedResponses = useRef(false);

    function getUpperBound(input: string) {
      return parseInt(input[0].slice(-10));  
    }

    function formatCurrency(value: number, currency: string = 'IDR', locale: string = 'id-ID'): string {
      return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0, // No decimal places
      }).format(value);
    }


    
    // Rule-based Function determining one of three results
    // "Keamanan atau Likuiditas Tinggi" -> "Tabungan atau Deposito"
    // "Toleransi resiko tinggi, minat invest tinggi" -> "Saham atau Reksadana"
    // "Produk dengan manfaat pajak or selain two above" -> "Obligasi Pemerintah"
    const [rekomendasi, setRekomendasi] = useState(""); // can be "Tabungan", "Deposito", "Saham" (v), "Reksa Dana" (v), "Obligasi"
    function getRulebasedRecommendation() { 
      let responses: string[] = [];
      if(ruleBasedResponses && ruleBasedResponses.length > 0) {
        // console.log('RULE BASED RESPONSES: ', ruleBasedResponses);
        ruleBasedResponses.map((response) => {
          if(response) {
            responses.push(response[0]);
          }
        })
      }
      if(responses && responses.length > 0) {
        // console.log('Array of rulebased responses: ', responses);

        // Rule-based Conditions below
        if(
          // All the conditions that outputs 'Saham'
          (
            responses.includes('Meningkatkan kekayaan dengan cepat') && responses.includes('Risiko tinggi, imbalan tinggi')
          ) ||
          (
            responses.includes('Risiko tinggi, imbalan tinggi') && responses.includes('Stabilitas keuangan jangka panjang')
          ) ||
          (
            responses.includes('Risiko tinggi, imbalan tinggi') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
          ) ||
          (
            responses.includes('Risiko moderat') && responses.includes('Meningkatkan kekayaan dengan cepat')
          )
        ) {
          setRekomendasi('Saham');
        } else if(
          // All the conditions that outputs 'Reksadana'
          (
            responses.includes('Risiko moderat') && responses.includes('Stabilitas keuangan jangka panjang')
          ) ||
          (
            responses.includes('Risiko moderat') && responses.includes('Keamanan dan menghindari risiko')
          ) ||
          (
            responses.includes('Risiko moderat') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
          )
        ) {
          setRekomendasi('Reksa Dana');
        } else if(
          // All the conditions that outputs 'Obligasi'
          (
            responses.includes('Risiko rendah, pertumbuhan stabil') && responses.includes('Stabilitas keuangan jangka panjang')
          ) ||
          (
            responses.includes('Risiko rendah, pertumbuhan stabil') && responses.includes('Keamanan dan menghindari risiko')
          ) ||
          (
            responses.includes('Risiko rendah, pertumbuhan stabil') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
          )
        ) {
          setRekomendasi('Obligasi');
        } else if(
          // All the conditions that outputs 'Tabungan' or 'Deposito'
          (
            responses.includes('Menghindari risiko') && responses.includes('Stabilitas keuangan jangka panjang')
          ) ||
          (
            responses.includes('Menghindari risiko') && responses.includes('Keamanan dan menghindari risiko')
          ) ||
          (
            responses.includes('Menghindari risiko') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
          )
        ) {
          setRekomendasi('Deposito'); // add Tabungan as an alternative
        } else {
          setRekomendasi('Tabungan');
        }
      }
    }
    
    const [records, setRecords] = useState<Records[]>([]);
    async function getRecords() {
      // setLoading(true);
      const { data, error } = await supabase
        .from('records')
        .select('*')
        // console.log('MASUK GET RECORDS');
        if(error) {
        console.log('Error while fetching records', error);
      }
      if(data) {
        console.log('response records: ', data);
        setRecords(data);
        // setLoading(false);
      }
    }


    async function getResponseFirstRuleBased(rule_based_id: string) {
      const { data, error } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', rule_based_id)
      
      if(error) {
        console.log('error while fetching response balance', error);
      }

      if(data) {
        // console.log('question id: ', data[0].question_id, 'data rule base: ', data[0].response);
        setRuleBasedResponses((prevItem) => [...prevItem, data[0].response]);
      }
    }
    
    useEffect(() => {
      getRulebasedRecommendation();
    }, [ruleBasedResponses])

    useEffect(() => {
      fetchListPage();
      if(rekomendasi && rekomendasi.length > 0) {
        getRecords();
      }
    }, [rekomendasi])
    
    useEffect(() => {
      if(userId && ruleBasedQuestionIds && !hasFetchedResponses.current) {
        hasFetchedResponses.current = true;
        let i = 0;
        for(const ruleBased of ruleBasedQuestionIds) {
          i++;
          // console.log(ruleBased.rule_based_id);
          getResponseFirstRuleBased(ruleBased.rule_based_id);
        }
      }
    }, [userId, ruleBasedQuestionIds])
    

    // START PART 1: CALCULATING FIRST BALANCE BASED ON SALARY
    const [balance, setBalance] = useState<string>();
    const [dummyBalance, setDummyBalance] = useState<number>();
    const [balanceAfterPurchase, setBalanceAfterPurchase] = useState<number>();

    async function getResponseForBalance() {
      const { data, error } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('question_id', questionId)
      
      if(error) {
        console.log('error while fetching response for balance');
      }

      if(data && data[0] && data[0].response) {
        console.log('ada resp balance');
        setBalance(data[0].response);
      } else {
        console.log('tidak ada resp balance');
        setDummyBalance(1000000000);
      }
    }

    useEffect(() => {
      if(userId && questionId) {
        getResponseForBalance()
      }
    }, [userId, questionId]);

    useEffect(() => {
      console.log('balance before anything: ', balance);
      if(balance) {
        if(balance.length > 0) {
          const newBalance = getUpperBound(balance);
          console.log('new balance after conversion: ', newBalance);
          setDummyBalance(newBalance * 24000000);
        }
      }
    }, [balance])

    // END PART 1: CALCULATING FIRST BALANCE BASED ON SALARY

    // START PART 2: UPDATING BALANCE AFTER USER PURCHASE

    const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
    async function fetchUserPurchase() {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', userId)
      
      if(error) {
        console.log('error while fetching user purchase', error);
      }
      if(data) {
        console.log('data user purchases: ', data);
        setUserPurchases(data);
        setLoading(false);
      }
    }

    useEffect(() => {
      if(userId) {
        fetchUserPurchase();
      }
    }, [userId])
    
    useEffect(() => {
      if(userId && dummyBalance && userPurchases && userPurchases.length > 0) {
        console.log('ADA USER PURCHASES');

        // Calculating remaining amount of balance
        let finalAmount = dummyBalance;
        userPurchases.forEach((userPurchase) => {
          
          // Subtracting balance with user purchases
          console.log('dummy balance on user purchase: ', dummyBalance);

          let amountPurchased = ((userPurchase.percentage_purchased/100) * dummyBalance)
          finalAmount = finalAmount - amountPurchased;
          console.log('amount purchased: ', amountPurchased);
          console.log('change of final amount: ', finalAmount);
          
        });
        console.log('FINAL amount: ', finalAmount);

        setBalanceAfterPurchase(finalAmount);

      }
      else {
        console.log('TIDAK ADA USER PURCHASES');
      }
    }, [userPurchases, userId, dummyBalance])
    
    
    // END PART 2: UPDATE BALANCE AFTER USER PURCHASE

    // START PART 3: USER RESELL
    const [resellModal, setResellModal] = useState(false);
    const handleUserJualKembali = async ({ ...purchased } : UserPurchase) => {
      setLoading(true);
      const response = await supabase
        .from('user_purchases')
        .delete()
        .eq('simulation_id', simulationId)
        .eq('name_purchased', purchased.name_purchased);
      
      if(response) {
        console.log('SUCCESS jual kembali', response);
        setLoading(false);
        setResellModal(false);
        fetchUserPurchase();
      } else {
        console.log('gagal jual kembali');
      }

    }

    // END PART 3: USER RESELL  

    
    const [listPageData, setListPageData] = useState<Pages>();
    const fetchListPage = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('page_name', 'List Page')
      
      if(error) {
        console.log('error while fetching list page: ', error);
      }
      if(data) {
        // console.log('response list page: ', data[0]);
        setListPageData(data[0]);
      }
    }

    const postTimeSpent = async ({ simulation_id, user_id, user_email, page_id, page_name, enter_time, exit_time } : UserPageVisits) => {
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
          enter_time: enterTimeDate,
          exit_time: exitTimeDate,
          simulation_id: simulation_id,
          // time_spent: time_spent,
        });
      
      if(error) {
        console.log('error while posting page time spent: ', error);
      }
      if(data) {
        console.log('SUCCESS PAGE TIME SPENT: ', data);
      }
    }


    const navigate = useNavigate();
    const [finishSimulationModal, setFinishSimulationModal] = useState(false);

    const [phoneNumberValue, setPhoneNumberValue] = useState('');
    const handleChangePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPhoneNumberValue(value ? value : '');
    };

    const [loading, setLoading] = useState(false);
    async function handleFinishSimulation(finishSimulation: boolean, phoneNumber: string) {
      setLoading(true);
      console.log('MASUK handle finish sim', simulationId);
      const { error } = await supabase
        .from('user_finish_simulations')
        .update({
          finished_simulation: finishSimulation,
          phone_number: phoneNumber
        }) 
        .eq('id', simulationId)

      if(error) {
        console.log('error while posting finish simulation SIMULPAGE: ', error.message);
        if(error.message.includes('duplicate')) {
          setLoading(false);
          userSignOut();
          setFinishSimulationModal(false);
        }
      } else {
        console.log('MASUK handle UPDATE success');
        userSignOut();
        setFinishSimulationModal(false);
        setLoading(false);
        // userSignOut();
      }
    }

    async function userSignOut() {
      const { error } = await supabase.auth.signOut();
      if(error) {
        throw new Error('Error while signing out');
      } else {
        console.log('user signed out');
        navigate('/auth/ui/signIn')
      }
    }

    const startTimeRef = useRef<number>(0);
    useEffect(() => {
      startTimeRef.current = Date.now();

      return () => {
        const leaveTime = Date.now();
        const timeSpent = (leaveTime - startTimeRef.current) / 1000;

        if(simulationId && listPageData && listPageData.id) {
          if(timeSpent > 0.5) {
            console.log(`Time Spent on Simulation Page: ${timeSpent.toFixed(2)} seconds`)
            console.log('USER EMAIL: ', email);
            postTimeSpent({
              user_id: userId,
              user_email: email,
              page_id: listPageData.id,
              page_name: listPageData.page_name,
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
    }, [startTimeRef, listPageData, simulationId]);

    const categories: string[] = ['Tabungan', 'Investasi', 'Kredit', 'Asuransi'];
    
    if(loading) {
      return (
        <div className="h-screen flex justify-center items-center bg-slate-100">
          <span className="loading loading-spinner"></span>
        </div>
      )
    }
    return (
      <div className="p-3 flex flex-col space-y-3 bg-slate-100">
        <div className="mx-3 p-3 bg-info opacity-80 max-w-full">
          <div className="flex flex-col space-y-3">
            <div className="text-center font-medium text-white">Ini adalah sebuah simulasi</div>
            <div className="text-center font-light text-white">Bagaimana Anda mengelola uang Anda pada produk bank berikut ini.</div>
            <div className="text-center font-light text-white italic">
              Disclaimer: Saldo ini merupakan simulasi yang dihitung berdasarkan 24 kali total maksimum rentang pendapatan Anda. Jika tidak ada data pendapatan yang diinput, saldo akan diatur secara default ke Rp1.000.000.000.
            </div>
          </div>
        </div>
        <div className="px-3 font-semibold text-xl text-slate-700">Halo, {email}</div>
        <div className="px-3 font-semibold text-xl text-slate-700">
          Saldo Anda: {

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
        <div className="px-3 text-xl text-slate-700 font-bold max-tablet:text-center max-mobile:text-center">Anda sudah membeli</div>
        <div className="flex flex-wrap gap-3 max-tablet:justify-center max-mobile:justify-center ">
          {
            userPurchases.length > 0 ?
              userPurchases.map((purchased) => (
                <div className="relative p-3 m-3 bg-primary w-36 h-44 rounded-xl hover:scale-105 transition">
                  <div className="text-white text-base font-semibold">{purchased.name_purchased}</div>
                  <div className="absolute bottom-13 right-3 text-white text-3xl font-bold">{purchased.percentage_purchased}%</div>
                  <div onClick={() => setResellModal(true)} className="bg-slate-100 px-2 py-1 rounded-md absolute left-3 bottom-3 text-primary text-sm font-bold hover:scale-105 transition" >Jual kembali</div>
                  <Modal
                    ariaHideApp={false}
                    isOpen={resellModal}
                    onRequestClose={() => {
                      setResellModal(false);
                    }}
                    style={modalStyles}
                  >
                    <div className="bg-slate-100 rounded-lg shadow-lg p-6 max-w-md mx-auto space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-700">Jual kembali {purchased.name_purchased}</h2>
                        <button
                          onClick={() => setResellModal(false)}
                          className="btn btn-circle btn-ghost text-gray-600"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="text-gray-700">Yakin ingin menjual kembali produk {purchased.name_purchased} sebanyak {purchased.percentage_purchased}%?</div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <button
                          className="btn btn-secondary text-slate-100"
                          onClick={() => setResellModal(false)}
                        >
                          Batal
                        </button>
                        <button
                          className="btn btn-primary text-slate-100"
                          onClick={() => handleUserJualKembali({ ...purchased })}
                        >
                          Ya, saya yakin
                        </button>
                      </div>
                    </div>
                  </Modal>
                </div>

                // modal jual kembali
                

              ))
            :
              <div className="flex text-slate-700 justify-center p-3">Belum ada pembelian</div>
          }  
        </div>
        <div className="px-3 text-xl text-slate-700 font-bold max-tablet:text-center max-mobile:text-center">Rekomendasi untuk Anda</div>
        <div className="flex flex-wrap gap-3 max-tablet:justify-center max-mobile:justify-center">
          {
            records && 
            records.length > 0 &&
            records
              .filter((record) => record.record_title.includes(rekomendasi))
              .map((record, index) => (
              <RecordCard key={index} {...record}/>
            ))
          }
        </div>
        <div className="px-3 text-xl text-slate-700 font-bold max-tablet:text-center max-mobile:text-center">Produk terkait</div>
        {
          categories
            .filter((category) => !category.includes(rekomendasi))
            .map((category) => (
            <>
              <div className="px-3 text-xl text-slate-700 font-bold max-tablet:text-center max-mobile:text-center">{category}</div>
              <div className="flex flex-wrap gap-3 max-tablet:justify-center max-mobile:justify-center">
                {
                  records && 
                  records.length > 0 &&
                  records
                    .filter((record) => !record.record_name.includes(rekomendasi) && record.record_name.includes(category))
                    .map((record, index) => (
                    <RelatedRecordCard key={index} {...record}/>
                  ))
                }
              </div>
            </>

          ))
        }
        <div className="flex justify-center">
          <button onClick={() => setFinishSimulationModal(true)} className="btn btn-primary text-slate-100 w-1/4 text-center font-bold">Finish Simulation?</button>
        </div>
        <Modal
          ariaHideApp={false}
          isOpen={finishSimulationModal}
          onRequestClose={() => {
            setFinishSimulationModal(false);
          }}
          style={modalStyles}
        >
          <div className="bg-slate-100 rounded-lg shadow-lg p-6 max-w-md mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Thank you for finishing the study!</h2>
            </div>

            <div className="text-gray-700">Thank you for finishing the study! Kindly fill your phone number below. We have some e-wallet prize as a thanks for your contribution to the study.</div>

            <input 
              onChange={handleChangePhone}
              value={phoneNumberValue}
              type='text' 
              className="input input-bordered w-full max-w-xs bg-slate-100 input-secondary text-gray-700" 
            />

            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="btn btn-secondary text-slate-100"
                onClick={() => setFinishSimulationModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary text-slate-100"
                onClick={() => handleFinishSimulation(true, phoneNumberValue)}
              >
                Finish and Submit
              </button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
