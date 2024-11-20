import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "./database/supabaseClient";


export default function Consent() {

  const [consentAgree, setConsentAgree] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false); // Track session check state
  const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted
  const navigate = useNavigate();

  const purposeOfStudy = "Anda diundang untuk berpartisipasi dalam penelitian yang bertujuan mengoptimalkan strategi kampanye digital melalui penggunaan nudge berbasis data. Tujuan penelitian ini adalah untuk mengumpulkan data yang akan membantu kami memahami bagaimana berbagai nudge memengaruhi perilaku dan pengambilan keputusan pengguna. Informasi ini akan digunakan untuk mengembangkan model dalam mengoptimalkan nudge pada kampanye pemasaran digital."
  const purposeOfStudyEng = "(You are being invited to participate in a research study aimed at optimizing digital campaign strategies through the use of data-driven nudges. The purpose of this study is to collect data that will help us understand how different nudges influence user behavior and decision-making. This information will be used to develop a model for optimizing nudges in digital marketing campaigns.)"
  const participationInvolves = "Jika Anda setuju untuk berpartisipasi, Anda akan diminta memberikan beberapa informasi pribadi dan menjawab serangkaian pertanyaan yang dirancang untuk memahami preferensi dan perilaku Anda. Tanggapan Anda akan membantu kami mengidentifikasi nudge mana yang paling efektif untuk berbagai jenis pengguna"
  const participationInvolvesEng = "(If you agree to participate, you will be asked to provide some personal information and answer a series of questions designed to understand your preferences and behaviors. Your responses will help us identify which nudges are most effective for different types of users.)"
  const kerahasiaan = "Kami berkomitmen untuk melindungi privasi Anda. Semua data yang Anda berikan akan dianonimkan dan disimpan dengan aman. Informasi Anda hanya akan digunakan untuk tujuan penelitian dan tidak akan dibagikan kepada pihak ketiga. Kami tidak akan mengumpulkan data yang dapat secara langsung mengidentifikasi Anda kecuali Anda secara eksplisit menyetujui untuk memberikannya."
  const confidentiality = "(We are committed to protecting your privacy. All the data you provide will be anonymized and securely stored. Your information will be used solely for research purposes and will not be shared with third parties. We will not collect any data that could directly identify you unless you explicitly agree to provide it.)"
  const resiko = "Risiko yang terkait dengan penelitian ini sangat minimal. Anda mungkin merasa tidak nyaman dalam menjawab beberapa pertanyaan pribadi, namun Anda bebas untuk melewati pertanyaan apa pun yang tidak ingin Anda jawab"  
  const risks = "(The risks associated with this study are minimal. You may feel discomfort in answering some personal questions, but you are free to skip any question you prefer not to answer.)"
  const manfaat = "Meskipun tidak ada manfaat langsung bagi Anda dalam berpartisipasi dalam penelitian ini, partisipasi Anda akan berkontribusi pada pemahaman yang lebih baik tentang cara meningkatkan strategi kampanye digital, yang mungkin akan memberikan manfaat bagi bisnis dan konsumen di masa depan"
  const benefits = "(While there are no direct benefits to you for participating in this study, your participation will contribute to a better understanding of how to improve digital campaign strategies, which may benefit businesses and consumers in the future.)"


  // Check session on component mount
  useEffect(() => {
    let isActive = true;

    async function getCurrentSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (isActive && data && data.session) {
          navigate('/surveyHome');
        }
        if (error) {
          console.error(error);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        if (isActive) {
          setSessionChecked(true);
        }
      }
    }

    if (!sessionChecked && isMounted) {
      getCurrentSession();
    }

    return () => {
      isActive = false; // Cleanup effect to prevent state updates after unmounting
    };
  }, [sessionChecked, isMounted, navigate]);

  // Set the component as mounted after the first render
  useEffect(() => {
    setIsMounted(true);
  }, []);
  

  return (
    <div className="p-3 h-full flex flex-col space-y-3 justify-center items-center bg-slate-100 text-slate-700">
      <div className="h-full w-full">
        <div className="overflow-y-auto h-full p-3 border border-1 border-slate-800 rounded-lg">
          <div className="space-y-1">
            <div className="text-xl font-bold">Research Study Consent Form</div>
            <div className="text-lg font-medium">Title of Study</div>
            <div className="text-base font-light">Model Rekomendasi Nudge untuk Meningkatkan Efektivitas Kampanye Digital di Industri Perbankan</div>
            <div className="text-base font-light italic">(Nudge Recommendation Model to Improve the Effectiveness of Digital Campaigns in the Banking Industry)</div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Informasi Peneliti</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">Researcher Information</div>
            </div>

            <div className="px-4">
              <ul className="list-disc">

                <li>
                  <div className="flex flex-row space-x-1">
                    <div className="flex flex-row space-x-1">
                      <div className="text-base font-medium">Peneliti Utama</div>
                      <div className="text-base font-medium">/</div>
                      <div className="text-base font-medium italic">Principal Information</div>
                    </div>
                    <div className="text-base font-light">: Idha Kristiana</div>
                  </div>
                </li>

                <li>
                  <div className="flex flex-row space-x-1">
                    <div className="flex flex-row space-x-1">
                      <div className="text-base font-medium">Institusi</div>
                      <div className="text-base font-medium">/</div>
                      <div className="text-base font-medium italic">Institution</div>
                    </div>
                    <div className="text-base font-light">: Doctor of Computer Science Bina Nusantara University</div>
                  </div>
                </li>

                <li>
                  <div className="flex flex-row space-x-1">
                    <div className="flex flex-row space-x-1">
                      <div className="text-base font-medium">Informasi Kontak</div>
                      <div className="text-base font-medium">/</div>
                      <div className="text-base font-medium italic">Contact Information</div>
                    </div>
                    <div className="text-base font-light">: idha.kristiana@binus.ac.id</div>
                  </div>
                </li>

              </ul>
            </div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Tujuan Penelitian</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">Purpose of the Study</div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">{purposeOfStudy}</div>
              <div className="text-base font-light italic">{purposeOfStudyEng}</div>
            </div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Apa yang Terlibat dalam Partisipasi</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">What Participation Involves</div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">{participationInvolves}</div>
              <div className="text-base font-light italic">{participationInvolvesEng}</div>
            </div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Kerahasiaan</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">Confidentiality</div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">{kerahasiaan}</div>
              <div className="text-base font-light italic">{confidentiality}</div>
            </div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Resiko</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">Risks</div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">{resiko}</div>
              <div className="text-base font-light italic">{risks}</div>
            </div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Manfaat</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">Benefits</div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">{manfaat}</div>
              <div className="text-base font-light italic">{benefits}</div>
            </div>

            <div className="flex flex-row space-x-1">
              <div className="text-lg font-medium">Pernyataan Persetujuan</div>
              <div className="text-lg font-medium">/</div>
              <div className="text-lg font-medium italic">Statement of Consent</div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">Dengan mencentang kotak di bawah ini, Anda menyatakan bahwa:</div>
              <div className="text-base font-light italic">(By checking the box below, you acknowledge that:)</div>
            </div>

            <div className="px-4">
              <ul className="list-disc">
                <li>
                  <div className="flex flex-row space-x-1">
                    <div className="flex flex-row space-x-1">
                      <div className="text-sm font-medium">Anda telah membaca dan memahami informasi yang disampaikan dalam formulir ini.</div>
                      <div className="text-sm font-medium italic">(You have read and understood the information provided in this form.)</div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex flex-row space-x-1">
                    <div className="flex flex-row space-x-1">
                      <div className="text-sm font-medium">Anda secara sukarela setuju untuk berpartisipasi dalam penelitian ini.</div>
                      <div className="text-sm font-medium italic">(You voluntarily agree to participate in this research study)</div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="flex flex-row space-x-1">
                    <div className="flex flex-row space-x-1">
                      <div className="text-sm font-medium">Anda memahami bahwa data anda akan dijaga kerahasiaannya dan hanya digunakan untuk tujuan penelitian ini.</div>
                      <div className="text-sm font-medium italic">(You understand that your data will be kept confidential and used only for the purposes of this study)</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="text-base font-light">Silakan berikan persetujuan anda dengan mencentang kotak yang sesuai:</div>
              <div className="text-base font-light italic">(Please indicate your consent by checking the appropriate box:)</div>
            </div>

            <div className="flex items-center justify-center p-8">
              <div className="flex flex-row space-x-2">
                <input 
                  type="checkbox" 
                  onClick={() => {
                    setConsentAgree(!consentAgree);
                  }
                  } 
                  className="checkbox checkbox-primary" 
                />
                <div>SAYA SETUJU untuk berpartisipasi dalam penelitian ini</div>
                <div>(I AGREE to participate in this study)</div>
              </div>
            </div>  
          </div>
          {
            consentAgree && 
            <div className="flex justify-center p-6">
              <Link className='p-3 btn btn-primary text-slate-100 text-base' to='auth/ui/signUp'>Ayo mulai</Link>
            </div>
          }      
        </div>
      </div>
    </div>
  )
}
